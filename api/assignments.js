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

    // GET: List assignments (role-based)
    if (request.method === 'GET') {
      const { rows: userRows } = await sql`SELECT role FROM users WHERE id = ${userId}`;
      const userRole = userRows[0]?.role;

      let assignments;

      if (userRole === 'admin') {
        const { rows } = await sql`
          SELECT a.*, c.course_name, c.course_code
          FROM assignments a
          JOIN courses c ON a.course_id = c.id
          ORDER BY a.created_at DESC
        `;
        assignments = rows;
      } else if (userRole === 'lecturer') {
        const { rows } = await sql`
          SELECT a.*, c.course_name, c.course_code
          FROM assignments a
          JOIN courses c ON a.course_id = c.id
          WHERE c.lecturer_id = ${userId}
          ORDER BY a.created_at DESC
        `;
        assignments = rows;
      } else {
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
    }

    // POST: Create assignment (Lecturer/Admin only)
    if (request.method === 'POST') {
      const { rows: userRows } = await sql`SELECT role FROM users WHERE id = ${userId}`;
      const userRole = userRows[0]?.role;
      
      if (userRole !== 'lecturer' && userRole !== 'admin') {
        return response.status(403).json({ message: 'Access denied. Lecturers only.' });
      }

      const { course_id, title, description, due_date, max_score, assignment_file_url } = request.body;

      if (!course_id || !title) {
        return response.status(400).json({ message: 'course_id and title are required' });
      }

      if (userRole === 'lecturer') {
        const { rows: courseCheck } = await sql`
          SELECT * FROM courses WHERE id = ${course_id} AND lecturer_id = ${userId}
        `;
        if (courseCheck.length === 0) {
          return response.status(403).json({ message: 'You are not assigned to this course' });
        }
      }

      const { rows } = await sql`
        INSERT INTO assignments (course_id, title, description, due_date, max_score, assignment_file_url)
        VALUES (${course_id}, ${title}, ${description}, ${due_date || null}, ${max_score || 100}, ${assignment_file_url || null})
        RETURNING *
      `;

      return response.status(201).json({ message: 'Assignment created successfully', assignment: rows[0] });
    }

    return response.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Assignments API Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
