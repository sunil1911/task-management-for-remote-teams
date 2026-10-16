const Board = require("../models/Board");
const Task = require("../models/Task");
const { emitBoard } = require("../utils/notify");

const addBoard = async (req, res) => {
    try {
        const board = await Board.create({
            boardName: req.body.boardName,
            description: req.body.description || "",
            members: [{ user: req.user._id, role: req.user.role }],
            clientName: req.body.clientName || "",
            clientEmail: req.body.clientEmail || "",
        });
        emitBoard(req, board._id, "board:changed", { type: "board-created" });
        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBoards = async (req, res) => {
    try {
        const boards = await Board.find().populate("members.user", "name email role avatarColor");
        const defaults = [
            { key: "todo", title: "Todo", order: 0 },
            { key: "in-progress", title: "In Progress", order: 1 },
            { key: "done", title: "Done", order: 2 },
        ];
        for (const board of boards) {
            if (!board.columns?.length) {
                board.columns = defaults;
                await board.save();
            }
        }
        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBoard = async (req, res) => {
    try {
        const board = await Board.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        }).populate("members.user", "name email role avatarColor");
        emitBoard(req, req.params.id, "board:changed", { type: "board-updated", board });
        res.json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBoard = async (req, res) => {
    try {
        const boardId = req.params.id;
        await Task.deleteMany({ board: boardId });
        await Board.findByIdAndDelete(boardId);
        emitBoard(req, boardId, "board:changed", { type: "board-deleted" });
        res.json({ message: "Board and its tasks deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addColumn = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        const key = `col-${Date.now()}`;
        board.columns.push({
            key,
            title: req.body.title || "New column",
            order: board.columns.length,
        });
        await board.save();
        emitBoard(req, board._id, "board:changed", { type: "column-added" });
        res.json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateColumn = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        const column = board.columns.find((c) => c.key === req.params.columnKey);
        if (!column) return res.status(404).json({ message: "Column not found" });
        if (req.body.title) column.title = req.body.title;
        await board.save();
        emitBoard(req, board._id, "board:changed", { type: "column-updated" });
        res.json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteColumn = async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (board.columns.length <= 1) {
            return res.status(400).json({ message: "At least one column is required" });
        }
        board.columns = board.columns.filter((c) => c.key !== req.params.columnKey);
        await board.save();
        const first = board.columns[0];
        await Task.updateMany(
            { board: board._id, columnKey: req.params.columnKey },
            { columnKey: first.key, status: first.title === "Done" ? "Done" : "Todo" }
        );
        emitBoard(req, board._id, "board:changed", { type: "column-deleted" });
        res.json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addBoard,
    getBoards,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
};
