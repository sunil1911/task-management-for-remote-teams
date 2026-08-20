import { useState } from "react";
import API from "../services/api";

function AddTask({ selectedBoard, getTasks }) {

    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [assignedTo, setAssignedTo] = useState("Sunil");
    const [dueDate, setDueDate] = useState("");
    const [showForm, setShowForm] = useState(false);

    const addTask = async () => {

        if (title === "") {
            return;
        }

        try {

            await API.post("/tasks", {
                title,
                board: selectedBoard,
                priority,
                assignedTo,
                dueDate,
            });

            setTitle("");
            setPriority("Medium");
            setAssignedTo("Sunil");
            setDueDate("");

            getTasks();
            setShowForm(false);

        } catch (error) {
            console.log(error);
        }

    };

    return (
        <>
            <button
                onClick={() => setShowForm(true)}
            >
                + Add Task
            </button>

            {showForm && (
                <div className="modal-overlay">

                    <div className="add-task modal">

                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Task Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <input
                            type="text"
                            placeholder="Assigned To"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        />

                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />

                        <button
                            onClick={addTask}
                        >
                            Save Task
                        </button>

                        <button
                            onClick={() => setShowForm(false)}
                            style={{
                                background: "#6b7280",
                            }}
                        >
                            Cancel
                        </button>

                    </div>

                </div>
            )}
        </>
    );

}

export default AddTask;