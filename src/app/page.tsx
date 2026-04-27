'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { GradientBackground } from '@/components/GradientBackground';
import { PopMenu, type SuggestionItem } from '@/components/PopMenu';
import { TextareaCard } from '@/components/TextareaCard';

export default function Home() {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [originalInput, setOriginalInput] = useState('');
  const [merging, setMerging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPhaseTimer = () => {
    if (phaseTimerRef.current) {
      clearInterval(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  };

  const fetchSuggestions = useCallback(async () => {
    if (!value.trim()) return;
    setOriginalInput(value.trim());
    setMenuOpen(true);
    setLoading(true);
    setLoadingPhase(0);
    setError(null);
    setItems([]);
    setSelectedIndex(0);

    clearPhaseTimer();
    phaseTimerRef.current = setInterval(() => {
      setLoadingPhase((prev) => Math.min(prev + 1, 2));
    }, 3000);

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: value.trim() }),
      });
      const data = await res.json();
      const suggestions = data.suggestions ?? data;
      if (!Array.isArray(suggestions)) {
        console.error('[suggestions] Invalid response:', data);
        setError('Something went wrong. Please try again.');
        return;
      }
      setItems(suggestions);
      setSelectedIndex(0);
    } catch {
      setError('Could not connect. Please check your network.');
    } finally {
      setLoading(false);
      clearPhaseTimer();
    }
  }, [value]);

  useEffect(() => {
    return () => clearPhaseTimer();
  }, []);

  const hideMenu = useCallback(() => {
    setMenuOpen(false);
    setSelectedIndex(0);
    setError(null);
  }, []);

  const handleSelect = useCallback(
    async (item: SuggestionItem) => {
      hideMenu();
      setHistory((prev) => [...prev, value]);
      setMerging(true);
      setValue('Refining...');

      try {
        const res = await fetch('/api/merge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ original: originalInput, selected: item.label }),
        });
        const data = await res.json();
        if (data.merged) {
          setValue(data.merged);
        } else {
          setValue(item.label);
        }
      } catch {
        setValue(item.label);
      } finally {
        setMerging(false);
        textareaRef.current?.focus();
      }
    },
    [hideMenu, value, originalInput],
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setValue(prev);
    textareaRef.current?.focus();
  }, [history]);

  const handleCopy = useCallback(() => {
    if (value.trim()) {
      navigator.clipboard.writeText(value);
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (menuOpen && !loading && !error) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(items.length - 1, prev + 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) handleSelect(items[selectedIndex]);
        return;
      }
    }

    if (e.key === 'Escape' && menuOpen) {
      e.preventDefault();
      hideMenu();
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && !menuOpen) {
      e.preventDefault();
      fetchSuggestions();
    }
  };

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (menuOpen) hideMenu();
  };

  return (
    <main className='flex-1 flex items-center justify-end flex-col pb-[12vh] p-6 relative'>
      <GradientBackground />

      <div ref={containerRef} className='relative w-full max-w-[620px] z-10'>
        <PopMenu
          items={items}
          visible={menuOpen}
          loading={loading}
          loadingPhase={loadingPhase}
          error={error}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          onHover={setSelectedIndex}
          onRetry={fetchSuggestions}
          onClose={hideMenu}
        />

        <TextareaCard
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSubmit={fetchSuggestions}
          onUndo={handleUndo}
          onCopy={handleCopy}
          canUndo={history.length > 0}
          merging={merging}
        />
      </div>
    </main>
  );
}
