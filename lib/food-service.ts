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
 * Why a food search has nothing to show: `network` for a connection
 * failure, `http` for a server-side failure, `null` for success (or an
 * aborted superseded request, which has nothing to report).
 */
export type FoodSearchIssue = 'network' | 'http' | null;

/**
 * Search foods by name.
 *
 * Pass an `AbortSignal` to cancel an in-flight request. Without it, two
 * overlapping searches can resolve out of order and the stale response wins.
 *
 * The error is reported instead of being swallowed. A previous version
 * caught every failure and returned `[]`, which made an offline user read
 * «غذایی با این نام پیدا نشد» - advice that is simply wrong when the cause
 * is the network, not the query.
 *
 * An abort returns `error: null` with an empty list: the request was killed
 * either because a newer one superseded it or because the page went away,
 * so there is nothing to report to the user in either case.
 */
export const searchFoods = async (
  query: string,
  signal?: AbortSignal,
): Promise<{ foods: FoodItem[]; error: FoodSearchIssue }> => {
  try {
    const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`, { signal });
    if (!res.ok) return { foods: [], error: 'http' };

    const data = await res.json();
    return { foods: Array.isArray(data) ? (data as FoodItem[]) : [], error: null };
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') return { foods: [], error: null };
    console.error('Error searching foods:', error);
    return { foods: [], error: 'network' };
  }
};
