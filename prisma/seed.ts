import { GymCategory } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foods = [
  { name: 'نان بربری (یک کف دست)', calories: 75, protein: 2, carbs: 15, fat: 0 },
  { name: 'نان سنگک (یک کف دست)', calories: 75, protein: 2, carbs: 15, fat: 0 },
  { name: 'نان تافتون (یک کف دست)', calories: 35, protein: 1, carbs: 7, fat: 0 },
  { name: 'نان لواش (یک کف دست)', calories: 25, protein: 1, carbs: 5, fat: 0 },
  { name: 'برنج کته (یک قاشق غذاخوری)', calories: 25, protein: 0.5, carbs: 5, fat: 0 },
  { name: 'برنج آبکش (یک قاشق غذاخوری)', calories: 20, protein: 0.4, carbs: 4.5, fat: 0 },
  { name: 'ماکارونی پخته (یک لیوان)', calories: 200, protein: 7, carbs: 40, fat: 1 },
  { name: 'سیب زمینی آب‌پز (متوسط)', calories: 110, protein: 2, carbs: 25, fat: 0 },
  { name: 'سیب زمینی سرخ‌کرده (۱۰۰ گرم)', calories: 312, protein: 3, carbs: 41, fat: 15 },
  { name: 'عدسی (یک لیوان)', calories: 230, protein: 18, carbs: 40, fat: 1 },
  { name: 'خوراک لوبیا چیتی (یک لیوان)', calories: 250, protein: 15, carbs: 45, fat: 2 },
  { name: 'تخم مرغ آب‌پز (یک عدد)', calories: 70, protein: 6, carbs: 1, fat: 5 },
  { name: 'نیمرو (یک عدد)', calories: 110, protein: 6, carbs: 1, fat: 9 },
  { name: 'املت گوجه‌فرنگی (با یک تخم‌مرغ)', calories: 150, protein: 7, carbs: 5, fat: 12 },
  { name: 'کوکو سبزی (یک قطعه متوسط)', calories: 120, protein: 4, carbs: 5, fat: 9 },
  { name: 'کوکو سیب‌زمینی (یک قطعه متوسط)', calories: 150, protein: 3, carbs: 15, fat: 9 },
  { name: 'کتلت گوشت (یک قطعه متوسط)', calories: 180, protein: 8, carbs: 10, fat: 12 },
  { name: 'فلافل (یک عدد)', calories: 80, protein: 3, carbs: 10, fat: 4 },
  { name: 'کباب کوبیده (یک سیخ)', calories: 270, protein: 18, carbs: 2, fat: 21 },
  { name: 'جوجه کباب (یک سیخ)', calories: 200, protein: 28, carbs: 1, fat: 9 },
  { name: 'کباب برگ (یک سیخ)', calories: 200, protein: 25, carbs: 0, fat: 10 },
  { name: 'قورمه سبزی (پنج قاشق غذاخوری)', calories: 150, protein: 6, carbs: 8, fat: 10 },
  { name: 'قیمه (پنج قاشق غذاخوری)', calories: 180, protein: 7, carbs: 12, fat: 11 },
  { name: 'فسنجان (پنج قاشق غذاخوری)', calories: 250, protein: 5, carbs: 10, fat: 22 },
  { name: 'زرشک پلو با مرغ (بدون برنج، یک ران)', calories: 250, protein: 25, carbs: 5, fat: 15 },
  { name: 'لوبیا پلو (یک کفگیر)', calories: 300, protein: 10, carbs: 40, fat: 10 },
  { name: 'باقالی پلو با گوشت (یک کفگیر با گوشت)', calories: 450, protein: 20, carbs: 45, fat: 20 },
  { name: 'عدس پلو (یک کفگیر)', calories: 300, protein: 12, carbs: 50, fat: 6 },
  { name: 'ماکارونی با گوشت چرخ‌کرده (یک لیوان)', calories: 350, protein: 15, carbs: 45, fat: 12 },
  { name: 'کشک بادمجان (یک قاشق غذاخوری)', calories: 45, protein: 1, carbs: 3, fat: 3 },
  { name: 'میرزا قاسمی (یک قاشق غذاخوری)', calories: 40, protein: 1, carbs: 3, fat: 3 },
  { name: 'آش رشته (یک کاسه کوچک)', calories: 250, protein: 10, carbs: 35, fat: 8 },
  { name: 'سوپ جو (یک کاسه کوچک)', calories: 150, protein: 5, carbs: 20, fat: 5 },
  { name: 'حلیم (یک کاسه کوچک، بدون روغن و شکر)', calories: 200, protein: 12, carbs: 30, fat: 4 },
  { name: 'ماهی قزل‌آلا سرخ‌شده (۱۰۰ گرم)', calories: 200, protein: 20, carbs: 0, fat: 12 },
  { name: 'ماهی قزل‌آلا کبابی (۱۰۰ گرم)', calories: 150, protein: 21, carbs: 0, fat: 7 },
  { name: 'تن ماهی (در روغن، آبکش شده، ۱۰۰ گرم)', calories: 190, protein: 25, carbs: 0, fat: 9 },
  { name: 'میگو سرخ‌شده (۱۰۰ گرم)', calories: 200, protein: 18, carbs: 10, fat: 10 },
  { name: 'سینه مرغ پخته (۱۰۰ گرم)', calories: 165, protein: 31, carbs: 0, fat: 3.5 },
  { name: 'ران مرغ پخته (۱۰۰ گرم)', calories: 210, protein: 25, carbs: 0, fat: 11 },
  { name: 'گوشت گوسفندی پخته (۱۰۰ گرم)', calories: 250, protein: 25, carbs: 0, fat: 16 },
  { name: 'گوشت گوساله پخته (۱۰۰ گرم)', calories: 220, protein: 28, carbs: 0, fat: 11 },
  { name: 'پنیر لیقوان (یک قوطی کبریت)', calories: 75, protein: 4, carbs: 1, fat: 6 },
  { name: 'پنیر فتا (یک قوطی کبریت)', calories: 70, protein: 4, carbs: 1, fat: 5 },
  { name: 'پنیر خامه ای (یک قاشق غذاخوری)', calories: 50, protein: 1, carbs: 1, fat: 5 },
  { name: 'ماست پرچرب (یک لیوان)', calories: 150, protein: 8, carbs: 11, fat: 8 },
  { name: 'ماست کم‌چرب (یک لیوان)', calories: 110, protein: 9, carbs: 13, fat: 2 },
  { name: 'شیر پرچرب (یک لیوان)', calories: 150, protein: 8, carbs: 12, fat: 8 },
  { name: 'شیر کم‌چرب (یک لیوان)', calories: 100, protein: 8, carbs: 12, fat: 2 },
  { name: 'دوغ (یک لیوان)', calories: 50, protein: 3, carbs: 4, fat: 2 },
  { name: 'کره (یک قاشق مرباخوری)', calories: 35, protein: 0, carbs: 0, fat: 4 },
  { name: 'خامه (یک قاشق غذاخوری)', calories: 45, protein: 0.5, carbs: 1, fat: 4.5 },
  { name: 'گردو (یک عدد کامل)', calories: 30, protein: 1, carbs: 1, fat: 3 },
  { name: 'بادام (ده عدد)', calories: 70, protein: 2.5, carbs: 2.5, fat: 6 },
  { name: 'پسته (ده عدد)', calories: 40, protein: 1.5, carbs: 2, fat: 3 },
  { name: 'فندق (ده عدد)', calories: 90, protein: 2, carbs: 2.5, fat: 8 },
  { name: 'بادام زمینی (ده عدد)', calories: 45, protein: 2, carbs: 1.5, fat: 4 },
  { name: 'تخمه آفتابگردان (ده گرم)', calories: 60, protein: 2, carbs: 2, fat: 5 },
  { name: 'کشمش (یک قاشق غذاخوری)', calories: 30, protein: 0.5, carbs: 8, fat: 0 },
  { name: 'خرما (یک عدد متوسط)', calories: 20, protein: 0.5, carbs: 5, fat: 0 },
  { name: 'انجیر خشک (یک عدد)', calories: 25, protein: 0.5, carbs: 6, fat: 0 },
  { name: 'توت خشک (یک قاشق غذاخوری)', calories: 30, protein: 1, carbs: 7, fat: 0 },
  { name: 'سیب (متوسط)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'پرتقال (متوسط)', calories: 60, protein: 1, carbs: 15, fat: 0.2 },
  { name: 'نارنگی (متوسط)', calories: 40, protein: 0.5, carbs: 10, fat: 0.2 },
  { name: 'موز (متوسط)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'گلابی (متوسط)', calories: 100, protein: 0.6, carbs: 27, fat: 0.2 },
  { name: 'هلو (متوسط)', calories: 60, protein: 1.4, carbs: 14, fat: 0.4 },
  { name: 'شلیل (متوسط)', calories: 60, protein: 1.5, carbs: 14, fat: 0.5 },
  { name: 'انگور (یک لیوان حبه)', calories: 100, protein: 1, carbs: 27, fat: 0.2 },
  { name: 'انار (متوسط)', calories: 100, protein: 1.5, carbs: 23, fat: 0.3 },
  { name: 'هندوانه (یک قاچ بزرگ)', calories: 85, protein: 1.7, carbs: 21, fat: 0.4 },
  { name: 'خربزه (یک قاچ متوسط)', calories: 45, protein: 1, carbs: 11, fat: 0.2 },
  { name: 'طالبی (یک قاچ متوسط)', calories: 35, protein: 0.8, carbs: 8, fat: 0.2 },
  { name: 'توت فرنگی (یک لیوان)', calories: 50, protein: 1, carbs: 12, fat: 0.5 },
  { name: 'گیلاس (یک لیوان)', calories: 85, protein: 1.5, carbs: 22, fat: 0.3 },
  { name: 'آلبالو (یک لیوان)', calories: 70, protein: 1.5, carbs: 18, fat: 0.5 },
  { name: 'کیوی (متوسط)', calories: 40, protein: 0.8, carbs: 10, fat: 0.4 },
  { name: 'خیار (متوسط)', calories: 15, protein: 0.7, carbs: 3, fat: 0.1 },
  { name: 'گوجه‌فرنگی (متوسط)', calories: 20, protein: 1, carbs: 4, fat: 0.2 },
  { name: 'پیاز (متوسط)', calories: 40, protein: 1, carbs: 9, fat: 0.1 },
  { name: 'سیر (یک حبه)', calories: 5, protein: 0.2, carbs: 1, fat: 0 },
  { name: 'کاهو (یک لیوان خرد شده)', calories: 5, protein: 0.5, carbs: 1, fat: 0 },
  { name: 'کلم برگ (یک لیوان خرد شده)', calories: 15, protein: 1, carbs: 3, fat: 0.1 },
  { name: 'هویج (متوسط)', calories: 25, protein: 0.5, carbs: 6, fat: 0.1 },
  { name: 'کدو سبز (متوسط)', calories: 30, protein: 2, carbs: 6, fat: 0.5 },
  { name: 'بادمجان (متوسط)', calories: 25, protein: 1, carbs: 6, fat: 0.2 },
  { name: 'فلفل دلمه‌ای (متوسط)', calories: 30, protein: 1, carbs: 7, fat: 0.2 },
  { name: 'قارچ (یک لیوان خرد شده)', calories: 15, protein: 2, carbs: 2, fat: 0.2 },
  { name: 'کلم بروکلی (یک لیوان پخته)', calories: 55, protein: 4, carbs: 11, fat: 0.6 },
  { name: 'گل کلم (یک لیوان پخته)', calories: 30, protein: 2, carbs: 5, fat: 0.5 },
  { name: 'اسفناج پخته (یک لیوان)', calories: 40, protein: 5, carbs: 7, fat: 0.5 },
  { name: 'سبزی خوردن (یک لیوان)', calories: 10, protein: 1, carbs: 2, fat: 0 },
  { name: 'زیتون (ده عدد)', calories: 50, protein: 0.5, carbs: 2, fat: 5 },
  { name: 'روغن زیتون (یک قاشق غذاخوری)', calories: 120, protein: 0, carbs: 0, fat: 14 },
  { name: 'روغن مایع (یک قاشق غذاخوری)', calories: 120, protein: 0, carbs: 0, fat: 14 },
  { name: 'سس مایونز (یک قاشق غذاخوری)', calories: 90, protein: 0.2, carbs: 1, fat: 10 },
  { name: 'سس گوجه‌فرنگی (یک قاشق غذاخوری)', calories: 15, protein: 0.2, carbs: 4, fat: 0 },
  { name: 'شکر (یک قاشق غذاخوری)', calories: 50, protein: 0, carbs: 13, fat: 0 },
  { name: 'قند (یک حبه متوسط)', calories: 10, protein: 0, carbs: 2.5, fat: 0 },
  { name: 'عسل (یک قاشق غذاخوری)', calories: 65, protein: 0.1, carbs: 17, fat: 0 },
  { name: 'مربا (یک قاشق غذاخوری)', calories: 50, protein: 0.1, carbs: 13, fat: 0 },
  { name: 'بستنی وانیلی (نصف لیوان)', calories: 137, protein: 2.3, carbs: 15.6, fat: 7.3 },
  { name: 'بستنی سنتی (نصف لیوان)', calories: 200, protein: 4, carbs: 20, fat: 12 },
  { name: 'فالوده شیرازی (یک کاسه کوچک)', calories: 150, protein: 1, carbs: 35, fat: 0 },
  { name: 'شله زرد (یک کاسه کوچک)', calories: 250, protein: 4, carbs: 55, fat: 2 },
  { name: 'شیر برنج (یک کاسه کوچک)', calories: 200, protein: 6, carbs: 35, fat: 4 },
  { name: 'حلوا (یک قاشق غذاخوری)', calories: 100, protein: 1, carbs: 12, fat: 5 },
  { name: 'بیسکویت ساقه طلایی (یک عدد)', calories: 50, protein: 1, carbs: 8, fat: 1.5 },
  { name: 'بیسکویت کرم‌دار (یک عدد)', calories: 70, protein: 0.5, carbs: 10, fat: 3 },
  { name: 'کیک ساده (یک قطعه کوچک)', calories: 150, protein: 2, carbs: 20, fat: 7 },
  { name: 'نوشابه (یک لیوان)', calories: 100, protein: 0, carbs: 27, fat: 0 },
  { name: 'آبمیوه پاکتی (یک لیوان)', calories: 120, protein: 1, carbs: 28, fat: 0 },
  { name: 'چای تلخ (یک لیوان)', calories: 0, protein: 0, carbs: 0, fat: 0 },
  { name: 'قهوه تلخ (یک فنجان)', calories: 2, protein: 0, carbs: 0, fat: 0 },
  { name: 'شربت خاکشیر (یک لیوان با شکر)', calories: 100, protein: 1, carbs: 24, fat: 0.5 },
  { name: 'رب گوجه‌فرنگی (یک قاشق غذاخوری)', calories: 15, protein: 0.5, carbs: 3, fat: 0 },
  { name: 'آبغوره (یک قاشق غذاخوری)', calories: 3, protein: 0, carbs: 1, fat: 0 },
  { name: 'آبلیمو (یک قاشق غذاخوری)', calories: 3, protein: 0, carbs: 1, fat: 0 },
  { name: 'سرکه (یک قاشق غذاخوری)', calories: 3, protein: 0, carbs: 0, fat: 0 },
  { name: 'کله پاچه - زبان (یک قطعه)', calories: 250, protein: 18, carbs: 0, fat: 19 },
  { name: 'کله پاچه - چشم (یک عدد)', calories: 70, protein: 5, carbs: 0, fat: 5 },
  { name: 'کله پاچه - مغز (نصف مغز)', calories: 150, protein: 10, carbs: 0, fat: 12 },
  { name: 'کله پاچه - پاچه (یک عدد)', calories: 150, protein: 15, carbs: 0, fat: 10 },
  { name: 'آبگوشت (یک کاسه کوچک، بدون نان و گوشت)', calories: 200, protein: 10, carbs: 15, fat: 10 },
  { name: 'گوشت کوبیده آبگوشت (نصف لیوان)', calories: 300, protein: 15, carbs: 20, fat: 15 },
  { name: 'کباب تابه‌ای (یک قطعه متوسط)', calories: 200, protein: 15, carbs: 5, fat: 13 },
  { name: 'تاس کباب (یک بشقاب)', calories: 350, protein: 20, carbs: 30, fat: 15 },
  { name: 'ته‌چین مرغ (یک قطعه)', calories: 400, protein: 20, carbs: 45, fat: 15 },
  { name: 'آلبالو پلو (یک کفگیر با مرغ)', calories: 400, protein: 20, carbs: 60, fat: 8 },
  { name: 'رشته پلو (یک کفگیر)', calories: 350, protein: 10, carbs: 60, fat: 7 },
  { name: 'هویج پلو (یک کفگیر)', calories: 300, protein: 8, carbs: 55, fat: 6 },
  { name: 'سبزی پلو با ماهی (یک کفگیر و ۱۰۰ گرم ماهی)', calories: 500, protein: 30, carbs: 50, fat: 15 },
  { name: 'کوفته تبریزی (یک عدد متوسط)', calories: 350, protein: 20, carbs: 30, fat: 15 },
  { name: 'دلمه برگ مو (یک عدد متوسط)', calories: 50, protein: 2, carbs: 6, fat: 2 },
  { name: 'دلمه فلفل (یک عدد متوسط)', calories: 150, protein: 8, carbs: 15, fat: 6 },
  { name: 'کوکوی لوبیا سبز (یک قطعه)', calories: 120, protein: 4, carbs: 8, fat: 8 },
  { name: 'یتیمچه (یک بشقاب)', calories: 200, protein: 5, carbs: 15, fat: 13 },
  { name: 'خورش کرفس (پنج قاشق غذاخوری)', calories: 160, protein: 7, carbs: 6, fat: 12 },
  { name: 'خورش بامیه (پنج قاشق غذاخوری)', calories: 150, protein: 6, carbs: 8, fat: 10 },
  { name: 'خورش آلو اسفناج (پنج قاشق غذاخوری)', calories: 180, protein: 7, carbs: 10, fat: 12 },
  { name: 'کله جوش (یک کاسه)', calories: 250, protein: 15, carbs: 15, fat: 15 },
  { name: 'اشکنه (یک کاسه)', calories: 200, protein: 10, carbs: 15, fat: 10 },
  { name: 'سیرابی (یک کاسه کوچک)', calories: 130, protein: 18, carbs: 0, fat: 5 },
  { name: 'دل گوسفند (۱۰۰ گرم)', calories: 160, protein: 16, carbs: 0, fat: 10 },
  { name: 'جگر گوسفند (۱۰۰ گرم)', calories: 135, protein: 20, carbs: 3, fat: 5 },
  { name: 'قلوه گوسفند (۱۰۰ گرم)', calories: 100, protein: 16, carbs: 0, fat: 3 },
  { name: 'سوسیس (۱۰۰ گرم)', calories: 300, protein: 12, carbs: 4, fat: 25 },
  { name: 'کالباس (۱۰۰ گرم)', calories: 250, protein: 14, carbs: 3, fat: 20 },
  { name: 'همبرگر (یک عدد، بدون نان)', calories: 250, protein: 20, carbs: 0, fat: 18 },
  { name: 'پیتزا مخلوط (یک برش)', calories: 250, protein: 12, carbs: 25, fat: 10 },
  { name: 'لازانیا (یک قطعه)', calories: 350, protein: 15, carbs: 30, fat: 18 },
  { name: 'پاستا آلفردو (یک بشقاب)', calories: 500, protein: 20, carbs: 45, fat: 25 },
  { name: 'نودل (یک بسته پخته)', calories: 380, protein: 8, carbs: 55, fat: 14 },
  { name: 'چیپس سیب‌زمینی (ده عدد)', calories: 110, protein: 1, carbs: 10, fat: 7 },
  { name: 'پفک (یک مشت)', calories: 75, protein: 1, carbs: 8, fat: 4 },
  { name: 'پاپ کورن (یک لیوان شکفته)', calories: 30, protein: 1, carbs: 6, fat: 0.5 },
  { name: 'شکلات تلخ ۷۰٪ (ده گرم)', calories: 60, protein: 1, carbs: 5, fat: 4 },
  { name: 'شکلات شیری (ده گرم)', calories: 55, protein: 0.5, carbs: 6, fat: 3 },
  { name: 'باقلوا (یک قطعه)', calories: 150, protein: 2, carbs: 15, fat: 8 },
  { name: 'گوش فیل (یک عدد)', calories: 100, protein: 1, carbs: 15, fat: 4 },
  { name: 'زولبیا (یک عدد متوسط)', calories: 160, protein: 1, carbs: 25, fat: 5 },
  { name: 'بامیه (یک عدد متوسط)', calories: 80, protein: 0.5, carbs: 12, fat: 3 },
  { name: 'سمنو (یک پیاله کوچک)', calories: 250, protein: 4, carbs: 50, fat: 2 },
  { name: 'باسلوق (یک عدد)', calories: 70, protein: 0, carbs: 18, fat: 0 },
  { name: 'سوهان (یک قطعه کوچک)', calories: 100, protein: 1, carbs: 10, fat: 6 },
  { name: 'گز (یک عدد)', calories: 60, protein: 1, carbs: 12, fat: 1 },
  { name: 'پشمک (یک لیوان حلاجی شده)', calories: 50, protein: 0, carbs: 13, fat: 0 },
  { name: 'ارده (یک قاشق غذاخوری)', calories: 90, protein: 3, carbs: 3, fat: 8 },
  { name: 'شیره انگور (یک قاشق غذاخوری)', calories: 60, protein: 0, carbs: 15, fat: 0 },
  { name: 'کره بادام زمینی (یک قاشق غذاخوری)', calories: 95, protein: 4, carbs: 3, fat: 8 },
  { name: 'فرنی (یک کاسه کوچک)', calories: 200, protein: 6, carbs: 30, fat: 5 },
  { name: 'کاچی (یک کاسه کوچک)', calories: 350, protein: 4, carbs: 35, fat: 20 },
  { name: 'شیر کاکائو (یک لیوان)', calories: 180, protein: 8, carbs: 25, fat: 5 },
  { name: 'اسموتی موز (یک لیوان)', calories: 200, protein: 5, carbs: 40, fat: 2 },
  { name: 'نسکافه (یک لیوان با شکر و شیر)', calories: 100, protein: 2, carbs: 15, fat: 3 },
  { name: 'کاپوچینو (یک لیوان)', calories: 120, protein: 4, carbs: 15, fat: 4 },
  { name: 'انرژی‌زا (یک قوطی)', calories: 110, protein: 0, carbs: 28, fat: 0 },
  { name: 'ماءالشعیر (یک لیوان)', calories: 80, protein: 0.5, carbs: 19, fat: 0 },
  { name: 'آب انار (یک لیوان)', calories: 135, protein: 1, carbs: 33, fat: 0.5 },
  { name: 'آب پرتقال طبیعی (یک لیوان)', calories: 110, protein: 2, carbs: 26, fat: 0.5 },
  { name: 'آب سیب طبیعی (یک لیوان)', calories: 115, protein: 0.2, carbs: 28, fat: 0.3 },
  { name: 'آب هویج (یک لیوان)', calories: 90, protein: 2, carbs: 22, fat: 0.5 },
  { name: 'شربت زعفران (یک لیوان)', calories: 100, protein: 0, carbs: 25, fat: 0 },
  { name: 'شربت آلبالو (یک لیوان)', calories: 120, protein: 0, carbs: 30, fat: 0 },
  { name: 'تخم شربتی (در یک لیوان آب و کمی شکر)', calories: 60, protein: 1, carbs: 12, fat: 1 },
  { name: 'کوفته برنجی (یک عدد)', calories: 250, protein: 10, carbs: 35, fat: 8 },
  { name: 'سالاد الویه (یک قاشق غذاخوری)', calories: 45, protein: 1, carbs: 2, fat: 4 },
  { name: 'سالاد ماکارونی (یک لیوان)', calories: 350, protein: 10, carbs: 40, fat: 16 },
  { name: 'سالاد شیرازی (یک کاسه کوچک)', calories: 30, protein: 1, carbs: 4, fat: 1 },
  { name: 'سالاد فصل (یک بشقاب با سس روغن زیتون)', calories: 100, protein: 2, carbs: 5, fat: 8 },
  { name: 'سوپ گوجه فرنگی (یک کاسه)', calories: 120, protein: 3, carbs: 15, fat: 4 },
  { name: 'سوپ شیر و قارچ (یک کاسه)', calories: 220, protein: 8, carbs: 20, fat: 12 },
  { name: 'حلیم بادمجان (یک کاسه کوچک)', calories: 300, protein: 15, carbs: 20, fat: 18 },
  { name: 'کشک کدو (یک کاسه کوچک)', calories: 150, protein: 6, carbs: 12, fat: 8 },
  { name: 'آش شله قلمکار (یک کاسه)', calories: 350, protein: 18, carbs: 40, fat: 12 },
  { name: 'آش دوغ (یک کاسه)', calories: 180, protein: 8, carbs: 25, fat: 5 },
  { name: 'بورانی اسفناج (یک پیاله)', calories: 120, protein: 6, carbs: 10, fat: 6 },
  { name: 'بورانی بادمجان (یک پیاله)', calories: 110, protein: 5, carbs: 12, fat: 5 },
  { name: 'ترشی مخلوط (یک قاشق غذاخوری)', calories: 5, protein: 0.1, carbs: 1, fat: 0 },
  { name: 'خیارشور (یک عدد متوسط)', calories: 5, protein: 0.2, carbs: 1, fat: 0 },
  { name: 'سیر ترشی (یک حبه)', calories: 8, protein: 0.2, carbs: 2, fat: 0 },
  { name: 'نان جو (یک کف دست)', calories: 60, protein: 2, carbs: 12, fat: 0.5 },
  { name: 'نان تست سبوس‌دار (یک ورق)', calories: 75, protein: 3, carbs: 14, fat: 1 },
  { name: 'کورن فلکس (یک لیوان بدون شیر)', calories: 110, protein: 2, carbs: 24, fat: 0.5 },
  { name: 'اوتمیل (یک لیوان پخته با آب)', calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: 'گرانولا (نصف لیوان)', calories: 250, protein: 6, carbs: 35, fat: 10 },
  { name: 'شکلات صبحانه / نوتلا (یک قاشق غذاخوری)', calories: 80, protein: 1, carbs: 9, fat: 4.5 },
  { name: 'کره فندق (یک قاشق غذاخوری)', calories: 90, protein: 2, carbs: 3, fat: 8 }
];


const placeholderGyms = [
  {
    name: 'نمونه باشگاه ۱',
    location: 'تهران، خیابان ولیعصر',
    category: GymCategory.GENERAL,
    discountPercentage: 15,
    isPlaceholder: true,
  },
  {
    name: 'نمونه باشگاه ۲',
    location: 'تهران، سعادت آباد',
    category: GymCategory.POOL,
    discountPercentage: 20,
    isPlaceholder: true,
  },
  {
    name: 'نمونه باشگاه ۳',
    location: 'تهران، نیاوران',
    category: GymCategory.YOGA,
    discountPercentage: 10,
    isPlaceholder: true,
  },
];

async function seedGyms() {
  console.log('Start seeding gyms...');
  let count = 0;
  for (const gym of placeholderGyms) {
    // Generate a placeholder ID if needed, or rely on cuid() via db schema for create.
    // There isn't a unique constraint on 'name' in Gym model currently, so we need to
    // find first, then create/update. Or updateMany and if 0, create.
    const existing = await prisma.gym.findFirst({
        where: { name: gym.name }
    });

    if (existing) {
        await prisma.gym.update({
            where: { id: existing.id },
            data: gym
        });
    } else {
        await prisma.gym.create({
            data: gym
        });
    }
    count++;
  }
  console.log(`Finished seeding ${count} gyms.`);
}

async function main() {
  await seedGyms();
  console.log('Start seeding foods...');
  let count = 0;
  for (const food of foods) {
    await prisma.food.upsert({
      where: { name: food.name },
      update: {
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      },
      create: {
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        source: 'estimated',
      },
    });
    count++;
  }
  console.log(`Finished seeding ${count} foods.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
