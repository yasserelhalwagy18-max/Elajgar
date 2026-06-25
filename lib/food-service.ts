export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const MOCK_FOOD_DATABASE: FoodItem[] = [
  { id: '1', name: 'چلو کباب کوبیده', calories: 850, protein: 40, carbs: 110, fat: 35 },
  { id: '2', name: 'قورمه سبزی با برنج', calories: 750, protein: 30, carbs: 90, fat: 30 },
  { id: '3', name: 'زرشک پلو با مرغ', calories: 650, protein: 45, carbs: 80, fat: 15 },
  { id: '4', name: 'آش رشته (یک کاسه)', calories: 350, protein: 12, carbs: 55, fat: 8 },
  { id: '5', name: 'نان لواش (یک کف دست)', calories: 25, protein: 1, carbs: 5, fat: 0 },
  { id: '6', name: 'نان سنگک (یک کف دست)', calories: 75, protein: 2, carbs: 15, fat: 0 },
  { id: '7', name: 'تخم مرغ آب‌پز (یک عدد)', calories: 70, protein: 6, carbs: 1, fat: 5 },
  { id: '8', name: 'پنیر لیقوان (۳۰ گرم)', calories: 90, protein: 5, carbs: 1, fat: 7 },
  { id: '9', name: 'گردو (یک عدد)', calories: 30, protein: 1, carbs: 1, fat: 3 },
  { id: '10', name: 'سیب (متوسط)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: '11', name: 'موز (متوسط)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { id: '12', name: 'شیر کم چرب (یک لیوان)', calories: 100, protein: 8, carbs: 12, fat: 2 },
  { id: '13', name: 'سینه مرغ گریل شده (۱۰۰ گرم)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: '14', name: 'برنج سفید پخته (یک لیوان)', calories: 205, protein: 4, carbs: 45, fat: 0.4 },
  { id: '15', name: 'عدسی (یک کاسه)', calories: 230, protein: 18, carbs: 40, fat: 1 },
  { id: '16', name: 'املت گوجه فرنگی', calories: 250, protein: 12, carbs: 5, fat: 20 },
  { id: '17', name: 'ماهی قزل آلا سرخ شده (۱۰۰ گرم)', calories: 200, protein: 20, carbs: 0, fat: 12 },
  { id: '18', name: 'سالاد شیرازی (یک کاسه)', calories: 50, protein: 1, carbs: 5, fat: 3 },
  { id: '19', name: 'ماست کم چرب (یک لیوان)', calories: 110, protein: 9, carbs: 13, fat: 2 },
  { id: '20', name: 'بستنی وانیلی (نصف لیوان)', calories: 137, protein: 2.3, carbs: 15.6, fat: 7.3 },
  { id: '21', name: 'اوتمیل با میوه', calories: 350, protein: 12, carbs: 60, fat: 6 },
  { id: '22', name: 'سینه مرغ گریل شده با سالاد', calories: 450, protein: 45, carbs: 15, fat: 20 },
  { id: '23', name: 'ماهی قزل آلا با سبزیجات', calories: 600, protein: 40, carbs: 20, fat: 35 },
  { id: '24', name: 'ماست یونانی و گردو', calories: 400, protein: 25, carbs: 15, fat: 25 },
];

export const getFoodById = (id: string): FoodItem | undefined => {
  return MOCK_FOOD_DATABASE.find(food => food.id === id);
};

export const getAllFoods = (): FoodItem[] => {
  return MOCK_FOOD_DATABASE;
};

export const searchFoods = async (query: string): Promise<FoodItem[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!query.trim()) {
    return MOCK_FOOD_DATABASE.slice(0, 5); // Return some defaults
  }

  const lowerQuery = query.toLowerCase();
  return MOCK_FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(lowerQuery)
  );
};
