// import { TodoList } from "../models/TodoList";
import AddList from "./AddList.tsx";
import {useMemo, useState} from "react";
// import { Task } from "../models/Task";
import TaskList from "./TaskList.tsx";

type Task = {
    id: string;
    listId: string;
    title: string;
    description: string;
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
        {
            title: "Todo",
            id: crypto.randomUUID(),

        },
        {
            title: "In progress",
            id: crypto.randomUUID(),

        },
        {
            title: "Done",
            id: crypto.randomUUID()
        }]);

    const [tasks, setTasks] = useState<Task[]>([
        {id:crypto.randomUUID(), listId: taskList[0].id, title: "Card 1", description: "This is card 1"},
        {id:crypto.randomUUID(), listId: taskList[0].id, title:"Card 2", description:"This is card 2"},
        {id:crypto.randomUUID(), listId: taskList[1].id, title:"Card 1", description:"This is card 1"},
        {id:crypto.randomUUID(), listId: taskList[2].id, title: "Card 2", description:"This is card 2"}
    ]);

    const groupedTasks: TaskMap = useMemo(()=>
        tasks.reduce((acc: TaskMap, val: Task)=> {
            if(!acc[val.listId]){acc[val.listId] = [];}
            acc[val.listId].push(val);
            return acc;

        }, {} as TaskMap),
        [tasks]);



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
            setTasks(tasks.toSpliced(taskIndex, 1));
        }
    }



    return (
        <div className={"task-container"}>

            {taskList.map((item) => (<TaskList key={item.id}
                                               id={item.id}
                                               title={item.title}
                                               taskList={groupedTasks[item.id] ?? []}
                                               onAddTask={(title, desc) =>
                                                   addNewTask(title, desc, item.id)}
                                               onDeleteTask={deleteTask}

            />))}
            <AddList onAddList={addNewList}/>
        </div>
    )
}

export default Content;