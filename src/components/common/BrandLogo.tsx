import React, { useEffect, useState } from 'react';

interface BrandLogoProps {
  src?: string;
  siteName: string;
  className?: string;
  fallbackClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  siteName,
  className = 'h-8 w-8 rounded-md object-contain bg-white border border-surface-container shrink-0',
  fallbackClassName,
}) => {
  const [failed, setFailed] = useState(false);
  const trimmedSrc = (src || '').trim();

  useEffect(() => {
    setFailed(false);
  }, [trimmedSrc]);

  if (!trimmedSrc || failed) {
    const initial = (siteName || 'A').trim().charAt(0).toUpperCase() || 'A';
    const layoutClasses = className
      .split(/\s+/)
      .filter((token) => token && !token.startsWith('bg-') && !token.startsWith('border-') && token !== 'object-contain')
      .join(' ');
    return (
      <span
        aria-hidden="true"
        className={
          fallbackClassName ||
          `${layoutClasses} inline-flex items-center justify-center bg-primary text-on-primary font-extrabold text-sm select-none`
        }
      >
        {initial}
      </span>
    );
  }

  return (
    <img
      src={trimmedSrc}
      alt={`${siteName} Logo`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
