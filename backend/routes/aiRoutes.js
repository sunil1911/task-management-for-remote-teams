const express = require("express");
const router = express.Router();
const { digest } = require("../controllers/aiController");
const { auth } = require("../middleware/auth");

router.get("/digest", auth, digest);

module.exports = router;
