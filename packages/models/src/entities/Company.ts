import { BaseEntity } from './BaseEntity';
export interface Company extends BaseEntity {
  name: string;
  description: string;
  website: string;
}
