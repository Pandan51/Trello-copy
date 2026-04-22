import AddList from "./AddList.tsx";
import {useMemo, useState, useEffect } from "react";
import TaskList from "./TaskList.tsx";

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

function Content() {
    const [taskList, setTaskList] = useState<TaskListType[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    const groupedTasks: TaskMap = useMemo(()=> {
        const map = tasks.reduce((acc: TaskMap, val: Task)=> {
            if(!acc[val.listId]){acc[val.listId] = [];}
            acc[val.listId].push(val);
            return acc;
        }, {} as TaskMap);

        // Ensure tasks inside each list are sorted by their position!
        Object.keys(map).forEach(key => {
            map[key].sort((a, b) => a.position - b.position);
        });
        return map;
    }, [tasks]);

    useEffect(() => {
        // Fetch both Lists and Tasks from your backend controllers
        Promise.all([
            fetch('http://localhost:3000/lists').then(res => res.json()),
            fetch('http://localhost:3000/tasks').then(res => res.json())
        ])
            .then(([fetchedLists, fetchedTasks]) => {
                setTaskList(fetchedLists);
                setTasks(fetchedTasks);
            })
            .catch(err => console.error("Failed to load data:", err));
    }, []);

    // Currently dragged task
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    // We need to know which list the mouse is over, and exactly what index to put the placeholder
    const [placeholder, setPlaceholder] = useState<{ listId: string, index: number } | null>(null);

    function taskById(id: string): Task | undefined{
        const index = tasks.findIndex(task => task.id === id);

        return index >= 0 ? tasks[index] : undefined;
    }

    async function addNewList(title:string){
        try {
            const response = await fetch('http://localhost:3000/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            if (response.ok) {
                const newList = await response.json();
                setTaskList([...taskList, newList]);
            }
        } catch (err) {
            console.error("Failed to add list:", err);
        }
    }

    async function addNewTask(title:string, desc:string, listId: string){
        // Calculate a new position for the task (at the bottom of the list)
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

    async function deleteTask(taskId:string){
        // Optimistic UI update
        setTasks(prev => prev.filter(task => task.id !== taskId));

        // Background server update
        try {
            await fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error("Failed to delete task:", err);
        }
    }

    async function changeTaskId(taskId: string, listId: string) {
        let newPos = 0; // We will calculate this using fractional indexing
        let updatedTaskCopy: Task | null = null;

        setTasks(prevTasks => {
            // 1. Find the task we are moving
            const taskToMove = prevTasks.find(t => t.id === taskId);
            if (!taskToMove) return prevTasks;

            // 2. Create a new array WITHOUT the dragged task
            let newTasks = prevTasks.filter(t => t.id !== taskId);

            // 3. Get the other tasks currently in the target list (sorted by position)
            const tasksInTargetList = newTasks.filter(t => t.listId === listId).sort((a,b) => a.position - b.position);

            let insertIndex = tasksInTargetList.length;
            if (placeholder && placeholder.listId === listId) {
                insertIndex = placeholder.index;
            }

            // --- FRACTIONAL INDEXING MATH ---
            if (tasksInTargetList.length === 0) {
                // Dropped into an empty list
                newPos = 1024;
            } else if (insertIndex <= 0) {
                // Dropped at the very top
                newPos = tasksInTargetList[0].position / 2;
            } else if (insertIndex >= tasksInTargetList.length) {
                // Dropped at the very bottom
                newPos = tasksInTargetList[tasksInTargetList.length - 1].position + 1024;
            } else {
                // Dropped exactly in the middle of two cards
                const posAbove = tasksInTargetList[insertIndex - 1].position;
                const posBelow = tasksInTargetList[insertIndex].position;
                newPos = (posAbove + posBelow) / 2;
            }

            // 4. Create a copy of the task with the updated listId and new position
            updatedTaskCopy = { ...taskToMove, listId: listId, position: newPos };

            // Push it to the state array
            newTasks.push(updatedTaskCopy);
            return newTasks;
        });

        // 5. Instantly clean up the UI states
        handleDragEnd();

        // 6. Send PATCH to background
        if (updatedTaskCopy) {
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
    }

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

    return (
        <div className="task-container">
            {taskList.map((item) => {
                // 1. Get the real tasks for this column
                let renderTasks = [...(groupedTasks[item.id] ?? [])];

                // 2. If we are actively dragging something...
                if (draggedTaskId) {
                    // 3. If the mouse is hovering over THIS specific column...
                    if (placeholder && placeholder.listId === item.id) {
                        // Create the fake task
                        const ghostTask = {
                            id: "ghost-placeholder",
                            listId: item.id,
                            title: "",
                            description: "",
                            position: 0,
                            isGhost: true // A special flag we will use in TaskComponent
                        };

                        // Inject the ghost at the calculated index!
                        renderTasks.splice(placeholder.index, 0, ghostTask as any);
                    }
                }

                return (
                    <TaskList
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        taskList={renderTasks}
                        onAddTask={(title: string, desc: string) => addNewTask(title, desc, item.id)}
                        onDeleteTask={deleteTask}
                        onChangeTaskId={changeTaskId}
                        onHover={(taskId: string, before: boolean) => handleTaskHover(taskId, before, item.id)}
                        onDragStartTask={handleDragStartTask}
                        onDragEndTask={handleDragEnd}
                    />
                );
            })}
            <AddList onAddList={addNewList}/>
        </div>
    )
}

export default Content;