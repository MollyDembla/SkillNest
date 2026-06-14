const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/apiError');

// Create a generic Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'skillnest_assets',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mkv', 'webm', 'mov']
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only image files (jpg, png, webp) are allowed.'), false);
  }
};

// File filter for videos only
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only video files (mp4, mkv, webm, mov) are allowed.'), false);
  }
};

// Configured Multer instances
const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: imageFilter
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: videoFilter
});

// A standard local file storage for fallback/scratch upload if needed
const localTempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/scratch/'); // Ensure folders exist or create on startup
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const uploadLocal = multer({
  storage: multer.memoryStorage(), // In-memory buffer upload
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

module.exports = {
  uploadImage,
  uploadVideo,
  uploadLocal
};
