const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
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

    const { course_code, course_name, description, lecturer_id } = request.body;

    if (!course_code || !course_name) {
      return response.status(400).json({ message: 'course_code and course_name are required' });
    }

    // Create course
    const { rows } = await sql`
      INSERT INTO courses (course_code, course_name, description, lecturer_id)
      VALUES (${course_code}, ${course_name}, ${description}, ${lecturer_id || null})
      RETURNING *
    `;

    return response.status(201).json({ message: 'Course created successfully', course: rows[0] });

  } catch (error) {
    console.error('Create Course Error:', error);
    if (error.message.includes('duplicate key')) {
      return response.status(400).json({ message: 'Course code already exists' });
    }
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
