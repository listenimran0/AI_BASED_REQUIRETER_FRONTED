import { useState, type KeyboardEvent } from 'react';
import { Icon } from './Icon';

export function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState('');
  const add = () => {
    const parts = text
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setText('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="tags-input">
      {value.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
            <Icon name="x" size={12} />
          </button>
        </span>
      ))}
      <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKey} onBlur={add} placeholder={value.length ? '' : placeholder} />
    </div>
  );
}
