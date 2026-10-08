export type GuestRole = 'festari' | 'familja' | 'miqte' | 'koleget' | 'femije';

export type DietaryOption = 'klasike' | 'peshk' | 'vegjetariane' | 'pa-gluten' | 'femije';

export type TableShape = 'sides-parallel' | 'grand-oval' | 'u-shape' | 'double-banquet';

export type CenterpieceTheme = 'torta-dhe-qirinj' | 'lule-festive' | 'minimal-shampanje';

export type ViewMode = 'tavolina' | 'lista' | 'kartat' | 'menu' | 'fatura';

export interface OrderItem {
  id: string;
  name: string;
  category: 'pije' | 'ushqim' | 'embelsire';
  price: number; // in Euro €
  quantity: number;
}

export interface Seat {
  id: number;
  name: string;
  role: GuestRole;
  dietary: DietaryOption;
  note: string;
  confirmed: boolean;
  drinks: OrderItem[];
  dishes: OrderItem[];
}

export interface EventDetails {
  title: string;
  celebrant: string;
  date: string;
  venue: string;
  capacity: 18 | 20;
  tableShape: TableShape;
  centerpiece: CenterpieceTheme;
  generalNotes: string;
}

export const ROLE_LABELS: Record<GuestRole, string> = {
  festari: 'Festari/ja e Ditëlindjes',
  familja: 'Familja',
  miqte: 'Miqtë e Ngushtë',
  koleget: 'Kolegët & Të Ftuar',
  femije: 'Fëmijë',
};

export const ROLE_SHORT_LABELS: Record<GuestRole, string> = {
  festari: 'Festari/ja',
  familja: 'Familja',
  miqte: 'Miq',
  koleget: 'Kolegë',
  femije: 'Fëmijë',
};

export const DIETARY_LABELS: Record<DietaryOption, string> = {
  klasike: 'Menu Klasike',
  peshk: 'Menu Peshku',
  vegjetariane: 'Vegjetariane',
  'pa-gluten': 'Pa Gluten',
  femije: 'Menu Fëmijësh',
};

export const TABLE_SHAPE_LABELS: Record<TableShape, { name: string; subtitle: string }> = {
  'sides-parallel': {
    name: 'Të Gjitha Anash (Përballë)',
    subtitle: 'Karriget anash lart dhe poshtë, kreu dhe fundi të lirë',
  },
  'grand-oval': {
    name: 'Tavolinë Ovale Anash',
    subtitle: 'Karriget e shpërndara anash simetrikisht',
  },
  'u-shape': {
    name: 'Formë U-je (Anash)',
    subtitle: 'Karriget të vendosura anash në krahët e tavolinës',
  },
  'double-banquet': {
    name: '2 Tavolina Anash',
    subtitle: 'Ndarje në dy tavolina paralele',
  },
};

export const DEFAULT_DRINKS_CATALOG: { name: string; price: number; icon: string }[] = [
  { name: 'Cola', price: 1.80, icon: '🥤' },
  { name: 'Birra', price: 2.00, icon: '🍺' },
];

export const DEFAULT_DISHES_CATALOG: { name: string; price: number; icon: string }[] = [
  { name: 'Skenderbeg', price: 10.0, icon: '🥩' },
  { name: 'Peshk', price: 13.0, icon: '🐟' },
  { name: 'Biftek', price: 16.0, icon: '🥩' },
  { name: 'Pizza', price: 7.0, icon: '🍕' },
  { name: 'Sallatë', price: 4.0, icon: '🥗' },
];

export function calculateSeatTotal(seat: Seat): number {
  const drinksTotal = (seat.drinks || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const dishesTotal = (seat.dishes || []).reduce((acc, item) => acc + (item.price * item.quantity), 0);
  return drinksTotal + dishesTotal;
}

export const INITIAL_EVENT_DETAILS: EventDetails = {
  title: 'Darka Festive e Ditëlindjes',
  celebrant: 'Mërgim',
  date: 'E Shtunë, 24 Tetor · Ora 20:00',
  venue: 'Salla Solemne · Tavolina e Gjatë',
  capacity: 20,
  tableShape: 'sides-parallel',
  centerpiece: 'torta-dhe-qirinj',
  generalNotes:
    'Karriget te Kreu i Tavolinës dhe Ballë Tavoline janë hequr. Të 20 karriget janë vetëm anash (10 lart dhe 10 poshtë përballë njëra-tjetrës).',
};

export const ALL_SAMPLE_NAMES = [
  'Mërgim Dakaj',
  'Arbnora Dakaj',
  'Besnik Krasniqi',
  'Teuta Krasniqi',
  'Drilon Berisha',
  'Elira Berisha',
  'Alban Gashi',
  'Fjolla Gashi',
  'Valon Morina',
  'Kaltrina Hoxha',
  'Luan Rexhepi',
  'Drita Dakaj',
  'Ilir Kastrati',
  'Mimoza Kastrati',
  'Kushtrim Bytyqi',
  'Blerina Bytyqi',
  'Gentian Shala',
  'Saranda Shala',
  'Ylber Kelmendi',
  'Vlera Kelmendi',
];

export function getSampleSeats(count: 18 | 20): Seat[] {
  return Array.from({ length: count }, (_, idx) => {
    const id = idx + 1;
    const name = ALL_SAMPLE_NAMES[idx] || '';
    const isFestari = idx === 0;
    const role: GuestRole = isFestari ? 'festari' : idx < 4 ? 'familja' : idx < 12 ? 'miqte' : 'koleget';
    const dietary: DietaryOption = idx === 3 || idx === 13 ? 'peshk' : idx === 5 || idx === 17 ? 'vegjetariane' : idx === 9 ? 'pa-gluten' : 'klasike';
    
    // Sample drinks and dishes from the exact menu
    const drinks: OrderItem[] = [
      {
        id: `d1-${id}`,
        name: idx % 2 === 0 ? 'Cola' : 'Birra',
        category: 'pije',
        price: idx % 2 === 0 ? 1.80 : 2.00,
        quantity: 1,
      },
    ];

    const menuDishes = [
      { name: 'Skenderbeg', price: 10.0 },
      { name: 'Peshk', price: 13.0 },
      { name: 'Biftek', price: 16.0 },
      { name: 'Pizza', price: 7.0 },
      { name: 'Sallatë', price: 4.0 },
    ];
    const dishPick = menuDishes[idx % 5];

    const dishes: OrderItem[] = [
      {
        id: `f1-${id}`,
        name: dishPick.name,
        category: 'ushqim',
        price: dishPick.price,
        quantity: 1,
      },
    ];

    return {
      id,
      name,
      role,
      dietary,
      note: isFestari ? 'Festari i Ditëlindjes' : '',
      confirmed: true,
      drinks,
      dishes,
    };
  });
}

export function createEmptySeats(count: 18 | 20): Seat[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: idx + 1,
    name: '',
    role: idx === 0 ? 'festari' : 'miqte',
    dietary: 'klasike',
    note: '',
    confirmed: false,
    drinks: [],
    dishes: [],
  }));
}


