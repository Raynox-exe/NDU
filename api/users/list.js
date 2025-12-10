const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const token = request.headers['x-auth-token'];
  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');
    
    // Check if requesting user is admin
    const { rows: adminCheck } = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    if (!adminCheck[0] || adminCheck[0].role !== 'admin') {
      return response.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get all users (exclude passwords)
    const { rows } = await sql`
      SELECT id, fullname, email, phone, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;

    return response.status(200).json(rows);

  } catch (error) {
    console.error('List Users Error:', error);
    return response.status(500).json({ message: 'Server error' });
  }
};
