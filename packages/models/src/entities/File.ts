import { BaseEntity } from './BaseEntity';
import { Metadata } from './utils/Metadata';

export interface File extends BaseEntity {
  name: string;
  path: string;
  type: string;
  metadata?: Metadata;
}
