const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  const token = request.headers['x-auth-token'];
  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');

    // GET: List all courses
    if (request.method === 'GET') {
      const { rows } = await sql`
        SELECT 
          c.id, c.course_code, c.course_name, c.description, c.created_at,
          u.fullname as lecturer_name, u.id as lecturer_id
        FROM courses c
        LEFT JOIN users u ON c.lecturer_id = u.id
        ORDER BY c.created_at DESC
      `;
      return response.status(200).json(rows);
    }

    // POST: Create course (Admin only)
    if (request.method === 'POST') {
      const { rows: adminCheck } = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
      if (!adminCheck[0] || adminCheck[0].role !== 'admin') {
        return response.status(403).json({ message: 'Access denied. Admin only.' });
      }

      const { course_code, course_name, description, lecturer_id } = request.body;

      if (!course_code || !course_name) {
        return response.status(400).json({ message: 'course_code and course_name are required' });
      }

      const { rows } = await sql`
        INSERT INTO courses (course_code, course_name, description, lecturer_id)
        VALUES (${course_code}, ${course_name}, ${description}, ${lecturer_id || null})
        RETURNING *
      `;

      return response.status(201).json({ message: 'Course created successfully', course: rows[0] });
    }

    return response.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Courses API Error:', error);
    if (error.message.includes('duplicate key')) {
      return response.status(400).json({ message: 'Course code already exists' });
    }
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
