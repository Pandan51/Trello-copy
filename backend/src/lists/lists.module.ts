import { Module } from '@nestjs/common';
import {ListsController} from "./lists.controller";
import {PrismaService} from "../prisma/prisma.service";
import {ListsService} from "./lists.service";

@Module({
    controllers: [ListsController],
    providers: [PrismaService, ListsService]
})
export class ListsModule {

}
