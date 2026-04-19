import {PartialType} from "@nestjs/mapped-types";

export class CreateTaskDto {
    id: string;
    listId: string;
    title: string;
    description: string;
    position: number;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {

}