import React from 'react';
import {
  Seat,
  EventDetails,
  DietaryOption,
  GuestRole,
  DIETARY_LABELS,
  ROLE_LABELS,
  TABLE_SHAPE_LABELS,
  TableShape,
  CenterpieceTheme,
} from '../types';

interface MenuSummaryViewProps {
  seats: Seat[];
  eventDetails: EventDetails;
  onUpdateEventDetails: (patch: Partial<EventDetails>) => void;
}

export const MenuSummaryView: React.FC<MenuSummaryViewProps> = ({
  seats,
  eventDetails,
  onUpdateEventDetails,
}) => {
  const assignedSeats = seats.filter((s) => s.name.trim().length > 0);

  const dietaryCounts = (Object.keys(DIETARY_LABELS) as DietaryOption[]).map(
    (key) => ({
      key,
      label: DIETARY_LABELS[key],
      count: assignedSeats.filter((s) => s.dietary === key).length,
      guests: assignedSeats.filter((s) => s.dietary === key),
    })
  );

  const roleCounts = (Object.keys(ROLE_LABELS) as GuestRole[]).map((key) => ({
    key,
    label: ROLE_LABELS[key],
    count: assignedSeats.filter((s) => s.role === key).length,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Event Configuration */}
      <div className="lg:col-span-6 rounded-2xl bg-white border border-[#E6E1DA] p-6 space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            Detajet e Ditëlindjes & Tavolinës
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Personalizoni titullin e mbrëmjes, emrin e festarit, datën dhe dekorin qendror.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
              Titulli i Eventit / Ditëlindjes
            </label>
            <input
              type="text"
              value={eventDetails.title}
              onChange={(e) => onUpdateEventDetails({ title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9F2B2B] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                Emri i Festarit / Festares
              </label>
              <input
                type="text"
                value={eventDetails.celebrant}
                onChange={(e) =>
                  onUpdateEventDetails({ celebrant: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9F2B2B] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                Data dhe Ora
              </label>
              <input
                type="text"
                value={eventDetails.date}
                onChange={(e) => onUpdateEventDetails({ date: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9F2B2B] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
              Restoranti / Salla
            </label>
            <input
              type="text"
              value={eventDetails.venue}
              onChange={(e) => onUpdateEventDetails({ venue: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9F2B2B] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                Forma e Tavolinës (20 Vende)
              </label>
              <select
                value={eventDetails.tableShape}
                onChange={(e) =>
                  onUpdateEventDetails({
                    tableShape: e.target.value as TableShape,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9F2B2B]"
              >
                {(Object.keys(TABLE_SHAPE_LABELS) as TableShape[]).map((k) => (
                  <option key={k} value={k}>
                    {TABLE_SHAPE_LABELS[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                Dekori në Qendër të Tavolinës
              </label>
              <select
                value={eventDetails.centerpiece}
                onChange={(e) =>
                  onUpdateEventDetails({
                    centerpiece: e.target.value as CenterpieceTheme,
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9F2B2B]"
              >
                <option value="torta-dhe-qirinj">Torta Festive & Qirinjtë</option>
                <option value="lule-festive">Aranzhim Lulesh & Qirinj</option>
                <option value="minimal-shampanje">Dolli me Shampanjë</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
              Shënime për Kamarierët & Kuzhinën
            </label>
            <textarea
              rows={3}
              value={eventDetails.generalNotes}
              onChange={(e) =>
                onUpdateEventDetails({ generalNotes: e.target.value })
              }
              className="w-full px-3.5 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs text-[#1C1917] focus:outline-none focus:border-[#9F2B2B] focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Menu Breakdown */}
      <div className="lg:col-span-6 rounded-2xl bg-white border border-[#E6E1DA] p-6 space-y-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-[#1C1917]">
            Përmbledhja e Menuve & Mysafirëve
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Pasqyra e porosive sipas karrigeve anash ({assignedSeats.length} nga 20 vende të caktuara).
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#1C1917] mb-3">
            Shpërndarja e Menuve sipas Karrigeve
          </h3>
          <div className="divide-y divide-[#EFECE6] border-y border-[#EFECE6]">
            {dietaryCounts.map((item) => (
              <div key={item.key} className="py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1C1917]">{item.label}</span>
                  <span className="font-mono font-semibold tabular-nums text-[#1C1917]">
                    {item.count} mysafirë
                  </span>
                </div>
                {item.guests.length > 0 && (
                  <p className="text-[11px] text-[#78716C] leading-relaxed">
                    {item.guests
                      .map(
                        (g) =>
                          `#${String(g.id).padStart(2, '0')} ${g.name}`
                      )
                      .join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#1C1917] mb-3">
            Përbërja e Tavolinës sipas Grupit
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {roleCounts.map((r) => (
              <div
                key={r.key}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] flex items-center justify-between"
              >
                <span className="text-xs text-[#57534E] truncate">{r.label}</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-[#1C1917] ml-2">
                  {r.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
