'use client';

import { forwardRef } from 'react';

interface TextareaCardProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSubmit: () => void;
  onUndo: () => void;
  onCopy: () => void;
  canUndo: boolean;
  merging: boolean;
}

export const TextareaCard = forwardRef<HTMLTextAreaElement, TextareaCardProps>(
  function TextareaCard(
    { value, onChange, onKeyDown, onSubmit, onUndo, onCopy, canUndo, merging },
    ref,
  ) {
    return (
      <div className='glass rounded-[22px] overflow-hidden'>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder='Enter a UI prompt to improve'
          rows={5}
          disabled={merging}
          className='w-full resize-none bg-transparent px-5 pt-5 pb-3 text-[22px] leading-relaxed text-foreground placeholder:text-[22px] placeholder:font-medium placeholder:text-black/30 outline-none disabled:opacity-50'
        />
        <div className='flex items-center justify-end gap-2 px-4 pb-4'>
          <button
            onClick={onUndo}
            disabled={!canUndo || merging}
            className={`glass-btn rounded-full px-5 py-2 text-[19px] font-medium transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
              canUndo && !merging
                ? 'text-foreground/80 cursor-pointer hover:bg-black/5 active:bg-black/10 active:scale-95'
                : ''
            }`}
          >
            Undo
          </button>
          <button
            onClick={onCopy}
            disabled={merging}
            className={`glass-btn rounded-full px-5 py-2 text-[19px] font-medium transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
              !merging && value.trim()
                ? 'text-foreground/80 cursor-pointer hover:bg-black/5 active:bg-black/10 active:scale-95'
                : 'text-foreground/35'
            }`}
          >
            Copy
          </button>
          <button
            onClick={onSubmit}
            disabled={merging}
            className={`glass-btn rounded-full px-5 py-2 text-[19px] font-medium transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
              !merging && value.trim()
                ? 'text-foreground/80 cursor-pointer hover:bg-black/5 active:bg-black/10 active:scale-95'
                : 'text-foreground/35'
            }`}
          >
            Improve
          </button>
        </div>
      </div>
    );
  },
);
