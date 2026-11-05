import {
  getTodayItems,
  getTodayTotals,
  getWeeklyTotals,
} from "../state/appState.js";

const MESSAGE_STYLE = "grid-column:1/-1;text-align:center;padding:40px;color:#6b7280;";

export function hideLoading() {
  const overlay = document.getElementById("app-loading-overlay");
  if (overlay) {
    overlay.style.display = "none";
  }
}

export function showGridLoading(gridId) {
  const grid = document.getElementById(gridId);
  if (grid) {
   
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5";
    
    grid.innerHTML = `
      <div class="col-span-1 sm:col-span-2 lg:col-span-4 flex items-center justify-center py-12 w-full">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    `;
  }
}

export function showError(gridId, message) {
  document.getElementById(gridId).innerHTML =
    '<p style="' + MESSAGE_STYLE + '">' + message + "</p>";
}

export function showToast(message, icon) {
  if (typeof Swal === "undefined") {
    alert(message);
    return;
  }

  Swal.fire({
    toast: true,
    position: "top-end",
    icon: icon || "success",
    title: message,
    showConfirmButton: false,
    timer: 1800,
  });
}

const categoryIcons = {
  Beef: "fa-drumstick-bite",
  Chicken: "fa-drumstick-bite",
  Dessert: "fa-ice-cream",
  Lamb: "fa-bacon",
  Miscellaneous: "fa-bowl-food",
  Pasta: "fa-bowl-food",
  Pork: "fa-bacon",
  Seafood: "fa-fish",
  Side: "fa-carrot",
  Starter: "fa-utensils",
  Vegan: "fa-leaf",
  Vegetarian: "fa-seedling",
  Breakfast: "fa-bread-slice",
  Goat: "fa-drumstick-bite",
};

export function renderCategories(categories) {
  const grid = document.getElementById("categories-grid");
  let cartona = ``;

  for (let i = 0; i < categories.length; i++) {
    const name = categories[i].strCategory;
    let icon = categoryIcons[name];
    if (!icon) {
      icon = "fa-utensils";
    }

    cartona +=
      '<div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group" data-category="' + name + '">' +
      '<div class="flex items-center gap-2.5">' +
      '<div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">' +
      '<i class="fa-solid ' + icon + '"></i>' +
      "</div>" +
      "<div><h3 class=\"text-sm font-bold text-gray-900\">" + name + "</h3></div>" +
      "</div>" +
      "</div>";
  }

  grid.innerHTML = cartona;
}

export function renderRecipes(meals, fallbackCategory, fallbackArea, viewMode) {
  const grid = document.getElementById("recipes-grid");
  const count = document.getElementById("recipes-count");

  if (!viewMode) viewMode = "grid";

  if (viewMode === "list") {
    grid.className = "flex flex-col gap-4";
  } else {
    grid.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5";
  }

if (meals.length === 0) {
    grid.innerHTML = `
      <div class="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col items-center justify-center py-12 text-center w-full">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">No recipes found</p>
          <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
      </div>
    `;
    count.textContent = "Showing 0 recipes";
    return;
}

  let cartona = ``;

  for (let i = 0; i < meals.length; i++) {
    const meal = meals[i];

    const category = meal.strCategory || fallbackCategory;
    const area = meal.strArea || fallbackArea;

    let description = "Delicious recipe to try!";
    if (meal.strInstructions) {
      description = meal.strInstructions.substring(0, 110) + "...";
    }

    let pills = "";
    let bottom = "";
    if (category) {
      pills += '<span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">' + category + "</span>";
      bottom += '<span class="font-semibold text-gray-900"><i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>' + category + "</span>";
    }
    if (area) {
      pills += '<span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">' + area + "</span>";
      bottom += '<span class="font-semibold text-gray-500"><i class="fa-solid fa-globe text-blue-500 mr-1"></i>' + area + "</span>";
    }

    if (viewMode === "list") {
      cartona +=
        '<div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex" data-meal-id="' + meal.idMeal + '">' +
        '<div class="relative w-48 h-32 shrink-0 overflow-hidden">' +
        '<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="' + meal.strMealThumb + '" alt="' + meal.strMeal + '" loading="lazy" />' +
        '<div class="absolute bottom-2 left-2 flex gap-1">' + pills + "</div>" +
        "</div>" +
        '<div class="p-4 flex-1 flex flex-col justify-center">' +
        '<h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">' + meal.strMeal + "</h3>" +
        '<p class="text-xs text-gray-600 mb-2 line-clamp-2">' + description + "</p>" +
        '<div class="flex items-center gap-6 text-xs">' + bottom + "</div>" +
        "</div>" +
        "</div>";
    } else {
      cartona +=
        '<div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="' + meal.idMeal + '">' +
        '<div class="relative h-48 overflow-hidden">' +
        '<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="' + meal.strMealThumb + '" alt="' + meal.strMeal + '" loading="lazy" />' +
        '<div class="absolute bottom-3 left-3 flex gap-2">' + pills + "</div>" +
        "</div>" +
        '<div class="p-4">' +
        '<h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">' + meal.strMeal + "</h3>" +
        '<p class="text-xs text-gray-600 mb-3 line-clamp-2">' + description + "</p>" +
        '<div class="flex items-center justify-between text-xs">' + bottom + "</div>" +
        "</div>" +
        "</div>";
    }
  }

  grid.innerHTML = cartona;
  count.textContent = "Showing " + meals.length + " recipes";
}

export function renderMealDetails(meal) {
  const nutrition = estimateMealNutrition(meal);
  const n = nutrition.perServing;

  let ingredientsHtml = "";
  let ingredientsCount = 0;
  for (let i = 1; i <= 20; i++) {
    const name = meal["strIngredient" + i];
    let measure = meal["strMeasure" + i];
    if (name && name.trim() !== "") {
      if (!measure) measure = "";
      ingredientsCount = ingredientsCount + 1;
      ingredientsHtml +=
        '<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">' +
        '<input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />' +
        '<span class="text-gray-700"><span class="font-medium text-gray-900">' + measure + "</span> " + name + "</span>" +
        "</div>";
    }
  }

  let stepsHtml = "";
  const lines = meal.strInstructions.split("\n");
  let stepNumber = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line !== "") {
      stepNumber = stepNumber + 1;
      stepsHtml +=
        '<div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">' +
        '<div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">' + stepNumber + "</div>" +
        '<p class="text-gray-700 leading-relaxed pt-2">' + line + "</p>" +
        "</div>";
    }
  }

  let videoHtml = "";
  if (meal.strYoutube && meal.strYoutube.indexOf("v=") !== -1) {
    const videoId = meal.strYoutube.split("v=")[1].split("&")[0];
    videoHtml =
      '<div class="bg-white rounded-2xl shadow-lg p-6">' +
      '<h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><i class="fa-solid fa-video text-red-500"></i> Video Tutorial</h2>' +
      '<div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">' +
      '<iframe src="https://www.youtube.com/embed/' + videoId + '" class="absolute inset-0 w-full h-full" frameborder="0" allowfullscreen></iframe>' +
      "</div></div>";
  }

  let tagsHtml =
    '<span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">' + meal.strCategory + "</span>" +
    '<span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">' + meal.strArea + "</span>";
  if (meal.strTags) {
    const firstTag = meal.strTags.split(",")[0];
    tagsHtml += '<span class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">' + firstTag + "</span>";
  }

  document.getElementById("meal-details").innerHTML =
    '<div class="max-w-7xl mx-auto">' +
    '<button id="back-to-meals-btn" class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors">' +
    '<i class="fa-solid fa-arrow-left"></i><span>Back to Recipes</span></button>' +
    '<div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">' +
    '<div class="relative h-80 md:h-96">' +
    '<img src="' + meal.strMealThumb + '" alt="' + meal.strMeal + '" class="w-full h-full object-cover" />' +
    '<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>' +
    '<div class="absolute bottom-0 left-0 right-0 p-8">' +
    '<div class="flex items-center gap-3 mb-3">' + tagsHtml + "</div>" +
    '<h1 class="text-3xl md:text-4xl font-bold text-white mb-2">' + meal.strMeal + "</h1>" +
    '<div class="flex items-center gap-6 text-white/90">' +
    '<span><i class="fa-solid fa-utensils mr-2"></i>' + nutrition.servings + " servings</span>" +
    '<span><i class="fa-solid fa-fire mr-2"></i>' + n.calories + " cal/serving</span>" +
    "</div>" +
    "</div></div></div>" +
    '<div class="flex flex-wrap gap-3 mb-8">' +
    '<button id="log-meal-btn" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all">' +
    '<i class="fa-solid fa-clipboard-list"></i><span>Log This Meal</span></button>' +
    "</div>" +
    '<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">' +
    '<div class="lg:col-span-2 space-y-8">' +
    '<div class="bg-white rounded-2xl shadow-lg p-6">' +
    '<h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">' +
    '<i class="fa-solid fa-list-check text-emerald-600"></i> Ingredients ' +
    '<span class="text-sm font-normal text-gray-500 ml-auto">' + ingredientsCount + " items</span></h2>" +
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' + ingredientsHtml + "</div></div>" +
    '<div class="bg-white rounded-2xl shadow-lg p-6">' +
    '<h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">' +
    '<i class="fa-solid fa-shoe-prints text-emerald-600"></i> Instructions</h2>' +
    '<div class="space-y-4">' + stepsHtml + "</div></div>" +
    videoHtml +
    "</div>" +
    '<div class="space-y-6">' +
    '<div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">' +
    '<h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">' +
    '<i class="fa-solid fa-chart-pie text-emerald-600"></i> Nutrition Facts</h2>' +
    '<p class="text-sm text-gray-500 mb-4">Per serving (estimated)</p>' +
    '<div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">' +
    '<p class="text-sm text-gray-600">Calories per serving</p>' +
    '<p class="text-4xl font-bold text-emerald-600">' + n.calories + "</p>" +
    '<p class="text-xs text-gray-500 mt-1">Total: ' + nutrition.totalCalories + " cal</p></div>" +
    macroRow("Protein", n.protein, 50, "emerald") +
    macroRow("Carbs", n.carbs, 250, "blue") +
    macroRow("Fat", n.fat, 65, "purple") +
    "</div></div>" +
    "</div></div>";
}

const gradeColors = {
  a: "#16a34a",
  b: "#84cc16",
  c: "#eab308",
  d: "#f97316",
  e: "#ef4444",
};

const novaColors = {
  1: "#22c55e",
  2: "#84cc16",
  3: "#f97316",
  4: "#ef4444",
};

function getNutrient(product, key) {
  if (product.nutriments && product.nutriments[key]) {
    return Math.round(Number(product.nutriments[key]) * 10) / 10;
  }
  return 0;
}

export function renderProducts(products, grade) {
  const grid = document.getElementById("products-grid");
  const count = document.getElementById("products-count");

  let cartona = ``;
  let total = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];

    let productGrade = "";
    if (product.nutriscore_grade) {
      productGrade = product.nutriscore_grade.toLowerCase();
    }

    if (grade !== "" && productGrade !== grade) {
      continue;
    }

    let name = product.product_name;
    if (!name) name = "Unknown product";

    let brand = "";
    if (product.brands) brand = product.brands.split(",")[0];

    let quantity = "";
    if (product.quantity) {
      quantity = '<span><i class="fa-solid fa-weight-scale mr-1"></i>' + product.quantity + "</span>";
    }

    let image = "";
    if (product.image_front_small_url) {
      image = '<img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="' + product.image_front_small_url + '" alt="' + name + '" loading="lazy" />';
    }

    let gradeBadge = "";
    if (productGrade !== "" && gradeColors[productGrade]) {
      gradeBadge = '<div class="absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded uppercase" style="background:' + gradeColors[productGrade] + ';">Nutri-Score ' + productGrade + "</div>";
    }

    let novaBadge = "";
    if (product.nova_group && novaColors[product.nova_group]) {
      novaBadge = '<div class="absolute top-2 right-2 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ' + product.nova_group + '" style="background:' + novaColors[product.nova_group] + ';">' + product.nova_group + "</div>";
    }

    cartona +=
      '<div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group" data-barcode="' + product.code + '">' +
      '<div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">' + image + gradeBadge + novaBadge + "</div>" +
      '<div class="p-4">' +
      '<p class="text-xs text-emerald-600 font-semibold mb-1 truncate">' + brand + "</p>" +
      '<h3 class="font-bold text-gray-900 mb-2 line-clamp-2">' + name + "</h3>" +
      '<div class="flex items-center gap-3 text-xs text-gray-500 mb-3">' + quantity +
      '<span><i class="fa-solid fa-fire mr-1"></i>' + Math.round(getNutrient(product, "energy-kcal_100g")) + " kcal/100g</span></div>" +
      '<div class="grid grid-cols-4 gap-1 text-center">' +
      '<div class="bg-emerald-50 rounded p-1.5"><p class="text-xs font-bold text-emerald-700">' + getNutrient(product, "proteins_100g") + 'g</p><p class="text-[10px] text-gray-500">Protein</p></div>' +
      '<div class="bg-blue-50 rounded p-1.5"><p class="text-xs font-bold text-blue-700">' + getNutrient(product, "carbohydrates_100g") + 'g</p><p class="text-[10px] text-gray-500">Carbs</p></div>' +
      '<div class="bg-purple-50 rounded p-1.5"><p class="text-xs font-bold text-purple-700">' + getNutrient(product, "fat_100g") + 'g</p><p class="text-[10px] text-gray-500">Fat</p></div>' +
      '<div class="bg-orange-50 rounded p-1.5"><p class="text-xs font-bold text-orange-700">' + getNutrient(product, "sugars_100g") + 'g</p><p class="text-[10px] text-gray-500">Sugar</p></div>' +
      "</div>" +
      '<button class="log-product-btn mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700" data-barcode="' + product.code + '">+ Log (per 100g)</button>' +
      "</div>" +
      "</div>";

    total = total + 1;
  }

  if (total === 0) {
    showError("products-grid", "No products found.");
  } else {
    grid.innerHTML = cartona;
  }

  count.textContent = "Showing " + total + " products";
}

export function renderFoodLog() {
  const dateEl = document.getElementById("foodlog-date");
  dateEl.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const items = getTodayItems();
  const totals = getTodayTotals();
  const section = document.getElementById("foodlog-today-section");

  setText("today-meals-count", totals.meals);

  const goals = [2000, 50, 250, 65];
  const values = [totals.calories, totals.protein, totals.carbs, totals.fat];
  const units = ["kcal", "g", "g", "g"];
  const cards = section.querySelector(".grid").children;

  for (let i = 0; i < cards.length; i++) {
    const valueText = cards[i].querySelector(".text-gray-500");
    const bar = cards[i].querySelector(".bg-gray-200 div");

    let percent = Math.round((values[i] / goals[i]) * 100);
    if (percent > 100) percent = 100;

    valueText.textContent = Math.round(values[i]) + " / " + goals[i] + " " + units[i];
    bar.style.width = percent + "%";
  }

  section.querySelector("h4").textContent = "Logged Items (" + items.length + ")";
  document.getElementById("clear-foodlog").style.display = items.length > 0 ? "" : "none";

  const list = document.getElementById("logged-items-list");

  if (items.length === 0) {
    list.innerHTML =
      '<div class="text-center py-8 text-gray-500">' +
      '<i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>' +
      '<p class="font-medium">No meals logged today</p>' +
      '<p class="text-sm">Add meals from the Meals page or scan products</p>' +
      "</div>";
  } else {
    let cartona = ``;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      let details = "No nutrition data";
      if (item.calories > 0) {
        details =
          Math.round(item.calories) + " kcal · P " + Math.round(item.protein) +
          "g · C " + Math.round(item.carbs) + "g · F " + Math.round(item.fat) + "g";
      }

      let thumb = "";
      if (item.image) {
        thumb = '<img src="' + item.image + '" alt="' + item.name + '" class="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy" />';
      } else {
        thumb = '<div class="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0"><i class="fa-solid fa-utensils text-emerald-600"></i></div>';
      }

      let badges = "";
      if (item.category) badges += '<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-semibold rounded-full">' + item.category + '</span>';
      if (item.area) badges += '<span class="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">' + item.area + '</span>';
      if (item.brand) badges += '<span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-semibold rounded-full">' + item.brand + '</span>';
      if (item.type === "meal") badges += '<span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">Meal</span>';
      else if (item.type === "product") badges += '<span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">Product</span>';

      let ingredientsBlock = "";
      if (item.ingredients && item.ingredients.length > 0) {
        let ingList = "";
        for (let k = 0; k < item.ingredients.length; k++) {
          ingList +=
            '<li class="flex items-center gap-2 text-xs text-gray-600">' +
            '<i class="fa-solid fa-circle text-[4px] text-emerald-500"></i>' +
            '<span><span class="font-medium text-gray-800">' + item.ingredients[k].measure + '</span> ' +
            item.ingredients[k].name + '</span></li>';
        }
        ingredientsBlock =
          '<details class="mt-2 pl-16">' +
          '<summary class="cursor-pointer text-xs text-emerald-600 font-medium hover:text-emerald-700">' +
          '<i class="fa-solid fa-list-check mr-1"></i>Show ingredients (' + item.ingredients.length + ')</summary>' +
          '<ul class="mt-2 space-y-1 bg-emerald-50/50 rounded-lg p-3">' + ingList + '</ul>' +
          '</details>';
      }

      const servingsTxt = (item.servings && item.servings !== 1)
        ? ' <span class="text-xs font-normal text-gray-500">× ' + item.servings + ' serving' + (item.servings > 1 ? 's' : '') + '</span>'
        : '';

      cartona +=
        '<div class="p-3 bg-gray-50 rounded-xl">' +
        '<div class="flex items-start gap-3">' +
        thumb +
        '<div class="flex-1 min-w-0">' +
        '<div class="flex items-start justify-between gap-2">' +
        '<div class="flex-1 min-w-0">' +
        '<p class="font-semibold text-gray-900 truncate">' + item.name + servingsTxt + '</p>' +
        '<p class="text-xs text-gray-500">' + details + '</p>' +
        '</div>' +
        '<button class="remove-log-btn text-red-500 hover:text-red-600 shrink-0" data-id="' + item.id + '">' +
        '<i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
        (badges ? '<div class="flex flex-wrap gap-1 mt-2">' + badges + '</div>' : '') +
        ingredientsBlock +
        '</div>' +
        '</div>' +
        '</div>';
    }
    list.innerHTML = cartona;
  }

  renderWeeklyChart();
}

function renderWeeklySummary(weekly) {
  let calories = 0, protein = 0, carbs = 0, fat = 0, meals = 0;
  for (let i = 0; i < weekly.length; i++) {
    calories += weekly[i].total;
    protein += weekly[i].protein;
    carbs += weekly[i].carbs;
    fat += weekly[i].fat;
    meals += weekly[i].count;
  }
  setText("week-meals", meals);
  setText("week-calories", Math.round(calories) + " kcal");
  setText("week-protein", Math.round(protein) + " g");
  setText("week-carbs", Math.round(carbs) + " g");
  setText("week-fat", Math.round(fat) + " g");
}

function renderWeeklyChart() {
  const chart = document.getElementById("weekly-chart");
  const weekly = getWeeklyTotals();

  renderWeeklySummary(weekly);

  if (typeof Plotly === "undefined") {
    chart.innerHTML = "<p>Chart library not loaded.</p>";
    return;
  }

  const labels = [];
  const totals = [];

  for (let i = 0; i < weekly.length; i++) {
    labels.push(weekly[i].label);
    totals.push(weekly[i].total);
  }

  Plotly.newPlot(
    "weekly-chart",
    [{ x: labels, y: totals, type: "bar", marker: { color: "#10b981" } }],
    { margin: { t: 20, l: 50, r: 10, b: 40 }, yaxis: { title: "kcal" } },
    { responsive: true, displayModeBar: false }
  );
}

const DB = [
  [["black pepper", "salt", "ginger", "cumin", "cinnamon", "paprika", "turmeric", "oregano", "thyme", "parsley", "coriander", "cardamom", "chilli", "chili", "nutmeg", "basil", "mint", "bay leaf", "spice", "seasoning"], 250, 10, 50, 5, 2, 0.6],
  [["soy sauce", "sauce", "stock", "broth", "ketchup"], 40, 3, 6, 0.2, 15, 1.1],
  [["vinegar", "wine", "juice"], 25, 0, 3, 0, 15, 1],
  [["water"], 0, 0, 0, 0, 100, 1],
  [["tomato puree", "tomato paste", "passata"], 80, 4, 18, 0.5, 15, 1.1],
  [["tomato", "tomatoes"], 18, 0.9, 3.9, 0.2, 120, 1],
  [["potato", "potatoes"], 77, 2, 17, 0.1, 170, 1],
  [["onion", "onions"], 40, 1.1, 9, 0.1, 110, 1],
  [["garlic"], 149, 6.4, 33, 0.5, 5, 1],
  [["carrot", "carrots"], 41, 0.9, 10, 0.2, 60, 1],
  [["bell pepper", "red pepper", "green pepper", "yellow pepper", "capsicum"], 31, 1, 6, 0.3, 120, 1],
  [["broccoli", "spinach", "cabbage", "lettuce", "cucumber", "zucchini", "courgette", "celery", "mushroom", "eggplant", "aubergine", "vegetable", "stir-fry vegetables", "leek", "cauliflower"], 30, 2.5, 5, 0.3, 100, 0.8],
  [["lemon", "lime", "orange"], 30, 1, 9, 0.3, 60, 1],
  [["apple", "banana", "dates", "raisin"], 70, 0.7, 17, 0.3, 120, 0.8],
  [["chicken breast"], 165, 31, 0, 3.6, 170, 1],
  [["chicken thigh", "chicken leg", "drumstick"], 209, 26, 0, 11, 120, 1],
  [["chicken"], 190, 27, 0, 8, 170, 1],
  [["minced beef", "ground beef", "beef mince", "mince"], 250, 26, 0, 15, 100, 1],
  [["beef", "steak"], 250, 26, 0, 15, 150, 1],
  [["lamb"], 294, 25, 0, 21, 150, 1],
  [["pork", "bacon", "sausage", "ham"], 290, 20, 0, 23, 100, 1],
  [["salmon"], 208, 20, 0, 13, 150, 1],
  [["fish", "tuna", "cod", "prawn", "prawns", "shrimp", "haddock"], 130, 22, 1, 4, 100, 1],
  [["egg", "eggs"], 143, 13, 1, 10, 50, 1],
  [["coconut milk"], 197, 2, 3, 21, 100, 1],
  [["milk"], 61, 3.2, 4.8, 3.3, 100, 1.03],
  [["cream"], 340, 2, 3, 36, 100, 1],
  [["yogurt", "yoghurt"], 61, 3.5, 4.7, 3.3, 100, 1.03],
  [["cheese", "parmesan", "cheddar", "mozzarella", "feta"], 350, 24, 2, 27, 30, 0.5],
  [["peanut", "almond", "walnut", "cashew", "nut", "nuts"], 600, 20, 20, 50, 30, 0.6],
  [["butter", "margarine", "ghee"], 717, 0.9, 0.1, 81, 14, 0.95],
  [["olive oil", "vegetable oil", "sunflower oil", "oil"], 884, 0, 0, 100, 14, 0.92],
  [["rice"], 360, 7, 76, 2.7, 100, 0.8],
  [["pasta", "spaghetti", "macaroni", "noodle", "noodles", "penne", "fettuccine", "lasagne"], 360, 13, 74, 1.5, 100, 0.42],
  [["flour"], 364, 10, 76, 1, 100, 0.53],
  [["breadcrumbs", "bread"], 265, 9, 49, 3.2, 30, 0.4],
  [["cornstarch", "corn starch", "cornflour"], 381, 0.3, 91, 0.1, 8, 0.6],
  [["sugar", "honey", "syrup"], 385, 0, 99, 0, 10, 0.85],
  [["chocolate", "cocoa"], 500, 6, 55, 30, 30, 0.6],
  [["beans", "bean", "lentils", "lentil", "chickpeas", "peas"], 120, 8, 20, 0.5, 100, 0.8],
  [["oats", "oat"], 380, 13, 66, 7, 100, 0.4],
];

const FALLBACK = [[], 120, 3, 15, 4, 100, 1];

const UNITS = {
  g: 1, gram: 1, grams: 1, kg: 1000,
  ml: 1, l: 1000, litre: 1000, liter: 1000,
  cup: 240, cups: 240,
  tbs: 15, tbsp: 15, tablespoon: 15, tablespoons: 15, tblsp: 15,
  tsp: 5, teaspoon: 5, teaspoons: 5,
  oz: 28, lb: 454, lbs: 454, pound: 454,
  pinch: 1, dash: 1, sprig: 2, handful: 30,
};
const VOLUME_UNITS = ["ml", "l", "litre", "liter", "cup", "cups", "tbs", "tbsp", "tablespoon", "tablespoons", "tblsp", "tsp", "teaspoon", "teaspoons"];
const FIXED_PIECES = { clove: 5, cloves: 5, slice: 30, slices: 30, can: 400, tin: 400, knob: 15, bunch: 30 };

const SERVINGS = 4;

function findIngredient(name) {
  const text = name.toLowerCase();
  for (let i = 0; i < DB.length; i++) {
    for (let j = 0; j < DB[i][0].length; j++) {
      const key = DB[i][0][j].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp("\\b" + key + "s?\\b").test(text)) {
        return DB[i];
      }
    }
  }
  return FALLBACK;
}

function toNumber(str) {
  const parts = str.trim().split(/\s+/);
  let total = 0;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].indexOf("/") !== -1) {
      const f = parts[i].split("/");
      total += Number(f[0]) / Number(f[1]);
    } else {
      total += parseFloat(parts[i]) || 0;
    }
  }
  return total;
}

function measureToGrams(measure, item) {
  const piece = item[5];
  const density = item[6];

  const text = (measure || "").toLowerCase()
    .replace("½", " 1/2").replace("¼", " 1/4").replace("¾", " 3/4");

  const m = text.match(/^\s*(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)?\s*(?:-\s*\d+)?\s*([a-z]+)?/);
  const number = m && m[1] ? toNumber(m[1]) : 0;
  const unit = m && m[2] ? m[2] : "";

  if (number === 0) return 3;
  if (FIXED_PIECES[unit]) return number * FIXED_PIECES[unit];
  if (UNITS[unit]) {
    let grams = number * UNITS[unit];
    if (VOLUME_UNITS.indexOf(unit) !== -1) grams = grams * density;
    return grams;
  }
  return number * piece;
}

export function estimateMealNutrition(meal) {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  for (let i = 1; i <= 20; i++) {
    const name = meal["strIngredient" + i];
    if (!name || name.trim() === "") continue;

    const item = findIngredient(name);
    const factor = measureToGrams(meal["strMeasure" + i], item) / 100;

    total.calories += item[1] * factor;
    total.protein += item[2] * factor;
    total.carbs += item[3] * factor;
    total.fat += item[4] * factor;
  }

  return {
    servings: SERVINGS,
    totalCalories: Math.round(total.calories),
    perServing: {
      calories: Math.round(total.calories / SERVINGS),
      protein: Math.round(total.protein / SERVINGS),
      carbs: Math.round(total.carbs / SERVINGS),
      fat: Math.round(total.fat / SERVINGS),
    },
  };
}

function macroRow(label, value, goal, color) {
  const percent = Math.min(100, Math.round((value / goal) * 100));
  return (
    '<div class="flex items-center justify-between mt-3"><span class="text-gray-700">' + label +
    '</span><span class="font-bold text-gray-900">' + value + "g</span></div>" +
    '<div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-' + color +
    '-500 h-2 rounded-full" style="width:' + percent + '%"></div></div>'
  );
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}