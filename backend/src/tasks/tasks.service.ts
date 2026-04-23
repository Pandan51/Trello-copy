import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto} from "./dto/create-task.dto";


@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) {}

    async getAllTasks():Promise<CreateTaskDto[]> {
        return this.prisma.task.findMany({
            orderBy: {
                position: 'asc',
            },
        });
    }

    async getTaskById(id: string): Promise<CreateTaskDto | null> {
        return this.prisma.task.findFirst({
            where: {id: id},
        });
    }

    async createTask(title: string, description: string, listId: string, position: number): Promise<CreateTaskDto> {
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

    async patchTask(id: string, updateData: UpdateTaskDto): Promise<CreateTaskDto> {
        return this.prisma.task.update({
            where: { id: id },
            data: updateData,
        });
    }
}
