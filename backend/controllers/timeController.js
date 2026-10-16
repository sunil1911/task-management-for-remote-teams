const TimeEntry = require("../models/TimeEntry");
const Task = require("../models/Task");
const { emitBoard } = require("../utils/notify");

const list = async (req, res) => {
    try {
        const filter = {};
        if (req.query.board) filter.board = req.query.board;
        if (req.query.from || req.query.to) {
            filter.startedAt = {};
            if (req.query.from) filter.startedAt.$gte = new Date(req.query.from);
            if (req.query.to) filter.startedAt.$lte = new Date(req.query.to);
        }
        const entries = await TimeEntry.find(filter)
            .populate("task", "title")
            .sort({ startedAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addManual = async (req, res) => {
    try {
        const { taskId, minutes, note, billable } = req.body;
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });
        const entry = await TimeEntry.create({
            task: task._id,
            board: task.board,
            userName: req.user.name,
            minutes: Number(minutes) || 0,
            note: note || "",
            billable: billable !== false,
            startedAt: req.body.startedAt || new Date(),
            endedAt: new Date(),
        });
        task.timeSpent = (task.timeSpent || 0) + entry.minutes;
        await task.save();
        emitBoard(req, task.board, "board:changed", { type: "time-added" });
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const startTimer = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        task.timerStartedAt = new Date();
        await task.save();
        emitBoard(req, task.board, "board:changed", { type: "timer-started", task });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const stopTimer = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task.timerStartedAt) {
            return res.status(400).json({ message: "Timer is not running" });
        }
        const minutes = Math.max(
            1,
            Math.round((Date.now() - new Date(task.timerStartedAt).getTime()) / 60000)
        );
        const entry = await TimeEntry.create({
            task: task._id,
            board: task.board,
            userName: req.user.name,
            minutes,
            note: "Timer",
            billable: task.billable,
            startedAt: task.timerStartedAt,
            endedAt: new Date(),
        });
        task.timeSpent = (task.timeSpent || 0) + minutes;
        task.timerStartedAt = null;
        await task.save();
        emitBoard(req, task.board, "board:changed", { type: "timer-stopped", task });
        res.json({ task, entry });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const summary = async (req, res) => {
    try {
        const board = req.query.board;
        const from = req.query.from ? new Date(req.query.from) : new Date(Date.now() - 7 * 86400000);
        const to = req.query.to ? new Date(req.query.to) : new Date();
        const entries = await TimeEntry.find({
            board,
            startedAt: { $gte: from, $lte: to },
        }).populate("task", "title");

        const byUser = {};
        const byTask = {};
        let billable = 0;
        entries.forEach((e) => {
            byUser[e.userName] = (byUser[e.userName] || 0) + e.minutes;
            const t = e.task?.title || "Task";
            byTask[t] = (byTask[t] || 0) + e.minutes;
            if (e.billable) billable += e.minutes;
        });

        res.json({
            from,
            to,
            totalMinutes: entries.reduce((s, e) => s + e.minutes, 0),
            billableMinutes: billable,
            byUser,
            byTask,
            entries,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { list, addManual, startTimer, stopTimer, summary };
