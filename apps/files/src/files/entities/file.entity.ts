import { File } from '@repo/models';
import { Metadata } from '@repo/models/dist/entities/utils/Metadata';
import { BaseEntity } from '@repo/nest-service';
import { Entity, Column } from 'typeorm';

@Entity('files')
export class FileEntity extends BaseEntity implements File {
  @Column()
  name!: string;

  @Column()
  path!: string;

  @Column()
  type!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Metadata | undefined;
}
