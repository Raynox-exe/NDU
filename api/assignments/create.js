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
    
    // Check if user is lecturer or admin
    const { rows: userRows } = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    const userRole = userRows[0]?.role;
    
    if (userRole !== 'lecturer' && userRole !== 'admin') {
      return response.status(403).json({ message: 'Access denied. Lecturers only.' });
    }

    const { course_id, title, description, due_date, max_score, assignment_file_url } = request.body;

    if (!course_id || !title) {
      return response.status(400).json({ message: 'course_id and title are required' });
    }

    // Verify lecturer owns this course (or is admin)
    if (userRole === 'lecturer') {
      const { rows: courseCheck } = await sql`
        SELECT * FROM courses WHERE id = ${course_id} AND lecturer_id = ${decoded.userId}
      `;
      if (courseCheck.length === 0) {
        return response.status(403).json({ message: 'You are not assigned to this course' });
      }
    }

    // Create assignment
    const { rows } = await sql`
      INSERT INTO assignments (course_id, title, description, due_date, max_score, assignment_file_url)
      VALUES (${course_id}, ${title}, ${description}, ${due_date || null}, ${max_score || 100}, ${assignment_file_url || null})
      RETURNING *
    `;

    return response.status(201).json({ message: 'Assignment created successfully', assignment: rows[0] });

  } catch (error) {
    console.error('Create Assignment Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
