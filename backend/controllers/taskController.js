const Task = require("../models/Task");

const addTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);

        res.json({
            message: "Task Deleted Successfully",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTasksByBoard = async (req, res) => {
    try {
        const tasks = await Task.find({
            board: req.params.boardId,
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const searchTasks = async (req, res) => {
    try {

        const { keyword } = req.params;
        const { board } = req.query;

        let filter = {
            title: {
                $regex: keyword,
                $options: "i",
            },
        };

        if (board) {
            filter.board = board;
        }

        const tasks = await Task.find(filter);

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const getTasksByStatus = async (req, res) => {
    try {

        const { status } = req.params;
        const { board } = req.query;

        let filter = {
            status,
        };

        if (board) {
            filter.board = board;
        }

        const tasks = await Task.find(filter);

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};
const getTasksByPriority = async (req, res) => {
    try {

        const { priority } = req.params;
        const { board } = req.query;

        let filter = {
            priority,
        };

        if (board) {
            filter.board = board;
        }

        const tasks = await Task.find(filter);

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }
};

const getTasksByDueDate = async (req, res) => {
    try {
        const tasks = await Task.find({
            dueDate: req.params.date,
        });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const updateTimeSpent = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                timeSpent: req.body.timeSpent,
            },
            { new: true }
        );

        res.json(task);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
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
};
