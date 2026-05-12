export interface FoodItem {
  id: string;
  name: string;
  serving: string;
  servingType: 'cup' | 'piece' | 'gram';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

export const foodDatabase: FoodItem[] = [
  // Grains & Carbs
  { id: 'rice-1cup', name: 'Rice', serving: '1 cup cooked', servingType: 'cup', calories: 206, protein: 4, carbs: 45, fat: 0.4, category: 'Grains & Carbs' },
  { id: 'rice-2cup', name: 'Rice (double)', serving: '2 cups cooked', servingType: 'cup', calories: 412, protein: 8, carbs: 90, fat: 0.8, category: 'Grains & Carbs' },
  { id: 'roti', name: 'Roti / Chapati', serving: '1 piece', servingType: 'piece', calories: 71, protein: 3, carbs: 15, fat: 0.4, category: 'Grains & Carbs' },
  { id: 'paratha', name: 'Paratha', serving: '1 piece', servingType: 'piece', calories: 160, protein: 4, carbs: 24, fat: 6, category: 'Grains & Carbs' },
  { id: 'bread', name: 'Bread', serving: '1 slice', servingType: 'piece', calories: 79, protein: 3, carbs: 15, fat: 1, category: 'Grains & Carbs' },
  { id: 'poha', name: 'Poha', serving: '1 cup', servingType: 'cup', calories: 180, protein: 3, carbs: 36, fat: 2, category: 'Grains & Carbs' },
  { id: 'oats', name: 'Oats', serving: '1 cup cooked', servingType: 'cup', calories: 154, protein: 6, carbs: 27, fat: 3, category: 'Grains & Carbs' },

  // Protein Sources
  { id: 'chicken', name: 'Chicken', serving: '1 cup (~150g)', servingType: 'cup', calories: 247, protein: 38, carbs: 0, fat: 10, category: 'Protein' },
  { id: 'egg', name: 'Egg (boiled)', serving: '1 egg', servingType: 'piece', calories: 78, protein: 6, carbs: 0.6, fat: 5, category: 'Protein' },
  { id: 'fish', name: 'Fish', serving: '1 cup (~150g)', servingType: 'cup', calories: 194, protein: 30, carbs: 0, fat: 8, category: 'Protein' },
  { id: 'dal', name: 'Dal / Lentils', serving: '1 cup cooked', servingType: 'cup', calories: 230, protein: 18, carbs: 40, fat: 1, category: 'Protein' },
  { id: 'paneer', name: 'Paneer', serving: '100g', servingType: 'gram', calories: 265, protein: 18, carbs: 3, fat: 20, category: 'Protein' },
  { id: 'curd', name: 'Curd / Yogurt', serving: '1 cup', servingType: 'cup', calories: 100, protein: 8, carbs: 11, fat: 3, category: 'Protein' },
  { id: 'moong-dal', name: 'Moong Dal', serving: '1 cup cooked', servingType: 'cup', calories: 212, protein: 14, carbs: 38, fat: 0.8, category: 'Protein' },
  { id: 'rajma', name: 'Rajma', serving: '1 cup cooked', servingType: 'cup', calories: 225, protein: 15, carbs: 40, fat: 1, category: 'Protein' },
  { id: 'chana', name: 'Chana / Chickpeas', serving: '1 cup cooked', servingType: 'cup', calories: 269, protein: 15, carbs: 45, fat: 4, category: 'Protein' },

  // Vegetables
  { id: 'mixed-veg', name: 'Mixed Vegetables', serving: '1 cup cooked', servingType: 'cup', calories: 80, protein: 3, carbs: 15, fat: 1, category: 'Vegetables' },
  { id: 'potato', name: 'Potato (boiled)', serving: '1 medium', servingType: 'piece', calories: 130, protein: 3, carbs: 30, fat: 0.1, category: 'Vegetables' },
  { id: 'spinach', name: 'Spinach', serving: '1 cup cooked', servingType: 'cup', calories: 41, protein: 5, carbs: 7, fat: 0.5, category: 'Vegetables' },
  { id: 'tomato', name: 'Tomato', serving: '1 medium', servingType: 'piece', calories: 22, protein: 1, carbs: 5, fat: 0.2, category: 'Vegetables' },
  { id: 'onion', name: 'Onion', serving: '1 medium', servingType: 'piece', calories: 44, protein: 1, carbs: 10, fat: 0.1, category: 'Vegetables' },

  // Fruits
  { id: 'banana', name: 'Banana', serving: '1 medium', servingType: 'piece', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'Fruits' },
  { id: 'apple', name: 'Apple', serving: '1 medium', servingType: 'piece', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'Fruits' },
  { id: 'papaya', name: 'Papaya', serving: '1 cup', servingType: 'cup', calories: 55, protein: 0.9, carbs: 14, fat: 0.2, category: 'Fruits' },
  { id: 'mango', name: 'Mango', serving: '1 cup', servingType: 'cup', calories: 99, protein: 1.4, carbs: 25, fat: 0.6, category: 'Fruits' },
  { id: 'orange', name: 'Orange', serving: '1 medium', servingType: 'piece', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, category: 'Fruits' },

  // Snacks & Others
  { id: 'peanuts', name: 'Peanuts', serving: '1 handful (~30g)', servingType: 'gram', calories: 170, protein: 8, carbs: 5, fat: 14, category: 'Snacks' },
  { id: 'roasted-chana', name: 'Roasted Chana', serving: '1 handful (~30g)', servingType: 'gram', calories: 120, protein: 7, carbs: 18, fat: 3, category: 'Snacks' },
  { id: 'milk', name: 'Milk', serving: '1 cup', servingType: 'cup', calories: 149, protein: 8, carbs: 12, fat: 8, category: 'Snacks' },
  { id: 'buttermilk', name: 'Buttermilk', serving: '1 cup', servingType: 'cup', calories: 99, protein: 8, carbs: 12, fat: 2, category: 'Snacks' },
  { id: 'samosa', name: 'Samosa', serving: '1 piece', servingType: 'piece', calories: 262, protein: 4, carbs: 24, fat: 17, category: 'Snacks' },
  { id: 'biscuits', name: 'Biscuits', serving: '2 pieces', servingType: 'piece', calories: 90, protein: 1, carbs: 14, fat: 4, category: 'Snacks' },
  { id: 'green-tea', name: 'Green Tea', serving: '1 cup', servingType: 'cup', calories: 2, protein: 0, carbs: 0, fat: 0, category: 'Beverages' },
  { id: 'tea-milk-sugar', name: 'Tea (milk + sugar)', serving: '1 cup', servingType: 'cup', calories: 45, protein: 1, carbs: 8, fat: 1, category: 'Beverages' },
  { id: 'coffee-black', name: 'Coffee (black)', serving: '1 cup', servingType: 'cup', calories: 5, protein: 0, carbs: 0, fat: 0, category: 'Beverages' },

  // Oils & Fats
  { id: 'cooking-oil', name: 'Cooking Oil', serving: '1 tsp', servingType: 'gram', calories: 40, protein: 0, carbs: 0, fat: 4.5, category: 'Oils & Fats' },
  { id: 'ghee', name: 'Ghee', serving: '1 tsp', servingType: 'gram', calories: 45, protein: 0, carbs: 0, fat: 5, category: 'Oils & Fats' },
  { id: 'butter', name: 'Butter', serving: '1 tsp', servingType: 'gram', calories: 35, protein: 0, carbs: 0, fat: 4, category: 'Oils & Fats' },
];

export interface CustomFoodItem {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const CUSTOM_FOODS_KEY = 'transform90_custom_foods';

export function loadCustomFoods(): CustomFoodItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FOODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomFoods(foods: CustomFoodItem[]) {
  localStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify(foods));
}

export function getQuantityOptions(servingType: 'cup' | 'piece' | 'gram'): number[] {
  switch (servingType) {
    case 'cup': return [0.5, 1, 1.5, 2, 2.5, 3];
    case 'piece': return [1, 2, 3, 4, 5];
    case 'gram': return [0.5, 1, 1.5, 2, 3, 4];
  }
}

export const quickAddItems = [
  { id: 'egg', name: 'Egg', icon: '🥚' },
  { id: 'milk', name: 'Milk', icon: '🥛' },
  { id: 'apple', name: 'Apple', icon: '🍎' },
  { id: 'protein-shake', name: 'Shake', icon: '🥤' },
  { id: 'banana', name: 'Banana', icon: '🍌' },
  { id: 'coffee-black', name: 'Coffee', icon: '☕' },
];
