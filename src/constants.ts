export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Switch OLED' | 'Switch' | 'Switch Lite';
  subCategory?: string;
  rating: number;
}

export const PRODUCTS: Product[] = [
  // Switch OLED - Home Items (No subCategory)
  {
    id: 'oled-mod-h',
    name: 'Switch oled mod',
    description: 'Hardware modded Nintendo Switch OLED for ultimate versatility. Features high-speed storage and custom firmware access.',
    price: 449.99,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&q=80&w=500',
    category: 'Switch OLED',
    rating: 5,
  },
  {
    id: 'oled-mod-s',
    name: 'Switch oled mod service (local)',
    description: 'Professional local installation service. Drop off your Switch OLED and we handle the technical hardware modification.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=500',
    category: 'Switch OLED',
    rating: 5,
  },
  // Switch OLED - Shells
  {
    id: 'oled-shell-white',
    name: 'Glossy White Replacement Shell',
    description: 'Premium replacement shell for the Switch OLED. High-durability finish with precise cutouts.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1578303372704-14a089cd8b72?auto=format&fit=crop&q=80&w=500',
    category: 'Switch OLED',
    subCategory: 'Shells',
    rating: 4.8,
  },
  {
    id: 'oled-shell-red',
    name: 'Savage Red Replacement Shell',
    description: 'Give your OLED a bold new look with this vibrant red shell replacement.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=500',
    category: 'Switch OLED',
    subCategory: 'Shells',
    rating: 4.9,
  },
  // Switch OLED - Physical Mods
  {
    id: 'oled-cooling-mod',
    name: 'Internal Cooling Overhaul',
    description: 'Hardware mod to improve thermal performance. Includes high-grade thermal paste and fan optimization.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4ea3539?auto=format&fit=crop&q=80&w=500',
    category: 'Switch OLED',
    subCategory: 'Physical Mods',
    rating: 4.7,
  },
  // Switch Standard - Replaced Everything
  {
    id: 'switch-mod-h',
    name: 'Switch mod',
    description: 'Hardware modded v2 Nintendo Switch. Optimized for performance and custom environment accessibility.',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=500',
    category: 'Switch',
    rating: 5,
  },
  {
    id: 'switch-mod-s',
    name: 'Switch mod service (local)',
    description: 'Local precision hardware modification service for your standard Switch model. Quick turnaround time.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=500',
    category: 'Switch',
    rating: 5,
  },
  // Switch - Shells
  {
    id: 'switch-shell-cl',
    name: 'Clear Crystal Shell',
    description: 'Atomic Purple style translucent shell for the classic Switch experience.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1600080972464-8e5f35802446?auto=format&fit=crop&q=80&w=500',
    category: 'Switch',
    subCategory: 'Shells',
    rating: 4.8,
  },
  // Switch - Physical Mods
  {
    id: 'switch-hall-joy',
    name: 'Hall Effect Joysticks',
    description: 'Eliminate drift forever with electromagnetic Hall Effect sensor replacements.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=500',
    category: 'Switch',
    subCategory: 'Physical Mods',
    rating: 5,
  },
  {
    id: 'switch-high-bat',
    name: 'High Capacity Battery',
    description: 'Extended life internal battery replacement for longer gaming sessions.',
    price: 40.00,
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4ea3539?auto=format&fit=crop&q=80&w=500',
    category: 'Switch',
    subCategory: 'Physical Mods',
    rating: 4.9,
  },
  // Switch Lite
  {
    id: 'lite-mod-consult',
    name: 'Lite Mod Consultation',
    description: 'Free technical consultation for Switch Lite hardware modifications. Available for local and remote inquiries.',
    price: 0.00,
    image: 'https://images.unsplash.com/photo-1590650153855-d9e808231d41?auto=format&fit=crop&q=80&w=500',
    category: 'Switch Lite',
    rating: 5,
  },
  {
    id: '10',
    name: 'Nintendo Switch Lite: Mod Chip',
    description: 'Compact handheld power with custom firmware pre-installed.',
    price: 124.99,
    image: 'https://images.unsplash.com/photo-1585858091840-33698827c33d?auto=format&fit=crop&q=80&w=400',
    category: 'Switch Lite',
    rating: 4.8,
  }
];
