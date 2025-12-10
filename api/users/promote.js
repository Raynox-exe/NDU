const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  if (request.method !== 'PUT') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  const token = request.headers['x-auth-token'];
  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token and check if user is admin
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');
    
    // Check if requesting user is admin
    const { rows: adminCheck } = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    if (!adminCheck[0] || adminCheck[0].role !== 'admin') {
      return response.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId, newRole } = request.body;

    if (!userId || !newRole) {
      return response.status(400).json({ message: 'userId and newRole are required' });
    }

    // Validate role
    if (!['student', 'lecturer', 'admin'].includes(newRole)) {
      return response.status(400).json({ message: 'Invalid role. Must be student, lecturer, or admin' });
    }

    // Update user role
    await sql`UPDATE users SET role = ${newRole} WHERE id = ${userId}`;

    return response.status(200).json({ message: `User promoted to ${newRole} successfully` });

  } catch (error) {
    console.error('Promote User Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
