const { sql } = require("@vercel/postgres");
const jwt = require("jsonwebtoken");

module.exports = async function handler(request, response) {
  const token = request.headers['x-auth-token'];
  if (!token) {
    return response.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');
    const userId = decoded.userId;

    // GET: List enrollments (role-based)
    if (request.method === 'GET') {
      const { rows: userRows } = await sql`SELECT role FROM users WHERE id = ${userId}`;
      const userRole = userRows[0]?.role;

      let enrollments;

      if (userRole === 'admin') {
        const { rows } = await sql`
          SELECT 
            e.id, e.enrolled_at, e.status, e.grade,
            u.fullname as student_name, u.email as student_email,
            c.course_name, c.course_code
          FROM enrollments e
          JOIN users u ON e.student_id = u.id
          JOIN courses c ON e.course_id = c.id
          ORDER BY e.enrolled_at DESC
        `;
        enrollments = rows;
      } else if (userRole === 'lecturer') {
        const { rows } = await sql`
          SELECT 
            e.id, e.enrolled_at, e.status, e.grade,
            u.fullname as student_name, u.email as student_email,
            c.course_name, c.course_code
          FROM enrollments e
          JOIN users u ON e.student_id = u.id
          JOIN courses c ON e.course_id = c.id
          WHERE c.lecturer_id = ${userId}
          ORDER BY e.enrolled_at DESC
        `;
        enrollments = rows;
      } else {
        const { rows } = await sql`
          SELECT 
            e.id, e.enrolled_at, e.status, e.grade,
            c.course_name, c.course_code, c.description,
            u.fullname as lecturer_name
          FROM enrollments e
          JOIN courses c ON e.course_id = c.id
          LEFT JOIN users u ON c.lecturer_id = u.id
          WHERE e.student_id = ${userId}
          ORDER BY e.enrolled_at DESC
        `;
        enrollments = rows;
      }

      return response.status(200).json(enrollments);
    }

    // POST: Enroll in course
    if (request.method === 'POST') {
      const { course_id } = request.body;

      if (!course_id) {
        return response.status(400).json({ message: 'course_id is required' });
      }

      const { rows: existing } = await sql`
        SELECT * FROM enrollments 
        WHERE student_id = ${userId} AND course_id = ${course_id}
      `;

      if (existing.length > 0) {
        return response.status(400).json({ message: 'Already enrolled in this course' });
      }

      await sql`
        INSERT INTO enrollments (student_id, course_id)
        VALUES (${userId}, ${course_id})
      `;

      return response.status(201).json({ message: 'Enrolled successfully' });
    }

    return response.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Enrollments API Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
