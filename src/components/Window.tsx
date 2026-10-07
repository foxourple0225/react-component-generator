import { useId } from 'react';
import type { ReactNode } from 'react';

interface WindowProps {
  title: string;
  children: ReactNode;
  className?: string;
  flush?: boolean;
  onClose?: () => void;
  closeLabel?: string;
}

export function Window({
  title,
  children,
  className = '',
  flush = false,
  onClose,
  closeLabel = '닫기',
}: WindowProps) {
  const titleId = useId();

  return (
    <section className={`window ${className}`.trim()} aria-labelledby={titleId}>
      <header className="titlebar">
        {onClose ? (
          <button
            type="button"
            className="close-box"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
          />
        ) : (
          <span className="close-box close-box--empty" aria-hidden="true" />
        )}
        <span id={titleId} className="titlebar-title">
          {title}
        </span>
        <span className="titlebar-end" aria-hidden="true" />
      </header>
      <div className={flush ? 'window-body window-body--flush' : 'window-body'}>{children}</div>
    </section>
  );
}
