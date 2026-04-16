import { Task } from "./Task.ts";

export class TodoList{
    id: number;
    title: string;
    taskList: Task[]

    constructor(id: number, title: string, taskList: Task[]) {
        this.id = id;
        this.title = title;
        this.taskList = taskList;
    }
}

