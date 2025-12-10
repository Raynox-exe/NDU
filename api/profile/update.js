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
    const userId = decoded.userId;

    // We expect FormData or JSON
    // Vercel parses JSON body automatically
    const body = request.body;

    // Helper to build dynamic query (Vercel/node-postgres doesn't have a query builder, so we do it manually safely)
    // Note: In a production app, we should validate fields.
    // For simplicity, we assume fields match column names mostly.
    
    const {
        dob, gender, marital_status, nationality, state_origin, lga,
        nin_number, address, city, state_residence, nok_name, nok_phone,
        nok_address, qualification, employment_status, program_interest,
        experience, ref_name, ref_relationship, ref_phone, ref_email
    } = body;

    await sql`
      UPDATE users 
      SET dob = ${dob}, 
          gender = ${gender},
          marital_status = ${marital_status},
          nationality = ${nationality},
          state_origin = ${state_origin},
          lga = ${lga},
          nin_number = ${nin_number},
          address = ${address},
          city = ${city},
          state_residence = ${state_residence},
          nok_name = ${nok_name},
          nok_phone = ${nok_phone},
          nok_address = ${nok_address},
          qualification = ${qualification},
          employment_status = ${employment_status},
          program_interest = ${program_interest},
          experience_level = ${experience},
          ref_name = ${ref_name},
          ref_relationship = ${ref_relationship},
          ref_phone = ${ref_phone},
          ref_email = ${ref_email}
      WHERE id = ${userId}
    `;

    return response.status(200).json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Profile Update Error:', error);
    return response.status(500).json({ message: 'Server error', error: error.message });
  }
};
