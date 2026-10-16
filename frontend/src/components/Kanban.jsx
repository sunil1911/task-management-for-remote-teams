import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import TaskModal from "./TaskModal";

function Kanban({ board, tasks, reload, users }) {
    const { canWrite } = useAuth();
    const [open, setOpen] = useState(null);
    const [draft, setDraft] = useState({ title: "", priority: "Medium", assignedTo: "" });

    const columns = [...(board.columns || [])].sort((a, b) => a.order - b.order);

    const onDragEnd = async (result) => {
        if (!result.destination || !canWrite) return;
        const taskId = result.draggableId;
        const columnKey = result.destination.droppableId;
        const order = result.destination.index;
        await API.put(`/tasks/${taskId}/move`, { columnKey, order });
        reload();
    };

    const addTask = async (columnKey) => {
        if (!draft.title.trim()) return;
        await API.post("/tasks", {
            title: draft.title,
            board: board._id,
            columnKey,
            priority: draft.priority,
            assignedTo: draft.assignedTo,
        });
        setDraft({ title: "", priority: "Medium", assignedTo: "" });
        reload();
    };

    return (
        <>
            <div className="composer">
                <input
                    placeholder="New task title"
                    value={draft.title}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
                <select
                    value={draft.priority}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
                >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
                <input
                    list="assignees"
                    placeholder="Assignee"
                    disabled={!canWrite}
                    value={draft.assignedTo}
                    onChange={(e) => setDraft({ ...draft, assignedTo: e.target.value })}
                />
                <datalist id="assignees">
                    {(users || []).map((u) => (
                        <option key={u._id} value={u.name} />
                    ))}
                </datalist>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="board">
                    {columns.map((col) => {
                        const cards = tasks.filter((t) => t.columnKey === col.key);
                        return (
                            <Droppable droppableId={col.key} key={col.key}>
                                {(provided) => (
                                    <div
                                        className="column"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        <div className="todo-header">
                                            <h3>
                                                {col.title} <small>{cards.length}</small>
                                            </h3>
                                            {canWrite && (
                                                <div className="col-actions">
                                                    <button
                                                        className="tiny-btn"
                                                        onClick={async () => {
                                                            const title = prompt("Column name", col.title);
                                                            if (!title) return;
                                                            await API.put(
                                                                `/boards/${board._id}/columns/${col.key}`,
                                                                { title }
                                                            );
                                                            reload();
                                                        }}
                                                    >
                                                        Rename
                                                    </button>
                                                    <button
                                                        className="tiny-btn danger-text"
                                                        onClick={async () => {
                                                            await API.delete(
                                                                `/boards/${board._id}/columns/${col.key}`
                                                            );
                                                            reload();
                                                        }}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {canWrite && (
                                            <button className="ghost" onClick={() => addTask(col.key)}>
                                                + Add to {col.title}
                                            </button>
                                        )}
                                        {cards.map((task, index) => (
                                            <Draggable
                                                key={task._id}
                                                draggableId={task._id}
                                                index={index}
                                                isDragDisabled={!canWrite}
                                            >
                                                {(drag) => (
                                                    <div
                                                        className="task-card"
                                                        ref={drag.innerRef}
                                                        {...drag.draggableProps}
                                                        {...drag.dragHandleProps}
                                                        onClick={() => setOpen(task)}
                                                    >
                                                        <h4>{task.title}</h4>
                                                        <p>
                                                            <span
                                                                className={`priority ${String(task.priority).toLowerCase()}`}
                                                            >
                                                                {task.priority}
                                                            </span>
                                                            {task.aiScore ? ` • AI ${task.aiScore}` : ""}
                                                        </p>
                                                        <p>
                                                            {task.assignedTo || "Unassigned"} ·{" "}
                                                            {task.dueDate
                                                                ? new Date(task.dueDate).toLocaleDateString()
                                                                : "No due"}
                                                        </p>
                                                        {task.blockedBy?.length > 0 && (
                                                            <p className="tiny">Blocked by {task.blockedBy.length}</p>
                                                        )}
                                                        {task.timerStartedAt && (
                                                            <p className="live">Timer on</p>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        );
                    })}
                </div>
            </DragDropContext>
            {open && (
                <TaskModal
                    task={open}
                    board={board}
                    tasks={tasks}
                    onClose={() => setOpen(null)}
                    onSaved={reload}
                />
            )}
        </>
    );
}

export default Kanban;
