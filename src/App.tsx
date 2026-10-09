import React, { useState, useEffect } from 'react';
import {
  Seat,
  OrderItem,
  EventDetails,
  ViewMode,
  TableShape,
  GuestRole,
  INITIAL_EVENT_DETAILS,
  getSampleSeats,
  createEmptySeats,
  calculateSeatTotal,
} from './types';
import { VisualTableCanvas } from './components/VisualTableCanvas';
import { SeatInspectorPanel } from './components/SeatInspectorPanel';
import { GuestListView } from './components/GuestListView';
import { PlaceCardsView } from './components/PlaceCardsView';
import { MenuSummaryView } from './components/MenuSummaryView';
import { BillSummaryView } from './components/BillSummaryView';
import { BulkPasteModal } from './components/BulkPasteModal';
import { ChairOrderModal } from './components/ChairOrderModal';
import {
  Printer,
  Check,
  UserPlus,
  HardDrive,
  Upload,
  CheckCircle2,
  Save,
} from 'lucide-react';

const STORAGE_SEATS_KEY = 'eventseat_planner_seats_v7';
const STORAGE_EVENT_KEY = 'eventseat_planner_event_v7';

// Clear previous versions' cache
try {
  ['tavolina_festive_seats_v1', 'tavolina_festive_event_v1', 'eventseat_planner_seats_v2', 'eventseat_planner_event_v2', 'eventseat_planner_seats_v3', 'eventseat_planner_event_v3', 'eventseat_planner_seats_v5', 'eventseat_planner_seats_v6', 'eventseat_planner_event_v6'].forEach(k => localStorage.removeItem(k));
} catch {
  // ignore
}

export default function App() {
  const [capacity, setCapacity] = useState<number>(20);

  const [eventDetails, setEventDetails] = useState<EventDetails>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EVENT_KEY);
      if (saved) {
        return { ...INITIAL_EVENT_DETAILS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return INITIAL_EVENT_DETAILS;
  });

  const [seats, setSeats] = useState<Seat[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SEATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return getSampleSeats(20);
  });

  const [viewMode, setViewMode] = useState<ViewMode>('tavolina');
  const [selectedSeatId, setSelectedSeatId] = useState<number>(1);
  const [swapSourceId, setSwapSourceId] = useState<number | null>(null);
  const [filterRole, setFilterRole] = useState<GuestRole | 'te-gjitha'>('te-gjitha');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [orderModalSeatId, setOrderModalSeatId] = useState<number | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [confirmClearAll, setConfirmClearAll] = useState<boolean>(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  const handleOpenOrderModal = (id: number) => {
    setSelectedSeatId(id);
    setOrderModalSeatId(id);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SEATS_KEY, JSON.stringify(seats));
    } catch {
      // ignore
    }
  }, [seats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(eventDetails));
    } catch {
      // ignore
    }
  }, [eventDetails]);

  const totalSeats = seats.length;
  const halfSeats = Math.ceil(totalSeats / 2);
  const selectedSeat = seats.find((s) => s.id === selectedSeatId) || seats[0];
  const assignedCount = seats.filter((s) => s.name.trim().length > 0).length;
  const emptyCount = totalSeats - assignedCount;

  // Exact counts requested by user: sa pije, sa ushqime, gjithsej qmimi
  const totalDrinksCount = seats.reduce(
    (acc, s) => acc + (s.drinks || []).reduce((dAcc, d) => dAcc + d.quantity, 0),
    0
  );
  const totalDishesCount = seats.reduce(
    (acc, s) => acc + (s.dishes || []).reduce((fAcc, f) => fAcc + f.quantity, 0),
    0
  );
  const grandTotalPrice = seats.reduce((acc, s) => acc + calculateSeatTotal(s), 0);

  // Ruajtja në Hard Disk për GitHub (JSON file export)
  const handleExportToHardDrive = () => {
    const exportData = {
      appName: 'Tavolina Festive - Event Planner',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      eventDetails,
      seats,
      summary: {
        totalSeats: seats.length,
        assignedGuests: assignedCount,
        totalDrinks: totalDrinksCount,
        totalDishes: totalDishesCount,
        grandTotalPrice,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const cleanName = (eventDetails.celebrant || 'tavolina')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    downloadAnchor.setAttribute('download', `tavolina-eventi-${cleanName}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSaveStatusMessage('Fajlli JSON u shkarkua me sukses në hard disk (gati për GitHub)!');
    setTimeout(() => setSaveStatusMessage(null), 4000);
  };

  // Ngarkimi nga Hard Disku (JSON file import)
  const handleImportFromHardDrive = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.seats && Array.isArray(parsed.seats)) {
          setSeats(parsed.seats);
          if (parsed.eventDetails) {
            setEventDetails(parsed.eventDetails);
          }
          setSaveStatusMessage('Të dhënat u ngarkuan me sukses nga hard disku!');
          setTimeout(() => setSaveStatusMessage(null), 4000);
        } else if (Array.isArray(parsed)) {
          setSeats(parsed);
          setSaveStatusMessage('Karriget u ngarkuan me sukses!');
          setTimeout(() => setSaveStatusMessage(null), 4000);
        } else {
          alert('Struktura e fajllit nuk është e vlefshme.');
        }
      } catch {
        alert('Gabim gjatë leximit të fajllit JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChangeCapacity = (newCap: 18 | 20) => {
    setCapacity(newCap);
    setEventDetails((prev) => ({ ...prev, capacity: newCap }));
    if (newCap === 18) {
      if (seats.length > 18) {
        setSeats(seats.slice(0, 18));
      } else {
        setSeats(getSampleSeats(18));
      }
      if (selectedSeatId > 18) setSelectedSeatId(1);
    } else {
      if (seats.length < 20) {
        const extra = getSampleSeats(20).slice(seats.length);
        setSeats([...seats, ...extra]);
      } else {
        setSeats(getSampleSeats(20));
      }
    }
  };

  const handleUpdateSeat = (id: number, patch: Partial<Seat>) => {
    setSeats((prev) =>
      prev.map((seat) => (seat.id === id ? { ...seat, ...patch } : seat))
    );
  };

  const handleUpdateSeatName = (id: number, name: string) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.id === id
          ? { ...seat, name, confirmed: name.trim().length > 0 }
          : seat
      )
    );
  };

  const handleSwapSeats = (idA: number, idB: number) => {
    if (idA === idB) return;
    setSeats((prev) => {
      const seatA = prev.find((s) => s.id === idA);
      const seatB = prev.find((s) => s.id === idB);
      if (!seatA || !seatB) return prev;

      return prev.map((s) => {
        if (s.id === idA) {
          return {
            ...s,
            name: seatB.name,
            role: seatB.role,
            dietary: seatB.dietary,
            note: seatB.note,
            confirmed: seatB.confirmed,
          };
        }
        if (s.id === idB) {
          return {
            ...s,
            name: seatA.name,
            role: seatA.role,
            dietary: seatA.dietary,
            note: seatA.note,
            confirmed: seatA.confirmed,
          };
        }
        return s;
      });
    });
    setSelectedSeatId(idB);
  };

  const handleClearSeat = (id: number) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, name: '', note: '', confirmed: false, drinks: [], dishes: [] }
          : s
      )
    );
  };

  const handleClearSeatOrder = (id: number) => {
    setSeats((prev) =>
      prev.map((s) => (s.id === id ? { ...s, drinks: [], dishes: [] } : s))
    );
    setSaveStatusMessage(`✓ U fshinë të gjitha porositë për Karrigen #${String(id).padStart(2, '0')}`);
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handleClearAllOrders = () => {
    setSeats((prev) =>
      prev.map((s) => ({ ...s, drinks: [], dishes: [] }))
    );
    setSaveStatusMessage('✓ Fatura u fshi! Të gjitha porositë u pastruan me sukses.');
    setTimeout(() => setSaveStatusMessage(null), 3500);
  };

  const handleSaveFormat = () => {
    try {
      localStorage.setItem(STORAGE_SEATS_KEY, JSON.stringify(seats));
      localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(eventDetails));
      setSaveStatusMessage('💾 Formati dhe të gjithë emrat u ruajtën me sukses!');
      setTimeout(() => setSaveStatusMessage(null), 3500);
    } catch {
      setSaveStatusMessage('⚠️ Gabim gjatë ruajtjes.');
    }
  };

  const handleRemoveSeat = (target: string | number): boolean => {
    let seatToRemove: Seat | undefined;

    if (typeof target === 'number') {
      seatToRemove = seats.find((s) => s.id === target);
    } else {
      const trimmed = target.trim();
      if (!trimmed) {
        setSaveStatusMessage('⚠️ Ju lutem shkruani numrin e karriges ose emrin.');
        setTimeout(() => setSaveStatusMessage(null), 3000);
        return false;
      }
      const numOnly = parseInt(trimmed.replace(/\D/g, ''), 10);
      if (!isNaN(numOnly) && seats.some((s) => s.id === numOnly)) {
        seatToRemove = seats.find((s) => s.id === numOnly);
      } else {
        const lower = trimmed.toLowerCase();
        seatToRemove = seats.find((s) => s.name.trim().toLowerCase().includes(lower));
      }
    }

    if (!seatToRemove) {
      setSaveStatusMessage(`⚠️ Karriga "${target}" nuk u gjet në skemë.`);
      setTimeout(() => setSaveStatusMessage(null), 3500);
      return false;
    }

    if (seats.length <= 2) {
      setSaveStatusMessage('⚠️ Tavolina duhet të ketë së paku 2 karrige.');
      setTimeout(() => setSaveStatusMessage(null), 3500);
      return false;
    }

    const removedId = seatToRemove.id;
    const removedName = seatToRemove.name.trim() ? ` (${seatToRemove.name})` : '';

    setSeats((prev) => {
      const remaining = prev.filter((s) => s.id !== removedId);
      return remaining.map((s, idx) => ({ ...s, id: idx + 1 }));
    });

    setSelectedSeatId((prevId) => {
      if (prevId === removedId) return 1;
      if (prevId > removedId) return prevId - 1;
      return prevId;
    });

    setSaveStatusMessage(`✓ Karriga #${removedId}${removedName} u hoq nga skema vizuale! Mbetën ${seats.length - 1} karrige.`);
    setTimeout(() => setSaveStatusMessage(null), 3500);
    return true;
  };

  const handleAddSeat = () => {
    setSeats((prev) => {
      const newId = prev.length + 1;
      const newSeat: Seat = {
        id: newId,
        name: '',
        role: 'miqte',
        dietary: 'klasike',
        note: '',
        confirmed: false,
        drinks: [],
        dishes: [],
      };
      return [...prev, newSeat];
    });
    setSaveStatusMessage(`✓ U shtua një karrige e re! Gjithsej ${seats.length + 1} karrige.`);
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handleResetTo20Seats = () => {
    setSeats(getSampleSeats(20));
    setSelectedSeatId(1);
    setSaveStatusMessage('✓ U rikthyen të 20 karriget e plota.');
    setTimeout(() => setSaveStatusMessage(null), 3000);
  };

  const handleAddDrinkToAll = (drink: { name: string; price: number }) => {
    setSeats((prev) =>
      prev.map((s) => {
        const drinks = s.drinks || [];
        const existing = drinks.find((d) => d.name === drink.name);
        const updated: OrderItem[] = existing
          ? drinks.map((d) => (d.name === drink.name ? { ...d, quantity: d.quantity + 1 } : d))
          : [
              ...drinks,
              {
                id: `d-all-${Date.now()}-${s.id}`,
                name: drink.name,
                category: 'pije' as const,
                price: drink.price,
                quantity: 1,
              },
            ];
        return { ...s, drinks: updated };
      })
    );
  };

  const handleCopyOrderToAll = (sourceSeat: Seat) => {
    setSeats((prev) =>
      prev.map((s) => ({
        ...s,
        drinks: (sourceSeat.drinks || []).map((d) => ({
          ...d,
          id: `d-${Date.now()}-${s.id}-${Math.random().toString(36).substr(2, 4)}`,
        })),
        dishes: (sourceSeat.dishes || []).map((f) => ({
          ...f,
          id: `f-${Date.now()}-${s.id}-${Math.random().toString(36).substr(2, 4)}`,
        })),
      }))
    );
  };

  const handleClearAllSeats = () => {
    setSeats(createEmptySeats(capacity));
    setConfirmClearAll(false);
  };

  const handleRestoreSampleSeats = () => {
    setSeats(getSampleSeats(capacity));
    setConfirmClearAll(false);
  };

  const handleApplyBulkNames = (names: string[]) => {
    setSeats((prev) =>
      prev.map((s, idx) => {
        const newName = names[idx] !== undefined ? names[idx] : s.name;
        return {
          ...s,
          name: newName,
          confirmed: newName.trim().length > 0,
        };
      })
    );
  };

  const handleUpdateEventDetails = (patch: Partial<EventDetails>) => {
    setEventDetails((prev) => ({ ...prev, ...patch }));
  };

  const handleCopySeatingList = () => {
    const lines = [
      `🎂 ${eventDetails.title} — Festari/ja: ${eventDetails.celebrant}`,
      `📅 ${eventDetails.date} · ${eventDetails.venue}`,
      `========================================`,
      `--- ANA E SIPËRME (${halfSeats} Karrige) ---`,
      ...seats.slice(0, halfSeats).map(
        (s) =>
          `#${String(s.id).padStart(2, '0')}: ${s.name.trim() || '(E lirë)'}${
            s.role === 'festari' ? ' ★ [Festari/ja]' : ''
          }${s.note ? ` — ${s.note}` : ''}`
      ),
      `--- ANA E POSHTME (${totalSeats - halfSeats} Karrige) ---`,
      ...seats.slice(halfSeats, totalSeats).map(
        (s) =>
          `#${String(s.id).padStart(2, '0')}: ${s.name.trim() || '(E lirë)'}${
            s.role === 'festari' ? ' ★ [Festari/ja]' : ''
          }${s.note ? ` — ${s.note}` : ''}`
      ),
    ];
    navigator.clipboard?.writeText(lines.join('\n'));
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917]">
      {/* 3-Zone Top Bar Contract */}
      <header className="no-print sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E6E1DA] px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setViewMode('tavolina');
          }}
          className="font-display text-xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap"
        >
          EventSeat Planner
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#57534E]">
          <button
            type="button"
            onClick={() => setViewMode('tavolina')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap ${
              viewMode === 'tavolina'
                ? 'border-[#9F2B2B] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CFC2]'
            }`}
          >
            Skema e Tavolinës (Anash)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('lista')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap ${
              viewMode === 'lista'
                ? 'border-[#9F2B2B] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CFC2]'
            }`}
          >
            Lista e Karrigeve ({totalSeats})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('fatura')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              viewMode === 'fatura'
                ? 'border-[#9F2B2B] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CFC2]'
            }`}
          >
            <span>Fatura & Shpenzimet</span>
            <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-[#FAF8F5] border border-[#E6E1DA] font-bold text-[#8C6227]">
              {seats.reduce((acc, s) => acc + calculateSeatTotal(s), 0).toFixed(0)} €
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kartat')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap ${
              viewMode === 'kartat'
                ? 'border-[#9F2B2B] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CFC2]'
            }`}
          >
            Kartat e Vendeve
          </button>
          <button
            type="button"
            onClick={() => setViewMode('menu')}
            className={`py-1 border-b-2 transition-colors whitespace-nowrap ${
              viewMode === 'menu'
                ? 'border-[#9F2B2B] text-[#1C1917] font-semibold'
                : 'border-transparent hover:text-[#1C1917] hover:border-[#D6CFC2]'
            }`}
          >
            Menu & Detaje
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Auto-save status */}
          <div
            title="Çdo emër, pije dhe ushqim ruhet automatikisht në memorien e faqes"
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1DA] text-[11px] text-[#2E5A44] font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>Ruhet automatikisht në faqe</span>
          </div>

          {/* Ruaj Formatin & Emrat */}
          <button
            type="button"
            onClick={handleSaveFormat}
            title="Ruaj formatin dhe të gjithë emrat e tavolinës në shfletues"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1C1917] hover:bg-[#332E28] text-white text-xs font-semibold transition-colors whitespace-nowrap shadow-xs"
          >
            <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden sm:inline">Ruaj Formatin</span>
            <span className="sm:hidden">Ruaj</span>
          </button>

          {/* Ruaj në Hard Disk (Për GitHub) */}
          <button
            type="button"
            onClick={handleExportToHardDrive}
            title="Ruaj dhe shkarko fajllin JSON në kompjuter për ta vendosur në GitHub"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] hover:bg-white hover:border-[#1C1917] text-xs font-semibold text-[#1C1917] transition-colors whitespace-nowrap shadow-2xs"
          >
            <HardDrive className="w-3.5 h-3.5 text-[#1C1917]" />
            <span className="hidden sm:inline">Ruaj në Hard Disk</span>
            <span className="sm:hidden">Ruaj JSON</span>
          </button>

          {/* Ngarko nga Hard Disku */}
          <label
            title="Ngarko fajllin e ruajtur JSON nga hard disku ose GitHub"
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-[#E6E1DA] bg-white hover:border-[#9F2B2B] text-xs font-semibold text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-[#78716C]" />
            <span className="hidden md:inline">Ngarko JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportFromHardDrive}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D6CFC2] bg-white hover:border-[#9F2B2B] text-xs font-semibold text-[#1C1917] transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#9F2B2B]" />
            <span className="hidden sm:inline">Shkruaj {totalSeats} Emrat</span>
            <span className="sm:hidden">Emrat</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9F2B2B] hover:bg-[#842222] text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Printo Planin</span>
            <span className="sm:hidden">Printo</span>
          </button>
        </div>
      </header>

      {/* Mobile Bar */}
      <div className="no-print md:hidden flex items-center gap-1 px-4 py-2 bg-[#EFECE6]/60 border-b border-[#E6E1DA] overflow-x-auto">
        {(
          [
            ['tavolina', 'Skema Vizuale'],
            ['lista', `Lista (${totalSeats})`],
            ['fatura', 'Fatura €'],
            ['kartat', 'Kartat'],
            ['menu', 'Menu & Detaje'],
          ] as [ViewMode, string][]
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              viewMode === mode
                ? 'bg-white text-[#1C1917] font-semibold shadow-xs'
                : 'text-[#57534E]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 space-y-6 print-full">
        {/* Context Header */}
        <section className="no-print flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#E6E1DA]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C]">
              <span className="font-semibold text-[#2E5A44] flex items-center gap-1">
                <Check className="w-3 h-3 text-[#2E5A44]" />
                Kreu & Balli: Pa karrige (0 karrige)
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-[#1C1917] font-semibold">
                {assignedCount} të emërtuara
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {emptyCount} të lira
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums font-bold text-[#8C6227]">
                Fatura: {grandTotalPrice.toFixed(2)} € ({totalDrinksCount} pije · {totalDishesCount} ushqime)
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#1C1917]">
                {eventDetails.title}
              </h1>
              <span className="text-sm text-[#57534E]">
                për ditëlindjen e{' '}
                <strong className="text-[#9F2B2B] font-semibold">
                  {eventDetails.celebrant}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Capacity Toggle: 18 vs 20 */}
            <div
              className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-xl border border-[#E6E1DA]"
              title="Zgjidhni numrin e personave (të gjithë anash)"
            >
              <button
                type="button"
                onClick={() => handleChangeCapacity(18)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  totalSeats === 18
                    ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                18 Vende
              </button>
              <button
                type="button"
                onClick={() => handleChangeCapacity(20)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  totalSeats === 20
                    ? 'bg-[#1C1917] text-white font-semibold shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                20 Vende (10 me 10 Anash)
              </button>
            </div>

            {/* FAKTURA GJITHSEJ - Totali i Përgjithshëm i Shpenzimeve & Pijeve */}
            <div
              onClick={() => setViewMode('fatura')}
              title="Kliko për të parë faturën e plotë dhe shpenzimet"
              className="cursor-pointer flex items-center gap-3.5 px-4 py-2 rounded-xl bg-[#1C1917] text-white shadow-sm border border-[#332E28] hover:border-[#D4AF37] transition-all"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-wider font-bold block">
                    FAKTURA GJITHSEJ
                  </span>
                  <span className="text-[10px] font-mono text-[#A8A29E]">
                    ({totalSeats} karrige)
                  </span>
                </div>
                <div className="text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="text-[#93C5FD] font-semibold">{totalDrinksCount} pije</span>
                  <span className="text-[#78716C]">·</span>
                  <span className="text-[#FCA5A5] font-semibold">{totalDishesCount} ushqime</span>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-[#332E28]" />
              <div className="text-right">
                <span className="text-[9px] text-[#A8A29E] block uppercase font-mono leading-none mb-0.5">
                  Gjithsej
                </span>
                <span className="font-mono text-xl font-bold tabular-nums text-[#D4AF37]">
                  {grandTotalPrice.toFixed(2)} €
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Print Header */}
        <div className="hidden print:block pb-4 mb-4 border-b border-[#1C1917]">
          <h1 className="font-display text-2xl font-bold text-[#1C1917]">
            {eventDetails.title} — Festari/ja: {eventDetails.celebrant}
          </h1>
          <p className="text-xs text-[#57534E] mt-1">
            {eventDetails.date} · {eventDetails.venue} · {totalSeats} Karrige Anash ({assignedCount}/{totalSeats} të caktuara)
          </p>
        </div>

        {/* VIEW 1: Visual Table */}
        {viewMode === 'tavolina' && (
          <div className="space-y-6">
            <VisualTableCanvas
              seats={seats}
              selectedSeatId={selectedSeatId}
              swapSourceId={swapSourceId}
              tableShape={eventDetails.tableShape}
              centerpiece={eventDetails.centerpiece}
              eventTitle={eventDetails.title}
              celebrantName={eventDetails.celebrant}
              eventDate={eventDetails.date}
              filterRole={filterRole}
              searchQuery={searchQuery}
              onSelectSeat={setSelectedSeatId}
              onUpdateSeatName={handleUpdateSeatName}
              onSwapSeats={handleSwapSeats}
              onStartSwap={setSwapSourceId}
              onClearSeat={handleClearSeat}
              onOpenOrderModal={handleOpenOrderModal}
              onSaveFormat={handleSaveFormat}
              onRemoveSeat={handleRemoveSeat}
              onAddSeat={handleAddSeat}
              onResetSeats={handleResetTo20Seats}
            />

            {/* Bottom Controls: Seat Inspector */}
            <div className="no-print max-w-3xl mx-auto w-full">
              <SeatInspectorPanel
                seat={selectedSeat}
                allSeats={seats}
                onSelectSeat={setSelectedSeatId}
                onUpdateSeat={handleUpdateSeat}
                onSwapSeats={handleSwapSeats}
                onClearSeat={handleClearSeat}
                onAddDrinkToAll={handleAddDrinkToAll}
                onCopyOrderToAll={handleCopyOrderToAll}
                onOpenOrderModal={handleOpenOrderModal}
                onClearSeatOrder={handleClearSeatOrder}
                onClearAllOrders={handleClearAllOrders}
                onSaveFormat={handleSaveFormat}
                onRemoveSeat={handleRemoveSeat}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: List View */}
        {viewMode === 'lista' && (
          <GuestListView
            seats={seats}
            selectedSeatId={selectedSeatId}
            filterRole={filterRole}
            searchQuery={searchQuery}
            onSelectSeat={setSelectedSeatId}
            onUpdateSeat={handleUpdateSeat}
            onSwapSeats={handleSwapSeats}
            onClearSeat={handleClearSeat}
            onOpenBulkModal={() => setIsBulkModalOpen(true)}
            onOpenOrderModal={handleOpenOrderModal}
          />
        )}

        {/* VIEW: Bill Summary View (Fatura & Shpenzimet) */}
        {viewMode === 'fatura' && (
          <BillSummaryView
            seats={seats}
            eventDetails={eventDetails}
            onSelectSeat={(id) => {
              setSelectedSeatId(id);
              handleOpenOrderModal(id);
            }}
            onAddDrinkToAll={handleAddDrinkToAll}
            onPrint={handlePrint}
            onOpenOrderModal={handleOpenOrderModal}
            onClearSeatOrder={handleClearSeatOrder}
            onClearAllOrders={handleClearAllOrders}
            onSaveFormat={handleSaveFormat}
          />
        )}

        {/* VIEW 3: Place Cards View */}
        {viewMode === 'kartat' && (
          <PlaceCardsView
            seats={seats}
            eventDetails={eventDetails}
            onUpdateSeatName={handleUpdateSeatName}
            onSelectSeat={setSelectedSeatId}
            onPrint={handlePrint}
          />
        )}

        {/* VIEW 4: Menu View */}
        {viewMode === 'menu' && (
          <MenuSummaryView
            seats={seats}
            eventDetails={eventDetails}
            onUpdateEventDetails={handleUpdateEventDetails}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-12 border-t border-[#E6E1DA] bg-[#FAF8F5] py-5 px-6">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#78716C]">
          <div>
            EventSeat Planner · Karriget anash, karriget 01 dhe 11 në mes janë hequr
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(true)}
              className="hover:text-[#1C1917] transition-colors"
            >
              Ngjit Emrat
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleCopySeatingList}
              className="hover:text-[#1C1917] transition-colors"
            >
              Kopjo Planin e Ulëseve
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handlePrint}
              className="hover:text-[#1C1917] transition-colors"
            >
              Printo Skemën
            </button>
          </div>
        </div>
      </footer>

      <BulkPasteModal
        isOpen={isBulkModalOpen}
        seats={seats}
        onClose={() => setIsBulkModalOpen(false)}
        onApplyNames={handleApplyBulkNames}
      />

      {/* Interactive 1-Click Order Modal for Drinks & Food Prices */}
      <ChairOrderModal
        isOpen={orderModalSeatId !== null}
        seatId={orderModalSeatId}
        allSeats={seats}
        onClose={() => setOrderModalSeatId(null)}
        onSelectSeat={(id) => {
          setSelectedSeatId(id);
          setOrderModalSeatId(id);
        }}
        onUpdateSeat={handleUpdateSeat}
        onAddDrinkToAll={handleAddDrinkToAll}
        onCopyOrderToAll={handleCopyOrderToAll}
        onClearSeatOrder={handleClearSeatOrder}
        onClearAllOrders={handleClearAllOrders}
      />

      {/* Toast Notification for Disk Save / Load */}
      {saveStatusMessage && (
        <aside aria-label="Njoftim për ruajtje" className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#1C1917] text-white shadow-2xl border border-[#D4AF37] text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span>{saveStatusMessage}</span>
        </aside>
      )}
    </div>
  );
}
