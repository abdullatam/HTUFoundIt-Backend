const express = require("express");
const router  = express.Router();
const pool    = require("../db");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `found-${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const okMime = allowed.test(file.mimetype);
    const okExt  = allowed.test(path.extname(file.originalname).toLowerCase());
    if (okMime && okExt) cb(null, true);
    else cb(new Error("Only image files (jpg, jpeg, png, gif, webp) are allowed!"));
  }
});

// GET all found items
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM founditem ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ GET /found-items error:", err);
    res.status(500).json({ error: "Failed to fetch found items" });
  }
});

// POST a new found item with photo
router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("📝 Request body:", req.body);
    console.log("📎 File:", req.file);

    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a valid image file"
      });
    }

    const {
      name,
      category,
      place,
      date_found,
      status = "pending",
      submitted_by
    } = req.body;

    // Safely parse place and submitted_by into integers, fallback to 1
    let placeInt = parseInt(place, 10);
    if (isNaN(placeInt)) placeInt = 1;

    let submittedByInt = parseInt(submitted_by, 10);
    if (isNaN(submittedByInt)) submittedByInt = 1;

    const image_url = `/uploads/${req.file.filename}`;
    console.log("✅ Saving image_url:", image_url);

    const result = await pool.query(
      `INSERT INTO founditem
         (name, category, place, date_found, image_url, status, submitted_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        name,
        category,
        placeInt,
        date_found,
        image_url,
        status,
        submittedByInt
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ POST /found-items error:", err);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: "Failed to create found item" });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const { id }     = req.params;
    const result = await pool.query(
      `UPDATE founditem SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ PUT /found-items/:id error:", err);
    res.status(500).json({ error: "Failed to update found item status" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM founditem WHERE id = $1", [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    console.error("❌ DELETE /found-items/:id error:", err);
    res.status(500).json({ error: "Failed to delete found item" });
  }
});

module.exports = router;
