import { Base } from '../base';
import { Metadata } from '../utils/metadata';

export interface File extends Base {
  name: string;
  path: string;
  type: string;
  metadata?: Metadata;
}
