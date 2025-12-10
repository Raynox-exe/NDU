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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_change_me');
    
    // Check if user is lecturer or admin
    const { rows: userRows } = await sql`SELECT role FROM users WHERE id = ${decoded.userId}`;
    const userRole = userRows[0]?.role;
    
    if (userRole !== 'lecturer' && userRole !== 'admin') {
      return response.status(403).json({ message: 'Access denied. Lecturers only.' });
    }

    const { submission_id, score, feedback } = request.body;

    if (!submission_id) {
      return response.status(400).json({ message: 'submission_id is required' });
    }

    // Verify lecturer owns the course (if not admin)
    if (userRole === 'lecturer') {
      const { rows: check } = await sql`
        SELECT s.* FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN courses c ON a.course_id = c.id
        WHERE s.id = ${submission_id} AND c.lecturer_id = ${decoded.userId}
      `;
      if (check.length === 0) {
        return response.status(403).json({ message: 'You are not authorized to grade this submission' });
      }
    }

    // Grade submission
    await sql`
      UPDATE submissions 
      SET score = ${score}, feedback = ${feedback}
      WHERE id = ${submission_id}
    `;

    return response.status(200).json({ message: 'Submission graded successfully' });

  } catch (error) {
    console.error('Grade Submission Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
