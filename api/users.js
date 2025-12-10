const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  const token = request.headers['x-auth-token'];
  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');
    
    // Check if user is admin
    const { rows: adminCheck } = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    if (!adminCheck[0] || adminCheck[0].role !== 'admin') {
      return response.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // GET: List all users
    if (request.method === 'GET') {
      const { rows } = await sql`
        SELECT id, fullname, email, phone, role, created_at 
        FROM users 
        ORDER BY created_at DESC
      `;
      return response.status(200).json(rows);
    }

    // PUT: Promote user
    if (request.method === 'PUT') {
      const { userId, newRole } = request.body;

      if (!userId || !newRole) {
        return response.status(400).json({ message: 'userId and newRole are required' });
      }

      if (!['student', 'lecturer', 'admin'].includes(newRole)) {
        return response.status(400).json({ message: 'Invalid role' });
      }

      await sql`UPDATE users SET role = ${newRole} WHERE id = ${userId}`;
      return response.status(200).json({ message: `User promoted to ${newRole} successfully` });
    }

    return response.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Users API Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
