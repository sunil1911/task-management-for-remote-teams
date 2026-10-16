const Task = require("../models/Task");
const TimeEntry = require("../models/TimeEntry");

function daysUntil(date) {
    if (!date) return 14;
    return (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
}

function heuristicScore(task, workloadByAssignee = {}) {
    const due = daysUntil(task.dueDate);
    const overdue = due < 0 ? 80 : 0;
    const deadline = due >= 0 ? Math.max(0, 40 - due * 4) : 0;
    const priorityBoost =
        task.priority === "High" ? 25 : task.priority === "Medium" ? 10 : 0;
    const blockers = (task.blockedBy?.length || 0) * 8;
    const load = Math.min(20, (workloadByAssignee[task.assignedTo] || 0) / 30);
    return Math.round(overdue + deadline + priorityBoost + blockers + (20 - load));
}

async function rankTasks(boardId) {
    const tasks = await Task.find({ board: boardId }).populate("blockedBy", "title status columnKey");
    const entries = await TimeEntry.find({ board: boardId });
    const workload = {};
    entries.forEach((e) => {
        workload[e.userName] = (workload[e.userName] || 0) + e.minutes;
    });

    const ranked = tasks
        .filter((t) => t.columnKey !== "done" && t.status !== "Done")
        .map((task) => {
            const score = heuristicScore(task, workload);
            return {
                _id: task._id,
                title: task.title,
                dueDate: task.dueDate,
                priority: task.priority,
                assignedTo: task.assignedTo,
                blockedBy: task.blockedBy,
                score,
                reason:
                    daysUntil(task.dueDate) < 0
                        ? "Overdue — schedule immediately"
                        : daysUntil(task.dueDate) <= 2
                          ? "Deadline is close"
                          : task.blockedBy?.length
                            ? "Has blocking dependencies"
                            : "Balanced against team workload",
            };
        })
        .sort((a, b) => b.score - a.score);

    await Promise.all(
        ranked.map((item) =>
            Task.findByIdAndUpdate(item._id, { aiScore: item.score })
        )
    );

    if (process.env.OPENAI_API_KEY) {
        try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content:
                                "You rank tasks for a remote team. Return JSON array of {_id, reason} only.",
                        },
                        {
                            role: "user",
                            content: JSON.stringify(
                                ranked.slice(0, 12).map((t) => ({
                                    _id: t._id,
                                    title: t.title,
                                    dueDate: t.dueDate,
                                    priority: t.priority,
                                    blockers: t.blockedBy?.length || 0,
                                }))
                            ),
                        },
                    ],
                    temperature: 0.2,
                }),
            });
            const data = await res.json();
            const text = data.choices?.[0]?.message?.content || "[]";
            const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
            parsed.forEach((row) => {
                const match = ranked.find((r) => String(r._id) === String(row._id));
                if (match && row.reason) match.reason = row.reason;
            });
        } catch (error) {
            console.log("OpenAI fallback to local ranking:", error.message);
        }
    }

    return ranked.slice(0, 8);
}

module.exports = { rankTasks, heuristicScore };
