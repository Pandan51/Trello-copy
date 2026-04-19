import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { ListsModule } from './lists/lists.module';

@Module({
  // 1. Import the departments here
  imports: [TasksModule, ListsModule],
  // 2. Only register the App's own root controller
  controllers: [AppController],
  // 3. Only register the App's own root service
  providers: [AppService],
})
export class AppModule {}
