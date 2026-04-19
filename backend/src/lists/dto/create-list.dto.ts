import { PartialType } from "@nestjs/mapped-types";

export class CreateTaskListDto {
    id: string;
    title: string;
}

export class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}