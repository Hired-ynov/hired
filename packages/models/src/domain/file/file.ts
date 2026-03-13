import { Base } from '../base';
import { Metadata } from '../utils/metadata';

export interface File extends Base {
  metadata?: Metadata;
  name: string;
  path: string;
  type: string;
}
