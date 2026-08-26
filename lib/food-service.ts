export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source?: string;
}

export const getFoodById = async (id: string): Promise<FoodItem | undefined> => {
  try {
    // For getting a specific item, we can fetch all from search and filter, or just use the generic endpoint
    // since we don't have a specific /api/food/[id] endpoint requested.
    // Wait, the easiest is to just use getAllFoods and filter if needed, or if we really want
    // to just return undefined since it's barely used.
    const all = await getAllFoods();
    return all.find(f => f.id === id);
  } catch (error) {
    console.error('Error getting food by id:', error);
    return undefined;
  }
};

export const getAllFoods = async (): Promise<FoodItem[]> => {
  try {
    const res = await fetch('/api/food/search?all=true');
    if (!res.ok) throw new Error('Failed to fetch foods');
    return await res.json();
  } catch (error) {
    console.error('Error getting all foods:', error);
    return [];
  }
};

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search foods');
    return await res.json();
  } catch (error) {
    console.error('Error searching foods:', error);
    return [];
  }
};
