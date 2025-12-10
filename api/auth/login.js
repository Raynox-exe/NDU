const { sql } = require("@vercel/postgres");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { email, password } = request.body;

    if (!email || !password) {
      return response.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
    const user = rows[0];

    if (!user) {
      return response.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.status(400).json({ message: "Invalid credentials" });
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'student' },
      process.env.JWT_SECRET || 'default_secret_change_me', 
      { expiresIn: '7d' }
    );

    return response.status(200).json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role || 'student'
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return response.status(500).json({ message: 'Internal server error' });
  }
};
