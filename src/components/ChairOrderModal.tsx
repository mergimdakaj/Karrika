import React, { useState } from 'react';
import {
  Seat,
  OrderItem,
  DEFAULT_DRINKS_CATALOG,
  DEFAULT_DISHES_CATALOG,
  calculateSeatTotal,
  ROLE_SHORT_LABELS,
} from '../types';
import {
  X,
  Wine,
  Utensils,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  Crown,
  Receipt,
  Copy,
  Users,
} from 'lucide-react';

interface ChairOrderModalProps {
  isOpen: boolean;
  seatId: number | null;
  allSeats: Seat[];
  onClose: () => void;
  onSelectSeat: (id: number) => void;
  onUpdateSeat: (id: number, patch: Partial<Seat>) => void;
  onAddDrinkToAll?: (drink: { name: string; price: number }) => void;
  onCopyOrderToAll?: (sourceSeat: Seat) => void;
}

export const ChairOrderModal: React.FC<ChairOrderModalProps> = ({
  isOpen,
  seatId,
  allSeats,
  onClose,
  onSelectSeat,
  onUpdateSeat,
  onAddDrinkToAll,
  onCopyOrderToAll,
}) => {
  const [customDishName, setCustomDishName] = useState('');
  const [customDishPrice, setCustomDishPrice] = useState('');

  const [customDrinkName, setCustomDrinkName] = useState('');
  const [customDrinkPrice, setCustomDrinkPrice] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || seatId === null) return null;

  const currentSeat = allSeats.find((s) => s.id === seatId);
  if (!currentSeat) return null;

  const totalSeats = allSeats.length;
  const halfSeats = Math.ceil(totalSeats / 2);
  const positionText =
    currentSeat.id <= halfSeats
      ? `Ana e Sipërme (Karriga ${currentSeat.id} nga ${halfSeats})`
      : `Ana e Poshtme (Karriga ${currentSeat.id - halfSeats} nga ${totalSeats - halfSeats})`;

  const drinksList = currentSeat.drinks || [];
  const dishesList = currentSeat.dishes || [];

  const drinksSubtotal = drinksList.reduce((acc, d) => acc + d.price * d.quantity, 0);
  const dishesSubtotal = dishesList.reduce((acc, d) => acc + d.price * d.quantity, 0);
  const seatTotal = calculateSeatTotal(currentSeat);
  const grandTotal = allSeats.reduce((acc, s) => acc + calculateSeatTotal(s), 0);
  const totalDrinksAll = allSeats.reduce(
    (acc, s) => acc + (s.drinks || []).reduce((dAcc, d) => dAcc + d.quantity, 0),
    0
  );
  const totalDishesAll = allSeats.reduce(
    (acc, s) => acc + (s.dishes || []).reduce((fAcc, d) => fAcc + d.quantity, 0),
    0
  );

  const prevSeatId = currentSeat.id === 1 ? totalSeats : currentSeat.id - 1;
  const nextSeatId = currentSeat.id === totalSeats ? 1 : currentSeat.id + 1;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Automatic Drink Add (1-Click)
  const handleAddCatalogDrink = (drink: { name: string; price: number; icon: string }) => {
    const existing = drinksList.find((d) => d.name === drink.name);
    let updated: OrderItem[];
    if (existing) {
      updated = drinksList.map((d) =>
        d.name === drink.name ? { ...d, quantity: d.quantity + 1 } : d
      );
    } else {
      updated = [
        ...drinksList,
        {
          id: `drink-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: drink.name,
          category: 'pije',
          price: drink.price,
          quantity: 1,
        },
      ];
    }
    onUpdateSeat(currentSeat.id, { drinks: updated });
    showToast(`U shtua: ${drink.icon} ${drink.name} (+${drink.price.toFixed(2)} €)`);
  };

  // Custom Drink Add
  const handleAddCustomDrink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDrinkName.trim()) return;
    const price = Math.max(0, parseFloat(customDrinkPrice) || 0);
    const newDrink: OrderItem = {
      id: `custom-drink-${Date.now()}`,
      name: customDrinkName.trim(),
      category: 'pije',
      price,
      quantity: 1,
    };
    onUpdateSeat(currentSeat.id, { drinks: [...drinksList, newDrink] });
    setCustomDrinkName('');
    setCustomDrinkPrice('');
    showToast(`U shtua pija: ${newDrink.name} (${price.toFixed(2)} €)`);
  };

  // Automatic Dish Add (1-Click)
  const handleAddCatalogDish = (dish: { name: string; price: number; icon: string }) => {
    const existing = dishesList.find((d) => d.name === dish.name);
    let updated: OrderItem[];
    if (existing) {
      updated = dishesList.map((d) =>
        d.name === dish.name ? { ...d, quantity: d.quantity + 1 } : d
      );
    } else {
      updated = [
        ...dishesList,
        {
          id: `dish-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: dish.name,
          category: 'ushqim',
          price: dish.price,
          quantity: 1,
        },
      ];
    }
    onUpdateSeat(currentSeat.id, { dishes: updated });
    showToast(`U shtua: ${dish.icon} ${dish.name} (+${dish.price.toFixed(2)} €)`);
  };

  // Custom Dish with Price Add
  const handleAddCustomDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDishName.trim()) return;
    const price = Math.max(0, parseFloat(customDishPrice) || 0);
    const newDish: OrderItem = {
      id: `custom-dish-${Date.now()}`,
      name: customDishName.trim(),
      category: 'ushqim',
      price,
      quantity: 1,
    };
    onUpdateSeat(currentSeat.id, { dishes: [...dishesList, newDish] });
    setCustomDishName('');
    setCustomDishPrice('');
    showToast(`U shtua ushqimi: ${newDish.name} (${price.toFixed(2)} €)`);
  };

  const handleUpdateDrinkQuantity = (drinkId: string, delta: number) => {
    const updated = drinksList
      .map((d) => {
        if (d.id === drinkId) {
          const newQty = d.quantity + delta;
          return newQty > 0 ? { ...d, quantity: newQty } : null;
        }
        return d;
      })
      .filter((d): d is OrderItem => d !== null);
    onUpdateSeat(currentSeat.id, { drinks: updated });
  };

  const handleRemoveDrink = (drinkId: string) => {
    onUpdateSeat(currentSeat.id, {
      drinks: drinksList.filter((d) => d.id !== drinkId),
    });
  };

  const handleUpdateDishQuantity = (dishId: string, delta: number) => {
    const updated = dishesList
      .map((d) => {
        if (d.id === dishId) {
          const newQty = d.quantity + delta;
          return newQty > 0 ? { ...d, quantity: newQty } : null;
        }
        return d;
      })
      .filter((d): d is OrderItem => d !== null);
    onUpdateSeat(currentSeat.id, { dishes: updated });
  };

  const handleRemoveDish = (dishId: string) => {
    onUpdateSeat(currentSeat.id, {
      dishes: dishesList.filter((d) => d.id !== dishId),
    });
  };

  const handleClearOrders = () => {
    onUpdateSeat(currentSeat.id, { drinks: [], dishes: [] });
    showToast(`Porositë u pastruan për karrigen #${currentSeat.id}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-[#E6E1DA] shadow-2xl overflow-hidden"
      >
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1C1917] text-white text-xs font-semibold shadow-lg animate-in slide-in-from-top-2 duration-150">
            <Check className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-[#FAF8F5] border-b border-[#E6E1DA] px-5 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-mono font-bold tabular-nums shadow-xs ${
                currentSeat.role === 'festari'
                  ? 'bg-[#B4833E] text-white ring-2 ring-[#B4833E]/40'
                  : 'bg-[#1C1917] text-white'
              }`}
            >
              #{String(currentSeat.id).padStart(2, '0')}
            </span>

            <div>
              <div className="flex items-center gap-2">
                <h3 id="order-modal-title" className="font-display text-lg font-bold text-[#1C1917]">
                  {currentSeat.name.trim() || `Karriga #${String(currentSeat.id).padStart(2, '0')}`}
                </h3>
                {currentSeat.role === 'festari' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#B4833E]/15 text-[#8C6227] text-[11px] font-semibold">
                    <Crown className="w-3 h-3 text-[#B4833E]" />
                    Festari/ja
                  </span>
                )}
              </div>
              <p className="text-xs text-[#78716C] mt-0.5 flex items-center gap-2">
                <span>{positionText}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#9F2B2B] font-medium">
                  {ROLE_SHORT_LABELS[currentSeat.role]}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Faktura Gjithsej Badge */}
            <div className="text-right px-3.5 py-1.5 rounded-xl bg-[#1C1917] text-white shadow-xs border border-[#332E28]">
              <div className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                Faktura Gjithsej
              </div>
              <div className="text-[10px] text-[#D6CFC2] font-mono flex items-center justify-end gap-1">
                <span className="text-[#93C5FD]">{totalDrinksAll} pije</span>
                <span>·</span>
                <span className="text-[#FCA5A5]">{totalDishesAll} ushqime</span>
              </div>
              <div className="font-mono text-base sm:text-lg font-bold tabular-nums text-[#D4AF37]">
                {grandTotal.toFixed(2)} €
              </div>
            </div>

            {/* Quick Prev / Next Navigator */}
            <div className="flex items-center gap-1 bg-white border border-[#E6E1DA] rounded-xl p-1">
              <button
                type="button"
                onClick={() => onSelectSeat(prevSeatId)}
                title={`Karriga #${prevSeatId}`}
                className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-semibold tabular-nums px-1 text-[#1C1917]">
                {currentSeat.id}/{totalSeats}
              </span>
              <button
                type="button"
                onClick={() => onSelectSeat(nextSeatId)}
                title={`Karriga #${nextSeatId}`}
                className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-white border border-transparent hover:border-[#E6E1DA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* SECTION 1: Automatic Drink Selection (1-Click) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF0F0] border border-[#9F2B2B]/20 flex items-center justify-center text-[#9F2B2B]">
                  <Wine className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1C1917]">
                    Pije Automatike (Kliko për ta shtuar menjëherë)
                  </h4>
                  <p className="text-[11px] text-[#78716C]">
                    Klikoni çdo pije më poshtë për ta regjistruar automatikisht me çmimin përkatës
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-[#78716C] tabular-nums">
                Nëntotali: {drinksSubtotal.toFixed(2)} €
              </span>
            </div>

            {/* Quick 1-Click Drink Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEFAULT_DRINKS_CATALOG.map((drink) => {
                const countInSeat = (drinksList.find((d) => d.name === drink.name)?.quantity || 0);
                return (
                  <button
                    key={drink.name}
                    type="button"
                    onClick={() => handleAddCatalogDrink(drink)}
                    className={`relative p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group cursor-pointer ${
                      countInSeat > 0
                        ? 'border-[#9F2B2B] bg-[#FFF8F7] shadow-2xs'
                        : 'border-[#E6E1DA] bg-white hover:border-[#9F2B2B]/60 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full">
                      <span className="text-xl group-hover:scale-110 transition-transform">
                        {drink.icon}
                      </span>
                      {countInSeat > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#9F2B2B] text-white font-mono text-[10px] font-bold">
                          ×{countInSeat}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <div className="text-xs font-medium text-[#1C1917] line-clamp-1 leading-snug">
                        {drink.name}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#8C6227] mt-0.5">
                        +{drink.price.toFixed(2)} €
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Drink with Price */}
            <form
              onSubmit={handleAddCustomDrink}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={customDrinkName}
                onChange={(e) => setCustomDrinkName(e.target.value)}
                placeholder="Pije tjetër (p.sh. Rakia, Çaj Kamomili)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#E6E1DA] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B]"
              />
              <div className="relative w-24">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={customDrinkPrice}
                  onChange={(e) => setCustomDrinkPrice(e.target.value)}
                  placeholder="Çmimi"
                  className="w-full px-3 py-1.5 pr-6 rounded-xl border border-[#E6E1DA] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#78716C] font-bold">
                  €
                </span>
              </div>
              <button
                type="submit"
                disabled={!customDrinkName.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D6CFC2] hover:border-[#9F2B2B] disabled:opacity-40 text-xs font-semibold text-[#1C1917] transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#9F2B2B]" />
                <span>Shto Pije</span>
              </button>
            </form>
          </section>

          {/* SECTION 2: Food Menu with Prices */}
          <section className="space-y-3 pt-3 border-t border-[#EFECE6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF4ED] border border-[#B4833E]/20 flex items-center justify-center text-[#B4833E]">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#1C1917]">
                    Ushqim me Çmim (Zgjidh ose Vendos Çmim)
                  </h4>
                  <p className="text-[11px] text-[#78716C]">
                    Shtoni pjata nga menyja ose shkruani çdo ushqim me çmimin e dëshiruar
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-[#78716C] tabular-nums">
                Nëntotali: {dishesSubtotal.toFixed(2)} €
              </span>
            </div>

            {/* Quick 1-Click Dishes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {DEFAULT_DISHES_CATALOG.map((dish) => {
                const countInSeat = (dishesList.find((d) => d.name === dish.name)?.quantity || 0);
                return (
                  <button
                    key={dish.name}
                    type="button"
                    onClick={() => handleAddCatalogDish(dish)}
                    className={`relative p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between group cursor-pointer ${
                      countInSeat > 0
                        ? 'border-[#B4833E] bg-[#FFFBF5] shadow-2xs'
                        : 'border-[#E6E1DA] bg-white hover:border-[#B4833E]/60 hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 w-full">
                      <span className="text-xl group-hover:scale-110 transition-transform">
                        {dish.icon}
                      </span>
                      {countInSeat > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#B4833E] text-white font-mono text-[10px] font-bold">
                          ×{countInSeat}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <div className="text-xs font-medium text-[#1C1917] line-clamp-1 leading-snug">
                        {dish.name}
                      </div>
                      <div className="text-xs font-mono font-bold text-[#8C6227] mt-0.5">
                        +{dish.price.toFixed(2)} €
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Dish with Price Form */}
            <form
              onSubmit={handleAddCustomDish}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={customDishName}
                onChange={(e) => setCustomDishName(e.target.value)}
                placeholder="Ushqim tjetër (p.sh. Tavë Dheu, Pica, Sallatë Cezar)..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-[#E6E1DA] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#B4833E]"
              />
              <div className="relative w-24">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={customDishPrice}
                  onChange={(e) => setCustomDishPrice(e.target.value)}
                  placeholder="Çmimi"
                  className="w-full px-3 py-1.5 pr-6 rounded-xl border border-[#E6E1DA] text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#B4833E]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#78716C] font-bold">
                  €
                </span>
              </div>
              <button
                type="submit"
                disabled={!customDishName.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D6CFC2] hover:border-[#B4833E] disabled:opacity-40 text-xs font-semibold text-[#1C1917] transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-[#B4833E]" />
                <span>Shto Ushqim me Çmim</span>
              </button>
            </form>
          </section>

          {/* SECTION 3: Current Orders Summary for this Seat */}
          <section className="space-y-3 pt-3 border-t border-[#EFECE6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#1C1917]" />
                <h4 className="text-sm font-semibold text-[#1C1917]">
                  Porositë Aktuale për #{String(currentSeat.id).padStart(2, '0')}{' '}
                  {currentSeat.name ? `(${currentSeat.name})` : ''}
                </h4>
              </div>
              {(drinksList.length > 0 || dishesList.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearOrders}
                  className="text-xs text-[#DC2626] hover:underline transition-colors"
                >
                  Pastro të gjitha porositë
                </button>
              )}
            </div>

            {drinksList.length === 0 && dishesList.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#FAF8F5] border border-dashed border-[#D6CFC2] text-center">
                <p className="text-xs text-[#78716C]">
                  Nuk ka ende pije ose ushqim të shtuar për këtë karrige.
                </p>
                <p className="text-[11px] text-[#A8A29E] mt-1">
                  Klikoni butonat më lart për të shtuar pije automatikisht ose ushqim me çmim.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Active Drinks */}
                {drinksList.map((drink) => (
                  <div
                    key={drink.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FFFDF9] border border-[#E6E1DA]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Wine className="w-4 h-4 text-[#9F2B2B] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1C1917] truncate">
                          {drink.name}
                        </div>
                        <div className="text-[10px] text-[#78716C] font-mono">
                          {drink.price.toFixed(2)} € / copë
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-white border border-[#E6E1DA] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateDrinkQuantity(drink.id, -1)}
                          className="p-1 rounded text-[#57534E] hover:text-[#DC2626] hover:bg-[#FAF8F5] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold tabular-nums text-[#1C1917]">
                          {drink.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateDrinkQuantity(drink.id, 1)}
                          className="p-1 rounded text-[#57534E] hover:text-[#2E5A44] hover:bg-[#FAF8F5] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="w-16 text-right font-mono text-xs font-bold tabular-nums text-[#1C1917]">
                        {(drink.price * drink.quantity).toFixed(2)} €
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDrink(drink.id)}
                        className="p-1 text-[#A8A29E] hover:text-[#DC2626] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Active Dishes */}
                {dishesList.map((dish) => (
                  <div
                    key={dish.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#FFFDF9] border border-[#E6E1DA]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Utensils className="w-4 h-4 text-[#B4833E] shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#1C1917] truncate">
                          {dish.name}
                        </div>
                        <div className="text-[10px] text-[#78716C] font-mono">
                          {dish.price.toFixed(2)} € / copë
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1 bg-white border border-[#E6E1DA] rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateDishQuantity(dish.id, -1)}
                          className="p-1 rounded text-[#57534E] hover:text-[#DC2626] hover:bg-[#FAF8F5] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold tabular-nums text-[#1C1917]">
                          {dish.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateDishQuantity(dish.id, 1)}
                          className="p-1 rounded text-[#57534E] hover:text-[#2E5A44] hover:bg-[#FAF8F5] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="w-16 text-right font-mono text-xs font-bold tabular-nums text-[#1C1917]">
                        {(dish.price * dish.quantity).toFixed(2)} €
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDish(dish.id)}
                        className="p-1 text-[#A8A29E] hover:text-[#DC2626] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 4: Fast Batch Actions */}
          <section className="space-y-2 pt-3 border-t border-[#EFECE6]">
            <div className="text-xs font-semibold text-[#1C1917]">
              Veprime të Shpejta për të Gjithë Mysafirët:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {onAddDrinkToAll && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onAddDrinkToAll({ name: 'Cola', price: 1.8 });
                      showToast('U shtua Cola (1.80 €) për të gjithë mysafirët!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#1C1917] transition-colors"
                  >
                    <span>🥤</span>
                    <span>+ Cola për të {totalSeats} Karriget (1.80 €)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onAddDrinkToAll({ name: 'Birra', price: 2.0 });
                      showToast('U shtua Birra (2.00 €) për të gjithë mysafirët!');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#1C1917] transition-colors"
                  >
                    <span>🍺</span>
                    <span>+ Birra për të {totalSeats} Karriget (2.00 €)</span>
                  </button>
                </>
              )}

              {onCopyOrderToAll && (drinksList.length > 0 || dishesList.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    onCopyOrderToAll(currentSeat);
                    showToast('Kjo porosi u kopjua te të gjitha karriget!');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] hover:bg-white text-xs font-semibold text-[#1C1917] transition-colors"
                >
                  <Users className="w-3.5 h-3.5 text-[#9F2B2B]" />
                  <span>Kopjo këtë porosi për të gjithë ({totalSeats} vende)</span>
                </button>
              )}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF8F5] border-t border-[#E6E1DA] px-5 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectSeat(prevSeatId)}
              className="px-3 py-1.5 rounded-xl border border-[#D6CFC2] bg-white text-xs font-semibold text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
            >
              ← Karriga #{prevSeatId}
            </button>
            <button
              type="button"
              onClick={() => onSelectSeat(nextSeatId)}
              className="px-3 py-1.5 rounded-xl border border-[#D6CFC2] bg-white text-xs font-semibold text-[#1C1917] hover:bg-[#FAF8F5] transition-colors"
            >
              Karriga #{nextSeatId} →
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[#78716C] uppercase font-semibold block">Qmimi Gjithsej</span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#1C1917] tabular-nums">
                Faktura Gjithsej: <span className="text-[#9F2B2B]">{grandTotal.toFixed(2)} €</span> <span className="text-xs font-normal text-[#78716C]">({totalDrinksAll} pije · {totalDishesAll} ushqime)</span>
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-semibold transition-colors"
            >
              U Krye (Mbyll)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
