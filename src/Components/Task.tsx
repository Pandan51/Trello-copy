import DeleteTask from "./DeleteTask.tsx";

type Props = {
    id: string
    title: string,
    description: string
    onDeleteTask: (id: string) => void;
}
function TaskComponent({id, title, description, onDeleteTask}: Props) {
    return (
        <div className={"task"} key={id}>
            <h3>{title}</h3>
            <DeleteTask onDeleteTask={() => onDeleteTask(id)} />
            <p>{description}</p>
        </div>
    )
}

export default TaskComponent;