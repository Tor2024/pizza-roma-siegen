'use client';
import { useLanguage } from '@/context/LanguageContext';
import MenuCard from './MenuCard';

interface Topping {
  id: string;
  name: { de: string; ru: string };
  price: number;
}

interface MenuItem {
  id: string;
  image: string;
  name: { de: string; ru: string };
  desc: { de: string; ru: string };
  prices: { [size: string]: number };
  toppings: Topping[];
}

const menuData: { pizzas: MenuItem[]; pasta: MenuItem[]; salads: MenuItem[]; drinks: MenuItem[]; desserts: MenuItem[] } = {
  pizzas: [
    {
      id: 'p1',
      image: '/images/pizza-margherita.webp',
      name: { de: 'Margherita Classic', ru: 'Маргарита Классик' },
      desc: { de: 'Tomatensauce, Mozzarella, Basilikum', ru: 'Томатный соус, Моцарелла, Базилик' },
      prices: { '26': 8.90, '32': 11.90, '40': 15.90 },
      toppings: [
        { id: 't1', name: { de: 'Extra Käse', ru: 'Доп. сыр' }, price: 1.50 },
        { id: 't2', name: { de: 'Oliven', ru: 'Оливки' }, price: 1.00 }
      ]
    },
    {
      id: 'p2',
      image: '/images/pizza-salami.webp',
      name: { de: 'Salami', ru: 'Салями' },
      desc: { de: 'Tomatensauce, Mozzarella, Salami', ru: 'Томатный соус, Моцарелла, Салями' },
      prices: { '26': 9.90, '32': 12.90, '40': 16.90 },
      toppings: [
        { id: 't1', name: { de: 'Extra Käse', ru: 'Доп. сыр' }, price: 1.50 },
        { id: 't3', name: { de: 'Pepperoni', ru: 'Пепперони' }, price: 1.50 }
      ]
    },
    {
      id: 'p3',
      image: '/images/pizza-tonno.webp',
      name: { de: 'Tonno', ru: 'Тонно' },
      desc: { de: 'Tomatensauce, Mozzarella, Thunfisch, Zwiebeln', ru: 'Томатный соус, Моцарелла, Тунец, Лук' },
      prices: { '26': 10.50, '32': 13.50, '40': 17.50 },
      toppings: [
        { id: 't1', name: { de: 'Extra Käse', ru: 'Доп. сыр' }, price: 1.50 },
        { id: 't2', name: { de: 'Oliven', ru: 'Оливки' }, price: 1.00 }
      ]
    },
    {
      id: 'p4',
      image: '/images/pizza-diavola.webp',
      name: { de: 'Diavola', ru: 'Дьявола' },
      desc: { de: 'Tomatensauce, Mozzarella, Scharfe Salami, Chili', ru: 'Томатный соус, Моцарелла, Острая салями, Чили' },
      prices: { '26': 10.90, '32': 13.90, '40': 17.90 },
      toppings: [
        { id: 't1', name: { de: 'Extra Käse', ru: 'Доп. сыр' }, price: 1.50 },
        { id: 't4', name: { de: 'Extra Chili', ru: 'Доп. чили' }, price: 0.50 }
      ]
    },
    {
      id: 'p5',
      image: '/images/pizza-quattro.webp',
      name: { de: 'Quattro Formaggi', ru: 'Четыре сыра' },
      desc: { de: 'Mozzarella, Gorgonzola, Parmesan, Emmentaler', ru: 'Моцарелла, Горгонзола, Пармезан, Эмменталер' },
      prices: { '26': 11.50, '32': 14.50, '40': 18.50 },
      toppings: [
        { id: 't5', name: { de: 'Honig', ru: 'Мед' }, price: 1.00 },
        { id: 't6', name: { de: 'Walnüsse', ru: 'Грецкие орехи' }, price: 1.50 }
      ]
    },
    {
      id: 'p6',
      image: '/images/pizza-prosciutto.webp',
      name: { de: 'Prosciutto Funghi', ru: 'Прошутто Фунги' },
      desc: { de: 'Tomatensauce, Mozzarella, Schinken, Champignons', ru: 'Томатный соус, Моцарелла, Ветчина, Грибы' },
      prices: { '26': 10.90, '32': 13.90, '40': 17.90 },
      toppings: [
        { id: 't1', name: { de: 'Extra Käse', ru: 'Доп. сыр' }, price: 1.50 },
        { id: 't7', name: { de: 'Trüffelöl', ru: 'Трюфельное масло' }, price: 2.00 }
      ]
    }
  ],
  pasta: [
    {
      id: 'pas1',
      image: '/images/pasta-carb.webp',
      name: { de: 'Pasta Carbonara', ru: 'Паста Карбонара' },
      desc: { de: 'Speck, Sahmesauce, Parmesan', ru: 'Бекон, сливочный соус, Пармезан' },
      prices: { '1': 11.90 },
      toppings: []
    },
    {
      id: 'pas2',
      image: '/images/pasta-bolo.webp',
      name: { de: 'Pasta Bolognese', ru: 'Паста Болоньезе' },
      desc: { de: 'Rindfleischsauce, Parmesan', ru: 'Мясной соус, Пармезан' },
      prices: { '1': 10.90 },
      toppings: []
    }
  ],
  salads: [
    {
      id: 's1',
      image: '/images/salad-caesar.webp',
      name: { de: 'Caesar Salad', ru: 'Салат Цезарь' },
      desc: { de: 'Römersalat, Croutons, Parmesan, Caesar-Dressing', ru: 'Салат романо, крутоны, пармезан, соус Цезарь' },
      prices: { '1': 8.90 },
      toppings: [
        { id: 's1', name: { de: 'Hähnchenbrust', ru: 'Куриная грудка' }, price: 3.50 },
        { id: 's2', name: { de: 'Extra Parmesan', ru: 'Доп. пармезан' }, price: 1.50 }
      ]
    },
    {
      id: 's2',
      image: '/images/salad-mista.webp',
      name: { de: 'Insalata Mista', ru: 'Смешанный салат' },
      desc: { de: 'Gemischter Blattsalat, Tomaten, Gurken, Oliven', ru: 'Смешанный листовой салат, томаты, огурцы, оливки' },
      prices: { '1': 7.50 },
      toppings: [
        { id: 's3', name: { de: 'Thunfisch', ru: 'Тунец' }, price: 2.50 },
        { id: 's4', name: { de: 'Mozzarella', ru: 'Моцарелла' }, price: 2.00 }
      ]
    },
    {
      id: 's3',
      image: '/images/salad-tomate.webp',
      name: { de: 'Tomaten-Mozzarella', ru: 'Томат с моцареллой' },
      desc: { de: 'Frische Tomaten, Büffelmozzarella, Basilikum, Olivenöl', ru: 'Свежие томаты, буйволиная моцарелла, базилик, оливковое масло' },
      prices: { '1': 9.90 },
      toppings: [
        { id: 's5', name: { de: 'Rucola', ru: 'Руккола' }, price: 1.50 },
        { id: 's6', name: { de: 'Balsamico', ru: 'Бальзамико' }, price: 0.50 }
      ]
    }
  ],
  drinks: [
    {
      id: 'd1',
      image: '/images/drink-cola.webp',
      name: { de: 'Coca Cola 0,5L', ru: 'Кока-Кола 0,5л' },
      desc: { de: 'Eisgekühlt', ru: 'Ледяная' },
      prices: { '1': 2.90 },
      toppings: []
    },
    {
      id: 'd2',
      image: '/images/drink-fanta.webp',
      name: { de: 'Fanta 0,5L', ru: 'Фанта 0,5л' },
      desc: { de: 'Orange, erfrischend', ru: 'Апельсин, освежающая' },
      prices: { '1': 2.90 },
      toppings: []
    },
    {
      id: 'd3',
      image: '/images/drink-sprite.webp',
      name: { de: 'Sprite 0,5L', ru: 'Спрайт 0,5л' },
      desc: { de: 'Lemon-Lime, erfrischend', ru: 'Лимон-лайм, освежающий' },
      prices: { '1': 2.90 },
      toppings: []
    },
    {
      id: 'd4',
      image: '/images/drink-water.webp',
      name: { de: 'Mineralwasser 0,5L', ru: 'Минеральная вода 0,5л' },
      desc: { de: 'Mit oder ohne Kohlensäure', ru: 'С газом или без' },
      prices: { '1': 2.50 },
      toppings: []
    },
    {
      id: 'd5',
      image: '/images/drink-beer.webp',
      name: { de: 'Bier 0,5L', ru: 'Пиво 0,5л' },
      desc: { de: 'Deutsches Pils', ru: 'Немецкий пилснер' },
      prices: { '1': 3.90 },
      toppings: []
    }
  ],
  desserts: [
    {
      id: 'de1',
      image: '/images/dessert-tiramisu.webp',
      name: { de: 'Tiramisu', ru: 'Тирамису' },
      desc: { de: 'Hausgemacht, klassisch italienisch', ru: 'Домашнее, классическое итальянское' },
      prices: { '1': 5.90 },
      toppings: [
        { id: 'de1', name: { de: 'Extra Kakao', ru: 'Доп. какао' }, price: 0.50 }
      ]
    },
    {
      id: 'de2',
      image: '/images/dessert-panna.webp',
      name: { de: 'Panna Cotta', ru: 'Панна-котта' },
      desc: { de: 'Mit Erdbeersauce', ru: 'С клубничным соусом' },
      prices: { '1': 5.50 },
      toppings: [
        { id: 'de2', name: { de: 'Beerenmix', ru: 'Ягодный микс' }, price: 1.50 }
      ]
    },
    {
      id: 'de3',
      image: '/images/dessert-ice.webp',
      name: { de: 'Eis 3 Kugeln', ru: 'Мороженое 3 шарика' },
      desc: { de: 'Vanille, Schoko, Erdbeere', ru: 'Ваниль, шоколад, клубника' },
      prices: { '1': 4.90 },
      toppings: [
        { id: 'de3', name: { de: 'Sahne', ru: 'Сливки' }, price: 0.50 },
        { id: 'de4', name: { de: 'Schokosoße', ru: 'Шоколадный соус' }, price: 0.50 }
      ]
    }
  ]
};

export default function MenuSection() {
  const { lang, t } = useLanguage();

  return (
    <section id="menu" className="py-24 bg-roma-gray">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-poppins font-bold text-roma-dark">{t('nav_menu')}</h2>
          <div className="w-20 h-1 bg-roma-red mx-auto mt-4"></div>
        </div>

        {/* Category filter (Desktop) */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {['Pizza', 'Pasta', 'Salate', 'Getränke', 'Desserts'].map(cat => (
            <button key={cat} className="px-6 py-2 rounded-full bg-roma-dark/5 hover:bg-roma-red hover:text-white text-roma-dark font-poppins font-semibold transition-all">
              {cat}
            </button>
          ))}
        </div>

        {/* Pizza grid */}
        <h3 className="text-3xl font-poppins font-bold text-roma-dark mb-8 border-l-4 border-roma-red pl-4">Pizza</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {menuData.pizzas.map(pizza => <MenuCard key={pizza.id} {...pizza} />)}
        </div>

        {/* Pasta grid */}
        <h3 className="text-3xl font-poppins font-bold text-roma-dark mb-8 border-l-4 border-roma-gold pl-4">Pasta</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {menuData.pasta.map(p => <MenuCard key={p.id} {...p} />)}
        </div>

        {/* Salads grid */}
        <h3 className="text-3xl font-poppins font-bold text-roma-dark mb-8 border-l-4 border-green-500 pl-4">Salate / Салаты</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {menuData.salads.map(s => <MenuCard key={s.id} {...s} />)}
        </div>

        {/* Drinks grid */}
        <h3 className="text-3xl font-poppins font-bold text-roma-dark mb-8 border-l-4 border-blue-500 pl-4">Getränke / Напитки</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {menuData.drinks.map(d => <MenuCard key={d.id} {...d} />)}
        </div>

        {/* Desserts grid */}
        <h3 className="text-3xl font-poppins font-bold text-roma-dark mb-8 border-l-4 border-pink-500 pl-4">Desserts / Десерты</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuData.desserts.map(d => <MenuCard key={d.id} {...d} />)}
        </div>
      </div>
    </section>
  );
}
