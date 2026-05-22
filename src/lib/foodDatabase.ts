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
  allowedMeals: string[]; // Contextual routing: E.g., ['Breakfast'], ['Lunch', 'Dinner']
}

export const foodDatabase: FoodItem[] = [
  // Breakfast Specialties
  { id: 'egg-omelet', name: 'Egg Omelet (2 Eggs)', serving: '1 plate', servingType: 'piece', calories: 154, protein: 12, carbs: 1, fat: 11, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'boiled-egg-omelet', name: 'Boiled Egg Omelet', serving: '1 plate', servingType: 'piece', calories: 160, protein: 13, carbs: 1, fat: 12, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'mutton-bun', name: 'Mutton Bun', serving: '1 bun', servingType: 'piece', calories: 280, protein: 12, carbs: 32, fat: 11, category: 'Breakfast', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'poha', name: 'Poha', serving: '1 cup', servingType: 'cup', calories: 180, protein: 3, carbs: 36, fat: 2, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'idli', name: 'Idli (2 pcs) with Chutney', serving: '1 plate', servingType: 'piece', calories: 120, protein: 4, carbs: 24, fat: 0.5, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'dosa', name: 'Plain Dosa', serving: '1 piece', servingType: 'piece', calories: 135, protein: 3, carbs: 26, fat: 2, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'masala-dosa', name: 'Masala Dosa', serving: '1 piece', servingType: 'piece', calories: 250, protein: 4, carbs: 38, fat: 9, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'upma', name: 'Upma', serving: '1 cup', servingType: 'cup', calories: 192, protein: 4, carbs: 34, fat: 4, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'paratha-aloo', name: 'Aloo Paratha', serving: '1 piece', servingType: 'piece', calories: 210, protein: 4, carbs: 32, fat: 7, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'paratha', name: 'Plain Paratha', serving: '1 piece', servingType: 'piece', calories: 160, protein: 4, carbs: 24, fat: 6, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'oats', name: 'Masala Oats', serving: '1 cup cooked', servingType: 'cup', calories: 154, protein: 6, carbs: 27, fat: 3, category: 'Breakfast', allowedMeals: ['Breakfast'] },
  { id: 'bread', name: 'Brown Bread', serving: '2 slices', servingType: 'piece', calories: 150, protein: 6, carbs: 30, fat: 2, category: 'Breakfast', allowedMeals: ['Breakfast', 'Snack'] },

  // Grains & Carbs (Lunch & Dinner Staples)
  { id: 'rice-1cup', name: 'Basmati Rice', serving: '1 cup cooked', servingType: 'cup', calories: 206, protein: 4, carbs: 45, fat: 0.4, category: 'Grains & Carbs', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'rice-2cup', name: 'Basmati Rice (Double)', serving: '2 cups cooked', servingType: 'cup', calories: 412, protein: 8, carbs: 90, fat: 0.8, category: 'Grains & Carbs', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'roti', name: 'Roti / Chapati', serving: '1 piece', servingType: 'piece', calories: 71, protein: 3, carbs: 15, fat: 0.4, category: 'Grains & Carbs', allowedMeals: ['Breakfast', 'Lunch', 'Dinner'] },
  { id: 'brown-rice', name: 'Brown Rice', serving: '1 cup cooked', servingType: 'cup', calories: 215, protein: 5, carbs: 45, fat: 1.6, category: 'Grains & Carbs', allowedMeals: ['Lunch', 'Dinner'] },

  // Protein-Rich Curries & Dals
  { id: 'dal-tadka', name: 'Dal Tadka', serving: '1 cup cooked', servingType: 'cup', calories: 150, protein: 8, carbs: 20, fat: 4.5, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'dal-makhani', name: 'Dal Makhani', serving: '1 cup cooked', servingType: 'cup', calories: 250, protein: 9, carbs: 22, fat: 14, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'chicken-curry', name: 'Chicken Curry', serving: '1 cup (~150g)', servingType: 'cup', calories: 240, protein: 26, carbs: 8, fat: 12, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'paneer-curry', name: 'Paneer Butter Masala', serving: '100g', servingType: 'gram', calories: 290, protein: 12, carbs: 10, fat: 23, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'fish-curry', name: 'Fish Curry', serving: '1 cup (~150g)', servingType: 'cup', calories: 180, protein: 22, carbs: 6, fat: 8, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'mutton-curry', name: 'Mutton Curry', serving: '1 cup (~150g)', servingType: 'cup', calories: 310, protein: 28, carbs: 7, fat: 19, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'chole', name: 'Chole Masala', serving: '1 cup cooked', servingType: 'cup', calories: 220, protein: 9, carbs: 32, fat: 6, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'rajma', name: 'Rajma Masala', serving: '1 cup cooked', servingType: 'cup', calories: 180, protein: 8, carbs: 28, fat: 4, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'paneer', name: 'Raw Paneer', serving: '100g', servingType: 'gram', calories: 265, protein: 18, carbs: 3, fat: 20, category: 'Protein & Curries', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'curd', name: 'Curd / Yogurt', serving: '1 cup', servingType: 'cup', calories: 100, protein: 8, carbs: 11, fat: 3, category: 'Protein & Curries', allowedMeals: ['Breakfast', 'Lunch', 'Dinner'] },
  { id: 'egg', name: 'Egg (boiled)', serving: '1 egg', servingType: 'piece', calories: 78, protein: 6, carbs: 0.6, fat: 5, category: 'Protein & Curries', allowedMeals: ['Breakfast', 'Snack'] },

  // Vegetables
  { id: 'mixed-veg', name: 'Mixed Vegetables Curry', serving: '1 cup cooked', servingType: 'cup', calories: 120, protein: 3, carbs: 12, fat: 7, category: 'Vegetables', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'potato', name: 'Potato (boiled)', serving: '1 medium', servingType: 'piece', calories: 130, protein: 3, carbs: 30, fat: 0.1, category: 'Vegetables', allowedMeals: ['Breakfast', 'Lunch', 'Dinner'] },
  { id: 'spinach', name: 'Palak Sabji', serving: '1 cup cooked', servingType: 'cup', calories: 85, protein: 4, carbs: 8, fat: 5, category: 'Vegetables', allowedMeals: ['Lunch', 'Dinner'] },
  { id: 'salad', name: 'Onion, Cucumber & Tomato Salad', serving: '1 plate', servingType: 'piece', calories: 30, protein: 1, carbs: 6, fat: 0.2, category: 'Vegetables', allowedMeals: ['Lunch', 'Dinner'] },

  // Fresh Fruits
  { id: 'banana', name: 'Banana', serving: '1 medium', servingType: 'piece', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: 'Fruits', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'apple', name: 'Apple', serving: '1 medium', servingType: 'piece', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: 'Fruits', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'papaya', name: 'Papaya', serving: '1 cup', servingType: 'cup', calories: 55, protein: 0.9, carbs: 14, fat: 0.2, category: 'Fruits', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'mango', name: 'Mango', serving: '1 cup', servingType: 'cup', calories: 99, protein: 1.4, carbs: 25, fat: 0.6, category: 'Fruits', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'orange', name: 'Orange', serving: '1 medium', servingType: 'piece', calories: 62, protein: 1.2, carbs: 15, fat: 0.2, category: 'Fruits', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'fruits-bowl', name: 'Mixed Fruits Bowl', serving: '1 plate', servingType: 'piece', calories: 85, protein: 1, carbs: 20, fat: 0.4, category: 'Fruits', allowedMeals: ['Breakfast', 'Snack'] },

  // Healthy Snacks & Traditional Bites
  { id: 'peanuts', name: 'Roasted Peanuts', serving: '1 handful (~30g)', servingType: 'gram', calories: 170, protein: 8, carbs: 5, fat: 14, category: 'Snacks', allowedMeals: ['Snack'] },
  { id: 'roasted-chana', name: 'Roasted Chana', serving: '1 handful (~30g)', servingType: 'gram', calories: 120, protein: 7, carbs: 18, fat: 3, category: 'Snacks', allowedMeals: ['Snack'] },
  { id: 'paneer-tikka', name: 'Paneer Tikka (3 pcs)', serving: '1 plate', servingType: 'piece', calories: 180, protein: 12, carbs: 4, fat: 13, category: 'Snacks', allowedMeals: ['Snack'] },
  { id: 'chicken-tikka', name: 'Chicken Tikka (3 pcs)', serving: '1 plate', servingType: 'piece', calories: 150, protein: 24, carbs: 2, fat: 5, category: 'Snacks', allowedMeals: ['Snack'] },
  { id: 'samosa', name: 'Samosa', serving: '1 piece', servingType: 'piece', calories: 262, protein: 4, carbs: 24, fat: 17, category: 'Snacks', allowedMeals: ['Snack'] },
  { id: 'biscuits', name: 'Digestive Biscuits', serving: '2 pieces', servingType: 'piece', calories: 90, protein: 1, carbs: 14, fat: 4, category: 'Snacks', allowedMeals: ['Snack'] },

  // Beverages
  { id: 'milk', name: 'Cow Milk', serving: '1 cup', servingType: 'cup', calories: 149, protein: 8, carbs: 12, fat: 8, category: 'Beverages', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'buttermilk', name: 'Buttermilk (Chaas)', serving: '1 cup', servingType: 'cup', calories: 60, protein: 3, carbs: 5, fat: 2, category: 'Beverages', allowedMeals: ['Lunch', 'Snack'] },
  { id: 'tea-milk-sugar', name: 'Masala Chai', serving: '1 cup', servingType: 'cup', calories: 75, protein: 2, carbs: 12, fat: 2, category: 'Beverages', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'coffee-milk', name: 'Filter Coffee', serving: '1 cup', servingType: 'cup', calories: 80, protein: 3, carbs: 11, fat: 3, category: 'Beverages', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'coffee-black', name: 'Coffee (Black)', serving: '1 cup', servingType: 'cup', calories: 5, protein: 0, carbs: 0, fat: 0, category: 'Beverages', allowedMeals: ['Breakfast', 'Snack'] },
  { id: 'green-tea', name: 'Green Tea', serving: '1 cup', servingType: 'cup', calories: 2, protein: 0, carbs: 0, fat: 0, category: 'Beverages', allowedMeals: ['Breakfast', 'Snack'] },

  // Oils & Cooking Fats (Only searchable, not shown under default listings)
  { id: 'cooking-oil', name: 'Cooking Oil', serving: '1 tsp', servingType: 'gram', calories: 40, protein: 0, carbs: 0, fat: 4.5, category: 'Oils & Fats', allowedMeals: [] },
  { id: 'ghee', name: 'Ghee', serving: '1 tsp', servingType: 'gram', calories: 45, protein: 0, carbs: 0, fat: 5, category: 'Oils & Fats', allowedMeals: ['Breakfast', 'Lunch', 'Dinner'] },
  { id: 'butter', name: 'Butter', serving: '1 tsp', servingType: 'gram', calories: 35, protein: 0, carbs: 0, fat: 4, category: 'Oils & Fats', allowedMeals: ['Breakfast', 'Lunch', 'Dinner'] },
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

// Meal-Specific Quick Add suggestions for instant one-tap logging
export const quickAddItemsByMeal: Record<string, { id: string; name: string; icon: string }[]> = {
  Breakfast: [
    { id: 'egg-omelet', name: 'Omelet', icon: '🍳' },
    { id: 'boiled-egg-omelet', name: 'Boiled Omelet', icon: '🥚' },
    { id: 'mutton-bun', name: 'Mutton Bun', icon: '🍞' },
    { id: 'poha', name: 'Poha', icon: '🥣' },
    { id: 'idli', name: 'Idli', icon: '⚪' },
    { id: 'banana', name: 'Banana', icon: '🍌' },
    { id: 'apple', name: 'Apple', icon: '🍎' },
    { id: 'tea-milk-sugar', name: 'Chai', icon: '☕' },
  ],
  Lunch: [
    { id: 'roti', name: 'Roti', icon: '🫓' },
    { id: 'rice-1cup', name: 'Basmati Rice', icon: '🍚' },
    { id: 'dal-tadka', name: 'Dal Tadka', icon: '🍲' },
    { id: 'chicken-curry', name: 'Chicken Curry', icon: '🍗' },
    { id: 'paneer-curry', name: 'Paneer Butter', icon: '🧀' },
    { id: 'fish-curry', name: 'Fish Curry', icon: '🐟' },
    { id: 'curd', name: 'Curd', icon: '🥛' },
  ],
  Snack: [
    { id: 'biscuits', name: 'Biscuits', icon: '🍪' },
    { id: 'samosa', name: 'Samosa', icon: '🥟' },
    { id: 'roasted-chana', name: 'Roasted Chana', icon: '🥜' },
    { id: 'tea-milk-sugar', name: 'Chai', icon: '☕' },
    { id: 'buttermilk', name: 'Buttermilk', icon: '🥛' },
  ],
  Dinner: [
    { id: 'roti', name: 'Roti', icon: '🫓' },
    { id: 'rice-1cup', name: 'Basmati Rice', icon: '🍚' },
    { id: 'dal-tadka', name: 'Dal Tadka', icon: '🍲' },
    { id: 'chicken-curry', name: 'Chicken Curry', icon: '🍗' },
    { id: 'paneer-curry', name: 'Paneer Butter', icon: '🧀' },
    { id: 'fish-curry', name: 'Fish Curry', icon: '🐟' },
    { id: 'mutton-curry', name: 'Mutton Curry', icon: '🍖' },
  ]
};

// Legacy fallback support
export const quickAddItems = [
  { id: 'egg-omelet', name: 'Omelet', icon: '🍳' },
  { id: 'milk', name: 'Milk', icon: '🥛' },
  { id: 'apple', name: 'Apple', icon: '🍎' },
  { id: 'banana', name: 'Banana', icon: '🍌' },
];
