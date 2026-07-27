/* ============================================
   GALLERY ROUTE
   Handles photo gallery uploads and retrieval
   ============================================ */

const express = require("express");
const router = express.Router();
const { upload, processImage } = require("../middleware/upload");
const db = require("../database");
const fs = require("fs");
const path = require("path");

// Helper: Verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Admin authentication required" });
  }

  db.get(
    `SELECT * FROM admin_sessions WHERE token = ? AND expires_at > datetime('now')`,
    [token],
    (err, session) => {
      if (err || !session) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }
      req.admin = session;
      next();
    },
  );
};

// ========== PUBLIC ROUTES ==========

// GET /api/gallery/images - Get all published images
router.get("/images", (req, res) => {
  const { category, page = 1, limit = 12 } = req.query;
  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM gallery_images WHERE is_approved = 1`;
  const params = [];

  if (category && category !== "all") {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, images) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(
      `SELECT COUNT(*) as total FROM gallery_images WHERE is_approved = 1${category && category !== "all" ? " AND category = ?" : ""}`,
      category && category !== "all" ? [category] : [],
      (err, count) => {
        res.json({
          success: true,
          images: images.map((img) => ({
            ...img,
            url: `/uploads/gallery/${img.filename}.webp`,
            thumbnail: `/uploads/thumbnails/thumb_${img.filename}.webp`,
          })),
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count.total / limit),
            total_items: count.total,
          },
        });
      },
    );
  });
});

// GET /api/gallery/categories - Get gallery categories
router.get("/categories", (req, res) => {
  db.all(
    `SELECT * FROM gallery_categories ORDER BY name`,
    (err, categories) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      Promise.all(
        categories.map((cat) => {
          return new Promise((resolve) => {
            db.get(
              `SELECT COUNT(*) as count FROM gallery_images WHERE category = ? AND is_approved = 1`,
              [cat.slug],
              (err, result) => {
                resolve({ ...cat, image_count: result?.count || 0 });
              },
            );
          });
        }),
      ).then((categoriesWithCount) => {
        res.json({ success: true, categories: categoriesWithCount });
      });
    },
  );
});

// GET /api/gallery/images/:id - Get single image
router.get("/images/:id", (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM gallery_images WHERE id = ? AND is_approved = 1`,
    [id],
    (err, image) => {
      if (err || !image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Increment view count
      db.run(
        `UPDATE gallery_images SET view_count = view_count + 1 WHERE id = ?`,
        [id],
      );

      res.json({
        success: true,
        image: {
          ...image,
          url: `/uploads/gallery/${image.filename}.webp`,
          thumbnail: `/uploads/thumbnails/thumb_${image.filename}.webp`,
        },
      });
    },
  );
});

// ========== ADMIN ROUTES ==========

// POST /api/gallery/upload - Upload images (admin only)
router.post(
  "/upload",
  verifyAdmin,
  upload.array("images", 10),
  async (req, res) => {
    const { title, description, category, is_featured } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedImages = [];

    for (const file of files) {
      try {
        const processed = await processImage(
          file.path,
          path.parse(file.filename).name,
          {
            width: 1200,
            format: "webp",
            quality: 80,
          },
        );

        const filename = path.parse(processed.mainPath).name;

        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO gallery_images 
                        (filename, original_name, title, description, category, file_path, thumbnail_path, 
                         file_size, mime_type, width, height, uploaded_by, is_featured)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              filename,
              file.originalname,
              title || filename,
              description || null,
              category || "general",
              processed.mainPath,
              processed.thumbnailPath,
              processed.size,
              file.mimetype,
              processed.width,
              processed.height,
              req.admin.username || "admin",
              is_featured === "true" ? 1 : 0,
            ],
            function (err) {
              if (err) reject(err);
              else {
                uploadedImages.push({
                  id: this.lastID,
                  filename,
                  title: title || filename,
                });
                resolve();
              }
            },
          );
        });
      } catch (error) {
        console.error("Image processing error:", error);
      }
    }

    // Log activity
    db.run(
      `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
            VALUES (?, ?, ?, ?)`,
      [
        req.admin.admin_id,
        "gallery_upload",
        `Uploaded ${uploadedImages.length} images`,
        req.ip,
      ],
    );

    res.json({
      success: true,
      message: `${uploadedImages.length} image(s) uploaded successfully`,
      images: uploadedImages,
    });
  },
);

// PUT /api/gallery/images/:id - Update image metadata (admin only)
router.put("/images/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, category, is_featured, is_approved } = req.body;

  const updates = [];
  const params = [];

  if (title !== undefined) {
    updates.push("title = ?");
    params.push(title);
  }
  if (description !== undefined) {
    updates.push("description = ?");
    params.push(description);
  }
  if (category !== undefined) {
    updates.push("category = ?");
    params.push(category);
  }
  if (is_featured !== undefined) {
    updates.push("is_featured = ?");
    params.push(is_featured ? 1 : 0);
  }
  if (is_approved !== undefined) {
    updates.push("is_approved = ?");
    params.push(is_approved ? 1 : 0);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(id);

  db.run(
    `UPDATE gallery_images SET ${updates.join(", ")} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.run(
        `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                VALUES (?, ?, ?, ?)`,
        [
          req.admin.admin_id,
          "gallery_update",
          `Updated image ID ${id}`,
          req.ip,
        ],
      );

      res.json({ success: true, message: "Image updated successfully" });
    },
  );
});

// DELETE /api/gallery/images/:id - Delete image (admin only)
router.delete("/images/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT filename, file_path, thumbnail_path FROM gallery_images WHERE id = ?`,
    [id],
    (err, image) => {
      if (err || !image) {
        return res.status(404).json({ error: "Image not found" });
      }

      // Delete files from disk
      try {
        if (fs.existsSync(image.file_path)) fs.unlinkSync(image.file_path);
        if (fs.existsSync(image.thumbnail_path))
          fs.unlinkSync(image.thumbnail_path);
      } catch (e) {
        console.error("File deletion error:", e);
      }

      db.run(`DELETE FROM gallery_images WHERE id = ?`, [id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        db.run(
          `INSERT INTO admin_activity_log (admin_id, action, details, ip_address)
                    VALUES (?, ?, ?, ?)`,
          [
            req.admin.admin_id,
            "gallery_delete",
            `Deleted image ID ${id} - ${image.filename}`,
            req.ip,
          ],
        );

        res.json({ success: true, message: "Image deleted successfully" });
      });
    },
  );
});

module.exports = router;
