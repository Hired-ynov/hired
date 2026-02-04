export interface File {
  id: string;
  name: string;
  path: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    size: number;
    hash: string;
  };
}
