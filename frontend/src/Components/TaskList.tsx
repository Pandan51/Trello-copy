import AddTask from "./CRUD/AddTask.tsx";
import TaskComponent from "./TaskComponent.tsx";
import type { Task, TaskListType } from "../types";
import * as React from "react";
import { useContext } from "react";
import { ThemeContext } from "../Context/ThemeContext.ts";
import { adjustColorBrightness } from "../utils/colorUtils.ts";

// type Task = {
//   id: string;
//   listId: string;
//   title: string;
//   description: string;
//   isGhost?: boolean;
// };

type Props = {
  taskList: TaskListType;
  taskArr: Task[];

  onAddTask: (title: string, desc: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskListClick: (taskId: string) => void;
  onChangeTaskPosition: (id: string, listId: string) => void; // Renamed for clarity
  onHover: (taskId: string, before: boolean) => void;
  onListHover: (listId: string) => void; // New prop for empty lists
  onDragStartTask: (taskId: string) => void;
  onDragEndTask: () => void;
  onTaskClick: (taskId: string) => void;
  onToggleComplete: (taskId: string, isCompleted: boolean) => void;
};

function TaskList({
  taskList,
  taskArr,
  onAddTask,
  onDeleteTask,
  onChangeTaskPosition,
  onHover,
  onListHover,
  onDragStartTask,
  onDragEndTask,
  onTaskClick,
  onTaskListClick,
  onToggleComplete,
}: Props) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    console.log("Length of list is: " + taskArr.length);
    // If the list is empty, tell the parent to show the placeholder!
    // if (taskList.length === 0) {
    //     onListHover(id);
    // }

    // If the list is empty, anywhere is a valid drop zone to append
    if (taskArr.length === 0) {
      onListHover(taskList.id);
      return;
    }

    // PREVENT GAP FLICKER:
    // The .task-box has a gap: 10px in CSS. If the mouse hits that gap,
    // it bubbles to this list. We ignore it so the ghost stays in place!
    const target = e.target as HTMLElement;
    if (target.classList.contains("task-box")) {
      return;
    }

    onListHover(taskList.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");

    onChangeTaskPosition(data, taskList.id);
  };

  const { theme } = useContext(ThemeContext);
  const listColor = taskList.color || "#9339c6";
  const taskBgColor =
    theme === "dark"
      ? adjustColorBrightness(listColor, -50)
      : adjustColorBrightness(listColor, 60);

  return (
    <div
      // className={`task-list`}
      className={`task-list bg-[${listColor}]`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ backgroundColor: listColor }}
    >
      <h2
        className={"task-list-h2"}
        onClick={() => onTaskListClick(taskList.id)}
      >
        {taskList.title}
      </h2>
      <span onClick={(e) => e.stopPropagation()}></span>
      {/* Added minHeight so empty lists have a physical drop zone! */}
      <div className={"task-box"} style={{ minHeight: "50px" }}>
        {taskArr.map((task) => (
          <TaskComponent
            key={task.id}
            task={task}
            onDeleteTask={onDeleteTask}
            onHover={onHover}
            onDragStartTask={onDragStartTask}
            onDragEndTask={onDragEndTask}
            onClick={() => onTaskClick(task.id)}
            onToggleComplete={onToggleComplete}
            baseColor={listColor}
            taskColor={taskBgColor}
          />
        ))}
      </div>
      <AddTask onAddTask={onAddTask} />
    </div>
  );
}

export default TaskList;
