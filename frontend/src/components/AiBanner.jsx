function AiBanner({ digest }) {
    if (!digest?.tasks?.length) return null;
    return (
        <div className="ai-banner">
            <div>
                <b>Morning AI digest</b>
                <span className="muted"> · {digest.source} ranking from deadlines, blockers, workload</span>
            </div>
            <ol>
                {digest.tasks.slice(0, 5).map((task) => (
                    <li key={task._id}>
                        <b>{task.title}</b> — {task.reason}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export default AiBanner;
