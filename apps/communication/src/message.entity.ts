import { BaseEntity } from '@repo/nest-service';
import { Entity, Column } from 'typeorm';

@Entity('messages')
export class Message extends BaseEntity {
  @Column()
  content!: string;

  @Column()
  sender!: string;
}
