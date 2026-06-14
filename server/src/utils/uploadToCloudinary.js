const cloudinary = require('../config/cloudinary');

/**
 * Upload a local file to Cloudinary
 * @param {string} filePath - Absolute path to the local file
 * @param {string} folder - Folder name on Cloudinary
 * @returns {Promise<object>} - Upload response containing url and publicId
 */
const uploadToCloudinary = async (filePath, folder = 'skillnest') => {
  try {
    if (!filePath) return null;
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto'
    });
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary file upload error:', error);
    throw error;
  }
};

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Folder name on Cloudinary
 * @returns {Promise<object>} - Upload response containing url and publicId
 */
const uploadBufferToCloudinary = (buffer, folder = 'skillnest') => {
  return new Promise((resolve, reject) => {
    if (!buffer) return resolve(null);
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = {
  uploadToCloudinary,
  uploadBufferToCloudinary
};
