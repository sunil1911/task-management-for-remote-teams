import { useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";

import API from "../services/api";
import AddTask from "./AddTask";
import TaskCard from "./TaskCard";


function Board({
    selectedBoard,
    search,
    statusFilter,
    priorityFilter,
}) {

    const [tasks, setTasks] = useState([]);
    

    useEffect(() => {

        if (selectedBoard) {
            getTasks();
        }

    }, [selectedBoard, search, statusFilter, priorityFilter]);

    const getTasks = async () => {

        try {

            let res;

            if (search.trim() !== "") {

                res = await API.get(
                    `/tasks/search/${encodeURIComponent(search)}?board=${selectedBoard}`
                );

            }
            else if (statusFilter !== "All") {

                res = await API.get(
                    `/tasks/status/${statusFilter}?board=${selectedBoard}`
                );

            }
            else if (priorityFilter !== "All") {

                res = await API.get(
                    `/tasks/priority/${priorityFilter}?board=${selectedBoard}`
                );

            }
            else {

                res = await API.get(
                    `/tasks/board/${selectedBoard}`
                );

            }

            setTasks(res.data);

        } catch (error) {

            console.log(error);

        }

    };

    const onDragEnd = async (result) => {

        if (!result.destination) return;

        const taskId = result.draggableId;
        const newStatus = result.destination.droppableId;

        const task = tasks.find((t) => t._id === taskId);

        if (!task) return;

        if (task.status === newStatus) return;

        try {

            await API.put(`/tasks/${taskId}`, {
                ...task,
                status: newStatus,
            });

            getTasks();

        } catch (error) {

            console.log(error);

        }

    };

    
    const todo = tasks.filter(task => task.status === "Todo");

    const progress = tasks.filter(task => task.status === "In Progress");

    const done = tasks.filter(task => task.status === "Done");

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">

                {/* TODO COLUMN */}
                <Droppable droppableId="Todo">
                    {(provided) => (
                        <div
                            className="column"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <div className="todo-header">

                                <h3>Todo</h3>

                                

                            </div>

                            

                            <AddTask
                                selectedBoard={selectedBoard}
                                getTasks={getTasks}
                            />

                            {todo.map((task, index) => (
                                <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <TaskCard
                                                task={task}
                                                getTasks={getTasks}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}

                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* IN PROGRESS */}
                <Droppable droppableId="In Progress">
                    {(provided) => (
                        <div
                            className="column"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <h3>In Progress</h3>

                            {progress.map((task, index) => (
                                <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <TaskCard
                                                task={task}
                                                getTasks={getTasks}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}

                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* DONE */}
                <Droppable droppableId="Done">
                    {(provided) => (
                        <div
                            className="column"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            <h3>Done</h3>

                            {done.map((task, index) => (
                                <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <TaskCard
                                                task={task}
                                                getTasks={getTasks}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}

                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

            </div>
        </DragDropContext>
    );
}

export default Board;