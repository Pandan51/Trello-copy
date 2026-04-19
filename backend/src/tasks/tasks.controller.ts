import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';


  class CreateTaskDto {
  id: string;
  listId: string;
  title: string;
  description: string;
}

class UpdateTaskListDto extends PartialType(CreateTaskDto) {

}

@Controller('tasks')
export class TasksController {
  // A temporary in-memory database (just like your React state)
  private tasks: CreateTaskDto[] = [

      {id:crypto.randomUUID(), listId: "1", title: "Card 1", description: "This is card 1"},
      {id:crypto.randomUUID(), listId: "2", title:"Card 2", description:"This is card 2"},
      {id:crypto.randomUUID(), listId: "2", title:"Card 1", description:"This is card 1"},
      {id:crypto.randomUUID(), listId: "3", title: "Card 2", description:"This is card 2"}

  ];

  // ----------------------------------------------------
  // GET Endpoint: Fetch all tasks
  // URL: GET http://localhost:3000/tasks
  // ----------------------------------------------------
  @Get()
  getAllTasks(): CreateTaskDto[] {
    return this.tasks;
  }

  // ----------------------------------------------------
  // POST Endpoint: Add a new task
  // URL: POST http://localhost:3000/tasks
  // ----------------------------------------------------
  @Post()
  createTask(@Body() newTask: CreateTaskDto): CreateTaskDto {
    // @Body() automatically parses the incoming JSON from the request!
    this.tasks.push(newTask);

    // We return the task back so the frontend knows it saved successfully
    return newTask;
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string): any {
    this.tasks = this.tasks.filter((task) => task.id !== id);
    return this.tasks;
  }

  @Patch('/:id')
  patchTask(@Param('id') id: string, @Body() sentList: UpdateTaskListDto): any {
    const foundTask = this.tasks.find((list) => list.id === id);
    if (!foundTask) {
      return;
    }

    if (sentList.listId) foundTask.listId = sentList.listId;
    if (sentList.title) foundTask.title = sentList.title;
    if (sentList.description) foundTask.description = sentList.description;
    return foundTask;
  }
  @Get('/:id')
  getTask(@Param('id') id: string): any {
    return this.tasks.find((task) => task.id === id);
  }
}
