'use client';

import React from 'react';
import { Message } from '@repo/models';

interface MessageBubbleProps {
  message: Message;
  variant: 'local' | 'distant';
}

export default function MessageBubble({
  message,
  variant,
}: MessageBubbleProps) {
  const isLocal = variant === 'local';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isLocal ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '10px 14px',
          borderRadius: isLocal ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          backgroundColor: isLocal ? 'var(--primary)' : 'var(--white)',
          color: isLocal ? 'var(--white)' : 'var(--text-primary)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          wordWrap: 'break-word',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            lineHeight: '1.5',
          }}
        >
          {message.content}
        </p>
        <span
          style={{
            fontSize: '11px',
            opacity: 0.7,
            marginTop: '4px',
            display: 'block',
          }}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
