import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTaskListDto {
  @IsNotEmpty()
  @IsString()
  id: string;
  @IsNotEmpty()
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  color: string;
}

export class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}
