// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Manga extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  pageNum: number;

  @Column()
  hidden: boolean;

}
