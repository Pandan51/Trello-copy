import DeleteTask from "./CRUD/DeleteTask.tsx";
import type { Task } from "../types/index.ts";
import removeMd from 'remove-markdown';

// type Props = {
//   id: string;
//   title: string;
//   description: string;
//   isGhost?: boolean; // The flag from Content.tsx
//   onDeleteTask: (id: string) => void;
//   onHover: (taskId: string, before: boolean) => void;
//   onDragStartTask: (taskId: string) => void;
//   onDragEndTask: () => void;
//   onClick: () => void;
// };

type Props = {
    task: Task; // <-- One clean prop instead of 5!
    onDeleteTask: (id: string) => void;
    onHover: (taskId: string, before: boolean) => void;
    onDragStartTask: (taskId: string) => void;
    onDragEndTask: () => void;
    onClick: () => void;
    onToggleComplete: (id: string, isCompleted: boolean) => void; // Your new function
}

function TaskComponent({
  task,
  onDeleteTask,
  onHover,
  onDragStartTask,
  onDragEndTask,
  onClick,
    onToggleComplete,
}: Props) {
  // 1. THE GHOST RENDER
  // If the parent passes isGhost=true, we don't render a real card.
  // We render a placeholder box instead.
  if (task.isGhost) {
    return (
      <div
        className="task placeholder"
        style={{
          height: "80px",
          border: "2px dashed #999",
          backgroundColor: "#f0f0f0",
          margin: "10px 0",
          borderRadius: "5px",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation(); // <-- CRITICAL: Prevents the hover from falling through to the List
        }}
      />
    );
  }

  // 2. DRAG START
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Alert the Air Traffic Controller (Content.tsx)
    onDragStartTask(task.id);

    // Standard browser payload for the drop event
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  // 3. DRAG END (Fires whether it was a successful drop or cancelled)
  const handleDragEnd = () => {
    // Tell the parent to clear the placeholder state
    onDragEndTask();
  };

  // 4. DRAG OVER & THE MATH
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // CRITICAL to allow dropping!
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";

    // Get the physical dimensions of THIS specific card
    const rect = e.currentTarget.getBoundingClientRect();

    // Find the exact middle line (Y-axis)
    const middleY = rect.top + rect.height / 2;

    // Check if the user's mouse is above that middle line
    const isBefore = e.clientY < middleY;

    // Send the report back to the parent!
    onHover(task.id, isBefore);
  };

    const plainTextDescription = removeMd(task.description || "",
        {
            gfm: true,
            stripListLeaders: true,
            useImgAltText: false
        });

  return (
    <div
      onClick={onClick}
      className="task border border-black"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      // style={{ cursor: 'grab' }} // Optional UI polish
    >

        <div className="flex space-between">
            <h3>{task.title}</h3>
            <input type="checkbox" onClick={(e)=>{
                e.stopPropagation();
                onToggleComplete(task.id, !task.completed);
            }} checked={task.completed}/>
        </div>
        {/* Wrap the delete component in a span that stops the click event from bubbling up to the dialog */}
      <span onClick={(e) => e.stopPropagation()}>
        <DeleteTask onDeleteTask={() => onDeleteTask(task.id)} />
      </span>
      <p>{plainTextDescription}</p>
    </div>
  );
}

export default TaskComponent;
