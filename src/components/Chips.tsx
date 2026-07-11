'use client';

import type { UiLang } from '@/lib/types';
import type { LabeledItem } from '@/lib/i18n/labels';

export default function Chips<Id extends string>({
  items,
  selected,
  onToggle,
  lang,
}: {
  items: LabeledItem<Id>[];
  selected: Id[];
  onToggle: (id: Id) => void;
  lang: UiLang;
}) {
  return (
    <div className="chips">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className={`chip ${selected.includes(it.id) ? 'on' : ''}`}
          onClick={() => onToggle(it.id)}
        >
          {it.label[lang] ?? it.label.en}
        </button>
      ))}
    </div>
  );
}
