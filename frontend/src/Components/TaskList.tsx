import AddTask from "./AddTask.tsx";
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
    onAddTask: (title: string, desc: string) => void
    onDeleteTask: (taskId: string) => void;
    onChangeTaskPosition: (id: string, listId: string) => void; // Renamed for clarity
    onHover: (taskId: string, before: boolean) => void;
    onListHover: (listId: string) => void; // New prop for empty lists
    onDragStartTask: (taskId: string) => void;
    onDragEndTask: () => void;
    onTaskClick: (taskId: string) => void;
    onTaskListClick: (taskId: string) => void;
}

function TaskList({
                      id, title, taskList, onAddTask, onDeleteTask,
                      onChangeTaskPosition, onHover, onListHover,
                      onDragStartTask, onDragEndTask,
                      onTaskClick, onTaskListClick
                  }: Props) {

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        console.log(taskList.length);
        // If the list is empty, tell the parent to show the placeholder!
        if (taskList.length === 0) {
            onListHover(id);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const data = e.dataTransfer.getData("text/plain");

        onChangeTaskPosition(data, id);
    };

    return (
        <div className={"task-list"} onDragOver={handleDragOver} onDrop={handleDrop}>
            <h2 className={"task-list-h2"} onClick={()=>onTaskListClick(id)}>{title}</h2>
            {/* Added minHeight so empty lists have a physical drop zone! */}
            <div className={"task-box"} style={{ minHeight: "50px" }}>
                {taskList.map((task) => (
                    <TaskComponent
                        key={task.id}
                        id={task.id}
                        title={task.title}
                        description={task.description}
                        isGhost={task.isGhost}
                        onDeleteTask={onDeleteTask}
                        onHover={onHover}
                        onDragStartTask={onDragStartTask}
                        onDragEndTask={onDragEndTask}
                        onClick={() => onTaskClick(task.id)}
                    />
                ))}
            </div>
            <AddTask onAddTask={onAddTask} />
        </div>
    )
}

export default TaskList;