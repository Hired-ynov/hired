import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@repo/nest-service';

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  content!: string;

  @Column()
  sender!: string;
}
