const { sql } = require("@vercel/postgres");
const bcrypt = require("bcryptjs");

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { fullname, email, phone, password } = request.body;

    if (!fullname || !email || !password) {
      return response.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existingUser.rows.length > 0) {
      return response.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await sql`
      INSERT INTO users (fullname, email, phone, password)
      VALUES (${fullname}, ${email}, ${phone}, ${hashedPassword})
    `;

    return response.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    return response
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
