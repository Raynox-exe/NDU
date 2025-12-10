const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // Get token from header
  const token = request.headers['x-auth-token'];
  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');
    
    // Fetch user (exclude password)
    const { rows } = await sql`
      SELECT id, fullname, email, phone, dob, gender, marital_status, 
             nationality, state_origin, lga, nin_number, address, city, 
             state_residence, qualification, employment_status, program_interest
      FROM users WHERE id = ${decoded.userId}
    `;

    if (rows.length === 0) {
      return response.status(404).json({ message: 'User not found' });
    }

    return response.status(200).json(rows[0]);
  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return response.status(401).json({ message: 'Token is not valid' });
  }
};
