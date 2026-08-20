import API from "../services/api";

function TaskCard({
    task,
    getTasks,
}) {
    const deleteTask = async () => {

        try {

            await API.delete(`/tasks/${task._id}`);

            getTasks();

        } catch (error) {

            console.log(error);

        }

    };

    const changeStatus = async (e) => {

        try {

            await API.put(`/tasks/${task._id}`, {
                ...task,
                status: e.target.value,
            });

            getTasks();

        } catch (error) {

            console.log(error);

        }

    };

    const editTask = async () => {

        const newTitle = prompt("Enter new title", task.title);

        if (!newTitle) return;

        try {

            await API.put(`/tasks/${task._id}`, {

                ...task,

                title: newTitle

            });

            getTasks();

        } catch (error) {

            console.log(error);

        }

    };

    return (

        <div
            
            style={{
                border: "2px solid",
                padding: "10px",
                margin: "10px",
                cursor: "grab",
            }}
        >

            <h4>{task.title}</h4>

            <p>
                <b>Priority :</b>

                <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>
            </p>

            <p>
                <b>Assigned :</b> {task.assignedTo}
            </p>

            <p>
                <b>Due :</b>{" "}
                {task.dueDate
                    ?new Date(task.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    })
                : "No Date"}
            </p>

            <select
                value={task.status}
                onChange={changeStatus}
            >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
            </select>

            <div className="task-buttons">

                <button onClick={editTask}>
                    Edit
                </button>

                <button onClick={deleteTask}>
                    Delete
                </button>

            </div>

        </div>

    );

}

export default TaskCard;