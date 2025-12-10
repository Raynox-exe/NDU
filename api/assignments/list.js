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
    const userId = decoded.userId;

    // Get user role
    const { rows: userRows } = await sql`SELECT role FROM users WHERE id = ${userId}`;
    const userRole = userRows[0]?.role;

    let assignments;

    if (userRole === 'admin') {
      // Admins see all assignments
      const { rows } = await sql`
        SELECT a.*, c.course_name, c.course_code
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        ORDER BY a.created_at DESC
      `;
      assignments = rows;
    } else if (userRole === 'lecturer') {
      // Lecturers see assignments for their courses
      const { rows } = await sql`
        SELECT a.*, c.course_name, c.course_code
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE c.lecturer_id = ${userId}
        ORDER BY a.created_at DESC
      `;
      assignments = rows;
    } else {
      // Students see assignments for enrolled courses
      const { rows } = await sql`
        SELECT a.*, c.course_name, c.course_code,
               s.submission_file_url, s.score, s.feedback, s.submitted_at
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON e.course_id = c.id
        LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ${userId}
        WHERE e.student_id = ${userId}
        ORDER BY a.due_date ASC
      `;
      assignments = rows;
    }

    return response.status(200).json(assignments);

  } catch (error) {
    console.error('List Assignments Error:', error);
    return response.status(500).json({ message: 'Server error' });
  }
};
