import React, { useState } from 'react';
import {
  Seat,
  OrderItem,
  DietaryOption,
  DIETARY_LABELS,
  DEFAULT_DRINKS_CATALOG,
  DEFAULT_DISHES_CATALOG,
  calculateSeatTotal,
} from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  ArrowLeftRight,
  Trash2,
  CheckCircle2,
  Plus,
  Minus,
  Wine,
  Utensils,
  Sparkles,
  Receipt,
  Copy,
  Save,
} from 'lucide-react';

interface SeatInspectorPanelProps {
  seat: Seat;
  allSeats: Seat[];
  onSelectSeat: (id: number) => void;
  onUpdateSeat: (id: number, patch: Partial<Seat>) => void;
  onSwapSeats: (idA: number, idB: number) => void;
  onClearSeat: (id: number) => void;
  onAddDrinkToAll?: (drink: { name: string; price: number }) => void;
  onCopyOrderToAll?: (sourceSeat: Seat) => void;
  onOpenOrderModal?: (id: number) => void;
  onClearSeatOrder?: (id: number) => void;
  onClearAllOrders?: () => void;
  onSaveFormat?: () => void;
  onRemoveSeat?: (target: string | number) => boolean;
}

export const SeatInspectorPanel: React.FC<SeatInspectorPanelProps> = ({
  seat,
  allSeats,
  onSelectSeat,
  onUpdateSeat,
  onSwapSeats,
  onClearSeat,
  onAddDrinkToAll,
  onCopyOrderToAll,
  onOpenOrderModal,
  onClearSeatOrder,
  onClearAllOrders,
  onSaveFormat,
  onRemoveSeat,
}) => {
  const [swapTargetId, setSwapTargetId] = useState<number>(
    seat.id === 1 ? 2 : 1
  );

  // Custom Drink Input State
  const [customDrinkName, setCustomDrinkName] = useState('');
  const [customDrinkPrice, setCustomDrinkPrice] = useState('');

  // Custom Dish Input State
  const [customDishName, setCustomDishName] = useState('');
  const [customDishPrice, setCustomDishPrice] = useState('');

  // Feedback banner
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (swapTargetId === seat.id) {
      setSwapTargetId(seat.id === allSeats.length ? 1 : seat.id + 1);
    }
  }, [seat.id, swapTargetId, allSeats.length]);

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const totalSeats = allSeats.length;
  const halfSeats = Math.ceil(totalSeats / 2);

  const prevSeatId = seat.id === 1 ? totalSeats : seat.id - 1;
  const nextSeatId = seat.id === totalSeats ? 1 : seat.id + 1;

  const getSeatPositionLabel = (id: number) => {
    return `Karriga Anash #${String(id).padStart(2, '0')}`;
  };

  const drinksList = seat.drinks || [];
  const dishesList = seat.dishes || [];

  const drinksSubtotal = drinksList.reduce((acc, d) => acc + (d.price * d.quantity), 0);
  const dishesSubtotal = dishesList.reduce((acc, d) => acc + (d.price * d.quantity), 0);
  const seatTotal = calculateSeatTotal(seat);

  const totalDrinksAll = allSeats.reduce(
    (acc, s) => acc + (s.drinks || []).reduce((dAcc, d) => dAcc + d.quantity, 0),
    0
  );
  const totalDishesAll = allSeats.reduce(
    (acc, s) => acc + (s.dishes || []).reduce((fAcc, f) => fAcc + f.quantity, 0),
    0
  );
  const grandTotal = allSeats.reduce((acc, s) => acc + calculateSeatTotal(s), 0);

  // Drink handlers
  const handleAddCatalogDrink = (drink: { name: string; price: number }) => {
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
          id: `drink-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: drink.name,
          category: 'pije',
          price: drink.price,
          quantity: 1,
        },
      ];
    }
    onUpdateSeat(seat.id, { drinks: updated });
    showNotice(`U shtua: ${drink.name} (${drink.price.toFixed(2)} €)`);
  };

  const handleAddCustomDrink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDrinkName.trim()) return;
    const price = parseFloat(customDrinkPrice) || 0;
    const newDrink: OrderItem = {
      id: `custom-drink-${Date.now()}`,
      name: customDrinkName.trim(),
      category: 'pije',
      price: Math.max(0, price),
      quantity: 1,
    };
    onUpdateSeat(seat.id, { drinks: [...drinksList, newDrink] });
    setCustomDrinkName('');
    setCustomDrinkPrice('');
    showNotice(`U shtua: ${newDrink.name} (${newDrink.price.toFixed(2)} €)`);
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
    onUpdateSeat(seat.id, { drinks: updated });
  };

  const handleRemoveDrink = (drinkId: string) => {
    onUpdateSeat(seat.id, { drinks: drinksList.filter((d) => d.id !== drinkId) });
  };

  // Dish handlers
  const handleAddCatalogDish = (dish: { name: string; price: number }) => {
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
          id: `dish-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: dish.name,
          category: 'ushqim',
          price: dish.price,
          quantity: 1,
        },
      ];
    }
    onUpdateSeat(seat.id, { dishes: updated });
    showNotice(`U shtua: ${dish.name} (${dish.price.toFixed(2)} €)`);
  };

  const handleAddCustomDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDishName.trim()) return;
    const price = parseFloat(customDishPrice) || 0;
    const newDish: OrderItem = {
      id: `custom-dish-${Date.now()}`,
      name: customDishName.trim(),
      category: 'ushqim',
      price: Math.max(0, price),
      quantity: 1,
    };
    onUpdateSeat(seat.id, { dishes: [...dishesList, newDish] });
    setCustomDishName('');
    setCustomDishPrice('');
    showNotice(`U shtua: ${newDish.name} (${newDish.price.toFixed(2)} €)`);
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
    onUpdateSeat(seat.id, { dishes: updated });
  };

  const handleRemoveDish = (dishId: string) => {
    onUpdateSeat(seat.id, { dishes: dishesList.filter((d) => d.id !== dishId) });
  };

  return (
    <div className="rounded-2xl bg-white border border-[#E6E1DA] p-5 flex flex-col gap-5 shadow-xs">
      {/* Notice Banner */}
      {noticeMessage && (
        <div className="px-3.5 py-2 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Top Navigation between Chairs */}
      <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#9F2B2B] text-white text-xs font-mono font-semibold tabular-nums">
              Karriga #{String(seat.id).padStart(2, '0')}
            </span>
            {seat.role === 'festari' && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8C6227]">
                <Crown className="w-3.5 h-3.5 text-[#B4833E]" />
                Festari/ja
              </span>
            )}
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            {getSeatPositionLabel(seat.id)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectSeat(prevSeatId)}
            title={`Karriga e mëparshme (#${String(prevSeatId).padStart(2, '0')})`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#1C1917] transition-colors whitespace-nowrap"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">#{String(prevSeatId).padStart(2, '0')}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectSeat(nextSeatId)}
            title={`Karriga tjetër (#${String(nextSeatId).padStart(2, '0')})`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#1C1917] transition-colors whitespace-nowrap"
          >
            <span className="font-mono tabular-nums">#{String(nextSeatId).padStart(2, '0')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Guest Name on Chair */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="inspector-seat-name"
            className="text-xs font-semibold text-[#1C1917]"
          >
            Emri i Mysafirit në Karrige #{String(seat.id).padStart(2, '0')}
          </label>
          <span className="text-[11px] text-[#78716C]">
            {seat.name.trim() ? 'E rezervuar' : 'Karrige e lirë'}
          </span>
        </div>
        <div className="relative flex items-center gap-2">
          <input
            id="inspector-seat-name"
            type="text"
            value={seat.name}
            onChange={(e) =>
              onUpdateSeat(seat.id, {
                name: e.target.value,
                confirmed: e.target.value.trim().length > 0,
              })
            }
            placeholder="Shkruani emrin e mysafirit..."
            className="w-full px-3.5 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-sm font-medium text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B] focus:bg-white transition-colors"
          />

          {onSaveFormat && (
            <button
              type="button"
              onClick={onSaveFormat}
              title="Ruaj formatin dhe të gjithë emrat"
              className="px-3 py-2 rounded-xl bg-[#1C1917] hover:bg-[#332E28] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Ruaj Formatin</span>
              <span className="sm:hidden">Ruaj</span>
            </button>
          )}

          {seat.name.trim() && (
            <button
              type="button"
              onClick={() => onClearSeat(seat.id)}
              title="Pastro emrin e kësaj karrigeje"
              className="p-2.5 rounded-xl border border-[#E6E1DA] text-[#78716C] hover:text-[#DC2626] hover:border-[#FECACA] hover:bg-[#FEF2F2] transition-colors shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {onRemoveSeat && (
            <button
              type="button"
              onClick={() => onRemoveSeat(seat.id)}
              title={`Hiq Karrigen #${seat.id} nga skema e tavolinës`}
              className="p-2.5 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors shrink-0 flex items-center gap-1.5 text-xs font-semibold"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Hiq Karrigen #{seat.id}</span>
              <span className="sm:hidden">Hiq</span>
            </button>
          )}
        </div>

        {onOpenOrderModal && (
          <button
            type="button"
            onClick={() => onOpenOrderModal(seat.id)}
            className="mt-2.5 w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF0F0] hover:bg-[#F7E6E6] border border-[#9F2B2B]/30 text-xs font-semibold text-[#9F2B2B] transition-colors cursor-pointer"
          >
            <Wine className="w-3.5 h-3.5 text-[#9F2B2B]" />
            <span>Hap Dritaren e Pijeve & Ushqimit me 1 Klikim</span>
            <Sparkles className="w-3.5 h-3.5 text-[#B4833E]" />
          </button>
        )}
      </div>

      {/* DRINKS SECTION (SHTO PIJE AUTOMATIKISHT & ME ÇMIM) */}
      <div className="rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Wine className="w-4 h-4 text-[#9F2B2B]" />
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
              Pijet e Karriges
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold tabular-nums text-[#9F2B2B]">
            Nëntotali: {drinksSubtotal.toFixed(2)} €
          </span>
        </div>

        {/* Catalog 1-Click Drinks Picker */}
        <div>
          <span className="block text-[11px] text-[#57534E] mb-1.5 font-medium">
            Kliko për të shtuar pije menjëherë me çmim:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {DEFAULT_DRINKS_CATALOG.map((drink) => (
              <button
                key={drink.name}
                type="button"
                onClick={() => handleAddCatalogDrink(drink)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] bg-white hover:border-[#9F2B2B] hover:bg-[#FFFDF9] text-left text-xs transition-colors group"
              >
                <span className="truncate flex items-center gap-1">
                  <span>{drink.icon}</span>
                  <span className="truncate font-medium text-[#1C1917]">{drink.name}</span>
                </span>
                <span className="font-mono text-[11px] font-semibold tabular-nums text-[#8C6227] ml-1 shrink-0">
                  {drink.price.toFixed(2)} €
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Drink Form */}
        <form onSubmit={handleAddCustomDrink} className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            placeholder="Pije tjetër (p.sh. Gin Tonic, Raki)..."
            value={customDrinkName}
            onChange={(e) => setCustomDrinkName(e.target.value)}
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[#D6CFC2] bg-white text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B]"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Çmimi €"
            value={customDrinkPrice}
            onChange={(e) => setCustomDrinkPrice(e.target.value)}
            className="w-20 px-2 py-1.5 rounded-lg border border-[#D6CFC2] bg-white text-xs font-mono tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B]"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#3E2F26] text-white text-xs font-medium whitespace-nowrap transition-colors"
          >
            + Shto
          </button>
        </form>

        {/* Active Drinks on this Chair */}
        {drinksList.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#EFECE6]">
            <span className="block text-[11px] text-[#78716C] font-semibold">
              Pijet e zgjedhura për këtë karrige:
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {drinksList.map((drink) => (
                <div
                  key={drink.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#E6E1DA] text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-medium text-[#1C1917] truncate block">{drink.name}</span>
                    <span className="text-[10px] text-[#78716C] font-mono tabular-nums">
                      {drink.price.toFixed(2)} € / copë
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateDrinkQuantity(drink.id, -1)}
                      className="p-1 rounded bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#1C1917]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-mono font-semibold tabular-nums text-xs">
                      {drink.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateDrinkQuantity(drink.id, 1)}
                      className="p-1 rounded bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#1C1917]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold tabular-nums text-xs text-[#1C1917] w-14 text-right">
                      {(drink.price * drink.quantity).toFixed(2)} €
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDrink(drink.id)}
                      className="p-1 rounded text-[#78716C] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOD / DISHES SECTION (SHTO USHQIM & ÇMIM) */}
      <div className="rounded-xl border border-[#E6E1DA] bg-[#FAF8F5] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-[#B4833E]" />
            <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
              Ushqimi & Pjatat me Çmim
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold tabular-nums text-[#8C6227]">
            Nëntotali: {dishesSubtotal.toFixed(2)} €
          </span>
        </div>

        {/* Catalog 1-Click Dishes Picker */}
        <div>
          <span className="block text-[11px] text-[#57534E] mb-1.5 font-medium">
            Kliko për të shtuar pjatë festive me çmim:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {DEFAULT_DISHES_CATALOG.map((dish) => (
              <button
                key={dish.name}
                type="button"
                onClick={() => handleAddCatalogDish(dish)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-[#E6E1DA] bg-white hover:border-[#B4833E] hover:bg-[#FFFDF9] text-left text-xs transition-colors group"
              >
                <span className="truncate flex items-center gap-1">
                  <span>{dish.icon}</span>
                  <span className="truncate font-medium text-[#1C1917]">{dish.name}</span>
                </span>
                <span className="font-mono text-[11px] font-semibold tabular-nums text-[#8C6227] ml-1 shrink-0">
                  {dish.price.toFixed(2)} €
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Dish Form */}
        <form onSubmit={handleAddCustomDish} className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            placeholder="Pjatë tjetër (p.sh. Pica, Tiramisu)..."
            value={customDishName}
            onChange={(e) => setCustomDishName(e.target.value)}
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg border border-[#D6CFC2] bg-white text-xs text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B]"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Çmimi €"
            value={customDishPrice}
            onChange={(e) => setCustomDishPrice(e.target.value)}
            className="w-20 px-2 py-1.5 rounded-lg border border-[#D6CFC2] bg-white text-xs font-mono tabular-nums text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#9F2B2B]"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 rounded-lg bg-[#1C1917] hover:bg-[#3E2F26] text-white text-xs font-medium whitespace-nowrap transition-colors"
          >
            + Shto
          </button>
        </form>

        {/* Active Dishes on this Chair */}
        {dishesList.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#EFECE6]">
            <span className="block text-[11px] text-[#78716C] font-semibold">
              Ushqimet e zgjedhura për këtë karrige:
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {dishesList.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-[#E6E1DA] text-xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="font-medium text-[#1C1917] truncate block">{dish.name}</span>
                    <span className="text-[10px] text-[#78716C] font-mono tabular-nums">
                      {dish.price.toFixed(2)} € / copë
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateDishQuantity(dish.id, -1)}
                      className="p-1 rounded bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#1C1917]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-mono font-semibold tabular-nums text-xs">
                      {dish.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateDishQuantity(dish.id, 1)}
                      className="p-1 rounded bg-[#EFECE6] hover:bg-[#E5E0D8] text-[#1C1917]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold tabular-nums text-xs text-[#1C1917] w-14 text-right">
                      {(dish.price * dish.quantity).toFixed(2)} €
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDish(dish.id)}
                      className="p-1 rounded text-[#78716C] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Clear current seat orders button */}
        {onClearSeatOrder && (drinksList.length > 0 || dishesList.length > 0) && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                onClearSeatOrder(seat.id);
                showNotice(`U fshinë të gjitha porositë për Karrigen #${seat.id}`);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-xs font-semibold text-[#DC2626] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Fshi Porositë e Kësaj Karrigeje</span>
            </button>
          </div>
        )}
      </div>

      {/* GRAND TOTAL BILL (FAKTURA GJITHSEJ - ÇDO PIJE E SHTUAR SHKON KËTU) */}
      <div className="rounded-xl bg-[#1C1917] text-white p-4 space-y-3 shadow-sm border border-[#332E28]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#D4AF37] uppercase tracking-wider font-bold block">
                FAKTURA GJITHSEJ (TAVOLINA)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#332E28] text-[#D6CFC2] font-mono">
                {allSeats.length} karrige
              </span>
            </div>
            <div className="text-xs text-[#D6CFC2] mt-1 flex flex-wrap items-center gap-2">
              <span className="text-[#93C5FD] font-semibold">{totalDrinksAll} pije</span>
              <span className="text-[#78716C]">·</span>
              <span className="text-[#FCA5A5] font-semibold">{totalDishesAll} ushqime</span>
              <span className="text-[#78716C]">·</span>
              <span className="text-[#D6CFC2]">Çdo pije & ushqim llogaritet automatikisht</span>
            </div>
          </div>
          <div className="text-right pl-3 shrink-0">
            <span className="text-[10px] text-[#A8A29E] block uppercase font-semibold">GJITHSEJ ÇMIMI</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-[#D4AF37]">
              {grandTotal.toFixed(2)} €
            </span>
          </div>
        </div>

        {/* Clear All Orders in Bill */}
        {onClearAllOrders && grandTotal > 0 && (
          <div className="pt-2.5 border-t border-[#332E28] flex items-center justify-between gap-2">
            <span className="text-[11px] text-[#A8A29E]">Dëshironi të fshini të gjitha shpenzimet?</span>
            <button
              type="button"
              onClick={() => {
                onClearAllOrders();
                showNotice('Fatura u fshi! Të gjitha porositë u pastruan.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#332E28] hover:bg-[#DC2626] text-[#FCA5A5] hover:text-white text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
              <span>Fshi Faturën (Pastro)</span>
            </button>
          </div>
        )}
      </div>

      {/* QUICK BATCH TOOLS */}
      <div className="pt-2 border-t border-[#EFECE6] flex flex-wrap items-center gap-2">
        {onAddDrinkToAll && (
          <>
            <button
              type="button"
              onClick={() => {
                onAddDrinkToAll({ name: 'Cola', price: 1.8 });
                showNotice('U shtua nga 1 Cola (1.80 €) për të gjitha karriget!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E1DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#1C1917] transition-colors"
            >
              <span>🥤</span>
              <span>+ Cola për të gjithë (1.80 €)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAddDrinkToAll({ name: 'Birra', price: 2.0 });
                showNotice('U shtua nga 1 Birra (2.00 €) për të gjitha karriget!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E1DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#1C1917] transition-colors"
            >
              <span>🍺</span>
              <span>+ Birra për të gjithë (2.00 €)</span>
            </button>
          </>
        )}

        {onCopyOrderToAll && (drinksList.length > 0 || dishesList.length > 0) && (
          <button
            type="button"
            onClick={() => {
              onCopyOrderToAll(seat);
              showNotice(`U kopjua kjo menu & pije për të gjitha ${allSeats.length} karriget!`);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E6E1DA] hover:bg-[#FAF8F5] text-xs font-medium text-[#1C1917] transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-[#9F2B2B]" />
            <span>Kopjo këtë porosi për të gjithë</span>
          </button>
        )}
      </div>

      {/* Direct Seat Swap Control */}
      <div className="pt-3 border-t border-[#EFECE6]">
        <label
          htmlFor="swap-seat-select"
          className="block text-xs font-semibold text-[#1C1917] mb-1.5"
        >
          Ndërro Vendin me një Karrige Tjetër
        </label>
        <div className="flex items-center gap-2">
          <select
            id="swap-seat-select"
            value={swapTargetId}
            onChange={(e) => setSwapTargetId(Number(e.target.value))}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-[#D6CFC2] bg-[#FAF8F5] text-xs font-medium text-[#1C1917] focus:outline-none focus:border-[#9F2B2B]"
          >
            {allSeats
              .filter((s) => s.id !== seat.id)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  Karriga #{String(s.id).padStart(2, '0')} — {s.name.trim() || '(E lirë)'}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={() => onSwapSeats(seat.id, swapTargetId)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EFECE6] hover:bg-[#E5E0D8] text-xs font-semibold text-[#1C1917] transition-colors whitespace-nowrap shrink-0"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Ndërro
          </button>
        </div>
      </div>
    </div>
  );
};
