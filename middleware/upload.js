/* ============================================
   UPLOAD MIDDLEWARE
   Handles file uploads with Multer and Sharp image processing
   ============================================ */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");

// Ensure upload directories exist
const uploadDirs = ["uploads/gallery", "uploads/thumbnails", "uploads/temp"];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads/temp"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.",
      ),
      false,
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB default
  },
  fileFilter: fileFilter,
});

// Image processing function
async function processImage(tempPath, filename, options = {}) {
  const {
    width = 1200,
    height = null,
    quality = 80,
    format = "webp",
  } = options;

  const outputDir = path.join(__dirname, "..", "uploads/gallery");
  const outputPath = path.join(outputDir, `${filename}.${format}`);
  const thumbnailDir = path.join(__dirname, "..", "uploads/thumbnails");
  const thumbnailPath = path.join(thumbnailDir, `thumb_${filename}.${format}`);

  // Ensure output directories exist
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(thumbnailDir))
    fs.mkdirSync(thumbnailDir, { recursive: true });

  // Process main image
  let pipeline = sharp(tempPath);

  if (width || height) {
    pipeline = pipeline.resize(width, height, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  await pipeline[format]({ quality: quality }).toFile(outputPath);

  // Process thumbnail (300x200 cover)
  await sharp(tempPath)
    .resize(300, 200, { fit: "cover" })
    [format]({ quality: 60 })
    .toFile(thumbnailPath);

  // Get image metadata
  const metadata = await sharp(tempPath).metadata();

  // Delete temp file
  try {
    fs.unlinkSync(tempPath);
  } catch (e) {
    console.error("Temp file deletion error:", e);
  }

  return {
    mainPath: outputPath,
    thumbnailPath: thumbnailPath,
    width: metadata.width,
    height: metadata.height,
    size: metadata.size,
  };
}

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "FILE_TOO_LARGE") {
      return res
        .status(400)
        .json({ error: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { upload, processImage, handleUploadError };
