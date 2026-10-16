const { rankTasks } = require("../utils/aiPriority");
const { generateRecurringTasks } = require("../utils/recurring");

const digest = async (req, res) => {
    try {
        await generateRecurringTasks();
        const ranked = await rankTasks(req.query.board);
        res.json({
            generatedAt: new Date(),
            source: process.env.OPENAI_API_KEY ? "openai+heuristic" : "heuristic",
            tasks: ranked,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { digest };
