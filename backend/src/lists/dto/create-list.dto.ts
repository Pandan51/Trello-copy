import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty} from 'class-validator';

export class CreateTaskListDto {
  @IsNotEmpty()
  @IsString()
  id: string;
  @IsNotEmpty()
  @IsString()
  title: string;
}

export class UpdateTaskListDto extends PartialType(CreateTaskListDto) {}
