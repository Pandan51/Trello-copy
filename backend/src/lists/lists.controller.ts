import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PartialType } from '@nestjs/mapped-types';

class CreateTaskListDto {
  id: string;
  title: string;
}

class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}

@Controller('lists')
export class ListsController {
  private lists: CreateTaskListDto[] = [
    {
      id: '123',
      title: 'Todo',
    },
  ];

  @Get()
  getAllLists() {
    return this.lists;
  }

  @Post()
  createList(@Body() list: CreateTaskListDto) {
    this.lists.push(list);
    return this.lists;
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
