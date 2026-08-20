function Sidebar({
    boards,
    selectedBoard,
    setSelectedBoard,
    addBoard,
    deleteBoard,
    renameBoard,
}) {

    return (
        <div className="sidebar">

            <h3>Boards</h3>

            <button onClick={addBoard}>
                Add Board
            </button>

            {selectedBoard && (
                <>
                    <button
                        onClick={renameBoard}
                        className="rename-board-btn"
                    >
                        Rename Board
                    </button>

                    <button
                        onClick={deleteBoard}
                        className="delete-board-btn"
                    >
                        Delete Board
                    </button>
                </>
            )}

            <ul>

                {boards.map((board) => (

                    <li
                        key={board._id}
                        onClick={() => setSelectedBoard(board._id)}
                        className={
                            selectedBoard === board._id
                                ? "active-board"
                                : ""
                        }
                    >
                        {board.boardName}
                    </li>

                ))}

            </ul>

        </div>
    );
}

export default Sidebar;