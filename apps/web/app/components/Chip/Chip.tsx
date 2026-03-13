'use client';

import { JSX } from 'react';
import './styles.scss';

interface ChipProps {
  /** Text content of the chip */
  content: string;

  /**
   * Display a dot before the content.
   * Cannot be mixed with `icon` option.
   * @default false
   */
  dot?: boolean;
  /**
   * Display an icon before the content.
   * Cannot be mixed with `dot` option.
   * @default null
   */
  icon?: JSX.Element;
  onClick?: (content: string, ev: React.MouseEvent<HTMLDivElement>) => void;
}

export default function Chip({
  content,
  dot = false,
  icon,
  onClick,
}: ChipProps) {
  return (
    <div
      className="chip"
      role={onClick ? 'button' : 'generic'}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={(ev) => onClick?.(content, ev)}
    >
      {icon && !dot && icon}
      {dot && !icon && <div className="dot" aria-hidden />}
      {content}
    </div>
  );
}
