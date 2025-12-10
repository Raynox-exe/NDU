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
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');
    
    // Get all courses with lecturer info
    const { rows } = await sql`
      SELECT 
        c.id, c.course_code, c.course_name, c.description, c.created_at,
        u.fullname as lecturer_name, u.id as lecturer_id
      FROM courses c
      LEFT JOIN users u ON c.lecturer_id = u.id
      ORDER BY c.created_at DESC
    `;

    return response.status(200).json(rows);

  } catch (error) {
    console.error('List Courses Error:', error);
    return response.status(500).json({ message: 'Server error' });
  }
};
