function emitBoard(req, boardId, event, payload) {
    const io = req.app.get("io");
    if (io && boardId) {
        io.to(String(boardId)).emit(event, payload);
    }
}

async function slackNotify(webhook, text) {
    if (!webhook) return;
    try {
        await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
    } catch (error) {
        console.log("Slack notify skipped:", error.message);
    }
}

module.exports = { emitBoard, slackNotify };
