import DeleteTask from "./DeleteTask.tsx";

type Props = {
    id: string
    title: string,
    description: string
    onDeleteTask: (id: string) => void;
}



function TaskComponent({id, title, description, onDeleteTask}: Props) {
    const handleDragStart = (e: React.DragEvent) => {
        const img = new Image();
        img.src = "/droid.png";
        img.height = 2000;
        img.width = 2000;

        // We use the ID of the element to know what to move
        e.dataTransfer.setData("text/plain", id);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setDragImage(img, 10, 10);

        console.log("Element picked up");
        console.log(e);
    };

    const handleDragOver = (e: React.DragEvent) => {
        // CRITICAL: This allows the drop to happen
        // e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const data = e.dataTransfer.getData("text/plain");
        console.log("Dragged over: ", data);
    };
    return (
        <div className={"task"} key={id} draggable="true" onDragStart={handleDragStart} onDragOver={handleDragOver}>
            <h3>{title}</h3>
            <DeleteTask onDeleteTask={() => onDeleteTask(id)} />
            <p>{description}</p>
        </div>
    )
}

export default TaskComponent;