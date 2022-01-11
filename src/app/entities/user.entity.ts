import { hashPassword } from '@foal/core';
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  async setPassword(password: string) {
    this.password = await hashPassword(password);
  }
}

// Exporting this line is required
// when using session tokens with TypeORM.
// It will be used by `npm run makemigrations`
// to generate the SQL session table.
export { DatabaseSession } from '@foal/typeorm';