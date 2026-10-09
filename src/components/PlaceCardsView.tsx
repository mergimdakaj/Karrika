import React from 'react';
import {
  Seat,
  EventDetails,
  ROLE_SHORT_LABELS,
  DIETARY_LABELS,
} from '../types';
import { Crown, Printer } from 'lucide-react';

interface PlaceCardsViewProps {
  seats: Seat[];
  eventDetails: EventDetails;
  onUpdateSeatName: (id: number, name: string) => void;
  onSelectSeat: (id: number) => void;
  onPrint: () => void;
}

export const PlaceCardsView: React.FC<PlaceCardsViewProps> = ({
  seats,
  eventDetails,
  onUpdateSeatName,
  onSelectSeat,
  onPrint,
}) => {
  const half = Math.ceil(seats.length / 2);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="no-print rounded-2xl bg-white border border-[#E6E1DA] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            Kartat e Vendeve për Tavolinën ({seats.length} Karrige Anash)
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Kartat për çdo karrige/pjatë. Mund ta ndryshoni emrin direkt mbi kartë ose t&apos;i printoni për tavolinën e ditëlindjes.
          </p>
        </div>

        <button
          type="button"
          onClick={onPrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9F2B2B] hover:bg-[#842222] text-white text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <Printer className="w-3.5 h-3.5" />
          Printo të {seats.length} Kartat
        </button>
      </div>

      {/* Foldable Place Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-2 print:gap-6">
        {seats.map((seat) => {
          const isFestari = seat.role === 'festari';
          const isEmpty = !seat.name.trim();

          return (
            <div
              key={seat.id}
              onClick={() => onSelectSeat(seat.id)}
              className={`rounded-2xl bg-white border p-5 flex flex-col justify-between transition-colors break-inside-avoid ${
                isFestari
                  ? 'border-[#B4833E] bg-[#FFFDF9]'
                  : 'border-[#E6E1DA] hover:border-[#9F2B2B]/50'
              }`}
            >
              <div>
                <div className="border-b border-dashed border-[#D6CFC2] pb-2 mb-3 flex items-center justify-between text-[10px] text-[#78716C]">
                  <span className="truncate">{eventDetails.title}</span>
                  <span className="font-mono font-semibold tabular-nums text-[#1C1917]">
                    KARRIGA #{String(seat.id).padStart(2, '0')}
                  </span>
                </div>

                <div className="my-3 text-center">
                  {isFestari && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8C6227] mb-1">
                      <Crown className="w-3.5 h-3.5 text-[#B4833E]" />
                      <span>Festari/ja e Ditëlindjes</span>
                    </div>
                  )}
                  <input
                    type="text"
                    value={seat.name}
                    onChange={(e) => onUpdateSeatName(seat.id, e.target.value)}
                    placeholder="Shkruaj emrin..."
                    className={`w-full text-center font-display text-lg font-semibold bg-transparent border-b border-transparent focus:border-[#9F2B2B] focus:outline-none py-1 transition-colors ${
                      isEmpty
                        ? 'text-[#A8A29E] italic placeholder:text-[#C7C1B8]'
                        : 'text-[#1C1917]'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between text-[11px] text-[#78716C]">
                <span>{ROLE_SHORT_LABELS[seat.role]}</span>
                <span aria-hidden="true">·</span>
                <span>{DIETARY_LABELS[seat.dietary]}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {(seat.side ? seat.side === 'top' : seat.id <= 10) ? 'Lart' : 'Poshtë'} #{String(seat.id).padStart(2, '0')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
