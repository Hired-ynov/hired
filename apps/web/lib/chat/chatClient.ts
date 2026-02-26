import { Conversation, Message } from '@repo/models';
import fetchApi from '../api';

/**
 * Get all conversations for the authenticated user
 */
export async function getConversations(): Promise<Conversation[]> {
  const res = await fetchApi('/conversations', {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to fetch conversations');
  }

  const conversations = res.data || res;

  // Handle case where response is a single conversation object instead of an array
  const conversationsArray = Array.isArray(conversations)
    ? conversations
    : [conversations];

  // Convert date strings to Date objects and map participantIds to participants
  return conversationsArray.map((conv) => ({
    ...conv,
    participants: conv.participantIds || conv.participants || [],
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
  }));
}

/**
 * Get all messages for a specific conversation
 */
export async function getMessagesByConversationId(
  conversationId: string,
): Promise<Message[]> {
  const res = await fetchApi(`/conversations/${conversationId}/messages`, {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to fetch messages');
  }

  const messages = (res.data || res) as Message[];

  // Convert date strings to Date objects
  return messages.map((msg) => ({
    ...msg,
    createdAt: new Date(msg.createdAt),
    updatedAt: new Date(msg.updatedAt),
  }));
}

/**
 * Send a new message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  const res = await fetchApi(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.trim() }),
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to send message');
  }

  const message = (res.data || res) as Message;

  // Convert date strings to Date objects
  return {
    ...message,
    createdAt: new Date(message.createdAt),
    updatedAt: new Date(message.updatedAt),
  };
}

/**
 * Create a new conversation for an offer
 */
export async function createConversation(
  offerId: string,
): Promise<Conversation> {
  const res = await fetchApi('/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId }),
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to create conversation');
  }

  const conversation = (res.data || res) as {
    id: string;
    offerId: string;
    participantIds?: string[];
    participants?: string[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
    [key: string]: unknown;
  };

  // Convert date strings to Date objects and map participantIds to participants
  return {
    ...conversation,
    participants:
      conversation.participantIds || conversation.participants || [],
    createdAt: conversation.createdAt
      ? new Date(conversation.createdAt)
      : new Date(),
    updatedAt: conversation.updatedAt
      ? new Date(conversation.updatedAt)
      : new Date(),
  };
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationById(
  conversationId: string,
): Promise<Conversation> {
  const res = await fetchApi(`/conversations/${conversationId}`, {
    method: 'GET',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to fetch conversation');
  }

  const conversation = (res.data || res) as {
    id: string;
    offerId: string;
    participantIds?: string[];
    participants?: string[];
    createdAt?: string | Date;
    updatedAt?: string | Date;
    [key: string]: unknown;
  };

  // Convert date strings to Date objects and map participantIds to participants
  return {
    ...conversation,
    participants:
      conversation.participantIds || conversation.participants || [],
    createdAt: conversation.createdAt
      ? new Date(conversation.createdAt)
      : new Date(),
    updatedAt: conversation.updatedAt
      ? new Date(conversation.updatedAt)
      : new Date(),
  };
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string,
): Promise<void> {
  const res = await fetchApi(`/conversations/${conversationId}`, {
    method: 'DELETE',
  });

  if (!res || res.ok === false) {
    throw new Error(res.message ?? 'Failed to delete conversation');
  }
}

const chatClient = {
  getConversations,
  getMessagesByConversationId,
  sendMessage,
  createConversation,
  getConversationById,
  deleteConversation,
};

export default chatClient;
