import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  listId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  // This guarantees the frontend can no longer send integers!
  @IsString()
  @IsNotEmpty()
  position: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
