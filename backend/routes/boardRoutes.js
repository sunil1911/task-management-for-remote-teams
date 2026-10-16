const express = require("express");
const router = express.Router();
const {
    addBoard,
    getBoards,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
} = require("../controllers/boardController");
const { auth, requireWrite } = require("../middleware/auth");

router.get("/", auth, getBoards);
router.post("/", auth, requireWrite, addBoard);
router.put("/:id", auth, requireWrite, updateBoard);
router.delete("/:id", auth, requireWrite, deleteBoard);
router.post("/:id/columns", auth, requireWrite, addColumn);
router.put("/:id/columns/:columnKey", auth, requireWrite, updateColumn);
router.delete("/:id/columns/:columnKey", auth, requireWrite, deleteColumn);

module.exports = router;
