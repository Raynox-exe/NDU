import { useState } from 'react';

interface NduCrestProps {
  className?: string;
}

const NDU_CREST_SRC =
  '/assets/aistudio/Gemini_Generated_Image_263o03263o03263o-removebg-preview_997b1d22.png';

export function NduCrest({ className = 'h-10 w-auto' }: NduCrestProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <svg
        viewBox="0 0 100 108"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Niger Delta University Crest"
        role="img"
      >
        <path
          d="M50 4L90 14V52C90 77 72 95 50 103C28 95 10 77 10 52V14L50 4Z"
          fill="#0B3B69"
          stroke="#C2820A"
          strokeWidth="3.5"
        />
        <path d="M14 17.5L50 8.5L86 17.5V44H14V17.5Z" fill="#14452F" />
        <rect x="18" y="88" width="64" height="12" rx="2" fill="#C2820A" />
      </svg>
    );
  }

  return (
    <img
      src={NDU_CREST_SRC}
      alt="Niger Delta University Crest — Creativity, Excellence, Service"
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className={`object-contain select-none ${className}`}
    />
  );
}
