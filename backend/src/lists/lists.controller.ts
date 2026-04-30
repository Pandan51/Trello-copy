import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import {PartialType} from '@nestjs/mapped-types';
import {ListsService} from './lists.service';

class CreateTaskListDto {
    id: string;
    title: string;
}

class UpdateTaskListDto extends PartialType(CreateTaskListDto) {
}

@Controller('lists')
export class ListsController {
    constructor(private listsService: ListsService) {
    }

    @Get()
    async getAllLists() {
        return this.listsService.getAllLists();
    }

    @Post()
    async createList(@Body() body: { title: string }) {
        // Hand the incoming data to the Chef
        return this.listsService.createList(body.title);
    }

    @Delete('/:id')
    async deleteList(@Param('id') id: string): Promise<CreateTaskListDto> {
        return this.listsService.deleteList(id);
    }

    @Patch('/:id')
    async patchList(
        @Param('id') id: string,
        @Body() sentList: UpdateTaskListDto,
    ): Promise<any> {
        return this.listsService.patchList(id, sentList);
    }
}
