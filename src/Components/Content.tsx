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



function Content() {

    const [taskList, setTaskList] = useState([
        {
            title: "Todo",
            id: crypto.randomUUID(),

        },
        {
            title: "In progress",
            id: crypto.randomUUID(),

        },
        {title: "Done", id: crypto.randomUUID(), taskList: []}]);

    const [tasks, setTasks] = useState([
        {id:crypto.randomUUID(), listId: taskList[0].id, title: "Card 1", desc: "This is card 1"},
        {id:crypto.randomUUID(), listId: taskList[0].id, title:"Card 2", desc:"This is card 2"},
        {id:crypto.randomUUID(), listId: taskList[1].id, title:"Card 1", desc:"This is card 1"},
        {id:crypto.randomUUID(), listId: taskList[2].id, title: "Card 2", desc:"This is card 2"}
    ]);

    const groupedTasks = useMemo(()=> tasks.reduce((acc, val)=>))



    function addNewList(title:string){
        setTaskList([...taskList, {id:crypto.randomUUID(), title: title, taskList: []}]);
    }
    function addNewTask(title:string, desc:string){

    }



    return (
        <div className={"task-container"}>

            {taskList.map((item) => (<TaskList key={item.id} title={item.title} taskList={item.taskList}/>))}
            <AddList onAddList={addNewList}/>
        </div>
    )
}

export default Content;