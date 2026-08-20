const express = require("express");
const router = express.Router();

const {
    addTask,
    getTasks,
    updateTask,
    deleteTask,
    getTasksByBoard,
    searchTasks,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByDueDate,
    updateTimeSpent,
} = require("../controllers/taskController");

router.get("/", getTasks);
router.get("/board/:boardId", getTasksByBoard);
router.get("/search/:keyword", searchTasks);
router.get("/status/:status", getTasksByStatus);
router.get("/priority/:priority", getTasksByPriority);
router.get("/duedate/:date", getTasksByDueDate);
router.post("/", addTask);
router.put("/:id", updateTask);
router.put("/time/:id", updateTimeSpent);
router.delete("/:id", deleteTask);

module.exports = router;