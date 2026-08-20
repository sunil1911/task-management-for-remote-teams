const express = require("express");
const router = express.Router();

const {
    addBoard,
    getBoards,
    updateBoard,
    deleteBoard,
} = require("../controllers/boardController");

router.get("/", getBoards);
router.post("/", addBoard);
router.put("/:id", updateBoard);
router.delete("/:id", deleteBoard);


module.exports = router;