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

    // Get assignment_id from query params
    const { assignment_id } = request.query || {};

    if (!assignment_id) {
      return response.status(400).json({ message: 'assignment_id query parameter is required' });
    }

    // Get user role
    const { rows: userRows } = await sql`SELECT role FROM users WHERE id = ${userId}`;
    const userRole = userRows[0]?.role;

    let submissions;

    if (userRole === 'lecturer' || userRole === 'admin') {
      // Lecturers/admins see all submissions for the assignment
      const { rows } = await sql`
        SELECT s.*, u.fullname as student_name, u.email as student_email
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.assignment_id = ${assignment_id}
        ORDER BY s.submitted_at DESC
      `;
      submissions = rows;
    } else {
      // Students see only their own submission
      const { rows } = await sql`
        SELECT s.*
        FROM submissions s
        WHERE s.assignment_id = ${assignment_id} AND s.student_id = ${userId}
      `;
      submissions = rows;
    }

    return response.status(200).json(submissions);

  } catch (error) {
    console.error('List Submissions Error:', error);
    return response.status(500).json({ message: 'Server error' });
  }
};
