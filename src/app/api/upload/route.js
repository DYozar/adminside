import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

// Ensure the runtime is set to nodejs, as edge functions can't use native modules like fs or path.
export const runtime = 'nodejs';

export async function POST(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();

    form.uploadDir = './uploads'; // You can customize the upload directory
    form.keepExtensions = true; // Keep file extensions

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
      }

      const oldPath = files.file.filepath; // `filepath` will contain the uploaded file's temporary path
      const newPath = path.join(form.uploadDir, files.file.originalFilename);

      fs.rename(oldPath, newPath, (err) => {
        if (err) {
          return reject(new Response(JSON.stringify({ error: err.message }), { status: 500 }));
        }

        resolve(new Response(JSON.stringify({ message: 'File uploaded successfully' }), { status: 200 }));
      });
    });
  });
}
