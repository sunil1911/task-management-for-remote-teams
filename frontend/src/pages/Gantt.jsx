function Gantt({ tasks }) {
    const start = new Date();
    start.setDate(start.getDate() - 3);
    const days = Array.from({ length: 21 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });

    return (
        <div className="panel">
            <h2>Dependency timeline</h2>
            <div className="gantt">
                <div className="gantt-head">
                    <span className="gantt-name">Task</span>
                    {days.map((d) => (
                        <span key={d.toISOString()} className="gantt-day">
                            {d.getDate()}
                        </span>
                    ))}
                </div>
                {tasks.map((task) => {
                    const due = task.dueDate ? new Date(task.dueDate) : new Date();
                    const created = task.createdAt ? new Date(task.createdAt) : start;
                    const left = Math.max(0, Math.round((created - start) / 86400000));
                    const width = Math.max(1, Math.round((due - created) / 86400000) + 1);
                    return (
                        <div className="gantt-row" key={task._id}>
                            <span className="gantt-name">
                                {task.title}
                                {task.blockedBy?.length ? " ⛓️" : ""}
                            </span>
                            <div className="gantt-track">
                                <div
                                    className={`gantt-bar ${task.priority?.toLowerCase()}`}
                                    style={{
                                        marginLeft: `${(left / 21) * 100}%`,
                                        width: `${Math.min(100, (width / 21) * 100)}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Gantt;
