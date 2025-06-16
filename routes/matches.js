const express = require("express");
const router = express.Router();
const pool = require("../db");

const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;   
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE; 

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});

function checkAdmin(req, res, next) {
  const namespace = "http://foundit.example.com/roles";
  const userRoles = Array.isArray(req.user[namespace]) ? req.user[namespace] : [];
  if (!userRoles.includes("admin")) {
    return res.status(403).json({ error: "Admins only" });
  }
  next();
}


router.get("/", checkJwt, checkAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.*,
             li.name AS lost_name,
             fi.name AS found_name,
             u.name   AS matched_by_name
      FROM matches m
      JOIN lostitem li ON li.id = m.lost_item_id
      JOIN founditem fi ON fi.id = m.found_item_id
      JOIN users u  ON u.id = m.matched_by
      ORDER BY m.matched_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch matches" });
  }
});


router.post("/", checkJwt, checkAdmin, async (req, res) => {
  const { lost_item_id, found_item_id, matched_by } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const matchRes = await client.query(
      `INSERT INTO matches
        (lost_item_id, found_item_id, matched_by)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [lost_item_id, found_item_id, matched_by]
    );
    await client.query(
      `UPDATE lostitem SET status = 'matched' WHERE id = $1`,
      [lost_item_id]
    );
    await client.query(
      `UPDATE founditem SET status = 'matched' WHERE id = $1`,
      [found_item_id]
    );
    await client.query("COMMIT");
    res.status(201).json(matchRes.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not create match" });
  } finally {
    client.release();
  }
});

router.delete("/:id", checkJwt, checkAdmin, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const m = await client.query(
      "SELECT lost_item_id, found_item_id FROM matches WHERE id = $1",
      [id]
    );
    if (m.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Match not found" });
    }
    const { lost_item_id, found_item_id } = m.rows[0];
    await client.query("DELETE FROM matches WHERE id = $1", [id]);
    await client.query(
      `UPDATE lostitem SET status = 'pending' WHERE id = $1`,
      [lost_item_id]
    );
    await client.query(
      `UPDATE founditem SET status = 'pending' WHERE id = $1`,
      [found_item_id]
    );
    await client.query("COMMIT");
    res.sendStatus(204);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not delete match" });
  } finally {
    client.release();
  }
});

module.exports = router;
