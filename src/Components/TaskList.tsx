// import { Task} from "../models/Task";
import AddTask from "./AddTask.tsx";
// import DeleteTask from "./DeleteTask.tsx";
import TaskComponent from "./Task.tsx";

type Task = {
    id: string;
    listId: string;
    title: string;
    description: string;
}
type Props = {
    id: string;
    title: string,
    taskList: Task[]
    onAddTask: (title:string, desc:string) => void
    onDeleteTask: (taskId: string) => void; // Expects an ID
    onChangeTaskId: (id: string, listId:string) => void;
}
//
// const handleDragStart = (e: React.DragEvent) => {
//     // We use the ID of the element to know what to move
//     e.dataTransfer.setData("text/plain", "e");
//     e.dataTransfer.effectAllowed = "move";
// };

// Handler for the Drop Zone


function TaskList({id, title, taskList, onAddTask, onDeleteTask, onChangeTaskId}:Props) {
    const handleDragOver = (e: React.DragEvent) => {
        // CRITICAL: This allows the drop to happen
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const data = e.dataTransfer.getData("text/plain");
        console.log("Dragged over: ", data);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");

        // In a real app, you would update state here!
        console.log("Dropped:", data);
        console.log("Dropped in list with id: ", id);
        onChangeTaskId(data, id);
    };
    return(
        <div className={"task-list"} onDragOver={handleDragOver} onDrop={handleDrop}>
            <h2>{title}</h2>
            <div className={"task-box"}>

                {taskList.map( (task) => (
                    <TaskComponent
                        key = {task.id}
                        id={task.id}
                        title={task.title}
                        description={task.description}
                        onDeleteTask={onDeleteTask}


                />))}

            </div>
            <AddTask onAddTask={onAddTask}/>
        </div>
    )
}

export default TaskList;

