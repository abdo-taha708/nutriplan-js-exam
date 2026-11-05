export const state = {
  currentPage: "meals",
  categories: [],
  recipes: [],
  products: [],
  selectedCategory: "",
  selectedArea: "",
  nutriFilter: "",
  currentMeal: null,
};

export function setCurrentPage(page) {
  state.currentPage = page;
}

const FOODLOG_KEY = "nutriplan-foodlog";

export function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

export function getFoodLog() {
  const saved = localStorage.getItem(FOODLOG_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    console.warn("Food log was corrupted, resetting...", parsed);
    localStorage.removeItem(FOODLOG_KEY);
    return [];
  } catch (error) {
    console.error("Failed to parse food log:", error);
    localStorage.removeItem(FOODLOG_KEY);
    return [];
  }
}

export function addFoodLogItem(name, calories, protein, carbs, fat, extra) {
  const options = extra || {};
  const items = getFoodLog();
  items.push({
    id: Date.now(),
    name: name,
    calories: Number(calories) || 0,
    protein: Number(protein) || 0,
    carbs: Number(carbs) || 0,
    fat: Number(fat) || 0,
    servings: options.servings || 1,
    type: options.type || "custom",
    mealId: options.mealId || null,
    image: options.image || null,
    category: options.category || null,
    area: options.area || null,
    ingredients: options.ingredients || [],
    barcode: options.barcode || null,
    brand: options.brand || null,
    date: getDateKey(new Date()),
    loggedAt: new Date().toISOString(),
  });
  localStorage.setItem(FOODLOG_KEY, JSON.stringify(items));
}

export function removeFoodLogItem(id) {
  const items = getFoodLog();
  const rest = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].id !== Number(id)) {
      rest.push(items[i]);
    }
  }

  localStorage.setItem(FOODLOG_KEY, JSON.stringify(rest));
}

export function clearFoodLog() {
  localStorage.removeItem(FOODLOG_KEY);
}

export function getTodayItems() {
  const items = getFoodLog();
  const today = getDateKey(new Date());
  const result = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].date === today) {
      result.push(items[i]);
    }
  }

  return result;
}

export function getTodayTotals() {
  const items = getTodayItems();
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, meals: items.length };

  for (let i = 0; i < items.length; i++) {
    totals.calories = totals.calories + items[i].calories;
    totals.protein = totals.protein + items[i].protein;
    totals.carbs = totals.carbs + items[i].carbs;
    totals.fat = totals.fat + items[i].fat;
  }

  return totals;
}

export function getWeeklyTotals() {
  const items = getFoodLog();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = getDateKey(day);

    let total = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    let count = 0;

    for (let j = 0; j < items.length; j++) {
      if (items[j].date === key) {
        count = count + 1;
        total = total + items[j].calories;
        protein = protein + items[j].protein;
        carbs = carbs + items[j].carbs;
        fat = fat + items[j].fat;
      }
    }

    result.push({
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      total: total,
      protein: protein,
      carbs: carbs,
      fat: fat,
      count: count,
    });
  }

  return result;
}