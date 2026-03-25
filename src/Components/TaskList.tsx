import { Task} from "../models/Task";
import AddTask from "./AddTask.tsx";

type Props = {
    title: string,
    taskList: Task[]
}

function TaskList({title, taskList}:Props) {
    return(
        <div className={"task-list"}>
            <h2>{title}</h2>
            <div className={"task-box"}>
                {taskList.map(task => (<div className={"task"} key={task.id}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                </div>))}
            </div>
            <AddTask onAddList={}/>
        </div>
    )
}

export default TaskList;

