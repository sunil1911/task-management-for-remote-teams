const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
    {
        boardName: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Board", boardSchema);