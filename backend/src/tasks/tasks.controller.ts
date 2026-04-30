import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

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
  async createTask(
    @Body()
    body: {
      title: string;
      description: string;
      listId: string;
      position: string;
    },
  ) {
    return this.tasksService.createTask(
      body.title,
      body.description,
      body.listId,
      body.position,
    );
  }

  @Delete('/:id')
  async deleteTask(@Param('id') id: string): Promise<CreateTaskDto> {
    return this.tasksService.deleteTask(id);
  }

  @Patch('/:id')
  async patchTask(
    @Param('id') id: string,
    @Body() sentTask: UpdateTaskDto,
  ): Promise<UpdateTaskDto> {
    return this.tasksService.patchTask(id, sentTask);
  }

  @Get('/:id')
  async getTask(@Param('id') id: string): Promise<any> {
    return this.tasksService.getTaskById(id);
  }

  @Get('/:id/detail')
  async getTaskDetail(@Param('id') id: string): Promise<any> {
    return this.tasksService.getTaskDetail(id);
  }
}
