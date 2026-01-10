exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Construct the URL to access the file
  // Assuming the server serves 'uploads' statically
  const protocol = req.protocol;
  const host = req.get('host');
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.json({ 
    message: 'File uploaded successfully', 
    imageUrl: fileUrl 
  });
};