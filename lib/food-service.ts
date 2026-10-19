export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source?: string;
}

export const getFoodById = async (id: string, signal?: AbortSignal): Promise<FoodItem | undefined> => {
  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(id)}`, { signal });
    if (!res.ok) throw new Error('Failed to search foods');
    const results: FoodItem[] = await res.json();
    return results.find((food) => food.id === id);
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return undefined;
    console.error('Error getting food by id:', error);
    return undefined;
  }
};

export const getAllFoods = async (signal?: AbortSignal): Promise<FoodItem[]> => {
  try {
    const res = await fetch('/api/food/search?all=true', { signal });
    if (!res.ok) throw new Error('Failed to fetch foods');
    return await res.json();
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return [];
    console.error('Error getting all foods:', error);
    return [];
  }
};

/**
 * Search foods by name.
 *
 * Pass an `AbortSignal` to cancel an in-flight request. Without it, two
 * overlapping searches can resolve out of order and the stale response wins.
 */
export const searchFoods = async (query: string, signal?: AbortSignal): Promise<FoodItem[]> => {
  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) throw new Error('Failed to search foods');
    return await res.json();
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return [];
    console.error('Error searching foods:', error);
    return [];
  }
};
