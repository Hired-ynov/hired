'use client';

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from 'react';

interface ChatContextType {
  hasNewMessages: boolean;
  setHasNewMessages: (value: boolean) => void;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  openChatForOffer: (offerId: string) => void;
  isOpen: boolean;
  pendingOfferId: string | null;
  clearPendingOffer: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [pendingOfferId, setPendingOfferId] = useState<string | null>(null);

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const openChatForOffer = (offerId: string) => {
    setPendingOfferId(offerId);
    setIsOpen(true);
  };

  const clearPendingOffer = () => {
    setPendingOfferId(null);
  };

  const value = useMemo(
    () => ({
      hasNewMessages,
      setHasNewMessages,
      openChat,
      closeChat,
      toggleChat,
      openChatForOffer,
      isOpen,
      pendingOfferId,
      clearPendingOffer,
    }),
    [hasNewMessages, isOpen, pendingOfferId],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
