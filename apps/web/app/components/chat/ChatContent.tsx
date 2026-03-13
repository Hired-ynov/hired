'use client';

import React, { useState, useEffect } from 'react';
import { Conversation, Message } from '@repo/models';
import MessageBubble from './MessageBubble';
import chatClient from '@/lib/chat/chatClient';
import fetchApi from '@/lib/api';
import { useAuth } from '@/lib/auth/authProvider';
import { useChat } from './ChatProvider';
import { getOfferById } from '@/lib/offer/offerClient';
import { OfferWithCompany } from '@/lib/offer/types';
import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ChatContentProps {}

interface HiddenChat {
  remoteUserId: string;
  lastMessageId: string;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

const HIDDEN_CHATS_KEY = 'hidden_chats';

const getRemoteUserId = (
  conversation: Conversation,
  currentUserId: string,
): string => {
  const participantIds =
    (conversation as { participantIds?: string[] }).participantIds ||
    conversation.participants ||
    [];
  return participantIds.find((p: string) => p !== currentUserId) || '';
};

export default function ChatContent({}: ChatContentProps) {
  const { user } = useAuth();
  const { isOpen, pendingOfferId, closeChat, clearPendingOffer } = useChat();
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [hiddenChats, setHiddenChats] = useState<HiddenChat[]>([]);
  const [conversationLastMessages, setConversationLastMessages] = useState<
    Map<string, string>
  >(new Map());
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [offerDetails, setOfferDetails] = useState<
    Map<string, OfferWithCompany>
  >(new Map());
  const currentUserId = user?.id + '' || '';

  const getUserName = (userId: string): string => {
    const user = users.get(userId);
    if (!user) return userId;
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email || userId;
  };

  const getOtherParticipantName = (conversation: Conversation): string => {
    const remoteUserId = getRemoteUserId(conversation, currentUserId);
    return getUserName(remoteUserId);
  };

  const fetchUser = async (userId: string) => {
    if (users.has(userId)) return;

    try {
      const res = await fetchApi(`/user/${userId}`, { method: 'GET' });
      if (res?.ok) {
        const user = (res.data || res) as User;
        setUsers((prev) => new Map(prev).set(userId, user));
      }
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
    }
  };

  const fetchOffer = async (offerId: string) => {
    if (offerDetails.has(offerId)) return; // Already fetched

    try {
      const offer = await getOfferById(offerId);
      setOfferDetails((prev) => new Map(prev).set(offerId, offer));
    } catch (error) {
      console.error(`Failed to fetch offer ${offerId}:`, error);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(HIDDEN_CHATS_KEY);
    if (stored) {
      try {
        setHiddenChats(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse hidden chats from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HIDDEN_CHATS_KEY, JSON.stringify(hiddenChats));
  }, [hiddenChats]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const data = await chatClient.getConversations();
        setConversations(data);

        const userIds = new Set<string>();
        data.forEach((conv) => {
          const participantIds =
            (conv as { participantIds?: string[] }).participantIds ||
            conv.participants ||
            [];
          participantIds.forEach((id: string) => {
            if (id !== currentUserId) userIds.add(id);
          });
        });

        await Promise.all(
          Array.from(userIds).map((userId) => fetchUser(userId)),
        );
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    if (isOpen) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    const createConversationForOffer = async () => {
      if (
        !pendingOfferId ||
        !isOpen ||
        isCreatingConversation ||
        isLoadingConversations
      )
        return;

      const existingConversation = conversations.find(
        (conv) => conv.offerId === pendingOfferId,
      );

      if (existingConversation) {
        const remoteUserId = getRemoteUserId(
          existingConversation,
          currentUserId,
        );
        const isHidden = hiddenChats.some(
          (hc) => hc.remoteUserId === remoteUserId,
        );

        if (isHidden) {
          handleUnhideChat(remoteUserId);
        }
        setActiveTab(existingConversation.id);
        clearPendingOffer();
        return;
      }

      // Aucune conversation n'existe, on en crée une nouvelle
      try {
        setIsCreatingConversation(true);
        const newConversation =
          await chatClient.createConversation(pendingOfferId);

        setConversations((prev) => [newConversation, ...prev]);

        const participantIds =
          (newConversation as { participantIds?: string[] }).participantIds ||
          newConversation.participants ||
          [];
        await Promise.all(
          participantIds
            .filter((id: string) => id !== currentUserId)
            .map((userId: string) => fetchUser(userId)),
        );

        setActiveTab(newConversation.id);

        clearPendingOffer();
      } catch (error) {
        console.error('Failed to create conversation:', error);
      } finally {
        setIsCreatingConversation(false);
      }
    };

    createConversationForOffer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingOfferId, isOpen, conversations, isLoadingConversations]);

  useEffect(() => {
    if (conversations.length > 0 && !activeTab) {
      const firstVisible = conversations.find((conv) => {
        const remoteUserId = getRemoteUserId(conv, currentUserId);
        return !hiddenChats.some((hc) => hc.remoteUserId === remoteUserId);
      });
      if (firstVisible) {
        setActiveTab(firstVisible.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, hiddenChats]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeTab) return;

      try {
        setIsLoadingMessages(true);
        const data = await chatClient.getMessagesByConversationId(activeTab);
        setMessages(data);

        const conversation = conversations.find(
          (conv) => conv.id === activeTab,
        );
        if (conversation?.offerId) {
          await fetchOffer(conversation.offerId);
        }

        if (data.length > 0) {
          const lastMessage = data.at(-1);
          if (lastMessage) {
            setConversationLastMessages((prev) => {
              const newMap = new Map(prev);
              newMap.set(activeTab, lastMessage.id);
              return newMap;
            });

            const conversation = conversations.find(
              (conv) => conv.id === activeTab,
            );
            if (conversation) {
              const remoteUserId = getRemoteUserId(conversation, currentUserId);
              const hiddenChat = hiddenChats.find(
                (hc) => hc.remoteUserId === remoteUserId,
              );

              if (hiddenChat && lastMessage.id !== hiddenChat.lastMessageId) {
                handleUnhideChat(remoteUserId);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, conversations]);

  if (!isOpen) return null;

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeTab || isSending) return;

    try {
      setIsSending(true);
      const newMessage = await chatClient.sendMessage(
        activeTab,
        messageInput.trim(),
      );
      setMessages((prev) => [...prev, newMessage]);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleHideChat = (conversationId: string) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId,
    );
    if (!conversation) return;

    const remoteUserId = getRemoteUserId(conversation, currentUserId);
    const lastMessage = messages.at(-1);

    const lastMessageId = lastMessage ? lastMessage.id : 'no-messages-yet';

    const newHiddenChat: HiddenChat = {
      remoteUserId,
      lastMessageId,
    };

    setHiddenChats((prev) => {
      const filtered = prev.filter((hc) => hc.remoteUserId !== remoteUserId);
      return [...filtered, newHiddenChat];
    });

    if (activeTab === conversationId) {
      setMessages([]);

      const visibleConvs = conversations.filter((conv) => {
        const remoteId = getRemoteUserId(conv, currentUserId);
        return (
          !hiddenChats.some((hc) => hc.remoteUserId === remoteId) &&
          conv.id !== conversationId
        );
      });
      if (visibleConvs.length > 0) {
        setActiveTab(visibleConvs[0].id);
      } else {
        setActiveTab('');
      }
    }
  };

  const handleUnhideChat = (remoteUserId: string) => {
    setHiddenChats((prev) =>
      prev.filter((hc) => hc.remoteUserId !== remoteUserId),
    );
  };

  const isChatHidden = (conversation: Conversation): boolean => {
    const remoteUserId = getRemoteUserId(conversation, currentUserId);
    const hiddenChat = hiddenChats.find(
      (hc) => hc.remoteUserId === remoteUserId,
    );

    if (!hiddenChat) return false;

    // Chat is only hidden if the last message ID matches
    const lastMessageId = conversationLastMessages.get(conversation.id);

    // If we haven't loaded messages yet, assume it's hidden
    if (!lastMessageId) return true;

    return lastMessageId === hiddenChat.lastMessageId;
  };

  const activeChat = conversations.find((conv) => conv.id === activeTab);

  return (
    <>
      {/* Backdrop for maximized state */}
      {isMaximized && (
        <div
          onClick={handleMaximize}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 997,
          }}
        />
      )}

      {/* Chat Popup */}
      <div
        style={{
          position: 'fixed',
          bottom: isMaximized ? '50%' : '92px',
          right: isMaximized ? '50%' : '24px',
          transform: isMaximized ? 'translate(50%, 50%)' : 'none',
          width: isMaximized ? '95vw' : '360px',
          height: isMaximized ? '95vh' : '500px',
          backgroundColor: 'var(--white)',
          border: '1px solid var(--background-tertiary)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          zIndex: 998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Popup Header */}
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--primary)',
            color: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            Messages
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Maximize/Minimize Button */}
            <button
              onClick={handleMaximize}
              aria-label={isMaximized ? 'Réduire' : 'Agrandir'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--white)',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '4px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isMaximized ? (
                // Minimize icon
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M10 1v3h3M1 10h3v3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M13 3L9 7M3 13l4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                // Maximize icon
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 10v3H3M15 6h-3V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 13l3-3M13 3l-3 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            {/* Close Button */}
            <button
              onClick={closeChat}
              aria-label="Fermer le chat"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--white)',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Chat Tabs */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            borderBottom: '1px solid var(--background-tertiary)',
            backgroundColor: 'var(--background-secondary)',
          }}
        >
          {isLoadingConversations ? (
            <div
              style={{
                padding: '12px 16px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
              }}
            >
              Chargement des conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div
              style={{
                padding: '12px 16px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
              }}
            >
              Aucune conversation
            </div>
          ) : (
            conversations
              .filter((conv) => {
                const remoteUserId = getRemoteUserId(conv, currentUserId);
                const hiddenChat = hiddenChats.find(
                  (hc) => hc.remoteUserId === remoteUserId,
                );
                if (!hiddenChat) return true;
                // Show if there are new messages since hiding
                return !isChatHidden(conv);
              })
              .map((conversation) => (
                <div
                  key={conversation.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor:
                      activeTab === conversation.id
                        ? 'var(--white)'
                        : 'transparent',
                    borderBottom:
                      activeTab === conversation.id
                        ? '2px solid var(--primary)'
                        : 'none',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() => setActiveTab(conversation.id)}
                    style={{
                      padding: '12px 16px',
                      paddingRight: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeTab === conversation.id ? '600' : '400',
                      color:
                        activeTab === conversation.id
                          ? 'var(--primary)'
                          : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {getOtherParticipantName(conversation)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHideChat(conversation.id);
                    }}
                    aria-label="Masquer le chat"
                    title="Masquer le chat"
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color:
                        activeTab === conversation.id
                          ? 'var(--primary)'
                          : 'var(--text-secondary)',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'opacity 0.2s ease',
                      opacity: 0.6,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.6';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2 2L12 12M2 12L12 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))
          )}
        </div>

        {/* Hidden Chats Section */}
        {hiddenChats.length > 0 && (
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--background-tertiary)',
              borderBottom: '1px solid var(--background-tertiary)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <details>
              <summary
                style={{
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: '500',
                }}
              >
                Conversations en attente ({hiddenChats.length})
              </summary>
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {hiddenChats.map((hiddenChat) => {
                  const conversation = conversations.find(
                    (conv) =>
                      getRemoteUserId(conv, currentUserId) ===
                      hiddenChat.remoteUserId,
                  );
                  if (!conversation) return null;

                  return (
                    <div
                      key={hiddenChat.remoteUserId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        backgroundColor: 'var(--white)',
                        borderRadius: '4px',
                      }}
                    >
                      <span>{getOtherParticipantName(conversation)}</span>
                      <button
                        onClick={() =>
                          handleUnhideChat(hiddenChat.remoteUserId)
                        }
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          backgroundColor: 'var(--primary)',
                          color: 'var(--white)',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                        }}
                      >
                        Afficher
                      </button>
                    </div>
                  );
                })}
              </div>
            </details>
          </div>
        )}

        {/* Chat Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              backgroundColor: 'var(--background-secondary)',
            }}
          >
            {isLoadingMessages ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                }}
              >
                Chargement des messages...
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Show offer details if conversation is linked to an offer */}
                {activeChat?.offerId &&
                  offerDetails.has(activeChat.offerId) && (
                    <div
                      style={{
                        marginBottom: '16px',
                        padding: '16px',
                        backgroundColor: 'var(--white)',
                        borderRadius: '12px',
                        border: '1px solid var(--background-tertiary)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      {(() => {
                        const offer = offerDetails.get(activeChat.offerId);
                        if (!offer) return null;
                        return (
                          <>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '20px',
                                }}
                              >
                                💼
                              </span>
                              <p
                                style={{
                                  fontSize: '12px',
                                  color: 'var(--text-secondary)',
                                  margin: 0,
                                  fontWeight: '500',
                                }}
                              >
                                Offre liée à cette conversation
                              </p>
                            </div>
                            <h3
                              style={{
                                margin: '0 0 8px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {offer.title}
                            </h3>
                            <p
                              style={{
                                margin: '0 0 8px 0',
                                fontSize: '13px',
                                color: 'var(--text-secondary)',
                                lineHeight: '1.5',
                              }}
                            >
                              {offer.description.length > 150
                                ? offer.description.substring(0, 150) + '...'
                                : offer.description}
                            </p>
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                                marginBottom: '8px',
                              }}
                            >
                              {offer.skills.slice(0, 3).map((skill) => (
                                <span
                                  key={skill}
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    backgroundColor:
                                      'var(--background-secondary)',
                                    color: 'var(--text-primary)',
                                    borderRadius: '4px',
                                    fontWeight: '500',
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                              {offer.skills.length > 3 && (
                                <span
                                  style={{
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    color: 'var(--text-secondary)',
                                  }}
                                >
                                  +{offer.skills.length - 3}
                                </span>
                              )}
                            </div>
                            <Link
                              href={`/offer/${offer.id}`}
                              style={{
                                display: 'inline-block',
                                fontSize: '12px',
                                color: 'var(--primary)',
                                textDecoration: 'none',
                                fontWeight: '500',
                                marginTop: '4px',
                              }}
                            >
                              Voir l&apos;offre complète →
                            </Link>
                          </>
                        );
                      })()}
                    </div>
                  )}

                {messages.length > 0 ? (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      variant={
                        message.senderId === currentUserId ? 'local' : 'distant'
                      }
                    />
                  ))
                ) : (
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      textAlign: 'center',
                      margin: '20px 0',
                    }}
                  >
                    Aucun message. Commencez une conversation avec{' '}
                    {activeChat
                      ? getOtherParticipantName(activeChat)
                      : 'cet utilisateur'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--background-tertiary)',
              backgroundColor: 'var(--white)',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Envoyer à ${activeChat ? getOtherParticipantName(activeChat) : 'utilisateur'}...`}
                disabled={isSending || !activeTab}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid var(--background-tertiary)',
                  borderRadius: '20px',
                  fontSize: '14px',
                  outline: 'none',
                  opacity: isSending ? 0.6 : 1,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    'var(--background-tertiary)';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isSending || !messageInput.trim() || !activeTab}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: '20px',
                  cursor:
                    isSending || !messageInput.trim() || !activeTab
                      ? 'not-allowed'
                      : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  opacity:
                    isSending || !messageInput.trim() || !activeTab ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSending && messageInput.trim() && activeTab) {
                    e.currentTarget.style.opacity = '0.9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSending && messageInput.trim() && activeTab) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                {isSending ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
