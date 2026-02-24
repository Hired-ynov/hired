import { Metadata } from '../utils/metadata';

export class FileUploadResponse {
  name: string;

  path: string;

  type: string;

  metadata?: Metadata;
}
