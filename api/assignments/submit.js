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

    const { assignment_id, submission_file_url, submission_text } = request.body;

    if (!assignment_id) {
      return response.status(400).json({ message: 'assignment_id is required' });
    }

    if (!submission_file_url && !submission_text) {
      return response.status(400).json({ message: 'Either submission_file_url or submission_text is required' });
    }

    // Check if already submitted
    const { rows: existing } = await sql`
      SELECT * FROM submissions 
      WHERE assignment_id = ${assignment_id} AND student_id = ${student_id}
    `;

    if (existing.length > 0) {
      // Update existing submission
      await sql`
        UPDATE submissions 
        SET submission_file_url = ${submission_file_url}, 
            submission_text = ${submission_text},
            submitted_at = CURRENT_TIMESTAMP
        WHERE assignment_id = ${assignment_id} AND student_id = ${student_id}
      `;
      return response.status(200).json({ message: 'Submission updated successfully' });
    } else {
      // Create new submission
      await sql`
        INSERT INTO submissions (assignment_id, student_id, submission_file_url, submission_text)
        VALUES (${assignment_id}, ${student_id}, ${submission_file_url}, ${submission_text})
      `;
      return response.status(201).json({ message: 'Assignment submitted successfully' });
    }

  } catch (error) {
    console.error('Submit Assignment Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
