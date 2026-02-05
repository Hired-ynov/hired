import { Message as DomainMessage } from '@repo/models';
import { BaseEntity } from '@repo/nest-service';
import { Entity, Column } from 'typeorm';

@Entity('messages')
export class Message extends BaseEntity implements DomainMessage {
  @Column()
  conversationId!: string;

  @Column()
  senderId!: string;

  @Column({ type: 'text' })
  content!: string;
}
