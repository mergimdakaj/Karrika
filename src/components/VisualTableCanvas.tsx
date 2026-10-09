import React, { useRef } from 'react';
import {
  Seat,
  TableShape,
  CenterpieceTheme,
  GuestRole,
  ROLE_SHORT_LABELS,
  DIETARY_LABELS,
  calculateSeatTotal,
} from '../types';
import {
  Crown,
  ArrowLeftRight,
  Check,
  Sparkles,
  UserPlus,
  X,
  Wine,
  Utensils,
  Save,
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Plus,
} from 'lucide-react';

interface VisualTableCanvasProps {
  seats: Seat[];
  selectedSeatId: number;
  swapSourceId: number | null;
  tableShape: TableShape;
  centerpiece: CenterpieceTheme;
  eventTitle: string;
  celebrantName: string;
  eventDate: string;
  filterRole: GuestRole | 'te-gjitha';
  searchQuery: string;
  onSelectSeat: (id: number) => void;
  onUpdateSeatName: (id: number, name: string) => void;
  onSwapSeats: (idA: number, idB: number) => void;
  onStartSwap: (id: number | null) => void;
  onClearSeat: (id: number) => void;
  onOpenOrderModal: (id: number) => void;
  onSaveFormat?: () => void;
  onRemoveSeat?: (target: string | number) => boolean;
  onAddSeat?: () => void;
  onResetSeats?: () => void;
}

const ROLE_ACCENT_STYLES: Record<
  GuestRole,
  { border: string; badgeBg: string; badgeText: string; dot: string }
> = {
  festari: {
    border: 'border-[#B4833E]',
    badgeBg: 'bg-[#B4833E] text-white',
    badgeText: 'text-[#8C6227]',
    dot: 'bg-[#B4833E]',
  },
  familja: {
    border: 'border-[#9F2B2B]/50',
    badgeBg: 'bg-[#9F2B2B] text-white',
    badgeText: 'text-[#9F2B2B]',
    dot: 'bg-[#9F2B2B]',
  },
  miqte: {
    border: 'border-[#2E5A44]/50',
    badgeBg: 'bg-[#2E5A44] text-white',
    badgeText: 'text-[#2E5A44]',
    dot: 'bg-[#2E5A44]',
  },
  koleget: {
    border: 'border-[#3B526B]/50',
    badgeBg: 'bg-[#3B526B] text-white',
    badgeText: 'text-[#3B526B]',
    dot: 'bg-[#3B526B]',
  },
  femije: {
    border: 'border-[#B85D19]/50',
    badgeBg: 'bg-[#B85D19] text-white',
    badgeText: 'text-[#B85D19]',
    dot: 'bg-[#B85D19]',
  },
};

export const VisualTableCanvas: React.FC<VisualTableCanvasProps> = ({
  seats,
  selectedSeatId,
  swapSourceId,
  tableShape,
  centerpiece,
  eventTitle,
  celebrantName,
  eventDate,
  filterRole,
  searchQuery,
  onSelectSeat,
  onUpdateSeatName,
  onSwapSeats,
  onStartSwap,
  onClearSeat,
  onOpenOrderModal,
  onSaveFormat,
  onRemoveSeat,
  onAddSeat,
  onResetSeats,
}) => {
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [draggedSeatId, setDraggedSeatId] = React.useState<number | null>(null);
  const [dragOverSeatId, setDragOverSeatId] = React.useState<number | null>(null);
  const [scaleMode, setScaleMode] = React.useState<'photo' | 'compact' | 'normal'>('photo');
  const [removeInput, setRemoveInput] = React.useState('');

  const handleRemoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeInput.trim()) return;
    const success = onRemoveSeat?.(removeInput.trim());
    if (success) {
      setRemoveInput('');
    }
  };

  const totalSeats = seats.length;
  const halfSeats = Math.ceil(totalSeats / 2);

  const focusSeatInput = (id: number) => {
    const nextId = id > totalSeats ? 1 : id < 1 ? totalSeats : id;
    onSelectSeat(nextId);
    setTimeout(() => {
      const el = inputRefs.current[nextId];
      if (el) {
        el.focus();
        el.select();
      }
    }, 20);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, seatId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusSeatInput(seatId + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusSeatInput(seatId <= halfSeats ? seatId + halfSeats : seatId - halfSeats);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusSeatInput(seatId > halfSeats ? seatId - halfSeats : seatId + halfSeats);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusSeatInput(seatId + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusSeatInput(seatId - 1);
    }
  };

  const isSeatDimmed = (seat: Seat) => {
    const matchesRole = filterRole === 'te-gjitha' || seat.role === filterRole;
    const matchesSearch =
      !searchQuery.trim() ||
      seat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(seat.id).padStart(2, '0').includes(searchQuery.trim()) ||
      seat.note.toLowerCase().includes(searchQuery.toLowerCase());
    return !(matchesRole && matchesSearch);
  };

  const renderChairNode = (
    seat: Seat,
    orientation: 'top' | 'bottom' | 'left' | 'right'
  ) => {
    const isSelected = selectedSeatId === seat.id;
    const isSwapSource = swapSourceId === seat.id;
    const isSwapTarget = swapSourceId !== null && swapSourceId !== seat.id;
    const isDragOver = dragOverSeatId === seat.id;
    const isEmpty = !seat.name.trim();
    const dimmed = isSeatDimmed(seat);
    const style = ROLE_ACCENT_STYLES[seat.role];

    const handleChairClick = () => {
      if (swapSourceId !== null) {
        if (swapSourceId === seat.id) {
          onStartSwap(null);
        } else {
          onSwapSeats(swapSourceId, seat.id);
          onStartSwap(null);
        }
        return;
      }
      onSelectSeat(seat.id);
    };

    const backrestPosition =
      orientation === 'top'
        ? '-top-2 left-2.5 right-2.5 h-1.5 rounded-t-full'
        : orientation === 'bottom'
          ? '-bottom-2 left-2.5 right-2.5 h-1.5 rounded-b-full'
          : orientation === 'left'
            ? '-left-2 top-2.5 bottom-2.5 w-1.5 rounded-l-full'
            : '-right-2 top-2.5 bottom-2.5 w-1.5 rounded-r-full';

    return (
      <div
        key={seat.id}
        draggable
        onDragStart={(e) => {
          setDraggedSeatId(seat.id);
          e.dataTransfer.setData('text/plain', String(seat.id));
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (draggedSeatId !== seat.id) {
            setDragOverSeatId(seat.id);
          }
        }}
        onDragLeave={() => setDragOverSeatId(null)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverSeatId(null);
          const sourceId = Number(e.dataTransfer.getData('text/plain')) || draggedSeatId;
          if (sourceId && sourceId !== seat.id) {
            onSwapSeats(sourceId, seat.id);
          }
          setDraggedSeatId(null);
        }}
        onClick={handleChairClick}
        className={`group relative select-none transition-all duration-150 ${
          scaleMode === 'normal'
            ? 'w-[114px]'
            : scaleMode === 'compact'
              ? 'w-full min-w-0 max-w-[98px]'
              : 'w-full min-w-0 max-w-[88px] sm:max-w-[104px]'
        } ${
          dimmed ? 'opacity-30' : 'opacity-100'
        } ${isSwapTarget ? 'cursor-pointer ring-2 ring-[#B4833E]/60 rounded-xl' : 'cursor-pointer'}`}
      >
        {/* Physical Chair Backrest */}
        <div
          className={`absolute ${backrestPosition} transition-colors duration-150 ${
            seat.role === 'festari'
              ? 'bg-[#B4833E]'
              : isEmpty
                ? 'bg-[#D6CFC5]'
                : 'bg-[#4A372B] group-hover:bg-[#9F2B2B]'
          }`}
        />

        {/* Chair Card with Direct Input */}
        <div
          className={`relative rounded-xl bg-white ${
            scaleMode === 'normal' ? 'p-2' : 'p-1 sm:p-1.5'
          } transition-all duration-150 border ${
            isSelected
              ? 'border-[#9F2B2B] ring-2 ring-[#9F2B2B]/20 shadow-xs'
              : isSwapSource
                ? 'border-[#B4833E] ring-2 ring-[#B4833E]/30 bg-[#FFFDF9]'
                : isDragOver
                  ? 'border-[#9F2B2B] bg-[#FAF3F0] scale-[1.03]'
                  : isEmpty
                    ? 'border-dashed border-[#D5CEC4] bg-[#FCFBF9] hover:border-[#9F2B2B]/50'
                    : `${style.border} hover:border-[#9F2B2B]`
          }`}
        >
          {/* Header Row: Seat Number + Festari Crown + Quick Actions */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center justify-center ${
                  scaleMode === 'normal' ? 'px-1.5 py-0.5 text-[11px]' : 'px-1 py-0.5 text-[9px] sm:text-[10px]'
                } font-mono font-semibold tabular-nums rounded ${
                  seat.role === 'festari'
                    ? 'bg-[#B4833E] text-white'
                    : isSelected
                      ? 'bg-[#9F2B2B] text-white'
                      : isEmpty
                        ? 'bg-[#EFECE6] text-[#78716C]'
                        : 'bg-[#292524] text-white'
                }`}
              >
                #{String(seat.id).padStart(2, '0')}
              </span>
              {seat.role === 'festari' && (
                <Crown className={`${scaleMode === 'normal' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3'} text-[#B4833E] shrink-0`} aria-label="Festari" />
              )}
            </div>

            <div className="flex items-center gap-0.5">
              <button
                type="button"
                title="Shto pije automatike ose ushqim me çmim"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSeat(seat.id);
                  onOpenOrderModal(seat.id);
                }}
                className="p-1 rounded text-[#9F2B2B] hover:text-white hover:bg-[#9F2B2B] transition-colors"
              >
                <Wine className="w-3 h-3" />
              </button>
              {!isEmpty && (
                <button
                  type="button"
                  title="Ndërro vendin me një karrige tjetër"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartSwap(swapSourceId === seat.id ? null : seat.id);
                  }}
                  className={`p-0.5 rounded transition-colors ${
                    isSwapSource
                      ? 'bg-[#B4833E] text-white'
                      : 'text-[#78716C] opacity-0 group-hover:opacity-100 hover:text-[#1C1917] hover:bg-[#F5F2EB]'
                  }`}
                >
                  <ArrowLeftRight className="w-3 h-3" />
                </button>
              )}
              {!isEmpty && (
                <button
                  type="button"
                  title="Pastro emrin nga kjo karrige"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSeat(seat.id);
                  }}
                  className="p-0.5 rounded text-[#78716C] opacity-0 group-hover:opacity-100 hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {onRemoveSeat && (
                <button
                  type="button"
                  title={`Hiq Karrigen #${seat.id} nga tavolina`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSeat(seat.id);
                  }}
                  className="p-0.5 rounded text-[#78716C] opacity-0 group-hover:opacity-100 hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                >
                  <Trash2 className="w-3 h-3 text-[#DC2626]" />
                </button>
              )}
              {isEmpty && (
                <UserPlus className="w-3 h-3 text-[#A8A29E] group-hover:text-[#9F2B2B] transition-colors" />
              )}
            </div>
          </div>

          {/* Live Editable Name Box */}
          <div className="relative">
            <input
              ref={(el) => {
                inputRefs.current[seat.id] = el;
              }}
              type="text"
              value={seat.name}
              onFocus={() => onSelectSeat(seat.id)}
              onClick={(e) => {
                if (swapSourceId !== null) {
                  e.preventDefault();
                  return;
                }
                e.stopPropagation();
                onSelectSeat(seat.id);
              }}
              onChange={(e) => onUpdateSeatName(seat.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, seat.id)}
              placeholder="Emri..."
              aria-label={`Emri për karrigen ${seat.id}`}
              className={`w-full ${
                scaleMode === 'normal' ? 'text-[12px] py-1' : 'text-[10px] sm:text-[11px] py-0.5'
              } font-medium leading-tight bg-transparent rounded px-0.5 border border-transparent focus:border-[#9F2B2B]/40 focus:bg-[#FAF8F5] focus:outline-none transition-colors truncate ${
                isEmpty
                  ? 'text-[#78716C] placeholder:text-[#A8A29E] placeholder:italic'
                  : 'text-[#1C1917] font-semibold'
              }`}
            />
          </div>

          {/* Subtitle / Role Info */}
          <div className={`mt-0.5 flex items-center justify-between ${
            scaleMode === 'normal' ? 'text-[10px]' : 'text-[8px] sm:text-[9px]'
          } text-[#78716C] px-0.5 truncate`}>
            <span className={`truncate ${!isEmpty ? style.badgeText : 'text-[#A8A29E]'}`}>
              {isEmpty ? 'E lirë' : ROLE_SHORT_LABELS[seat.role]}
            </span>
            {!isEmpty && (
              <>
                <span aria-hidden="true" className="mx-0.5">·</span>
                <span className="truncate">
                  {seat.dietary === 'klasike' ? 'Klasike' : DIETARY_LABELS[seat.dietary].replace('Menu ', '')}
                </span>
              </>
            )}
          </div>

          {/* Drinks & Food Price Quick Indicator Button */}
          {(() => {
            const seatTotal = calculateSeatTotal(seat);
            const drinksCount = (seat.drinks || []).reduce((acc, d) => acc + d.quantity, 0);
            const dishesCount = (seat.dishes || []).reduce((acc, d) => acc + d.quantity, 0);
            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSeat(seat.id);
                  onOpenOrderModal(seat.id);
                }}
                title="Kliko për të shtuar pije automatikisht ose çmimin e ushqimit"
                className={`mt-1 w-full flex items-center justify-between ${
                  scaleMode === 'normal' ? 'text-[10px] px-1.5 py-0.5' : 'text-[8px] sm:text-[9px] px-1 py-0.5'
                } bg-[#FAF8F5] hover:bg-[#FFF8F7] border border-[#E6E1DA] hover:border-[#9F2B2B] rounded-md sm:rounded-lg text-left transition-colors cursor-pointer group/order`}
              >
                <span className="truncate text-[#57534E] group-hover/order:text-[#9F2B2B] flex items-center gap-0.5 font-medium">
                  {drinksCount > 0 && <span>🍷{drinksCount}</span>}
                  {dishesCount > 0 && <span>🍽️{dishesCount}</span>}
                  {drinksCount === 0 && dishesCount === 0 && (
                    <span className="text-[#A8A29E] group-hover/order:text-[#9F2B2B] font-semibold flex items-center gap-0.5">
                      <Wine className="w-2.5 h-2.5 text-[#9F2B2B]" />
                      <span>+Pije</span>
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold tabular-nums text-[#1C1917] group-hover/order:text-[#9F2B2B] ml-0.5 shrink-0">
                  {seatTotal > 0 ? `${seatTotal.toFixed(2)}€` : '0€'}
                </span>
              </button>
            );
          })()}
        </div>
      </div>
    );
  };

  const renderPlaceSetting = (seat: Seat) => {
    const isEmpty = !seat.name.trim();
    const isSelected = selectedSeatId === seat.id;
    const isFestari = seat.role === 'festari';

    return (
      <div
        key={`plate-${seat.id}`}
        onClick={() => {
          onSelectSeat(seat.id);
          onOpenOrderModal(seat.id);
        }}
        title={`Pjata #${String(seat.id).padStart(2, '0')} — ${seat.name || 'E lirë'} · Kliko për të shtuar pije automatikisht ose ushqim me çmim`}
        className="flex flex-col items-center justify-center cursor-pointer group"
      >
        <div className="flex items-center gap-0.5 sm:gap-1">
          <div className="w-[1.5px] sm:w-[2px] h-3.5 sm:h-5 bg-[#D6CFC2]/70 rounded-full" />
          <div
            className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-transform duration-150 group-hover:scale-110 ${
              isFestari
                ? 'bg-[#FFFDF9] border-2 border-[#D4AF37] shadow-xs'
                : isSelected
                  ? 'bg-white border-2 border-[#E17055] shadow-xs'
                  : isEmpty
                    ? 'bg-[#EFECE6]/40 border border-[#D6CFC2]/50'
                    : 'bg-[#FAF8F5] border border-[#D6CFC2]'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-mono tabular-nums ${
                isFestari
                  ? 'border border-[#D4AF37]/60 text-[#8C6227] font-bold'
                  : isEmpty
                    ? 'border border-dashed border-[#C7B299]/50 text-[#C7B299]'
                    : 'border border-[#D6CFC2] text-[#57534E] font-medium'
              }`}
            >
              {String(seat.id).padStart(2, '0')}
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#E8F1F5]/80 border border-white/60" />
            <div className="w-[1.5px] sm:w-[2px] h-3 sm:h-4 bg-[#D6CFC2]/70 rounded-full" />
          </div>
        </div>
      </div>
    );
  };

  const renderTableCenterpiece = () => {
    return (
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-6 px-3 sm:px-6 py-2 sm:py-3.5 rounded-xl bg-[#FAF6F0]/95 border border-[#D4AF37]/40 shadow-xs text-center">
        <div className="hidden sm:flex items-center gap-3 text-[#8C6227]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#F5EBE1] border border-[#D4AF37]/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#B4833E]" />
          </div>
          <div className="h-6 sm:h-8 w-[1px] bg-[#E6DEC8]" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-[#FFF9F2] border-2 border-[#B4833E] flex items-center justify-center shadow-inner shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-dashed border-[#9F2B2B]/50 bg-[#FDF2F0] flex flex-col items-center justify-center">
              <span className="text-[7px] sm:text-[8px] font-mono font-bold text-[#9F2B2B] tracking-tight">
                TORTA
              </span>
            </div>
          </div>

          <div className="text-left">
            <div className="text-[10px] sm:text-[11px] font-medium text-[#8C6227] flex items-center gap-1.5">
              <span>{centerpiece === 'torta-dhe-qirinj' ? 'Torta Festive & Qirinjtë' : centerpiece === 'lule-festive' ? 'Aranzhim Lulesh' : 'Dolli me Shampanjë'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{totalSeats} Karrige</span>
            </div>
            <h3 className="font-display text-xs sm:text-base font-semibold text-[#1C1917] leading-snug">
              {eventTitle || 'Darka e Ditëlindjes'}
            </h3>
            <p className="text-[10px] sm:text-xs text-[#57534E]">
              Festari/ja: <strong className="text-[#9F2B2B] font-semibold">{celebrantName || 'Mërgim'}</strong>
              <span aria-hidden="true" className="mx-1">·</span>
              <span>{eventDate}</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="h-6 sm:h-8 w-[1px] bg-[#E6DEC8]" />
          <div className="text-right">
            <div className="text-[10px] text-[#78716C]">Të caktuara</div>
            <div className="text-xs sm:text-sm font-mono font-semibold tabular-nums text-[#1C1917]">
              {seats.filter((s) => s.name.trim().length > 0).length} / {totalSeats}
            </div>
          </div>
          <div className="h-6 sm:h-8 w-[1px] bg-[#E6DEC8]" />
          <div className="text-right">
            <div className="text-[10px] text-[#8C6227] font-semibold">Fatura Totale</div>
            <div className="text-xs sm:text-sm font-mono font-bold tabular-nums text-[#9F2B2B]">
              {seats.reduce((acc, s) => acc + calculateSeatTotal(s), 0).toFixed(2)} €
            </div>
          </div>
        </div>
      </div>
    );
  };

  // LAYOUT 1: SIDES PARALLEL (TË GJITHA ANASH — PA KARRIGE NË MES APO SKAJE)
  const renderSidesParallelTable = () => {
    const topRow = seats.slice(0, halfSeats);
    const bottomRow = seats.slice(halfSeats, totalSeats);

    return (
      <div className="w-full overflow-x-auto pb-4 pt-2">
        <div className={`mx-auto flex flex-col items-center py-2 px-1 sm:px-3 ${
          scaleMode === 'normal' ? 'min-w-[1100px]' : 'w-full max-w-[1140px]'
        }`}>
          {/* Top Row of Chairs */}
          <div
            className={`grid gap-1 sm:gap-2 w-full mb-2 ${
              scaleMode === 'normal' ? 'max-w-[1200px]' : 'max-w-[1140px]'
            }`}
            style={{ gridTemplateColumns: `repeat(${topRow.length}, minmax(0, 1fr))` }}
          >
            {topRow.map((seat) => renderChairNode(seat, 'top'))}
          </div>

          {/* Central Banquet Table */}
          <div className={`w-full ${
            scaleMode === 'normal' ? 'max-w-[1200px] p-4' : 'max-w-[1140px] p-2 sm:p-3'
          } rounded-xl sm:rounded-2xl bg-[#433024] border-2 sm:border-4 border-[#2E2018] shadow-md relative overflow-hidden`}>
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-16 sm:h-20 bg-[#F4EFE6]/15 border-y border-[#D4AF37]/25 pointer-events-none" />

            {/* Top Place Settings */}
            <div
              className="grid gap-1 sm:gap-2 mb-2 sm:mb-3 relative z-10"
              style={{ gridTemplateColumns: `repeat(${topRow.length}, minmax(0, 1fr))` }}
            >
              {topRow.map((seat) => renderPlaceSetting(seat))}
            </div>

            {/* Center Area: Both Ends Completely Free (NO CHAIRS AT HEAD/FOOT) */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 my-1 sm:my-2 px-1 sm:px-6 relative z-10">
              <div className="flex-1 flex justify-center">
                {renderTableCenterpiece()}
              </div>
            </div>

            {/* Bottom Place Settings */}
            <div
              className="grid gap-1 sm:gap-2 mt-2 sm:mt-3 relative z-10"
              style={{ gridTemplateColumns: `repeat(${bottomRow.length}, minmax(0, 1fr))` }}
            >
              {bottomRow.map((seat) => renderPlaceSetting(seat))}
            </div>
          </div>

          {/* Bottom Row of Chairs */}
          <div
            className={`grid gap-1 sm:gap-2 w-full mt-2 ${
              scaleMode === 'normal' ? 'max-w-[1200px]' : 'max-w-[1140px]'
            }`}
            style={{ gridTemplateColumns: `repeat(${bottomRow.length}, minmax(0, 1fr))` }}
          >
            {bottomRow.map((seat) => renderChairNode(seat, 'bottom'))}
          </div>
        </div>
      </div>
    );
  };

  // LAYOUT 2: GRAND OVAL
  const renderGrandOvalTable = () => {
    const topRow = seats.slice(0, halfSeats);
    const bottomRow = seats.slice(halfSeats, totalSeats);

    return (
      <div className="w-full overflow-x-auto pb-4 pt-2">
        <div className={`mx-auto flex flex-col items-center py-4 px-2 ${
          scaleMode === 'normal' ? 'min-w-[1100px]' : 'w-full max-w-[1140px]'
        }`}>
          <div
            className={`grid gap-1 sm:gap-2 w-full mb-2 ${
              scaleMode === 'normal' ? 'max-w-[1200px]' : 'max-w-[1140px]'
            }`}
            style={{ gridTemplateColumns: `repeat(${topRow.length}, minmax(0, 1fr))` }}
          >
            {topRow.map((seat) => renderChairNode(seat, 'top'))}
          </div>

          <div className="w-full max-w-[1140px] rounded-full bg-[#433024] p-4 sm:p-6 border-2 sm:border-4 border-[#2E2018] shadow-md relative flex flex-col items-center justify-center">
            <div
              className="w-full grid gap-1 sm:gap-2 mb-3"
              style={{ gridTemplateColumns: `repeat(${topRow.length}, minmax(0, 1fr))` }}
            >
              {topRow.map((seat) => renderPlaceSetting(seat))}
            </div>
            <div className="my-1 sm:my-2">{renderTableCenterpiece()}</div>
            <div
              className="w-full grid gap-1 sm:gap-2 mt-3"
              style={{ gridTemplateColumns: `repeat(${bottomRow.length}, minmax(0, 1fr))` }}
            >
              {bottomRow.map((seat) => renderPlaceSetting(seat))}
            </div>
          </div>

          <div
            className={`grid gap-1 sm:gap-2 w-full mt-2 ${
              scaleMode === 'normal' ? 'max-w-[1200px]' : 'max-w-[1140px]'
            }`}
            style={{ gridTemplateColumns: `repeat(${bottomRow.length}, minmax(0, 1fr))` }}
          >
            {bottomRow.map((seat) => renderChairNode(seat, 'bottom'))}
          </div>
        </div>
      </div>
    );
  };

  // LAYOUT 3: U-SHAPE
  const renderUShapeTable = () => {
    const leftWing = seats.slice(0, halfSeats);
    const rightWing = seats.slice(halfSeats, totalSeats);

    return (
      <div className="w-full overflow-x-auto pb-4 pt-2">
        <div className="min-w-[960px] max-w-[1100px] mx-auto py-6 px-6 flex flex-col items-center">
          <div className="flex items-start justify-center gap-6 w-full">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#1C1917] mb-1">Krahu i Majtë ({leftWing.length} Vende)</span>
              {leftWing.map((seat) => renderChairNode(seat, 'left'))}
            </div>

            <div className="flex-1 flex flex-col">
              <div className="h-20 bg-[#433024] border-4 border-b-0 border-[#2E2018] rounded-t-2xl flex items-center justify-center px-4">
                <span className="text-xs font-mono text-[#D6CFC2]">Kreu i Lirë · Qendra Festive</span>
              </div>
              <div className="flex justify-between items-stretch min-h-[640px]">
                <div className="w-20 bg-[#433024] border-x-4 border-b-4 border-[#2E2018] rounded-b-2xl flex flex-col justify-around py-4 items-center">
                  {leftWing.map((seat) => renderPlaceSetting(seat))}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F5F1EA]/70 border-t-4 border-[#2E2018] rounded-b-2xl mx-2 my-2">
                  {renderTableCenterpiece()}
                </div>
                <div className="w-20 bg-[#433024] border-x-4 border-b-4 border-[#2E2018] rounded-b-2xl flex flex-col justify-around py-4 items-center">
                  {rightWing.map((seat) => renderPlaceSetting(seat))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-[#1C1917] mb-1">Krahu i Djathtë ({rightWing.length} Vende)</span>
              {rightWing.map((seat) => renderChairNode(seat, 'right'))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // LAYOUT 4: 2 TAVOLINA
  const renderDoubleBanquetTable = () => {
    const tableA = seats.slice(0, halfSeats);
    const tableB = seats.slice(halfSeats, totalSeats);

    const renderTable = (tSeats: Seat[], label: string) => {
      const topHalf = Math.ceil(tSeats.length / 2);
      const top = tSeats.slice(0, topHalf);
      const bot = tSeats.slice(topHalf);

      return (
        <div className="flex flex-col items-center bg-[#F7F4EE] border border-[#E6E1DA] rounded-2xl p-5 w-full max-w-[620px]">
          <div className="flex items-center justify-between w-full mb-3">
            <h4 className="font-display text-sm font-semibold text-[#1C1917]">{label}</h4>
            <span className="text-xs font-mono tabular-nums text-[#57534E]">Të gjitha anash</span>
          </div>

          <div
            className="grid gap-2 mb-2 w-full"
            style={{ gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))` }}
          >
            {top.map((s) => renderChairNode(s, 'top'))}
          </div>

          <div className="w-full rounded-xl bg-[#433024] border-4 border-[#2E2018] p-3 shadow-xs">
            <div
              className="grid gap-2 mb-3"
              style={{ gridTemplateColumns: `repeat(${top.length}, minmax(0, 1fr))` }}
            >
              {top.map((s) => renderPlaceSetting(s))}
            </div>
            <div className="py-2 text-center bg-[#FAF6F0]/95 rounded-lg border border-[#D4AF37]/40 text-xs font-medium text-[#8C6227]">
              {label}
            </div>
            <div
              className="grid gap-2 mt-3"
              style={{ gridTemplateColumns: `repeat(${bot.length}, minmax(0, 1fr))` }}
            >
              {bot.map((s) => renderPlaceSetting(s))}
            </div>
          </div>

          <div
            className="grid gap-2 mt-2 w-full"
            style={{ gridTemplateColumns: `repeat(${bot.length}, minmax(0, 1fr))` }}
          >
            {bot.map((s) => renderChairNode(s, 'bottom'))}
          </div>
        </div>
      );
    };

    return (
      <div className="w-full overflow-x-auto pb-4 pt-2">
        <div className="min-w-[800px] flex flex-col lg:flex-row gap-6 items-center justify-center py-4 px-4">
          {renderTable(tableA, 'Tavolina A')}
          {renderTable(tableB, 'Tavolina B')}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {/* Swap Active Banner */}
      {swapSourceId !== null && (
        <div className="mb-4 flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#B4833E] text-xs text-[#1C1917]">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[#B4833E]" />
            <span>
              Modaliteti i ndërrimit: Zgjidhni cilëndo karrige tjetër për të ndërruar vendin me{' '}
              <strong>
                Karrigen #{String(swapSourceId).padStart(2, '0')} (
                {seats.find((s) => s.id === swapSourceId)?.name || 'E lirë'})
              </strong>
              .
            </span>
          </div>
          <button
            type="button"
            onClick={() => onStartSwap(null)}
            className="px-3 py-1 rounded-lg bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#1C1917] font-medium whitespace-nowrap transition-colors"
          >
            Anulo Ndërrimin
          </button>
        </div>
      )}

      {/* Table Sizing & View Mode Toolbar */}
      <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E1DA] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5 mr-1">
            <Camera className="w-4 h-4 text-[#9F2B2B]" />
            <span>Madhësia e Skemës:</span>
          </span>

          <div className="inline-flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-[#E6E1DA] gap-1">
            <button
              type="button"
              onClick={() => setScaleMode('photo')}
              title="Shfaq të gjitha 20 karriget menjëherë — ideale për të parë gjithçka dhe për të bërë foto"
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                scaleMode === 'photo'
                  ? 'bg-[#9F2B2B] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Pamje Foto (Të 20 Karriget)</span>
            </button>

            <button
              type="button"
              onClick={() => setScaleMode('compact')}
              title="Pamje kompakte"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                scaleMode === 'compact'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <span>Kompakte</span>
            </button>

            <button
              type="button"
              onClick={() => setScaleMode('normal')}
              title="Pamje origjinale me rrotullim"
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                scaleMode === 'normal'
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <span>Normale (100%)</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSaveFormat && (
            <button
              type="button"
              onClick={onSaveFormat}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1C1917] hover:bg-[#332E28] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ruaj Formatin & Emrat</span>
            </button>
          )}
        </div>
      </div>

      {/* Remove Chair by Typing Form Toolbar */}
      {onRemoveSeat && (
        <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E1DA] shadow-xs">
          <form onSubmit={handleRemoveSubmit} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5 mr-1">
              <Trash2 className="w-4 h-4 text-[#DC2626]" />
              <span>Hiq Karrige nga Skema:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={removeInput}
                onChange={(e) => setRemoveInput(e.target.value)}
                placeholder="Shkruaj numrin p.sh. 5 ose emrin..."
                className="px-3 py-1.5 rounded-lg border border-[#D6CFC2] bg-[#FAF8F5] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#DC2626] focus:bg-white w-52 sm:w-64 transition-colors"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hiq nga Tavolina</span>
              </button>
            </div>
            <span className="text-[11px] text-[#78716C] hidden lg:inline">
              (Shkruani numrin si <strong>5</strong> ose emrin e mysafirit dhe largohet menjëherë nga skema)
            </span>
          </form>

          <div className="flex items-center gap-2">
            {onAddSeat && (
              <button
                type="button"
                onClick={onAddSeat}
                title="Shto një karrige tjetër në tavolinë"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D6CFC2] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] transition-colors whitespace-nowrap shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>+ Shto Karrige</span>
              </button>
            )}
            {onResetSeats && seats.length !== 20 && (
              <button
                type="button"
                onClick={onResetSeats}
                title="Rikthe tavolinën e plotë me 20 karrige"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D6CFC2] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors whitespace-nowrap"
              >
                <span>Rikthe 20 Karriget</span>
              </button>
            )}
            <span className="text-xs font-mono font-bold text-[#1C1917] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E6E1DA] tabular-nums whitespace-nowrap">
              {seats.length} karrige gjithsej
            </span>
          </div>
        </div>
      )}

      {/* Main Floorplan Container */}
      <div className="rounded-2xl bg-[#F4F1EA] border border-[#E6E1DA] p-3 sm:p-5">
        {tableShape === 'sides-parallel' && renderSidesParallelTable()}
        {tableShape === 'grand-oval' && renderGrandOvalTable()}
        {tableShape === 'u-shape' && renderUShapeTable()}
        {tableShape === 'double-banquet' && renderDoubleBanquetTable()}
      </div>
    </div>
  );
};
