import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Board from "../components/Board";
import API from "../services/api";

function Dashboard() {

    const [boards, setBoards] = useState([]);
    const [selectedBoard, setSelectedBoard] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [priorityFilter, setPriorityFilter] = useState("All");

    useEffect(() => {
        getBoards();
    }, []);

    const getBoards = async () => {
        try {
            const res = await API.get("/boards");
            setBoards(res.data);

            if (res.data.length > 0) {
                setSelectedBoard(res.data[0]._id);
            }

        } catch (error) {
            console.log(error);
        }
    };

    const addBoard = async () => {

        const boardName = prompt("Enter Board Name");

        if (!boardName) {
            return;
        }

        try {

            await API.post("/boards", {
                boardName,
            });

            getBoards();

        } catch (error) {

            console.log(error);

        }

    };

    const deleteBoard = async () => {

        if (!selectedBoard) return;

        if (boards.length === 1) {
            alert("At least one board is required.");
            return;
        }

        const confirmDelete = window.confirm(
            "Delete this board and all its tasks?"
        );

        if (!confirmDelete) return;

        try {

            await API.delete(`/boards/${selectedBoard}`);

            getBoards();

        } catch (error) {

            console.log(error);

        }

    };

    const renameBoard = async () => {

        if (!selectedBoard) return;

        const boardName = prompt("Enter new board name");

        if (!boardName) return;

        try {

            await API.put(`/boards/${selectedBoard}`, {
                boardName,
            });

            getBoards();

        } catch (error) {

            console.log(error);

        }

    };

    return (
        <>
            <Navbar
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                priorityFilter={priorityFilter}
                setPriorityFilter={setPriorityFilter}
            />

            <div className="main">

                <Sidebar
                    boards={boards}
                    selectedBoard={selectedBoard}
                    setSelectedBoard={setSelectedBoard}
                    addBoard={addBoard}
                    deleteBoard={deleteBoard}
                    renameBoard={renameBoard}
                />

                <Board
                    selectedBoard={selectedBoard}
                    getBoards={getBoards}
                    search={search}
                    statusFilter={statusFilter}
                    priorityFilter={priorityFilter}
                />

            </div>
        </>
    );
}

export default Dashboard;