import { BaseEntity } from './BaseEntity';

export interface File extends BaseEntity {
  name: string;
  path: string;
  type: string;
  metadata?: Metadata;
}
