import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import RichEditor from "./RichEditor";

function TaskModal({ task, board, tasks, onClose, onSaved }) {
    const { canWrite, user } = useAuth();
    const [form, setForm] = useState(task);
    const [minutes, setMinutes] = useState(30);

    useEffect(() => {
        setForm(task);
    }, [task]);

    const save = async () => {
        await API.put(`/tasks/${task._id}`, form);
        onSaved();
        onClose();
    };

    const remove = async () => {
        if (!window.confirm("Delete this task?")) return;
        await API.delete(`/tasks/${task._id}`);
        onSaved();
        onClose();
    };

    const start = async () => {
        await API.post(`/time/start/${task._id}`);
        onSaved();
    };

    const stop = async () => {
        await API.post(`/time/stop/${task._id}`);
        onSaved();
    };

    const logTime = async () => {
        await API.post("/time", { taskId: task._id, minutes, note: "Manual entry" });
        onSaved();
    };

    const upload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const data = new FormData();
        data.append("file", file);
        await API.post(`/tasks/${task._id}/files`, data);
        onSaved();
    };

    const running = Boolean(form.timerStartedAt);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <h3>Task details</h3>
                    <button className="ghost" onClick={onClose}>
                        Close
                    </button>
                </div>
                <input
                    value={form.title || ""}
                    disabled={!canWrite}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
                <div className="grid-2">
                    <select
                        value={form.priority}
                        disabled={!canWrite}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                    </select>
                    <input
                        value={form.assignedTo || ""}
                        disabled={!canWrite}
                        placeholder="Assignee"
                        onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                    />
                    <input
                        type="date"
                        disabled={!canWrite}
                        value={form.dueDate ? String(form.dueDate).slice(0, 10) : ""}
                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                    <input
                        type="number"
                        disabled={!canWrite}
                        placeholder="Estimate hours"
                        value={form.estimatedHours || ""}
                        onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
                    />
                </div>
                <label className="check">
                    <input
                        type="checkbox"
                        disabled={!canWrite}
                        checked={!!form.billable}
                        onChange={(e) => setForm({ ...form, billable: e.target.checked })}
                    />
                    Billable
                </label>
                <p className="label">Notion-style document</p>
                <RichEditor
                    value={form.document || form.description || ""}
                    readOnly={!canWrite}
                    onChange={(html) => setForm({ ...form, document: html })}
                />
                <p className="label">Blocked by</p>
                <select
                    disabled={!canWrite}
                    value=""
                    onChange={(e) => {
                        const id = e.target.value;
                        if (!id) return;
                        const current = (form.blockedBy || []).map((b) => b._id || b);
                        setForm({ ...form, blockedBy: [...new Set([...current, id])] });
                    }}
                >
                    <option value="">Add dependency</option>
                    {tasks
                        .filter((t) => t._id !== task._id)
                        .map((t) => (
                            <option key={t._id} value={t._id}>
                                {t.title}
                            </option>
                        ))}
                </select>
                <input
                    disabled={!canWrite}
                    placeholder="GitHub PR URL"
                    value={form.githubPr || ""}
                    onChange={(e) => setForm({ ...form, githubPr: e.target.value })}
                />
                <div className="grid-2">
                    <select
                        disabled={!canWrite}
                        value={form.recurring?.rule || "none"}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                recurring: {
                                    enabled: e.target.value !== "none",
                                    rule: e.target.value,
                                },
                            })
                        }
                    >
                        <option value="none">No recurrence</option>
                        <option value="daily">Daily standup</option>
                        <option value="weekly">Weekly review</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <input type="file" disabled={!canWrite} onChange={upload} />
                </div>
                <div className="attachments">
                    {(form.attachments || []).map((file) => (
                        <a
                            key={file.filename}
                            href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${file.url}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {file.originalName}
                        </a>
                    ))}
                </div>
                <div className="timer-row">
                    <span>
                        Logged {form.timeSpent || 0} min {running ? "• timer running" : ""}
                    </span>
                    {canWrite && (
                        <>
                            {running ? (
                                <button type="button" onClick={stop}>
                                    Stop timer
                                </button>
                            ) : (
                                <button type="button" onClick={start}>
                                    Start timer
                                </button>
                            )}
                            <input
                                type="number"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                            />
                            <button type="button" className="ghost" onClick={logTime}>
                                Add minutes
                            </button>
                        </>
                    )}
                </div>
                {canWrite && (
                    <div className="modal-actions">
                        <button onClick={save}>Save</button>
                        <button className="danger" onClick={remove}>
                            Delete
                        </button>
                    </div>
                )}
                <p className="tiny">Editing as {user?.name}</p>
                {board?.githubRepo && form.githubPr && (
                    <p className="tiny">
                        Linked PR in {board.githubRepo}
                    </p>
                )}
            </div>
        </div>
    );
}

export default TaskModal;
