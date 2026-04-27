'use client';

import { DashedIcon } from './icons';

export interface SuggestionItem {
  label: string;
}

interface PopMenuProps {
  items: SuggestionItem[];
  visible: boolean;
  loading: boolean;
  loadingPhase: number;
  error: string | null;
  selectedIndex: number;
  onSelect: (item: SuggestionItem) => void;
  onHover: (index: number) => void;
  onRetry: () => void;
  onClose: () => void;
}

function MenuRow({
  children,
  isSelected,
  onClick,
  onMouseEnter,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <div
      className={`group mx-2 px-3 py-3 flex items-center rounded-xl cursor-pointer ${
        isSelected ? 'bg-black/4' : ''
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </div>
  );
}

const RETRY_MESSAGES = ['Taking a bit longer...', 'Almost there...'];

function LoadingState({ phase }: { phase: number }) {
  const showMessage = phase > 0;
  const message = showMessage
    ? RETRY_MESSAGES[Math.min(phase - 1, RETRY_MESSAGES.length - 1)]
    : null;

  return (
    <div className='flex flex-col items-center py-6 gap-3'>
      <div className='flex gap-1.5'>
        <div className='w-1.5 h-1.5 rounded-full bg-black/20 animate-[pulse_1s_ease-in-out_0s_infinite]' />
        <div className='w-1.5 h-1.5 rounded-full bg-black/20 animate-[pulse_1s_ease-in-out_0.2s_infinite]' />
        <div className='w-1.5 h-1.5 rounded-full bg-black/20 animate-[pulse_1s_ease-in-out_0.4s_infinite]' />
      </div>
      {message && <span className='text-[15px] text-black/30'>{message}</span>}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className='flex flex-col items-center py-6 gap-2'>
      <span className='text-[15px] text-black/40'>{message}</span>
      <button
        onClick={onRetry}
        className='text-[15px] text-black/50 hover:text-black/70 underline underline-offset-2 cursor-pointer'
      >
        Try again
      </button>
    </div>
  );
}

export function PopMenu({
  items,
  visible,
  loading,
  loadingPhase,
  error,
  selectedIndex,
  onSelect,
  onHover,
  onRetry,
  onClose,
}: PopMenuProps) {
  const renderContent = () => {
    if (loading) return <LoadingState phase={loadingPhase} />;
    if (error) return <ErrorState message={error} onRetry={onRetry} />;
    return items.map((item, i) => (
      <MenuRow
        key={i}
        isSelected={i === selectedIndex}
        onClick={() => onSelect(item)}
        onMouseEnter={() => onHover(i)}
      >
        <DashedIcon />
        <span className='ml-3 text-[22px] text-black/40 group-hover:text-black/90'>
          {item.label}
        </span>
      </MenuRow>
    ));
  };

  return (
    <div
      className={`absolute bottom-[calc(100%+10px)] left-0 right-0 max-h-[50vh] overflow-y-auto glass-elevated rounded-[22px] py-2 z-10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom ${
        visible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-2 scale-[0.97] pointer-events-none'
      }`}
    >
      <div className='flex items-center justify-between px-5 pt-2 pb-1'>
        <span className='text-[15px] font-medium text-black/30'>
          Suggestions
        </span>
        <button
          onClick={onClose}
          className='w-6 h-6 flex items-center justify-center rounded-full text-black/30 hover:bg-black/5 active:bg-black/10 transition-colors duration-200 cursor-pointer'
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
