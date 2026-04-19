import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksController } from './tasks/tasks.controller'; // 1. Import your new file
import { ListsController } from './lists/lists.controller';
import { TasksModule } from './tasks/tasks.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [TasksModule],
  controllers: [AppController, TasksController, ListsController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
