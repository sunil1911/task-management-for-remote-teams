const Board = require("../models/Board");
const Task = require("../models/Task");

const addBoard = async (req, res) => {
    try {
        const board = await Board.create(req.body);
        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBoards = async (req, res) => {
    try {
        const boards = await Board.find();
        res.json(boards);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const updateBoard = async (req, res) => {
    try {
        const board = await Board.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(board);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const deleteBoard = async (req, res) => {

    try {

        const boardId = req.params.id;

        await Task.deleteMany({
            board: boardId,
        });

        await Board.findByIdAndDelete(boardId);

        res.json({
            message: "Board and its tasks deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            message: error.message,
        });

    }

};
module.exports = {
    addBoard,
    getBoards,
    updateBoard,
    deleteBoard,
};