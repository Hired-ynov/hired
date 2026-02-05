import { Conversation as DomainConversation } from '@repo/models';
import { BaseEntity } from '@repo/nest-service';
import { Entity, Column } from 'typeorm';

@Entity('conversations')
export class Conversation extends BaseEntity implements DomainConversation {
  @Column('text', { array: true })
  participants!: string[];

  @Column()
  offerId!: string;
}
