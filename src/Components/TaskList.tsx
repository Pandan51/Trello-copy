// import { Task} from "../models/Task";
import AddTask from "./AddTask.tsx";
// import DeleteTask from "./DeleteTask.tsx";
import TaskComponent from "./TaskComponent.tsx";

type Task = {
    id: string;
    listId: string;
    title: string;
    description: string;
    isGhost?: boolean;
}
type Props = {
    id: string;
    title: string,
    taskList: Task[]
    onAddTask: (title:string, desc:string) => void
    onDeleteTask: (taskId: string) => void; // Expects an ID
    onChangeTaskId: (id: string, listId:string) => void;
    onHover: (taskId: string, before: boolean) => void;
    onDragStartTask: (taskId: string) => void;
    onDragEndTask: () => void;
}
//
// const handleDragStart = (e: React.DragEvent) => {
//     // We use the ID of the element to know what to move
//     e.dataTransfer.setData("text/plain", "e");
//     e.dataTransfer.effectAllowed = "move";
// };

// Handler for the Drop Zone


function TaskList({id, title, taskList, onAddTask, onDeleteTask, onChangeTaskId, onHover, onDragStartTask, onDragEndTask}:Props) {
    // const handleDragOver = (e: React.DragEvent) => {
    //     // CRITICAL: This allows the drop to happen
    //     e.preventDefault();
    //     e.dataTransfer.dropEffect = "move";
    //     const data = e.dataTransfer.getData("text/plain");
    //     console.log("Dragged over: ", data);
    // };
    //
    // const handleDrop = (e: React.DragEvent) => {
    //     e.preventDefault();
    //     const data = e.dataTransfer.getData("text/plain");
    //
    //     // In a real app, you would update state here!
    //     console.log("Dropped:", data);
    //     console.log("Dropped in list with id: ", id);
    //     onChangeTaskId(data, id);
    // };

    // 3. Simplify drag over (just needs to prevent default to allow dropping)
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");

        console.log("Dropped task ID:", data, "into list:", id);
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
                        isGhost={task.isGhost}
                        onDeleteTask={onDeleteTask}
                        onHover={onHover}
                        onDragStartTask={onDragStartTask}
                        onDragEndTask={onDragEndTask}


                />))}

            </div>
            <AddTask onAddTask={onAddTask}/>
        </div>
    )
}

export default TaskList;

