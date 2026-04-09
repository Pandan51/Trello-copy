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
    title: string,
    taskList: Task[]
    onAddTask: (title:string, desc:string) => void
    onDeleteTask: (taskId: string) => void; // Expects an ID
}

function TaskList({title, taskList, onAddTask, onDeleteTask}:Props) {
    return(
        <div className={"task-list"}>
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

