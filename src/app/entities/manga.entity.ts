// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Manga extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: String,
    // unique: true,
    nullable: true,
  })
  name: string | null;

  @Column()
  url: string;

  @Column()
  pageNum: number;

  @Column()
  hidden: boolean;

  @Column({
    type: Number,
    // unique: true,
    nullable: true,
  })
  order: number;

}
