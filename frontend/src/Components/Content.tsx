import AddList from "./AddList.tsx";
import { useMemo, useState, useEffect, useOptimistic, startTransition } from "react";
import TaskList from "./TaskList.tsx";
import TaskDialog from "./TaskDialog.tsx";
import TaskListDialog from "./TaskListDialog.tsx";


type Task = {
    id: string;
    listId: string;
    title: string;
    description: string;
    position: number;
    isGhost?: boolean;
}

type TaskListType = {
    id: string;
    title: string;
}

type TaskMap = {
    [key: string]: Task[];
};

// --- HELPER FUNCTION: Keeps our component code clean! ---
// Calculates the exact middle position between any two cards
function calculateNewPosition(targetList: Task[], insertIndex: number): number {
    if (targetList.length === 0) return 1024; // Empty list
    if (insertIndex <= 0) return targetList[0].position / 2; // Top of list
    if (insertIndex >= targetList.length) return targetList[targetList.length - 1].position + 1024; // Bottom of list

    // Exactly between two cards
    const posAbove = targetList[insertIndex - 1].position;
    const posBelow = targetList[insertIndex].position;
    return (posAbove + posBelow) / 2;
}

function Content() {
    // Current lists
    const [taskLists, setTaskLists] = useState<TaskListType[]>([]);
    // Current tasks
    const [tasks, setTasks] = useState<Task[]>([]);

    const [activeList, setActiveList] = useState<TaskListType | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null)

    // Optimistic UI states
    const [optimisticTaskLists, addOptimisticListUpdate] = useOptimistic(
        taskLists, // The source of truth
        (currentLists, optimisticUpdate: { id: string, title: string }) => {
            // How to modify the list temporarily
            return currentLists.map(list =>
                list.id === optimisticUpdate.id ? { ...list, title: optimisticUpdate.title } : list
            );
        }
    );


    // Grouped tasks by listId cached using memo
    const groupedTasks: TaskMap = useMemo(() => {
        const map = tasks.reduce((acc: TaskMap, val: Task) => {
            if (!acc[val.listId]) { acc[val.listId] = []; }
            acc[val.listId].push(val);
            return acc;
        }, {} as TaskMap);

        // Crucial: Sort all lists visually by their new DB position number
        Object.keys(map).forEach(key => {
            map[key].sort((a, b) => a.position - b.position);
        });

        return map;
    }, [tasks]);

    useEffect(() => {
        Promise.all([
            // fetch('http://localhost:3000/lists').then(res => res.json()),
            getTasks(),
            // fetchTasks().then(res => res.json()),
            getLists()
            // fetch('http://localhost:3000/tasks').then(res => res.json())
        ])
            .then(([fetchedLists, fetchedTasks]) => {
                setTaskLists(fetchedLists);
                setTasks(fetchedTasks);
            })
            .catch(err => console.error("Failed to load data:", err));
    }, []);

    async function getTasks() {
        return fetch('http://localhost:3000/lists').then(res => res.json())
    }
    async function getLists() {
        return fetch('http://localhost:3000/tasks').then(res => res.json())
    }

    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [placeholder, setPlaceholder] = useState<{ listId: string, index: number } | null>(null);

    async function addNewList(title: string) {
        try {
            const response = await fetch('http://localhost:3000/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
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
        // Position Math: Bottom of the list gets current Max + 1024
        const tasksInList = groupedTasks[listId] || [];
        const maxPos = tasksInList.length > 0 ? tasksInList[tasksInList.length - 1].position : 0;
        const newPos = maxPos + 1024;

        try {
            const response = await fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title, description: desc, listId: listId, position: newPos })
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
        setTasks(prev => prev.filter(task => task.id !== taskId));
        try {
            await fetch(`http://localhost:3000/tasks/${taskId}`, { method: 'DELETE' });
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    }

    async function changeTaskPosition(taskId: string, listId: string) {
        let newPos = 0;

        setTasks(prevTasks => {
            const taskToMove = prevTasks.find(t => t.id === taskId);
            if (!taskToMove) return prevTasks;

            const newTasks = prevTasks.filter(t => t.id !== taskId);
            const targetList = newTasks.filter(t => t.listId === listId).sort((a,b) => a.position - b.position);

            const insertIndex = (placeholder && placeholder.listId === listId) ? placeholder.index : targetList.length;

            // Use our new clean helper function!
            newPos = calculateNewPosition(targetList, insertIndex);

            // Return the new array with the updated task appended
            return [...newTasks, { ...taskToMove, listId, position: newPos }];
        });

        handleDragEnd();

        // The bug fix: explicitly send ONLY listId and position without extra wrapping objects!
        try {
            await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listId: listId, position: newPos })
            });
        } catch (err) {
            console.error("Failed to move task:", err);
        }
    }

    async function updateTaskDetails(taskId: string, newTitle: string, newDescription: string) {
        // Optimistic UI update
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, title: newTitle, description: newDescription } : t
        ));

        // Background server update
        try {
            await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle, description: newDescription })
            });
        } catch (err) {
            console.error("Failed to update task details:", err);
        }
    }

    async function updateTaskListDetails(taskListId: string, newTitle: string) {
        // Optimistic UI update
        if(taskListId === null || taskListId === undefined || taskListId === "") { return;}

        // 1. Trigger the temporary UI update inside a transition
        startTransition(() => {
            addOptimisticListUpdate({ id: taskListId, title: newTitle });
        });

            const response = await fetch(`http://localhost:3000/lists/${taskListId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });

            if (!response.ok) {
                // throw new Error(`Server rejected request with status: ${response.status}`);
                return false;
            }

            setTaskLists(prev => prev.map(t =>
                t.id === taskListId ? { ...t, title: newTitle } : t
            ));

            return true;
    }

    // Test function used to fetching error rollback
    // async function testUpdateFetch(taskListId: string, newTitle: string) {
    //     const response = await fetch(`http://localhost:3000/lists/${taskListId}`, {
    //         method: 'PATCH',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ title: { newTitle: newTitle } })
    //     });
    //
    //     if (!response.ok) {
    //         throw new Error(`Server rejected request with status: ${response.status}`);
    //     }
    //
    //     return response.json();
    // }
    
    function handleDragStartTask(taskId: string) {
        setDraggedTaskId(taskId);
    }

    function handleDragEnd() {
        setDraggedTaskId(null);
        setPlaceholder(null);
    }

    function handleTaskHover(hoveredTaskId: string, beforePosition: boolean, listId: string) {
        if (!draggedTaskId || draggedTaskId === hoveredTaskId) return;

        const listTasks = groupedTasks[listId] ?? [];
        const hoveredIndex = listTasks.findIndex(t => t.id === hoveredTaskId);
        if (hoveredIndex === -1) return;

        const newIndex = beforePosition ? hoveredIndex : hoveredIndex + 1;

        setPlaceholder(prev => {
            if (prev?.listId === listId && prev?.index === newIndex) return prev;
            return { listId, index: newIndex };
        });
    }

    // New failsafe for dragging over an empty list
    function handleListHover(listId: string) {
        setPlaceholder(prev => {
            if (prev?.listId === listId && prev?.index === 0) return prev;
            return { listId, index: 0 };
        });
    }

    return (
        <div className="task-container">
            {optimisticTaskLists.map((item) => {
                let renderTasks = [...(groupedTasks[item.id] ?? [])];

                if (draggedTaskId && placeholder && placeholder.listId === item.id) {
                    const ghostTask = {
                        id: "ghost-placeholder",
                        listId: item.id,
                        title: "",
                        description: "",
                        position: 0,
                        isGhost: true
                    };
                    renderTasks.splice(placeholder.index, 0, ghostTask as any);
                }

                return (
                    <TaskList
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        taskList={renderTasks}
                        onTaskListClick={(listId:string)=> {
                            const list = taskLists.find(l => l.id === listId);
                            if (list) setActiveList(list);
                        }}
                        onTaskClick={(taskId: string) => {
                            const task = tasks.find(t => t.id === taskId);
                            if (task) setActiveTask(task);
                        }}
                        onAddTask={(title, desc) => addNewTask(title, desc, item.id)}
                        onDeleteTask={deleteTask}
                        onChangeTaskPosition={changeTaskPosition}
                        onHover={(taskId: string, before: boolean) => handleTaskHover(taskId, before, item.id)}
                        onListHover={handleListHover}
                        onDragStartTask={handleDragStartTask}
                        onDragEndTask={handleDragEnd}
                    />
                );
            })}
            <AddList onAddList={addNewList}/>

            {/* Render the native dialog if there is an active task selected */}
            {activeTask && (
                <TaskDialog
                    task={activeTask}
                    onClose={() => setActiveTask(null)}
                    onSave={updateTaskDetails}
                />
            )}

            {/* Render the native dialog if there is an active task selected */}
            {activeList && (
                <TaskListDialog
                    list={activeList}
                    onClose={() => setActiveList(null)}
                    onSave={updateTaskListDetails}
                />
            )}
        </div>
    )
}

export default Content;