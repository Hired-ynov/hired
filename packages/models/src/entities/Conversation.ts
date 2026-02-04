export interface Conversation {
  id: string;
  participants: string[]; // Array of user IDs
  offerId: string;
  createdAt: Date;
  updatedAt: Date;
}
