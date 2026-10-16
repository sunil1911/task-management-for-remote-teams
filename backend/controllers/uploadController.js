const Task = require("../models/Task");
const { emitBoard } = require("../utils/notify");

const attachToTask = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const task = await Task.findById(req.params.taskId);
        const file = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            url: `/uploads/${req.file.filename}`,
        };
        task.attachments.push(file);
        await task.save();
        emitBoard(req, task.board, "board:changed", { type: "file-attached" });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { attachToTask };
