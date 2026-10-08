import React, { useState } from 'react';
import { Seat } from '../types';
import { X, Check } from 'lucide-react';

interface BulkPasteModalProps {
  isOpen: boolean;
  seats: Seat[];
  onClose: () => void;
  onApplyNames: (names: string[]) => void;
}

export const BulkPasteModal: React.FC<BulkPasteModalProps> = ({
  isOpen,
  seats,
  onClose,
  onApplyNames,
}) => {
  const [text, setText] = useState<string>(() =>
    seats.map((s) => s.name).join('\n')
  );

  React.useEffect(() => {
    if (isOpen) {
      setText(seats.map((s) => s.name).join('\n'));
    }
  }, [isOpen, seats]);

  if (!isOpen) return null;

  const total = seats.length;
  const half = Math.ceil(total / 2);
  const lines = text.split(/\r?\n/).slice(0, total);
  const nonEmptyCount = lines.filter((l) => l.trim().length > 0).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = Array.from({ length: total }, (_, idx) =>
      lines[idx] ? lines[idx].trim() : ''
    );
    onApplyNames(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E6E1DA] p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFECE6] pb-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-[#1C1917]">
              Vendosni të {total} Emrat Menjëherë
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              {half} të parat për anën e sipërme (#01–#{String(half).padStart(2, '0')}), të tjerat për anën e poshtme.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#1C1917]">
                Lista e Mysafirëve (1 rresht për çdo karrige)
              </span>
              <span className="font-mono tabular-nums text-[#78716C]">
                {nonEmptyCount} / {total} emra të shkruar
              </span>
            </div>

            <div className="relative flex rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] overflow-hidden focus-within:border-[#9F2B2B] focus-within:bg-white">
              <div className="select-none py-3 px-2.5 bg-[#EFECE6]/70 border-r border-[#E6E1DA] text-[11px] font-mono tabular-nums text-[#78716C] leading-[1.65rem] text-right">
                {Array.from({ length: total }, (_, i) => (
                  <div key={i}>
                    {i < half ? 'Lart' : 'Poshtë'} #{String(i + 1).padStart(2, '0')}
                  </div>
                ))}
              </div>
              <textarea
                rows={12}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Mërgim Dakaj&#10;Arbnora Dakaj&#10;Besnik Krasniqi..."
                className="w-full p-3 text-xs font-medium text-[#1C1917] bg-transparent leading-[1.65rem] focus:outline-none resize-y"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setText('')}
              className="px-3.5 py-2 rounded-xl border border-[#E6E1DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#57534E] transition-colors whitespace-nowrap"
            >
              Pastro Tekstin
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#E6E1DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#1C1917] transition-colors whitespace-nowrap"
              >
                Anulo
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9F2B2B] hover:bg-[#842222] text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                Vendos në {total} Karrige
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
