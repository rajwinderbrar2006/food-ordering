/* ==========================================================================
   EMBER & BOWL — Complete Menu Catalog, Add-ons & Promo Engine Data
   ========================================================================== */

window.MENU_CATEGORIES = [
  { id: 'all', name: 'All Menu', icon: '✦' },
  { id: 'pizza', name: 'Wood-Fired Pizza', icon: '🍕' },
  { id: 'burgers', name: 'Smash Burgers', icon: '🍔' },
  { id: 'bowls', name: 'Ramen & Bowls', icon: '🍜' },
  { id: 'starters', name: 'Small Plates', icon: '🥟' },
  { id: 'desserts', name: 'Desserts', icon: '🍫' },
  { id: 'drinks', name: 'Craft Drinks', icon: '🍹' }
];

window.SPICE_LEVELS = [
  { id: 'mild', label: 'Mild' },
  { id: 'medium', label: 'Balanced Medium' },
  { id: 'hot', label: 'Ember Hot' },
  { id: 'scorching', label: 'Scorching Chili' }
];

window.CATEGORY_SIZES = {
  pizza: [
    { id: 'personal', label: '11" Personal', delta: 0 },
    { id: 'share', label: '14" Feast', delta: 5.0 },
    { id: 'gf-crust', label: '11" Gluten-Free Crust', delta: 3.0 }
  ],
  burgers: [
    { id: 'single', label: 'Regular + Fries', delta: 0 },
    { id: 'deluxe', label: 'Double + Truffle Fries', delta: 4.5 }
  ],
  bowls: [
    { id: 'regular', label: 'Chef Bowl', delta: 0 },
    { id: 'large', label: 'Hungry Bowl (+35%)', delta: 4.0 }
  ],
  starters: [
    { id: 'standard', label: 'Standard Plate', delta: 0 },
    { id: 'table', label: 'Table Share (2x)', delta: 7.5 }
  ],
  desserts: [
    { id: 'solo', label: 'Single Serving', delta: 0 },
    { id: 'duo', label: 'Duo Box (2 pcs)', delta: 8.5 }
  ],
  drinks: [
    { id: 'regular', label: '12 oz Tall', delta: 0 },
    { id: 'large', label: '16 oz Carafe', delta: 2.5 }
  ]
};

window.CATEGORY_ADDONS = {
  pizza: [
    { id: 'extra-burrata', label: 'Fresh Pugliese Burrata', price: 3.5 },
    { id: 'hot-honey', label: 'Calabrian Chili Honey', price: 1.5 },
    { id: 'prosciutto', label: '24m Prosciutto di Parma', price: 4.0 },
    { id: 'garlic-dip', label: 'Roasted Garlic Herb Dip', price: 1.5 }
  ],
  burgers: [
    { id: 'wagyu-patty', label: 'Extra Wagyu Patty', price: 5.0 },
    { id: 'smoked-bacon', label: 'Applewood Bacon', price: 2.75 },
    { id: 'fried-egg', label: 'Sunny Pasture Egg', price: 2.0 },
    { id: 'truffle-aioli', label: 'Black Truffle Aioli', price: 1.5 }
  ],
  bowls: [
    { id: 'jammy-egg', label: 'Soy Jammy Ramen Egg', price: 2.0 },
    { id: 'extra-protein', label: 'Extra Seared Protein', price: 5.5 },
    { id: 'avocado', label: 'Half Hass Avocado', price: 2.5 },
    { id: 'chili-crisp', label: 'House Garlic Chili Crisp', price: 1.25 }
  ],
  starters: [
    { id: 'extra-sauce', label: 'Double Dipping Sauces', price: 1.5 },
    { id: 'sesame-slaw', label: 'Yuzu Sesame Slaw', price: 3.0 }
  ],
  desserts: [
    { id: 'extra-gelato', label: 'Extra Vanilla Gelato', price: 3.0 },
    { id: 'miso-caramel', label: 'Warm Miso Caramel Pour', price: 1.75 }
  ],
  drinks: [
    { id: 'boba-pearls', label: 'Yuzu Bursting Pearls', price: 1.5 },
    { id: 'espresso-shot', label: 'Single-Origin Shot', price: 1.75 }
  ]
};

window.PROMO_CODES = {
  EMBER20: { type: 'percent', value: 0.2, minOrder: 0, label: '20% Off Entire Order' },
  WELCOME10: { type: 'fixed', value: 10.0, minOrder: 25, label: '$10 Off Orders $25+' },
  FREESHIP: { type: 'freeship', value: 0, minOrder: 0, label: 'Free Express Delivery' }
};

window.DISHES = [
  // Wood-Fired Pizza
  {
    id: 'pizza-burrata',
    name: 'Burrata & Chili Honey Pie',
    category: 'pizza',
    price: 19.50,
    rating: 4.9,
    prepTime: 16,
    calories: 780,
    protein: '32g',
    tags: ['signature'],
    spicyDefault: 'mild',
    allowSpice: true,
    image: 'assets/images/pizza-burrata.jpg',
    description: '72-hour blistered sourdough crust topped with crushed San Marzano tomatoes, creamy pugliese burrata, fresh basil, and Calabrian chili honey.'
  },
  {
    id: 'pizza-truffle',
    name: 'Black Truffle & Wild Funghi',
    category: 'pizza',
    price: 22.00,
    rating: 4.9,
    prepTime: 17,
    calories: 820,
    protein: '29g',
    tags: ['signature'],
    spicyDefault: 'mild',
    allowSpice: false,
    image: 'assets/images/pizza-truffle.jpg',
    description: 'Wood-roasted cremini and maitake mushrooms over aged fontina, whipped roasted garlic cream, lemon thyme, and shaved black truffle.'
  },
  {
    id: 'pizza-diavola',
    name: 'Smoked Pepperoni Diavola',
    category: 'pizza',
    price: 20.50,
    rating: 4.8,
    prepTime: 15,
    calories: 890,
    protein: '38g',
    tags: ['spicy', 'high-protein'],
    spicyDefault: 'hot',
    allowSpice: true,
    image: 'assets/images/pizza-burrata.jpg',
    description: 'Crispy natural-casing cup pepperoni, smoked mozzarella, charred red shallots, wild oregano, and spiced wildflower hot honey.'
  },

  // Smash Burgers
  {
    id: 'burger-wagyu',
    name: 'Double Wagyu Smash Burger',
    category: 'burgers',
    price: 18.50,
    rating: 4.9,
    prepTime: 14,
    calories: 920,
    protein: '46g',
    tags: ['signature', 'high-protein'],
    spicyDefault: 'mild',
    allowSpice: true,
    image: 'assets/images/burger-wagyu.jpg',
    description: 'Two lacy-edged dry-aged wagyu patties, aged Vermont cheddar, balsamic caramelized onions, house dill pickles, and truffle-garlic aioli with rosemary fries.'
  },
  {
    id: 'burger-chicken',
    name: 'Gochujang Crispy Chicken',
    category: 'burgers',
    price: 16.50,
    rating: 4.8,
    prepTime: 15,
    calories: 810,
    protein: '39g',
    tags: ['spicy', 'high-protein'],
    spicyDefault: 'hot',
    allowSpice: true,
    image: 'assets/images/starter-chicken.jpg',
    description: 'Buttermilk-brined thigh glazed in smoky gochujang-honey, crunchy yuzu cabbage slaw, pickled daikon, and roasted sesame kewpie on toasted brioche.'
  },
  {
    id: 'burger-plant',
    name: 'Shiitake & Black Bean Melt',
    category: 'burgers',
    price: 15.50,
    rating: 4.7,
    prepTime: 14,
    calories: 690,
    protein: '24g',
    tags: ['vegan'],
    spicyDefault: 'medium',
    allowSpice: true,
    image: 'assets/images/burger-wagyu.jpg',
    description: 'House-roasted shiitake and black bean patty, smoked cashew cheddar, avocado mash, crispy shallots, and smoky chipotle crema on seeded brioche.'
  },

  // Ramen & Nourish Bowls
  {
    id: 'ramen-tonkotsu',
    name: 'Spicy Tonkotsu Miso Ramen',
    category: 'bowls',
    price: 19.00,
    rating: 4.9,
    prepTime: 18,
    calories: 760,
    protein: '41g',
    tags: ['signature', 'spicy', 'high-protein'],
    spicyDefault: 'hot',
    allowSpice: true,
    image: 'assets/images/ramen-tonkotsu.jpg',
    description: '18-hour slow-simmered pork & red miso broth, torched chashu pork belly, soy-marinated jammy egg, crispy nori, scallions, and chili oil.'
  },
  {
    id: 'bowl-poke',
    name: 'Seared Ahi Tuna Yuzu Poke',
    category: 'bowls',
    price: 20.00,
    rating: 4.8,
    prepTime: 12,
    calories: 610,
    protein: '42g',
    tags: ['gf', 'high-protein'],
    spicyDefault: 'mild',
    allowSpice: true,
    image: 'assets/images/bowl-poke.jpg',
    description: 'Sashimi-grade seared yellowfin tuna, Hass avocado, shelled edamame, pickled ginger, crispy shallots, toasted sesame, and bright yuzu ponzu glaze.'
  },
  {
    id: 'bowl-salmon',
    name: 'Miso Salmon & Forbidden Rice',
    category: 'bowls',
    price: 21.50,
    rating: 4.9,
    prepTime: 16,
    calories: 680,
    protein: '44g',
    tags: ['signature', 'gf', 'high-protein'],
    spicyDefault: 'mild',
    allowSpice: true,
    image: 'assets/images/bowl-salmon.jpg',
    description: 'Cedar-roasted Atlantic salmon glazed in sweet white miso, heirloom black rice, roasted sweet potato, crispy kale, and lemon tahini drizzle.'
  },
  {
    id: 'bowl-vegan',
    name: 'Crispy Five-Spice Tofu Bowl',
    category: 'bowls',
    price: 16.00,
    rating: 4.7,
    prepTime: 13,
    calories: 560,
    protein: '26g',
    tags: ['vegan', 'gf'],
    spicyDefault: 'medium',
    allowSpice: true,
    image: 'assets/images/bowl-poke.jpg',
    description: 'Crisp organic tofu, charred broccolini, miso-roasted kabocha squash, pickled red cabbage, jasmine brown rice, and ginger-peanut emulsion.'
  },

  // Small Plates & Starters
  {
    id: 'starter-bao',
    name: 'Pork Belly & Shiitake Gua Bao',
    category: 'starters',
    price: 14.50,
    rating: 4.9,
    prepTime: 12,
    calories: 540,
    protein: '22g',
    tags: ['signature'],
    spicyDefault: 'mild',
    allowSpice: true,
    image: 'assets/images/starter-bao.jpg',
    description: 'Three pillow-soft steamed bao buns stuffed with 6-hour soy-braised pork belly, crispy shiitake, hoisin glaze, crushed peanuts, and cilantro.'
  },
  {
    id: 'starter-chicken',
    name: 'Seoul Crispy Chicken Bites',
    category: 'starters',
    price: 13.50,
    rating: 4.8,
    prepTime: 12,
    calories: 590,
    protein: '34g',
    tags: ['spicy', 'high-protein'],
    spicyDefault: 'hot',
    allowSpice: true,
    image: 'assets/images/starter-chicken.jpg',
    description: 'Twice-fried crunchy boneless chicken bites lacquered in sweet-heat gochujang glaze with toasted sesame seeds and crisp pickled daikon.'
  },
  {
    id: 'starter-cauli',
    name: 'Harissa Roasted Cauliflower',
    category: 'starters',
    price: 12.00,
    rating: 4.7,
    prepTime: 14,
    calories: 410,
    protein: '11g',
    tags: ['vegan', 'spicy'],
    spicyDefault: 'medium',
    allowSpice: true,
    image: 'assets/images/starter-bao.jpg',
    description: 'Tempura-crisp cauliflower florets glazed in smoky rose harissa & maple, finished with toasted almond dukkah and whipped herb coconut crema.'
  },
  {
    id: 'starter-fries',
    name: 'Truffle Parm & Rosemary Frites',
    category: 'starters',
    price: 9.50,
    rating: 4.8,
    prepTime: 10,
    calories: 480,
    protein: '12g',
    tags: ['gf'],
    spicyDefault: 'mild',
    allowSpice: false,
    image: 'assets/images/burger-wagyu.jpg',
    description: 'Double-fried hand-cut Kennebec potatoes tossed with 24-month Parmigiano-Reggiano, crispy rosemary needles, and roasted black garlic aioli.'
  },

  // Desserts
  {
    id: 'dessert-lava',
    name: 'Molten Valrhona Lava Cake',
    category: 'desserts',
    price: 11.50,
    rating: 5.0,
    prepTime: 14,
    calories: 590,
    protein: '9g',
    tags: ['signature'],
    spicyDefault: 'mild',
    allowSpice: false,
    image: 'assets/images/dessert-lava.jpg',
    description: 'Warm 70% dark Valrhona chocolate fondant cake oozing rich ganache, drizzled with salted miso caramel alongside vanilla bean gelato.'
  },
  {
    id: 'dessert-matcha',
    name: 'Uji Matcha Mascarpone Tiramisu',
    category: 'desserts',
    price: 10.50,
    rating: 4.9,
    prepTime: 8,
    calories: 440,
    protein: '8g',
    tags: ['signature'],
    spicyDefault: 'mild',
    allowSpice: false,
    image: 'assets/images/dessert-matcha.jpg',
    description: 'Delicate savoiardi soaked in ceremonial Uji matcha & espresso, layered with whipped mascarpone zabaglione and bright yuzu zest.'
  },

  // Craft Drinks
  {
    id: 'drink-yuzu',
    name: 'Yuzu Blood Orange Spritz',
    category: 'drinks',
    price: 7.50,
    rating: 4.9,
    prepTime: 5,
    calories: 95,
    protein: '0g',
    tags: ['vegan', 'gf'],
    spicyDefault: 'mild',
    allowSpice: false,
    image: 'assets/images/drink-elixirs.jpg',
    description: 'Cold-pressed Sicilian blood orange and Japanese yuzu juice layered with botanical gentian bitters, sparkling mineral water, and charred rosemary.'
  },
  {
    id: 'drink-matcha',
    name: 'Iced Ceremonial Matcha Oat',
    category: 'drinks',
    price: 7.00,
    rating: 4.8,
    prepTime: 5,
    calories: 140,
    protein: '4g',
    tags: ['vegan', 'gf'],
    spicyDefault: 'mild',
    allowSpice: false,
    image: 'assets/images/drink-elixirs.jpg',
    description: 'First-harvest ceremonial Kyoto matcha hand-whisked to order over silky barista oat milk and lightly toasted raw cane syrup.'
  }
];
