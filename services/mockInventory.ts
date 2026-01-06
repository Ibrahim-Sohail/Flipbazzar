import { Product, SearchParams } from '../types';

const MOCK_INVENTORY: Product[] = [
  {
    id: 'p1',
    name: 'Pixel 8 Pro',
    category: 'smartphone',
    price: 999,
    description: 'Google\'s pro-level phone with advanced AI cameras.',
    specs: 'Tensor G3, 12GB RAM, 128GB Storage, 50MP Camera',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/300/300?random=1',
    inStock: true,
    tags: ['android', 'google', 'camera', 'ai', 'flagship', 'photo', 'photography'],
  },
  {
    id: 'p2',
    name: 'Galaxy S24 Ultra',
    category: 'smartphone',
    price: 1299,
    description: 'The ultimate Android experience with S-Pen.',
    specs: 'Snapdragon 8 Gen 3, 200MP Camera, 12GB RAM',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/300/300?random=2',
    inStock: true,
    tags: ['android', 'samsung', 'stylus', 'productivity', 'big screen', 'zoom', 'business'],
  },
  {
    id: 'p3',
    name: 'iPhone 15',
    category: 'smartphone',
    price: 799,
    description: 'The standard for smartphones with Dynamic Island.',
    specs: 'A16 Bionic, 48MP Camera, 6.1" Display',
    rating: 4.7,
    imageUrl: 'https://picsum.photos/300/300?random=3',
    inStock: true,
    tags: ['apple', 'ios', 'simple', 'reliable', 'video', 'social media'],
  },
  {
    id: 'p4',
    name: 'Sony WH-1000XM5',
    category: 'audio',
    price: 349,
    description: 'Industry-leading noise canceling headphones.',
    specs: '30hr Battery, LDAC, Noise Canceling',
    rating: 4.8,
    imageUrl: 'https://picsum.photos/300/300?random=4',
    inStock: true,
    tags: ['music', 'travel', 'quiet', 'anc', 'wireless', 'bluetooth', 'comfort'],
  },
  {
    id: 'p5',
    name: 'MacBook Air M3',
    category: 'laptop',
    price: 1099,
    description: 'Supercharged by M3, incredibly thin and light.',
    specs: 'M3 Chip, 8GB RAM, 256GB SSD, 13.6" Liquid Retina',
    rating: 4.9,
    imageUrl: 'https://picsum.photos/300/300?random=5',
    inStock: false,
    tags: ['apple', 'macos', 'coding', 'student', 'lightweight', 'battery', 'work', 'writing'],
  },
  {
    id: 'p6',
    name: 'Dell XPS 13',
    category: 'laptop',
    price: 999,
    description: 'Compact and powerful Windows ultrabook.',
    specs: 'Intel Core Ultra 7, 16GB RAM, 512GB SSD',
    rating: 4.5,
    imageUrl: 'https://picsum.photos/300/300?random=6',
    inStock: true,
    tags: ['windows', 'business', 'premium', 'thin', 'portability', 'office'],
  },
  {
    id: 'p7',
    name: 'Budget King X1',
    category: 'smartphone',
    price: 299,
    description: 'Great value for money with decent performance.',
    specs: 'MediaTek Dimensity, 5000mAh Battery, 90Hz Screen',
    rating: 4.2,
    imageUrl: 'https://picsum.photos/300/300?random=7',
    inStock: true,
    tags: ['cheap', 'affordable', 'battery', 'kids', 'starter', 'basic'],
  }
];

export const searchInventory = async (params: SearchParams): Promise<Product[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return MOCK_INVENTORY.filter(product => {
    let match = true;

    if (params.category && params.category !== 'all') {
      match = match && product.category.toLowerCase().includes(params.category.toLowerCase());
    }

    if (params.maxPrice) {
      match = match && product.price <= params.maxPrice;
    }

    if (params.query) {
      const queryLower = params.query.toLowerCase();
      // Enhanced search: Check tags as well as name/description
      const matchesText = 
        product.name.toLowerCase().includes(queryLower) ||
        product.description.toLowerCase().includes(queryLower) ||
        product.specs.toLowerCase().includes(queryLower) ||
        product.tags.some(tag => tag.includes(queryLower));
      
      match = match && matchesText;
    }

    return match;
  });
};