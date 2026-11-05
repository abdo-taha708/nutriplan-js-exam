

const BASE_URL = "https://www.themealdb.com/api/json/v1/1/";

async function getData(endpoint) {
  const response = await fetch(BASE_URL + endpoint);

  if (!response.ok) {
    throw new Error("Something went wrong: " + response.status);
  }

  return await response.json();
}

export async function getCategories() {
  const data = await getData("categories.php");
  return data.categories || [];
}

export async function searchMeals(query) {
  const data = await getData("search.php?s=" + encodeURIComponent(query));
  return data.meals || [];
}

export async function getMealById(id) {
  const data = await getData("lookup.php?i=" + id);
  if (data.meals) {
    return data.meals[0];
  }
  return null;
}

export async function filterByCategory(category) {
  const data = await getData("filter.php?c=" + encodeURIComponent(category));
  return data.meals || [];
}

export async function filterByArea(area) {
  const data = await getData("filter.php?a=" + encodeURIComponent(area));
  return data.meals || [];
}

export async function getRandomMeal() {
  const data = await getData("random.php");
  if (data.meals) {
    return data.meals[0];
  }
  return null;
}