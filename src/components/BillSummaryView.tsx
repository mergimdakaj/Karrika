import React from 'react';
import {
  Seat,
  EventDetails,
  calculateSeatTotal,
} from '../types';
import {
  Printer,
  Sparkles,
  Wine,
  Utensils,
  Receipt,
  CreditCard,
  Crown,
  Trash2,
  Save,
  AlertTriangle,
} from 'lucide-react';

interface BillSummaryViewProps {
  seats: Seat[];
  eventDetails: EventDetails;
  onSelectSeat: (id: number) => void;
  onAddDrinkToAll: (drink: { name: string; price: number }) => void;
  onPrint: () => void;
  onOpenOrderModal?: (id: number) => void;
  onClearSeatOrder?: (id: number) => void;
  onClearAllOrders?: () => void;
  onSaveFormat?: () => void;
}

export const BillSummaryView: React.FC<BillSummaryViewProps> = ({
  seats,
  eventDetails,
  onSelectSeat,
  onAddDrinkToAll,
  onPrint,
  onOpenOrderModal,
  onClearSeatOrder,
  onClearAllOrders,
  onSaveFormat,
}) => {
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const totalSeats = seats.length;

  const totalDrinksCost = seats.reduce((acc, s) => {
    return acc + (s.drinks || []).reduce((sum, d) => sum + (d.price * d.quantity), 0);
  }, 0);

  const totalDishesCost = seats.reduce((acc, s) => {
    return acc + (s.dishes || []).reduce((sum, d) => sum + (d.price * d.quantity), 0);
  }, 0);

  const grandTotal = totalDrinksCost + totalDishesCost;
  const averagePerSeat = totalSeats > 0 ? grandTotal / totalSeats : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="no-print rounded-2xl bg-white border border-[#E6E1DA] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#9F2B2B]" />
            <h2 className="font-display text-xl font-semibold text-[#1C1917]">
              Fatura & Llogaritësi i Shpenzimeve të Ditëlindjes
            </h2>
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Llogaritja automatike e pijeve dhe ushqimit për të {totalSeats} karriget e tavolinës.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSaveFormat && (
            <button
              type="button"
              onClick={onSaveFormat}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D4AF37]/50 bg-[#FFFDF9] hover:bg-white text-xs font-semibold text-[#8C6227] transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#B4833E]" />
              <span>Ruaj Formatin</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onAddDrinkToAll({ name: 'Cola', price: 1.8 })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#1C1917] transition-colors"
          >
            <span>🥤</span>
            <span>+ Cola (1.80 €)</span>
          </button>
          <button
            type="button"
            onClick={() => onAddDrinkToAll({ name: 'Birra', price: 2.0 })}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#1C1917] transition-colors"
          >
            <span>🍺</span>
            <span>+ Birra (2.00 €)</span>
          </button>

          {onClearAllOrders && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              disabled={grandTotal === 0}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] disabled:opacity-50 disabled:hover:bg-[#FEF2F2] text-xs font-semibold text-[#DC2626] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Fshi Faturën</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9F2B2B] hover:bg-[#842222] text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Printo Faturën</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white border border-[#E6E1DA] p-5">
          <div className="flex items-center justify-between text-[#78716C] text-xs font-medium">
            <span>Shpenzimet e Pijeve</span>
            <Wine className="w-4 h-4 text-[#9F2B2B]" />
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-[#1C1917] mt-2">
            {totalDrinksCost.toFixed(2)} €
          </div>
          <p className="text-[11px] text-[#78716C] mt-1">
            Gjithsej pije të porositura
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#E6E1DA] p-5">
          <div className="flex items-center justify-between text-[#78716C] text-xs font-medium">
            <span>Shpenzimet e Ushqimit</span>
            <Utensils className="w-4 h-4 text-[#B4833E]" />
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-[#1C1917] mt-2">
            {totalDishesCost.toFixed(2)} €
          </div>
          <p className="text-[11px] text-[#78716C] mt-1">
            Gjithsej pjata të porositura
          </p>
        </div>

        <div className="rounded-2xl bg-[#1C1917] text-white p-5">
          <div className="flex items-center justify-between text-[#D6CFC2] text-xs font-medium">
            <span>FATURA TOTALE</span>
            <CreditCard className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="font-mono text-3xl font-bold tabular-nums text-[#D4AF37] mt-2">
            {grandTotal.toFixed(2)} €
          </div>
          <p className="text-[11px] text-[#A8A29E] mt-1">
            Për të gjithë {totalSeats} personat
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-[#E6E1DA] p-5">
          <div className="flex items-center justify-between text-[#78716C] text-xs font-medium">
            <span>Mesatarja për Person</span>
            <Receipt className="w-4 h-4 text-[#2E5A44]" />
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-[#1C1917] mt-2">
            {averagePerSeat.toFixed(2)} €
          </div>
          <p className="text-[11px] text-[#78716C] mt-1">
            Kostoja për çdo karrige
          </p>
        </div>
      </div>

      {/* Itemized Table Breakdown by Chair */}
      <div className="rounded-2xl bg-white border border-[#E6E1DA] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EFECE6] flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-[#1C1917]">
            Detajet e Porosisë & Faturës për Çdo Karrige
          </h3>
          <span className="text-xs text-[#78716C] font-mono tabular-nums">
            {seats.length} karrige anash
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EFECE6] bg-[#FAF8F5] text-[11px] font-semibold text-[#57534E]">
                <th className="py-3 pl-6 pr-3 w-16">Karriga</th>
                <th className="py-3 px-3 min-w-[180px]">Mysafiri</th>
                <th className="py-3 px-3 min-w-[240px]">Pijet e Porositura (Çmimi)</th>
                <th className="py-3 px-3 min-w-[240px]">Ushqimi / Pjatat (Çmimi)</th>
                <th className="py-3 px-3 text-right w-24">Pijet €</th>
                <th className="py-3 px-3 text-right w-24">Ushqimi €</th>
                <th className="py-3 pl-3 pr-3 text-right w-28">Shuma Total</th>
                {onClearSeatOrder && <th className="py-3 px-3 text-center w-20 no-print">Veprime</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] text-xs">
              {seats.map((seat) => {
                const drinks = seat.drinks || [];
                const dishes = seat.dishes || [];
                const dSub = drinks.reduce((acc, d) => acc + (d.price * d.quantity), 0);
                const fSub = dishes.reduce((acc, d) => acc + (d.price * d.quantity), 0);
                const sTotal = dSub + fSub;
                const isFestari = seat.role === 'festari';
                const hasOrders = drinks.length > 0 || dishes.length > 0;

                return (
                  <tr
                    key={seat.id}
                    onClick={() => {
                      onSelectSeat(seat.id);
                      onOpenOrderModal?.(seat.id);
                    }}
                    title="Kliko për të menaxhuar pijet dhe ushqimin për këtë karrige"
                    className="hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <td className="py-3 pl-6 pr-3 font-mono font-semibold tabular-nums">
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs ${
                          isFestari ? 'bg-[#B4833E] text-white' : 'bg-[#292524] text-white'
                        }`}>
                          {String(seat.id).padStart(2, '0')}
                        </span>
                        {isFestari && <Crown className="w-3 h-3 text-[#B4833E]" />}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#1C1917]">
                        {seat.name || <span className="text-[#A8A29E] font-normal italic">(E lirë)</span>}
                      </div>
                      <div className="text-[10px] text-[#78716C]">
                        {seat.id <= Math.ceil(totalSeats / 2) ? 'Ana e Sipërme' : 'Ana e Poshtme'}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {drinks.length > 0 ? (
                        <div className="space-y-0.5 text-[11px]">
                          {drinks.map((d) => (
                            <div key={d.id} className="text-[#57534E]">
                              {d.quantity}× <span className="font-medium text-[#1C1917]">{d.name}</span>{' '}
                              <span className="font-mono tabular-nums text-[#78716C]">
                                ({(d.price * d.quantity).toFixed(2)} €)
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#A8A29E] italic">Pa pije të regjistruar</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {dishes.length > 0 ? (
                        <div className="space-y-0.5 text-[11px]">
                          {dishes.map((f) => (
                            <div key={f.id} className="text-[#57534E]">
                              {f.quantity}× <span className="font-medium text-[#1C1917]">{f.name}</span>{' '}
                              <span className="font-mono tabular-nums text-[#78716C]">
                                ({(f.price * f.quantity).toFixed(2)} €)
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#A8A29E] italic">Pa ushqim të regjistruar</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-[#78716C]">
                      {dSub.toFixed(2)} €
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-medium text-[#78716C]">
                      {fSub.toFixed(2)} €
                    </td>

                    <td className="py-3 pl-3 pr-3 text-right font-mono tabular-nums font-bold text-[#1C1917]">
                      {sTotal.toFixed(2)} €
                    </td>

                    {onClearSeatOrder && (
                      <td className="py-3 px-3 text-center no-print">
                        {hasOrders ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearSeatOrder(seat.id);
                            }}
                            title={`Fshi porositë për Karrigen #${seat.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] border border-transparent hover:border-[#FCA5A5] transition-colors text-xs font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Fshi</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-[#D6CFC2]">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#FAF8F5] border-t-2 border-[#1C1917] font-bold text-xs">
                <td colSpan={4} className="py-3 pl-6 text-[#1C1917] uppercase tracking-wider">
                  Shuma Totale e Tavolinës ({eventDetails.title})
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-[#9F2B2B]">
                  {totalDrinksCost.toFixed(2)} €
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-[#8C6227]">
                  {totalDishesCost.toFixed(2)} €
                </td>
                <td className="py-3 pl-3 pr-3 text-right font-mono tabular-nums text-base text-[#1C1917]">
                  {grandTotal.toFixed(2)} €
                </td>
                {onClearSeatOrder && <td className="no-print"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Clearing All Orders */}
      {showClearConfirm && onClearAllOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E6E1DA] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-[#DC2626] mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[#1C1917]">
                  Fshi të Gjithë Faturën?
                </h3>
                <span className="text-xs text-[#78716C]">
                  Pastrohen të gjitha pijet dhe ushqimet
                </span>
              </div>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed mb-5">
              A jeni të sigurt që dëshironi të fshini të gjitha porositë nga fatura e tavolinës?
              Emrat e mysafirëve në karrige do të mbeten të pandryshuar.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl border border-[#D6CFC2] text-xs font-semibold text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
              >
                Anulo
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllOrders();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-semibold text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Po, Fshi Faturën</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
