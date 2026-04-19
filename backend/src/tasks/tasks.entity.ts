import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";


@Entity()
export class TasksEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  userName: string;

  @Column()
  password: string;

  @Column()
  email: string;
}
