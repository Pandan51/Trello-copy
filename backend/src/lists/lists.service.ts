import { Injectable } from '@nestjs/common';
import  { PrismaService } from "../prisma/prisma.service";
import { CreateTaskListDto, UpdateTaskListDto } from "./dto/create-list.dto";


@Injectable()
export class ListsService {
    // The Chef needs access to the Pantry (Database)
    constructor(private prisma: PrismaService) {}

    async getAllLists():Promise<CreateTaskListDto[]> {
        return this.prisma.list.findMany();
    }

    async getListById(id: string) {
        return this.prisma.list.findFirst({
            where: {id: id},
        });
    }

    async createList(title: string):Promise<CreateTaskListDto> {
        return this.prisma.list.create({
            data: {
                title: title,
            },
        });
    }

    async deleteList(id: string): Promise<CreateTaskListDto> {
        return this.prisma.list.delete({
            where: { id: id },
        });
    }

    async patchList(id: string, updateData: UpdateTaskListDto):Promise<CreateTaskListDto> {
        return this.prisma.list.update({
            where: { id: id },
            data: updateData,
        });
    }


}
