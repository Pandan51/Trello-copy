import type {Task, TaskListType } from "../types";

import {
  useMemo,
  useState,
  useEffect,
  useOptimistic,
  startTransition,
} from "react";
import AddList from "./AddList.tsx";
import TaskList from "./TaskList.tsx";
import TaskDialog from "./TaskDialog.tsx";
import TaskListDialog from "./TaskListDialog.tsx";

//type Task = {
//   id: string;
//   listId: string;
//   title: string;
//   description: string;
//   position: string;
//   isGhost?: boolean;
//   isDragged?: boolean; // Added this to visually flag the source item
//      completed?: boolean;
// };

// type TaskListType = {
//   id: string;
//   title: string;
// };

type TaskMap = {
  [key: string]: Task[];
};

// --- LEXORANK ALGORITHM CONFIG ---
const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";
const MIN_CHAR = ALPHABET[0];
const MAX_CHAR = ALPHABET[ALPHABET.length - 1];

function getRankBetween(
  prevRank: string | null,
  nextRank: string | null,
): string {
  const p = prevRank || MIN_CHAR;
  let n = nextRank || MAX_CHAR;

  if (p === n) return p + MIN_CHAR;

  let result = "";
  let i = 0;

  while (true) {
    const pChar = p[i] || MIN_CHAR;
    const nChar = n[i] || MAX_CHAR;

    const pIdx = ALPHABET.indexOf(pChar);
    const nIdx = ALPHABET.indexOf(nChar);

    if (pIdx === nIdx) {
      result += pChar;
      i++;
      continue;
    }

    const diff = nIdx - pIdx;
    if (diff > 1) {
      result += ALPHABET[pIdx + Math.floor(diff / 2)];
      break;
    } else {
      result += pChar;
      n = result + MAX_CHAR;
      i++;
    }
  }
  return result;
}

function Content() {
  const [taskLists, setTaskLists] = useState<TaskListType[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [activeList, setActiveList] = useState<TaskListType | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [optimisticTaskLists, addOptimisticListUpdate] = useOptimistic(
    taskLists,
    (currentLists, optimisticUpdate: { id: string; title: string }) => {
      return currentLists.map((list) =>
        list.id === optimisticUpdate.id
          ? { ...list, title: optimisticUpdate.title }
          : list,
      );
    },
  );

  const groupedTasks: TaskMap = useMemo(() => {
    const map = tasks.reduce((acc: TaskMap, val: Task) => {
      if (!acc[val.listId]) {
        acc[val.listId] = [];
      }
      acc[val.listId].push(val);
      return acc;
    }, {} as TaskMap);

    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => a.position.localeCompare(b.position));
    });

    return map;
  }, [tasks]);

  async function getTasks() {
    return fetch("http://localhost:3000/lists").then((res) => res.json());
  }
  async function getLists() {
    return fetch("http://localhost:3000/tasks").then((res) => res.json());
  }

  useEffect(() => {
    Promise.all([getTasks(), getLists()])
      .then(([fetchedLists, fetchedTasks]) => {
        setTaskLists(fetchedLists);
        setTasks(fetchedTasks);
      })
      .catch((err) => console.error("Failed to load data:", err));
  }, []);

  type Placeholder = {
    listId: string;
    overTaskId: string | null;
    isBefore: boolean;
  };

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState<Placeholder | null>(null);

  async function addNewList(title: string) {
    try {
      const response = await fetch("http://localhost:3000/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (response.ok) {
        const newList = await response.json();
        setTaskLists([...taskLists, newList]);
      }
    } catch (err) {
      console.error("Failed to add list:", err);
    }
  }

  async function addNewTask(title: string, desc: string, listId: string) {
    const tasksInList = groupedTasks[listId] || [];
    const lastRank =
      tasksInList.length > 0
        ? tasksInList[tasksInList.length - 1].position
        : null;
    const newPos = getRankBetween(lastRank, null);

    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          description: desc,
          listId: listId,
          position: newPos,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  }

  async function deleteTask(taskId: string) {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    try {
      await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }

  async function deleteTaskList(listId: string) {
    setTaskLists((prev) => prev.filter((list) => list.id !== listId));
    try {
      await fetch(`http://localhost:3000/lists/${listId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete list:", err);
    }
  }

  async function changeTaskPosition(taskId: string, listId: string) {
    if (!placeholder) {
      handleDragEnd();
      return;
    }

    // If dropped exactly where it started, abort the API call
    if (placeholder.overTaskId === taskId) {
      handleDragEnd();
      return;
    }

    const taskToMove = tasks.find((t) => t.id === taskId);
    if (!taskToMove) {
      handleDragEnd();
      return;
    }

    // 2. Do the math BEFORE calling setTasks
    const newTasks = tasks.filter((t) => t.id !== taskId);
    const targetList = newTasks
      .filter((t) => t.listId === listId)
      .sort((a, b) => a.position.localeCompare(b.position));

    let insertIndex = targetList.length;

    if (placeholder.overTaskId) {
      const targetIdx = targetList.findIndex(
        (t) => t.id === placeholder.overTaskId,
      );
      if (targetIdx !== -1) {
        insertIndex = placeholder.isBefore ? targetIdx : targetIdx + 1;
      }
    }

    const prevRank =
      insertIndex > 0 ? targetList[insertIndex - 1].position : null;
    const nextRank =
      insertIndex < targetList.length ? targetList[insertIndex].position : null;

    // 3. Generate the actual string!
    const newPos = getRankBetween(prevRank, nextRank);

    // 4. NOW safely update the state using the pre-calculated value
    setTasks([...newTasks, { ...taskToMove, listId, position: newPos }]);

    handleDragEnd();

    try {
      await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: listId, position: newPos }),
      });
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  }

  async function updateTaskDetails(
    taskId: string,
    newTitle: string,
    newDescription: string,
    isCompleted: boolean,
  ) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, title: newTitle, description: newDescription, completed: isCompleted }
          : t,
      ),
    );

    try {
      await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription, completed: isCompleted }),
      });
    } catch (err) {
      console.error("Failed to update task details:", err);
    }
  }

    async function toggleTaskCompletion(taskId: string, isCompleted: boolean) {
        // 1. Optimistic UI Update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, completed: isCompleted } : t
        ));

        // 2. Network Request
        try {
            await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                // Notice we ONLY send the completed status!
                // The backend PATCH endpoint will leave the title/description/position alone.
                body: JSON.stringify({ completed: isCompleted })
            });
        } catch (err) {
            console.error("Failed to update task completion:", err);
        }
    }

  async function updateTaskListDetails(taskListId: string, newTitle: string) {
    if (!taskListId) return;

    startTransition(() => {
      addOptimisticListUpdate({ id: taskListId, title: newTitle });
    });

    const response = await fetch(`http://localhost:3000/lists/${taskListId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    if (!response.ok) return false;

    setTaskLists((prev) =>
      prev.map((t) => (t.id === taskListId ? { ...t, title: newTitle } : t)),
    );

    return true;
  }

  function handleDragStartTask(taskId: string) {
    setDraggedTaskId(taskId);

    // INSTANTLY set placeholder to its current spot to prevent jumping
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setPlaceholder({
        listId: task.listId,
        overTaskId: taskId,
        isBefore: true,
      });
    }
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setPlaceholder(null);
  }

  function handleTaskHover(
    hoveredTaskId: string,
    beforePosition: boolean,
    listId: string,
  ) {
    if (!draggedTaskId) return;

    // Removed the strict "return if hovering over itself" rule so the placeholder
    // cleanly resets to the original spot if you change your mind mid-drag.
    console.log(hoveredTaskId);
    setPlaceholder({
      listId,
      overTaskId: hoveredTaskId,
      isBefore: beforePosition,
    });
  }

  function handleListHover(listId: string) {
    if (!draggedTaskId) return;
    setPlaceholder({ listId, overTaskId: null, isBefore: false });
  }

  return (
    <div className="task-container">
      {/*<h1 className="text-5xl dark:text-8xl ">Test</h1>*/}
      {optimisticTaskLists.map((item) => {
        let renderTasks = [...(groupedTasks[item.id] ?? [])];

        // 1. Tag the original task instead of destroying it
        if (draggedTaskId) {
          renderTasks = renderTasks.map((t) =>
            t.id === draggedTaskId ? { ...t, isDragged: true } : t,
          );
        }

        // 2. Safely Inject the Ghost Task
        if (draggedTaskId && placeholder && placeholder.listId === item.id) {
          const ghostTask = {
            id: "ghost-placeholder",
            listId: item.id,
            title: "",
            description: "",
            position: "",
            isGhost: true,
          };

          if (placeholder.overTaskId) {
            // Only inject ghost if we aren't hovering directly over the original source task
            if (placeholder.overTaskId !== draggedTaskId) {
              const targetIndex = renderTasks.findIndex(
                (t) => t.id === placeholder.overTaskId,
              );
              if (targetIndex !== -1) {
                const insertAt = placeholder.isBefore
                  ? targetIndex
                  : targetIndex + 1;
                renderTasks.splice(insertAt, 0, ghostTask as Task);
              }
            }
          } else {
            renderTasks.push(ghostTask as Task);
          }
        }

        return (
          <TaskList
            key={item.id}
            id={item.id}
            title={item.title}
            taskList={renderTasks}
            onTaskListClick={(listId: string) => {
              const list = taskLists.find((l) => l.id === listId);
              if (list) setActiveList(list);
            }}
            onTaskClick={(taskId: string) => {
              const task = tasks.find((t) => t.id === taskId);
              if (task) setActiveTask(task);
            }}
            onAddTask={(title, desc) => addNewTask(title, desc, item.id)}
            onDeleteTask={deleteTask}
            onChangeTaskPosition={changeTaskPosition}
            onHover={(taskId: string, before: boolean) =>
              handleTaskHover(taskId, before, item.id)
            }
            onListHover={handleListHover}
            onDragStartTask={handleDragStartTask}
            onDragEndTask={handleDragEnd}
            onToggleComplete={toggleTaskCompletion}
          />
        );
      })}
      <AddList onAddList={addNewList} />

      {activeTask && (
        <TaskDialog
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSave={updateTaskDetails}
          onDeleteTask={deleteTask}
        />
      )}

      {activeList && (
        <TaskListDialog
          list={activeList}
          onClose={() => setActiveList(null)}
          onSave={updateTaskListDetails}
          onDeleteTaskList={deleteTaskList}
        />
      )}
    </div>
  );
}

export default Content;
