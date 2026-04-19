import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PartialType } from '@nestjs/mapped-types';

class CreateTaskListDto {
  id: string;
  title: string;
}

class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}

@Controller('lists')
export class ListsController {
  constructor(private prisma: PrismaService) {}

  private lists: CreateTaskListDto[] = [
    {
      title: "Todo",
      id: "1",

    },
    {
      title: "In progress",
      id: "2",

    },
    {
      title: "Done",
      id: "3",
    }
  ];

  @Get()
  async getAllLists() {
    return this.prisma.taskList.findMany();
  }

  @Post()
  async createList(@Body() body: { title: string }) {
    // Save a new list to the database
    return this.prisma.taskList.create({
      data: {
        title: body.title,
      },
    });
  }

  @Delete('/:id')
  deleteList(@Param('id') id: string): any {
    this.lists = this.lists.filter((list) => list.id !== id);
    return this.lists;
  }

  @Patch('/:id')
  patchList(@Param('id') id: string, @Body() task: UpdateTaskListDto): any {
    const foundList = this.lists.find((list) => list.id === id);
    if (!foundList) {
      return;
    }

    Object.assign(foundList, task);
    return foundList;
  }
}
