const express = require('express');
const router = express.Router();
const multer = require('multer');
const imagekit = require('../config/imagekit');
const { protect } = require('../middleware/auth');

// Multer memory storage configuration (up to 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Allow images, PDFs, zip, and documents
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'application/pdf',
      'application/zip',
      'text/plain',
      'application/json',
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload an image, document, or PDF.'));
    }
  },
});

// @route   GET /api/upload/auth
// @desc    Get ImageKit client-side authentication parameters
router.get('/auth', (req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json({
      success: true,
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).json({ success: false, message: 'Could not generate ImageKit authorization' });
  }
});

// @route   POST /api/upload
// @desc    Upload file buffer to ImageKit (Avatar, Project Attachment, Proposal Attachment)
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload' });
    }

    const { folder = '/skilldesk' } = req.body;
    const cleanFileName = `${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

    console.log(`Uploading file to ImageKit: ${cleanFileName} (${req.file.size} bytes)`);

    const uploadResponse = await imagekit.upload({
      file: req.file.buffer, // Buffer
      fileName: cleanFileName,
      folder: folder,
      useUniqueFileName: true,
    });

    console.log(`ImageKit Upload successful: ${uploadResponse.url}`);

    res.json({
      success: true,
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      name: req.file.originalname,
      size: req.file.size,
      thumbnailUrl: uploadResponse.thumbnailUrl || uploadResponse.url,
      message: 'File successfully uploaded to ImageKit',
    });
  } catch (error) {
    console.error('ImageKit upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'ImageKit upload failed',
    });
  }
});

module.exports = router;
