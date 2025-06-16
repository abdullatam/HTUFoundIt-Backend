const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        console.log("Saving to:", uploadDir);
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}-${path.basename(file.originalname, ext)}${ext}`;
        console.log("Generated filename:", filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 5 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(ext);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed!'));
        }
    }
});

router.post("/", upload.single("image"), async (req, res) => {
    try {
        console.log("📝 Request body:", req.body);
        console.log("📎 File:", req.file);

        if (!req.file) {
            console.log("❌ No file uploaded or invalid file type");
            return res.status(400).json({ 
                error: "Please upload a valid image file",
                acceptedFormats: ".jpg, .jpeg, .png, .gif, .webp, .bmp, .svg"
            });
        }

        const {
            name,
            category,
            place,
            date_lost,
            description = "",
            mobile = null,
            posted_by,
            avatar_url = ""
        } = req.body;

        const image_url = `/uploads/${req.file.filename}`;
        console.log('Saving image_url:', image_url);

        if (!name || !category || !place || !date_lost || !posted_by) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const mobileInt = mobile ? parseInt(mobile, 10) : null;

        const result = await pool.query(
            `INSERT INTO lostitem
                (name, category, place, date_lost, description, mobile, image_url, posted_by, avatar_url)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`,
            [name, category, place, date_lost, description, mobileInt, image_url, posted_by, avatar_url]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("❌ POST /lost-items error:", err);
        return res.status(500).json({ error: err.detail || "Failed to create lost item" });
    }
});

// GET all lost items
router.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM lostitem ORDER BY id DESC");
        return res.json(rows);
    } catch (err) {
        console.error("❌ GET /lost-items error:", err);
        return res.status(500).json({ error: "Failed to fetch lost items" });
    }
});

// DELETE a lost item
router.delete("/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM lostitem WHERE id = $1", [req.params.id]);
        return res.sendStatus(204);
    } catch (err) {
        console.error("❌ DELETE /lost-items/:id error:", err);
        return res.status(500).json({ error: "Failed to delete lost item" });
    }
});

module.exports = router;