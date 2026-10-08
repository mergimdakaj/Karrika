import React from 'react';
import {
  Seat,
  GuestRole,
  DietaryOption,
  ROLE_LABELS,
  DIETARY_LABELS,
  calculateSeatTotal,
} from '../types';
import {
  ArrowUp,
  ArrowDown,
  Crown,
  Trash2,
  UserCheck,
  UserPlus,
  Wine,
  Utensils,
} from 'lucide-react';

interface GuestListViewProps {
  seats: Seat[];
  selectedSeatId: number;
  filterRole: GuestRole | 'te-gjitha';
  searchQuery: string;
  onSelectSeat: (id: number) => void;
  onUpdateSeat: (id: number, patch: Partial<Seat>) => void;
  onSwapSeats: (idA: number, idB: number) => void;
  onClearSeat: (id: number) => void;
  onOpenBulkModal: () => void;
  onOpenOrderModal?: (id: number) => void;
}

export const GuestListView: React.FC<GuestListViewProps> = ({
  seats,
  selectedSeatId,
  filterRole,
  searchQuery,
  onSelectSeat,
  onUpdateSeat,
  onSwapSeats,
  onClearSeat,
  onOpenBulkModal,
  onOpenOrderModal,
}) => {
  const filteredSeats = seats.filter((seat) => {
    const matchesRole = filterRole === 'te-gjitha' || seat.role === filterRole;
    const matchesSearch =
      !searchQuery.trim() ||
      seat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(seat.id).padStart(2, '0').includes(searchQuery.trim()) ||
      seat.note.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const halfSeats = Math.ceil(seats.length / 2);
  const getZoneLabel = (id: number) => {
    if (id <= halfSeats) return `Ana e Sipërme (#${String(id).padStart(2, '0')})`;
    return `Ana e Poshtme (#${String(id).padStart(2, '0')})`;
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E6E1DA] overflow-hidden">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-[#EFECE6] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            Regjistri i 20 Karrigeve (Të Gjitha Anash)
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            10 karrige në anën e sipërme (#01–#10) dhe 10 karrige në anën e poshtme (#11–#20). Mund të ndryshoni emrat dhe preferencat në çdo rresht.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenBulkModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#D6CFC2] hover:border-[#9F2B2B] text-xs font-semibold text-[#1C1917] transition-colors whitespace-nowrap"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#9F2B2B]" />
          Ngjit Listën e 20 Emrave
        </button>
      </div>

      {/* High-Density Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EFECE6] bg-[#FAF8F5] text-[11px] font-semibold text-[#57534E]">
              <th className="py-3 pl-6 pr-3 w-20">Karriga</th>
              <th className="py-3 px-3 min-w-[200px]">Emri i Mysafirit</th>
              <th className="py-3 px-3 w-40">Pozicioni Anash</th>
              <th className="py-3 px-3 w-40">Grupi / Roli</th>
              <th className="py-3 px-3 w-36">Preferenca</th>
              <th className="py-3 px-3 min-w-[200px]">Pijet & Ushqimi me Çmim</th>
              <th className="py-3 px-3 text-right w-24">Fatura €</th>
              <th className="py-3 pl-3 pr-6 text-right w-28">Veprime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6] text-xs">
            {filteredSeats.map((seat) => {
              const isSelected = selectedSeatId === seat.id;
              const isEmpty = !seat.name.trim();

              return (
                <tr
                  key={seat.id}
                  onClick={() => onSelectSeat(seat.id)}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-[#FAF3F0]/70'
                      : 'hover:bg-[#FAF8F5]'
                  }`}
                >
                  {/* Seat Number */}
                  <td className="py-2.5 pl-6 pr-3 font-mono font-semibold tabular-nums whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                          seat.role === 'festari'
                            ? 'bg-[#B4833E] text-white'
                            : isEmpty
                              ? 'bg-[#EFECE6] text-[#78716C]'
                              : 'bg-[#1C1917] text-white'
                        }`}
                      >
                        {String(seat.id).padStart(2, '0')}
                      </span>
                      {seat.role === 'festari' && (
                        <Crown className="w-3.5 h-3.5 text-[#B4833E]" />
                      )}
                    </div>
                  </td>

                  {/* Direct Editable Name Input */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={seat.name}
                        onChange={(e) =>
                          onUpdateSeat(seat.id, {
                            name: e.target.value,
                            confirmed: e.target.value.trim().length > 0,
                          })
                        }
                        placeholder={`Shkruaj emrin për karrigen #${String(seat.id).padStart(2, '0')}...`}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs font-medium text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B]"
                      />
                      {!isEmpty && (
                        <UserCheck className="w-4 h-4 text-[#2E5A44] shrink-0" aria-label="E caktuar" />
                      )}
                    </div>
                  </td>

                  {/* Position */}
                  <td className="py-2.5 px-3 text-[#57534E] whitespace-nowrap">
                    {getZoneLabel(seat.id)}
                  </td>

                  {/* Role Select */}
                  <td className="py-2.5 px-3">
                    <select
                      value={seat.role}
                      onChange={(e) =>
                        onUpdateSeat(seat.id, { role: e.target.value as GuestRole })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs text-[#1C1917] focus:outline-none focus:border-[#9F2B2B]"
                    >
                      {(Object.keys(ROLE_LABELS) as GuestRole[]).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Dietary Select */}
                  <td className="py-2.5 px-3">
                    <select
                      value={seat.dietary}
                      onChange={(e) =>
                        onUpdateSeat(seat.id, {
                          dietary: e.target.value as DietaryOption,
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] bg-white text-xs text-[#1C1917] focus:outline-none focus:border-[#9F2B2B]"
                    >
                      {(Object.keys(DIETARY_LABELS) as DietaryOption[]).map((d) => (
                        <option key={d} value={d}>
                          {DIETARY_LABELS[d]}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Drinks & Dishes with Price */}
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSeat(seat.id);
                        onOpenOrderModal?.(seat.id);
                      }}
                      title="Kliko për të shtuar pije automatikisht ose ushqim me çmim"
                      className="w-full text-left p-1.5 rounded-lg hover:bg-[#FAF8F5] border border-transparent hover:border-[#E6E1DA] transition-colors group/item"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#57534E]">
                          <Wine className="w-3 h-3 text-[#9F2B2B] shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {(seat.drinks || []).length > 0
                              ? seat.drinks.map((d) => `${d.quantity}× ${d.name}`).join(', ')
                              : 'Pa pije'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#9F2B2B] opacity-0 group-hover/item:opacity-100 font-semibold shrink-0">
                          Ndrysho
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#57534E] mt-0.5">
                        <Utensils className="w-3 h-3 text-[#B4833E] shrink-0" />
                        <span className="truncate max-w-[160px]">
                          {(seat.dishes || []).length > 0
                            ? seat.dishes.map((f) => `${f.quantity}× ${f.name}`).join(', ')
                            : 'Pa ushqim'}
                        </span>
                      </div>
                    </button>
                  </td>

                  {/* Seat Bill Total in Euro */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-xs text-[#1C1917]">
                    {calculateSeatTotal(seat).toFixed(2)} €
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        disabled={seat.id === 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (seat.id > 1) onSwapSeats(seat.id, seat.id - 1);
                        }}
                        title="Ngjit një vend më lart"
                        className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5] disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={seat.id === seats.length}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (seat.id < seats.length) onSwapSeats(seat.id, seat.id + 1);
                        }}
                        title="Zbrit një vend më poshtë"
                        className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5] disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isEmpty}
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearSeat(seat.id);
                        }}
                        title="Pastro emrin"
                        className="p-1.5 rounded-lg border border-[#E6E1DA] text-[#78716C] hover:text-[#DC2626] hover:border-[#FECACA] disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
