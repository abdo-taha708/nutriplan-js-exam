import {
  getCategories,
  searchMeals,
  getMealById,
  filterByCategory,
  filterByArea,
} from "./api/mealdb.js";

import {
  searchProducts,
  getProductByBarcode,
  getProductsByCategory,
} from "./api/products.js";

import {
  state,
  setCurrentPage,
  addFoodLogItem,
  removeFoodLogItem,
  clearFoodLog,
} from "./state/appState.js";

import {
  renderCategories,
  renderRecipes,
  renderProducts,
  renderMealDetails,
  renderFoodLog,
  hideLoading,
  showGridLoading,
  showError,
  showToast,
  estimateMealNutrition,
} from "./ui/components.js";

const mealsSections = [
  "search-filters-section",
  "meal-categories-section",
  "all-recipes-section",
];

const pages = ["meals", "products", "foodlog"];

const pageTitles = {
  meals: ["Meals & Recipes", "Discover delicious and nutritious recipes tailored for you"],
  products: ["Product Scanner", "Search packaged foods and check their nutrition"],
  foodlog: ["Food Log", "Track and monitor your daily nutrition intake"],
};

const NAV_ACTIVE = "nav-link flex items-center gap-3 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-all";
const NAV_INACTIVE = "nav-link flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all";

const FILTER_ACTIVE = "px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all";
const FILTER_INACTIVE = "px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";

const productCategories = ["snacks", "beverages", "breakfasts", "desserts", "dairies"];

let currentViewMode = "grid";

function hideSection(id) {
  document.getElementById(id).classList.add("hidden");
}

function showSection(id) {
  document.getElementById(id).classList.remove("hidden");
}

function renderCurrentRecipes() {
  renderRecipes(state.recipes, state.selectedCategory, state.selectedArea, currentViewMode);
}

async function loadCategories() {
  try {
    state.categories = await getCategories();
    renderCategories(state.categories);
  } catch (error) {
    showError("categories-grid", "Could not load categories.");
    console.error(error);
  }
}

async function loadRecipes() {
  state.selectedCategory = "";
  state.selectedArea = "";
  showGridLoading("recipes-grid");
  try {
    state.recipes = await searchMeals("");
    renderCurrentRecipes();
  } catch (error) {
    showError("recipes-grid", "Could not load recipes.");
    console.error(error);
  }
}

let searchTimer = null;

async function runSearch(query) {
  state.selectedCategory = "";
  state.selectedArea = "";
  setActiveFilter(-1);
  showGridLoading("recipes-grid");
  try {
    state.recipes = await searchMeals(query);
    renderCurrentRecipes();
  } catch (error) {
    showError("recipes-grid", "Search failed. Try again.");
    console.error(error);
  }
}

function handleSearch(event) {
  const query = event.target.value.trim();
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function () {
    runSearch(query);
  }, 400);
}

function setActiveFilter(index) {
  const buttons = document.querySelectorAll("#search-filters-section button");
  for (let i = 0; i < buttons.length; i++) {
    if (i === index) {
      buttons[i].className = FILTER_ACTIVE;
    } else {
      buttons[i].className = FILTER_INACTIVE;
    }
  }
}

async function handleFilterClick(index) {
  setActiveFilter(index);
  document.getElementById("search-input").value = "";

  if (index === 0) {
    loadRecipes();
    return;
  }

  state.selectedCategory = "";
  state.selectedArea = "Egyptian";
  showGridLoading("recipes-grid");
  try {
    state.recipes = await filterByArea("Egyptian");
    renderCurrentRecipes();
  } catch (error) {
    showError("recipes-grid", "Could not filter recipes.");
    console.error(error);
  }
}

async function handleCategoryClick(categoryName) {
  setActiveFilter(-1);
  state.selectedCategory = categoryName;
  state.selectedArea = "";
  showGridLoading("recipes-grid");
  try {
    state.recipes = await filterByCategory(categoryName);
    renderCurrentRecipes();
  } catch (error) {
    showError("recipes-grid", "Could not filter recipes.");
    console.error(error);
  }
}

async function handleRecipeClick(id) {
  try {
    const meal = await getMealById(id);
    if (meal) {
      state.currentMeal = meal;
      renderMealDetails(meal);

      for (let i = 0; i < mealsSections.length; i++) {
        hideSection(mealsSections[i]);
      }
      showSection("meal-details");
      window.scrollTo(0, 0);
    }
  } catch (error) {
    showToast("Could not load meal details.", "error");
    console.error(error);
  }
}

async function handleProductSearch() {
  const text = document.getElementById("product-search-input").value.trim();
  if (text === "") {
    showToast("Type a product name first.", "warning");
    return;
  }

  showGridLoading("products-grid");
  try {
    state.products = (await searchProducts(text)) || [];
    renderProducts(state.products, state.nutriFilter);
  } catch (error) {
    showError("products-grid", "Product search failed. Try again.");
    console.error(error);
  }
}

async function handleBarcodeLookup() {
  const barcode = document.getElementById("barcode-input").value.trim();
  if (barcode === "") {
    showToast("Type a barcode first.", "warning");
    return;
  }

  showGridLoading("products-grid");
  try {
    state.products = (await getProductByBarcode(barcode)) || [];
    renderProducts(state.products, state.nutriFilter);
  } catch (error) {
    showError("products-grid", "Barcode lookup failed. Try again.");
    console.error(error);
  }
}

async function handleProductCategory(index) {
  showGridLoading("products-grid");
  try {
    state.products = (await getProductsByCategory(productCategories[index])) || [];
    renderProducts(state.products, state.nutriFilter);
  } catch (error) {
    showError("products-grid", "Could not load products.");
    console.error(error);
  }
}

function handleNutriFilter(button) {
  state.nutriFilter = button.dataset.grade;

  const buttons = document.querySelectorAll(".nutri-score-filter");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove("ring-2", "ring-offset-2", "ring-emerald-600");
  }
  button.classList.add("ring-2", "ring-offset-2", "ring-emerald-600");

  renderProducts(state.products, state.nutriFilter);
}

function logProduct(barcode) {
  for (let i = 0; i < state.products.length; i++) {
    const product = state.products[i];
    if (product.code === barcode) {
      let name = product.product_name || "Unknown product";
      const nutriments = product.nutriments || {};

      addFoodLogItem(
        name,
        nutriments["energy-kcal_100g"],
        nutriments["proteins_100g"],
        nutriments["carbohydrates_100g"],
        nutriments["fat_100g"],
        {
          type: "product",
          barcode: product.code,
          brand: product.brands || null,
          image: product.image_front_small_url || null,
        }
      );
      renderFoodLog();
      showToast("Added to Food Log: " + name);
      return;
    }
  }
}

async function handleLogMeal() {
  const meal = state.currentMeal;
  if (!meal) return;

  const nutrition = estimateMealNutrition(meal);
  const n = nutrition.perServing;

  const result = await Swal.fire({
    title: "Log " + meal.strMeal,
    html:
      "<p>Per serving (estimated): <b>" + n.calories + " kcal</b><br>" +
      "P " + n.protein + "g · C " + n.carbs + "g · F " + n.fat + "g</p>" +
      "<label>How many servings?</label>" +
      '<input id="log-servings" type="number" min="0.5" step="0.5" value="1" class="swal2-input">',
    showCancelButton: true,
    confirmButtonText: "Log meal",
    preConfirm: function () {
      const servings = Number(document.getElementById("log-servings").value);
      if (!servings || servings <= 0) {
        Swal.showValidationMessage("Enter a valid number of servings");
        return false;
      }
      return servings;
    },
  });

  if (!result.isConfirmed) return;

  const s = result.value;

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal["strIngredient" + i];
    const measure = meal["strMeasure" + i];
    if (ing && ing.trim() !== "") {
      ingredients.push({
        name: ing.trim(),
        measure: (measure || "").trim(),
      });
    }
  }

  addFoodLogItem(
    meal.strMeal,
    n.calories * s,
    n.protein * s,
    n.carbs * s,
    n.fat * s,
    {
      servings: s,
      type: "meal",
      mealId: meal.idMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      area: meal.strArea,
      ingredients: ingredients,
    }
  );

  renderFoodLog();

  showToast("Logged " + s + " serving(s) · " + Math.round(n.calories * s) + " kcal");

  const go = await Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: "Meal logged!",
    showCancelButton: true,
    confirmButtonText: "View Food Log",
    cancelButtonText: "Stay",
    timer: 4000,
  });
  if (go.isConfirmed) showPage("foodlog");
}

async function handleCustomEntry() {
  const result = await Swal.fire({
    title: "Custom Entry",
    html:
      '<input id="custom-name" class="swal2-input" placeholder="Food name">' +
      '<input id="custom-calories" type="number" class="swal2-input" placeholder="Calories (kcal)">',
    showCancelButton: true,
    confirmButtonText: "Add",
    preConfirm: function () {
      const name = document.getElementById("custom-name").value.trim();
      const calories = document.getElementById("custom-calories").value;
      if (name === "") {
        Swal.showValidationMessage("Please enter a food name");
        return false;
      }
      return { name: name, calories: calories };
    },
  });

  if (result.isConfirmed) {
    addFoodLogItem(result.value.name, result.value.calories, 0, 0, 0);
    renderFoodLog();
    showToast("Added to Food Log");
  }
}

async function handleClearFoodLog() {
  const result = await Swal.fire({
    title: "Clear all logged items?",
    text: "This will delete your whole food log.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, clear it",
  });

  if (result.isConfirmed) {
    clearFoodLog();
    renderFoodLog();
  }
}

function updateNav(page) {
  const links = document.querySelectorAll(".nav-link");
  for (let i = 0; i < links.length; i++) {
    const text = links[i].querySelector("span");
    if (pages[i] === page) {
      links[i].className = NAV_ACTIVE;
      text.className = "font-semibold";
    } else {
      links[i].className = NAV_INACTIVE;
      text.className = "font-medium";
    }
  }
}

function showPage(page) {
  setCurrentPage(page);

  if (window.location.hash !== "#" + page) {
    window.location.hash = page;
  }

  for (let i = 0; i < mealsSections.length; i++) {
    hideSection(mealsSections[i]);
  }
  hideSection("meal-details");
  hideSection("products-section");
  hideSection("foodlog-section");

  if (page === "meals") {
    for (let i = 0; i < mealsSections.length; i++) {
      showSection(mealsSections[i]);
    }
  } else if (page === "products") {
    showSection("products-section");
  } else if (page === "foodlog") {
    showSection("foodlog-section");
    renderFoodLog();
  }

  document.querySelector("#header h1").textContent = pageTitles[page][0];
  document.querySelector("#header p").textContent = pageTitles[page][1];
  updateNav(page);
  window.scrollTo(0, 0);
}

function setupEvents() {
  document.getElementById("search-input").addEventListener("input", handleSearch);

  const filterButtons = document.querySelectorAll("#search-filters-section button");
  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener("click", function () {
      handleFilterClick(i);
    });
  }

  document.getElementById("categories-grid").addEventListener("click", function (event) {
    const card = event.target.closest(".category-card");
    if (card) {
      handleCategoryClick(card.dataset.category);
    }
  });

  document.getElementById("recipes-grid").addEventListener("click", function (event) {
    const card = event.target.closest(".recipe-card");
    if (card) {
      handleRecipeClick(card.dataset.mealId);
    }
  });

  document.getElementById("meal-details").addEventListener("click", function (event) {
    if (event.target.closest("#back-to-meals-btn")) {
      showPage("meals");
      return;
    }

    if (event.target.closest("#log-meal-btn")) {
      handleLogMeal();
    }
  });

  const navLinks = document.querySelectorAll(".nav-link");
  for (let i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function (event) {
      event.preventDefault();
      showPage(pages[i]);
    });
  }

  document.getElementById("search-product-btn").addEventListener("click", handleProductSearch);
  document.getElementById("lookup-barcode-btn").addEventListener("click", handleBarcodeLookup);

  document.getElementById("product-search-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleProductSearch();
    }
  });

  document.getElementById("barcode-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      handleBarcodeLookup();
    }
  });

  const nutriButtons = document.querySelectorAll(".nutri-score-filter");
  for (let i = 0; i < nutriButtons.length; i++) {
    nutriButtons[i].addEventListener("click", function () {
      handleNutriFilter(this);
    });
  }

  const categoryButtons = document.querySelectorAll(".product-category-btn");
  for (let i = 0; i < categoryButtons.length; i++) {
    categoryButtons[i].addEventListener("click", function () {
      handleProductCategory(i);
    });
  }

  document.getElementById("products-grid").addEventListener("click", function (event) {
    const btn = event.target.closest(".log-product-btn");
    if (btn) {
      logProduct(btn.dataset.barcode);
    }
  });

  document.getElementById("clear-foodlog").addEventListener("click", handleClearFoodLog);

  document.getElementById("logged-items-list").addEventListener("click", function (event) {
    const btn = event.target.closest(".remove-log-btn");
    if (btn) {
      removeFoodLogItem(btn.dataset.id);
      renderFoodLog();
    }
  });

  const quickButtons = document.querySelectorAll(".quick-log-btn");
  for (let i = 0; i < quickButtons.length; i++) {
    quickButtons[i].addEventListener("click", function () {
      if (i === 0) {
        showPage("meals");
      } else if (i === 1) {
        showPage("products");
      } else {
        handleCustomEntry();
      }
    });
  }

  const viewToggleContainer = document.getElementById("view-toggle");
  if (viewToggleContainer) {
    const buttons = viewToggleContainer.querySelectorAll("button");
    const gridBtn = buttons[0];
    const listBtn = buttons[1];

    gridBtn.addEventListener("click", function () {
      currentViewMode = "grid";
      gridBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
      gridBtn.querySelector("i").className = "fa-solid fa-table-cells text-gray-700";
      listBtn.className = "px-3 py-1.5";
      listBtn.querySelector("i").className = "fa-solid fa-list text-gray-500";
      renderCurrentRecipes();
    });

    listBtn.addEventListener("click", function () {
      currentViewMode = "list";
      listBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
      listBtn.querySelector("i").className = "fa-solid fa-list text-gray-700";
      gridBtn.className = "px-3 py-1.5";
      gridBtn.querySelector("i").className = "fa-solid fa-table-cells text-gray-500";
      renderCurrentRecipes();
    });
  }
}

async function init() {
  setupEvents();

  let startPage = window.location.hash.replace("#", "");
  if (pages.indexOf(startPage) === -1) startPage = "meals";
  showPage(startPage);

  showError("products-grid", "Search for a product or pick a category to see results.");

  await loadCategories();
  await loadRecipes();

  hideLoading();
}

window.addEventListener("hashchange", function () {
  let page = window.location.hash.replace("#", "");
  if (pages.indexOf(page) === -1) page = "meals";
  if (state.currentPage !== page) showPage(page);
});

init();




const navLinks = document.querySelectorAll(".nav-link");
const pageNames = ["meals", "products", "foodlog"];

navLinks.forEach(function (link, index) {
  link.addEventListener("click", function () {
  
    window.location.hash = pageNames[index];
  });
});


window.addEventListener("hashchange", function () {
  const currentHash = window.location.hash.replace("#", "");
  

  if (state.currentPage === currentHash) return;


  const targetIndex = pageNames.indexOf(currentHash);
  if (targetIndex !== -1) {

    navLinks[targetIndex].click();
  }
});


window.addEventListener("load", function () {
  const initialHash = window.location.hash.replace("#", "");
  const targetIndex = pageNames.indexOf(initialHash);
  
  if (targetIndex !== -1) {
   
    setTimeout(function () {
      navLinks[targetIndex].click();
    }, 500);
  }
});