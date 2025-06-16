const express = require("express");
const cors    = require("cors");
const path    = require("path");
const fs      = require("fs");  
const dotenv  = require("dotenv");
dotenv.config();

const uploadsDir = path.join(__dirname, "uploads");
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
        console.log("📁 Created uploads directory");
    }
} catch (err) {
    console.error("Failed to create uploads directory:", err);
}

const pool               = require("./db");
const lostItemsRouter    = require("./routes/lostItems");
const foundItemsRouter   = require("./routes/foundItems");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/uploads", express.static(uploadsDir));  

app.use("/api/lost-items", lostItemsRouter);
app.use("/api/found-items", foundItemsRouter);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

const port = process.env.PORT || 3001;
app.listen(port, () =>
  console.log(`🚀 Backend listening at http://localhost:${port}`)
);
