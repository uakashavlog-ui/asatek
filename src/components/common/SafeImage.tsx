import React, { useEffect, useState } from 'react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  placeholderIcon?: string;
  placeholderLabel?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  placeholderClassName,
  placeholderIcon = 'image',
  placeholderLabel,
}) => {
  const [failed, setFailed] = useState(false);
  const trimmedSrc = (src || '').trim();

  useEffect(() => {
    setFailed(false);
  }, [trimmedSrc]);

  if (!trimmedSrc || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={
          placeholderClassName ||
          'w-full h-full bg-surface-container-low text-on-surface-variant flex flex-col items-center justify-center gap-1 p-2 text-center select-none'
        }
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[24px] opacity-60">
          {placeholderIcon}
        </span>
        {placeholderLabel && (
          <span className="font-spec-code text-[10px] opacity-70 truncate max-w-full">
            {placeholderLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={trimmedSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
