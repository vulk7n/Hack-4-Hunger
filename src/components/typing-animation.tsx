
'use client';

import { useState, useEffect } from 'react';

interface TypingAnimationProps {
  words: string[];
  className?: string;
}

export function TypingAnimation({ words, className }: TypingAnimationProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const delay = 1200;

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[wordIndex];
      
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
      } else {
        setText(currentWord.substring(0, text.length + 1));
      }

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, delay]);

  return (
    <span className={className}>
      {text}
      <span className="inline-block w-[1px] h-[1em] ml-1 bg-current animate-pulse"></span>
    </span>
  );
}
