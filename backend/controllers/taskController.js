const Task = require("../models/Task");
const { emitBoard, slackNotify } = require("../utils/notify");
const Board = require("../models/Board");

const statusFromColumn = (board, columnKey) => {
    const col = board?.columns?.find((c) => c.key === columnKey);
    const title = col?.title || "Todo";
    if (/done|complete/i.test(title)) return "Done";
    if (/progress|doing/i.test(title)) return "In Progress";
    return "Todo";
};

const addTask = async (req, res) => {
    try {
        const board = await Board.findById(req.body.board);
        const columnKey = req.body.columnKey || board?.columns?.[0]?.key || "todo";
        const count = await Task.countDocuments({ board: req.body.board, columnKey });
        const task = await Task.create({
            ...req.body,
            columnKey,
            order: count,
            status: statusFromColumn(board, columnKey),
        });
        emitBoard(req, task.board, "board:changed", { type: "task-added", task });
        await slackNotify(board?.slackWebhook, `New task: ${task.title}`);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate("blockedBy", "title columnKey");
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate("blockedBy", "title columnKey");
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const existing = await Task.findById(req.params.id);
        const board = await Board.findById(existing.board);
        const body = { ...req.body };
        if (body.columnKey) {
            body.status = statusFromColumn(board, body.columnKey);
        }
        const task = await Task.findByIdAndUpdate(req.params.id, body, {
            new: true,
        }).populate("blockedBy", "title columnKey");
        emitBoard(req, task.board, "board:changed", { type: "task-updated", task });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (task) {
            emitBoard(req, task.board, "board:changed", { type: "task-deleted", id: task._id });
        }
        res.json({ message: "Task Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasksByBoard = async (req, res) => {
    try {
        const { keyword, status, priority } = req.query;
        const filter = { board: req.params.boardId };
        if (keyword) {
            filter.title = { $regex: keyword, $options: "i" };
        }
        if (status && status !== "All") {
            filter.status = status;
        }
        if (priority && priority !== "All") {
            filter.priority = priority;
        }
        const tasks = await Task.find(filter)
            .populate("blockedBy", "title columnKey")
            .sort({ order: 1, createdAt: 1 });

        const mapped = tasks.map((task) => {
            const json = task.toObject();
            if (!json.columnKey) {
                json.columnKey =
                    json.status === "Done"
                        ? "done"
                        : json.status === "In Progress"
                          ? "in-progress"
                          : "todo";
            }
            return json;
        });
        res.json(mapped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const moveTask = async (req, res) => {
    try {
        const { columnKey, order } = req.body;
        const existing = await Task.findById(req.params.id);
        const board = await Board.findById(existing.board);
        existing.columnKey = columnKey;
        existing.order = order ?? existing.order;
        existing.status = statusFromColumn(board, columnKey);
        await existing.save();
        emitBoard(req, existing.board, "board:changed", { type: "task-moved", task: existing });
        res.json(existing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    getTasksByBoard,
    moveTask,
};
