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
import { TasksService } from "./tasks.service";


class CreateTaskDto {
  id: string;
  listId: string;
  title: string;
  description: string;
  position: number;
}

class UpdateTaskDto extends PartialType(CreateTaskDto) {

}

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // A temporary in-memory database (just like your React state)
  // private tasks: CreateTaskDto[] = [
  //
  //     {id:crypto.randomUUID(), listId: "1", title: "Card 1", description: "This is card 1"},
  //     {id:crypto.randomUUID(), listId: "2", title:"Card 2", description:"This is card 2"},
  //     {id:crypto.randomUUID(), listId: "2", title:"Card 1", description:"This is card 1"},
  //     {id:crypto.randomUUID(), listId: "3", title: "Card 2", description:"This is card 2"}
  //
  // ];

  // ----------------------------------------------------
  // GET Endpoint: Fetch all tasks
  // URL: GET http://localhost:3000/tasks
  // ----------------------------------------------------
  @Get()
  async getAllTasks() {
    // Fetch all tasks, ordered by their position!
    return this.tasksService.getAllTasks();
  }

  // ----------------------------------------------------
  // POST Endpoint: Add a new task
  // URL: POST http://localhost:3000/tasks
  // ----------------------------------------------------
  @Post()
  async createTask(@Body() body: { title: string; description: string; listId: string, position: number }) {
    return this.tasksService.createTask(body.title, body.description, body.listId, body.position);
  }

  @Delete('/:id')
  async deleteTask(@Param('id') id: string): Promise<CreateTaskDto> {
    return this.tasksService.deleteTask(id);
  }

  @Patch('/:id')
  async patchTask(
      @Param('id') id: string,
      @Body() sentTask: UpdateTaskDto): Promise<UpdateTaskDto> {
    return this.tasksService.patchTask(id, sentTask);
  }
  @Get('/:id')
  async getTask(@Param('id') id: string): Promise<any>{
    return this.tasksService.getTaskById(id);
  }
}
