const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
    addTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    getTasksByBoard,
    moveTask,
} = require("../controllers/taskController");
const { attachToTask } = require("../controllers/uploadController");
const { auth, requireWrite } = require("../middleware/auth");

const storage = multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

router.get("/", auth, getTasks);
router.get("/board/:boardId", auth, getTasksByBoard);
router.get("/:id", auth, getTask);
router.post("/", auth, requireWrite, addTask);
router.put("/:id/move", auth, requireWrite, moveTask);
router.put("/:id", auth, requireWrite, updateTask);
router.delete("/:id", auth, requireWrite, deleteTask);
router.post("/:taskId/files", auth, requireWrite, upload.single("file"), attachToTask);

module.exports = router;
