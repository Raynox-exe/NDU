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
    const student_id = decoded.userId;

    const { course_id } = request.body;

    if (!course_id) {
      return response.status(400).json({ message: 'course_id is required' });
    }

    // Check if already enrolled
    const { rows: existing } = await sql`
      SELECT * FROM enrollments 
      WHERE student_id = ${student_id} AND course_id = ${course_id}
    `;

    if (existing.length > 0) {
      return response.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Enroll student
    await sql`
      INSERT INTO enrollments (student_id, course_id)
      VALUES (${student_id}, ${course_id})
    `;

    return response.status(201).json({ message: 'Enrolled successfully' });

  } catch (error) {
    console.error('Enroll Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
