// NOTE: This requires @vercel/blob package
// Run: npm install @vercel/blob
// Then add BLOB_READ_WRITE_TOKEN to Vercel environment variables

const { put } = require('@vercel/blob');

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For Vercel Blob, files are sent as request body
    const { searchParams } = new URL(request.url, `https://${request.headers.host}`);
    const filename = searchParams.get('filename');

    if (!filename) {
      return response.status(400).json({ message: 'filename query parameter required' });
    }

    // Upload to Vercel Blob
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return response.status(200).json({ url: blob.url });

  } catch (error) {
    console.error('Upload Error:', error);
    return response.status(500).json({ message: 'Upload failed', error: error.message });
  }
};
