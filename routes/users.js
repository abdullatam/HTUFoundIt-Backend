const express = require("express");
const router = express.Router();
const pool = require("../db"); 

router.post("/", async (req, res) => {
  const { firstName, secondName, email, password } = req.body;

  if (!firstName || !secondName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (first_name, second_name, email, password, role)
       VALUES ($1, $2, $3, $4, 'student')
       RETURNING id, first_name AS "firstName", second_name AS "secondName", email, role;`,
      [firstName, secondName, email, password]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating user:", err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
