// Add reset button event listener
const resetBtn = document.getElementById("reset_products");
if (resetBtn) {
	resetBtn.addEventListener("click", () => {
		// Query checkboxes each time to avoid ReferenceError
		const categoryInputs = document.querySelectorAll('#category_filter input[type="checkbox"]');
		const colorInputs = document.querySelectorAll('#color_filter input[type="checkbox"]');
		categoryInputs.forEach((input) => {
			input.checked = false;
		});
		colorInputs.forEach((input) => {
			input.checked = false;
		});
		// Clear search input
		const searchInput = document.getElementById("search");
		if (searchInput) searchInput.value = "";
		// Reset sort select to default (A-Z)
		const sortSelect = document.getElementById("select_sort");
		if (sortSelect) sortSelect.value = "az";
		// Show all products
		getProducts(allProducts, true);
	});
}
const body = document.querySelector("body");
const buttons = document.querySelectorAll(".menu_button");
const open = document.querySelector(".open_button");

function toggleMenu() {
	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			const isActive = body.classList.toggle("menu_active");
			if (isActive) {
				open.setAttribute("aria-expanded", "true");
			} else {
				open.setAttribute("aria-expanded", "false");
			}
		});
	});
}

let allProducts = [];
let filteredProducts = [];
let itemsToShow = 9;
let currentIndex = 0;
// No need for firstVisibleIndex variable, calculate dynamically
function getProducts(products, reset = false) {
	const grid = document.getElementById("products");
	if (!grid) return;

	if (reset) {
		grid.innerHTML = ""; // Clear previous products only when resetting
		currentIndex = 0;
	}

	const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
	const toDisplay = products.slice(currentIndex, currentIndex + itemsToShow);
	toDisplay.forEach((product) => {
		const article = document.createElement("article");
		article.classList.add("product");

		let displayPrice = `${fmt.format(product.price)}`;
		if (product.sale && product.discount) {
			const salePrice = product.price - product.price * (product.discount / 100);
			displayPrice = `
						<span>${fmt.format(salePrice)}</span>
						<span>${fmt.format(product.price)}</span>
					`;
		}

		article.innerHTML = `
					<figure class="figure">
						<img loading="lazy" src="images/${product.image}" alt="${product.alt}" />
					</figure>
					<h2 class="product-heading">${product.name}</h2>
					<p>${displayPrice}</p>
				`;
		grid.appendChild(article);
	});
	const firstItemEls = document.querySelectorAll("#first_item");
	const lastItemEls = document.querySelectorAll("#last_item");
	const totalItemsEls = document.querySelectorAll("#total_items");
	// Calculate first and last visible indices
	currentIndex += toDisplay.length;
	let firstIdx = products.length === 0 ? 0 : 1;
	let lastIdx = products.length === 0 ? 0 : currentIndex;
	if (lastIdx > products.length) lastIdx = products.length;
	firstItemEls.forEach((el) => (el.textContent = firstIdx));
	lastItemEls.forEach((el) => (el.textContent = lastIdx));
	totalItemsEls.forEach((el) => (el.textContent = products.length));
	// Show/hide Load More button
	const loadMoreBtn = document.getElementById("load_more");
	if (loadMoreBtn) {
		if (currentIndex >= products.length) {
			loadMoreBtn.classList.remove("more_active");
		} else {
			loadMoreBtn.classList.add("more_active");
		}
	}
}

function getCheckedFilters() {
	const checkedCategories = Array.from(document.querySelectorAll("#category_filter input[type=checkbox]:checked")).map((i) => i.value);
	const checkedColors = Array.from(document.querySelectorAll('#color_filter input[type="checkbox"]:checked')).map((i) => i.value);
	// return { checkedCategories, checkedColors };

	// need to search product names using the search input field
	const searchInput = document.getElementById("search_input");
	const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
	return { checkedCategories, checkedColors, searchTerm };
}

function filterProducts() {
	const { checkedCategories, checkedColors } = getCheckedFilters();
	const searchInput = document.getElementById("search");
	const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";
	let filteredProducts = allProducts.filter((product) => {
		let categoryMatch = checkedCategories.length === 0 || checkedCategories.every((cat) => product.category.includes(cat));
		let colorMatch = checkedColors.length === 0 || checkedColors.every((col) => product.colors.includes(col));
		let searchMatch = true;
		if (searchTerm) {
			searchMatch = product.name.toLowerCase().includes(searchTerm);
		}
		return categoryMatch && colorMatch && searchMatch;
	});
	// Sort filteredProducts
	const sortSelect = document.getElementById("select_sort");
	if (sortSelect) {
		switch (sortSelect.value) {
			case "az":
				filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "za":
				filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case "lowhigh":
				filteredProducts.sort((a, b) => a.price - b.price);
				break;
			case "highlow":
				filteredProducts.sort((a, b) => b.price - a.price);
				break;
		}
	}
	getProducts(filteredProducts, true);
}

function createFilters(params) {
	const filterSection = document.getElementById("filters");
	if (!filterSection) return;
	const categoryList = document.getElementById("category_filter");
	const colorList = document.getElementById("color_filter");
	if (!categoryList || !colorList) return;

	params.categories.forEach((category) => {
		const listItem = document.createElement("li");
		const input = document.createElement("input");
		input.type = "checkbox";
		input.name = "category";
		input.value = category;

		const label = document.createElement("label");
		label.textContent = category.charAt(0).toUpperCase() + category.slice(1);

		label.prepend(input);
		listItem.appendChild(label);

		categoryList.appendChild(listItem);
	});

	params.colors.forEach((color) => {
		const listItem = document.createElement("li");
		const input = document.createElement("input");
		input.type = "checkbox";
		input.name = "color";
		input.value = color;

		const label = document.createElement("label");
		label.textContent = color.charAt(0).toUpperCase() + color.slice(1);

		label.prepend(input);
		listItem.appendChild(label);

		colorList.appendChild(listItem);
	});

	const categoryInputs = filterSection.querySelectorAll('#category_filter input[type="checkbox"]');
	const colorInputs = filterSection.querySelectorAll('#color_filter input[type="checkbox"]');
	categoryInputs.forEach((input, idx) => {
		input.addEventListener("change", filterProducts);
	});
	colorInputs.forEach((input, idx) => {
		input.addEventListener("change", filterProducts);
	});
	// Add search input event listener
	const searchInput = document.getElementById("search");
	if (searchInput) {
		searchInput.addEventListener("input", filterProducts);
	}
}

function initProductsAndFilters() {
	fetch("products.json")
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		})

		.then((products) => {
			allProducts = products.sort((a, b) => a.name.localeCompare(b.name));
			filteredProducts = allProducts;
			getProducts(filteredProducts, true);

			const categories = [...new Set(products.flatMap((product) => product.category))].sort();
			const colors = [...new Set(products.flatMap((product) => product.colors))].sort();
			createFilters({ categories, colors });

			// Load More button
			const loadMoreBtn = document.getElementById("load_more");
			if (loadMoreBtn) {
				loadMoreBtn.addEventListener("click", () => {
					getProducts(filteredProducts);
				});
			}
		})

		.catch((err) => {
			console.error("Failed to load products: ", err);
		});
}

function sortProducts() {
	const sortSelect = document.getElementById("select_sort");
	if (sortSelect) {
		sortSelect.addEventListener("change", filterProducts);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	toggleMenu();
	initProductsAndFilters();
	sortProducts();
});
