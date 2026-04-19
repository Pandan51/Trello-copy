// import { TodoList } from "../models/TodoList";
import AddList from "./AddList.tsx";
import {useMemo, useState, useEffect } from "react";
// import { Task } from "../models/Task";
import TaskList from "./TaskList.tsx";

type Task = {
    id: string;
    listId: string;
    title: string;
    description: string;
    position: number;
}

type TaskList = {
    id: string;
    title: string;
}

// Option B: Using an Index Signature
type TaskMap = {
    [key: string]: Task[];
};



function Content() {

    const [taskList, setTaskList] = useState<TaskList[]>([
        // {
        //     title: "Todo",
        //     id: crypto.randomUUID(),
        //
        // },
        // {
        //     title: "In progress",
        //     id: crypto.randomUUID(),
        //
        // },
        // {
        //     title: "Done",
        //     id: crypto.randomUUID()
        // }
        ]);

    const [tasks, setTasks] = useState<Task[]>([
        // {id:crypto.randomUUID(), listId: taskList[0].id, title: "Card 1", description: "This is card 1"},
        // {id:crypto.randomUUID(), listId: taskList[0].id, title:"Card 2", description:"This is card 2"},
        // {id:crypto.randomUUID(), listId: taskList[1].id, title:"Card 1", description:"This is card 1"},
        // {id:crypto.randomUUID(), listId: taskList[2].id, title: "Card 2", description:"This is card 2"}
    ]);

    const groupedTasks: TaskMap = useMemo(()=>
        tasks.reduce((acc: TaskMap, val: Task)=> {
            if(!acc[val.listId]){acc[val.listId] = [];}
            acc[val.listId].push(val);
            return acc;

        }, {} as TaskMap),
        [tasks]);

    useEffect(() => {
        // Fetch both Lists and Tasks from your two separate controllers
        Promise.all([
            fetch('http://localhost:3000/lists').then(res => res.json()),
            fetch('http://localhost:3000/tasks').then(res => res.json())
        ])
            .then(([fetchedLists, fetchedTasks]:[TaskList[], Task[]]) => {
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

    function addNewList(title:string){
        setTaskList([...taskList, {id:crypto.randomUUID(), title: title}]);
    }

    function addNewTask(title:string, desc:string, listId: string){
        const task = {id: crypto.randomUUID(), listId: listId, title: title, description: desc };
        setTasks([...tasks, task]);

    }

    function deleteTask(taskId:string){
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if(taskIndex > -1){
            // @ts-ignore
            setTasks(tasks.toSpliced(taskIndex, 1));
        }
    }


    function changeTaskId(taskId: string, listId: string) {
        setTasks(prevTasks => {
            // 1. Find the task we are moving
            const taskToMove = prevTasks.find(t => t.id === taskId);
            if (!taskToMove) return prevTasks;

            // 2. Create a new array WITHOUT the dragged task
            let newTasks = prevTasks.filter(t => t.id !== taskId);

            // 3. Create a copy of the task with the updated listId
            const updatedTask = { ...taskToMove, listId: listId };

            // 4. Figure out exactly where to insert it based on the ghost placeholder
            if (placeholder && placeholder.listId === listId) {
                // Get the other tasks that are already in this specific column
                const tasksInTargetList = newTasks.filter(t => t.listId === listId);

                if (placeholder.index >= tasksInTargetList.length) {
                    // If the index is at the very end, just push it
                    newTasks.push(updatedTask);
                } else {
                    // Find the specific task that is currently sitting where we want to drop
                    const taskAtTargetSpot = tasksInTargetList[placeholder.index];
                    // Find its actual index in our main flat array
                    const flatIndexToInsert = newTasks.findIndex(t => t.id === taskAtTargetSpot.id);

                    // Splice it exactly into the main array
                    newTasks.splice(flatIndexToInsert, 0, updatedTask);
                }
            } else {
                // Failsafe: if no placeholder is tracked, just add it to the end
                newTasks.push(updatedTask);
            }

            return newTasks;
        });

        // 5. Instantly clean up the UI states
        handleDragEnd();
    }

    function handleDragStartTask(taskId: string) {
        setDraggedTaskId(taskId);
    }

    function handleDragEnd() {
        // Clear everything when the user drops the card or cancels the drag
        setDraggedTaskId(null);
        setPlaceholder(null);
    }

    function handleTaskHover(hoveredTaskId: string, beforePosition: boolean, listId: string) {
        if (!draggedTaskId || draggedTaskId === hoveredTaskId) return; // Don't hover over yourself!

        // 1. Find the current tasks in the hovered list
        const listTasks = groupedTasks[listId] ?? [];

        // 2. Find the index of the specific card we are hovering over
        const hoveredIndex = listTasks.findIndex(t => t.id === hoveredTaskId);
        if (hoveredIndex === -1) return;

        // 3. Calculate the ghost's target index
        const newIndex = beforePosition ? hoveredIndex : hoveredIndex + 1;

        // 4. Update the placeholder state
        // We check if it actually changed to prevent React from re-rendering unnecessarily fast
        setPlaceholder(prev => {
            if (prev?.listId === listId && prev?.index === newIndex) return prev;
            return { listId, index: newIndex };
        });
    }


    return (
        // <div className={"task-container"}>
        //
        //     {taskList.map((item) => (<TaskList key={item.id}
        //                                        id={item.id}
        //                                        title={item.title}
        //                                        taskList={groupedTasks[item.id] ?? []}
        //                                        onAddTask={(title, desc) =>
        //                                            addNewTask(title, desc, item.id)}
        //                                        onDeleteTask={deleteTask}
        //                                        onChangeTaskId={changeTaskId}
        //
        //     />))}
        //     <AddList onAddList={addNewList}/>
        // </div>
        <div className="task-container">
            {taskList.map((item) => {
                // 1. Get the real tasks for this column
                let renderTasks = [...(groupedTasks[item.id] ?? [])];

                // 2. If we are actively dragging something...
                if (draggedTaskId) {
                    // Remove the dragged task from its original spot visually
                    // (so it looks like it's attached to your mouse)
                    // renderTasks = renderTasks.filter(task => task.id !== draggedTaskId);

                    // 3. If the mouse is hovering over THIS specific column...
                    if (placeholder && placeholder.listId === item.id) {
                        // Create the fake task
                        const ghostTask = {
                            id: "ghost-placeholder",
                            listId: item.id,
                            title: "",
                            description: "",
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
                        taskList={renderTasks} // Pass the modified array!
                        onAddTask={(title, desc) => addNewTask(title, desc, item.id)}
                        onDeleteTask={deleteTask}
                        onChangeTaskId={changeTaskId}
                        onHover={(taskId:string, before:boolean) => handleTaskHover(taskId, before, item.id)}
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