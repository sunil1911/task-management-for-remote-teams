const express = require("express");
const router = express.Router();
const { list, addManual, startTimer, stopTimer, summary } = require("../controllers/timeController");
const { auth, requireWrite } = require("../middleware/auth");

router.get("/", auth, list);
router.get("/summary", auth, summary);
router.post("/", auth, requireWrite, addManual);
router.post("/start/:taskId", auth, requireWrite, startTimer);
router.post("/stop/:taskId", auth, requireWrite, stopTimer);

module.exports = router;
