import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(): Promise<CreateTaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      orderBy: {
        position: 'asc',
      },
    });

    return tasks.map((task) => {
      const maxLength = 50;
      let shortContent = task.description;

      if (task.description && task.description.length > maxLength) {
        shortContent = task.description.substring(0, maxLength) + '...';
      }

      return {
        ...task,
        description: shortContent, // Overwrite the original or create a new property
      };
    });
  }

  async getTaskById(id: string): Promise<CreateTaskDto | null> {
    return this.prisma.task.findFirst({
      where: { id: id },
    });
  }

  async getTaskDetail(id: string): Promise<CreateTaskDto | null> {
    return this.prisma.task.findFirst({
      where: { id: id },
    });
  }

  async createTask(
    title: string,
    description: string,
    listId: string,
    position: number,
  ): Promise<CreateTaskDto> {
    return this.prisma.task.create({
      data: {
        title: title,
        description: description,
        listId: listId,
        position: position,
      },
    });
  }

  async deleteTask(id: string): Promise<CreateTaskDto> {
    return this.prisma.task.delete({
      where: { id: id },
    });
  }

  async patchTask(
    id: string,
    updateData: UpdateTaskDto,
  ): Promise<CreateTaskDto> {
    return this.prisma.task.update({
      where: { id: id },
      data: updateData,
    });
  }
}
