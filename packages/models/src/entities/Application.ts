export interface Application {
  id: string;
  userId: string;
  offerId: string;
  firstMessage?: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  filesIds: string[];
}
