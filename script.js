// Menu variables
const body = document.querySelector("body");
const buttons = document.querySelectorAll(".menu_button");
const open = document.querySelector(".open_button");

// Toggle menu visibility
function toggleMenu() {
	// Add click event listeners to all menu buttons
	buttons.forEach((button) => {
		button.addEventListener("click", () => {
			// Toggle menu_active class on body
			// Update aria-expanded attribute on open button
			// to reflect menu state
			const isActive = body.classList.toggle("menu_active");
			if (isActive) {
				open.setAttribute("aria-expanded", "true");
			} else {
				open.setAttribute("aria-expanded", "false");
			}
		});
	});
}

// Product variables
let allProducts = [];
let filteredProducts = [];
let itemsToShow = 9;
let currentIndex = 0;

// Fetch and display products
function getProducts(products, reset = false) {
	// If no products, clear grid and return
	const grid = document.getElementById("products");
	if (!grid) return;

	// If resetting, clear grid and reset currentIndex
	if (reset) {
		grid.innerHTML = ""; // Clear previous products only when resetting
		currentIndex = 0;
	}

	// format currency
	const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

	// Get products to display
	// toDisplay = products from currentIndex to currentIndex + itemsToShow
	const toDisplay = products.slice(currentIndex, currentIndex + itemsToShow);

	// Display products
	toDisplay.forEach((product) => {
		// Create product article
		const article = document.createElement("article");
		article.classList.add("product");

		// Handle sale price display
		// If product is on sale, show sale price and original price
		// Otherwise, show regular price
		let displayPrice = `${fmt.format(product.price)}`;
		if (product.sale && product.discount) {
			const salePrice = product.price - product.price * (product.discount / 100);
			displayPrice = `<span class="sale">${fmt.format(salePrice)}</span><span class="regular">${fmt.format(product.price)}</span>`;
		}

		// Set inner HTML
		article.innerHTML = `
			<figure class="figure">
				<img loading="lazy" src="images/${product.image}" alt="${product.alt}" />
			</figure>
			<h2 class="product-heading">${product.name}</h2>
			<p>${displayPrice}</p>
		`;
		// Append to grid
		grid.appendChild(article);
	});

	// Update currentIndex
	// Move currentIndex forward by number of items displayed
	// If fewer items were displayed than itemsToShow, we've reached the end
	// and currentIndex should be set to products.length
	const firstItemEls = document.querySelectorAll("#first_item");
	const lastItemEls = document.querySelectorAll("#last_item");
	const totalItemsEls = document.querySelectorAll("#total_items");

	// Calculate first and last visible indices
	currentIndex += toDisplay.length;
	let firstIdx = products.length === 0 ? 0 : 1;
	let lastIdx = products.length === 0 ? 0 : currentIndex;

	// Adjust firstIdx if not resetting
	if (lastIdx > products.length) lastIdx = products.length;
	firstItemEls.forEach((el) => (el.textContent = firstIdx));
	lastItemEls.forEach((el) => (el.textContent = lastIdx));
	totalItemsEls.forEach((el) => (el.textContent = products.length));

	// Show/hide Load More button
	const loadMoreBtn = document.getElementById("load_more");
	if (loadMoreBtn) {
		// If we've displayed all products, remove class to hide button
		// Otherwise, show it
		if (currentIndex >= products.length) {
			loadMoreBtn.classList.remove("more_active");
		} else {
			loadMoreBtn.classList.add("more_active");
		}
	}
}

// Get checked filters
function getCheckedFilters() {
	// Query checkboxes each time to avoid ReferenceError
	const checkedCategories = Array.from(document.querySelectorAll("#category_filter input[type=checkbox]:checked")).map((i) => i.value);
	const checkedColors = Array.from(document.querySelectorAll('#color_filter input[type="checkbox"]:checked')).map((i) => i.value);

	// need to search product names using the search input field
	const searchInput = document.getElementById("search_input");
	const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

	// Return arrays of checked values and search term
	return { checkedCategories, checkedColors, searchTerm };
}

// Filter products based on checked filters and search term
function filterProducts() {
	// Get checked filters and search term
	const { checkedCategories, checkedColors } = getCheckedFilters();
	const searchInput = document.getElementById("search");
	const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : "";

	// Filter allProducts based on checked filters and search term
	let filteredProducts = allProducts.filter((product) => {
		// Check category and color filters
		// If no categories/colors are checked, match all
		// If categories/colors are checked, product must include all checked values
		let categoryMatch = checkedCategories.length === 0 || checkedCategories.every((cat) => product.category.includes(cat));
		let colorMatch = checkedColors.length === 0 || checkedColors.every((col) => product.colors.includes(col));

		// Check search term match
		// If no search term, match all
		// If search term, product name must include search term (case insensitive)
		let searchMatch = true;
		if (searchTerm) {
			searchMatch = product.name.toLowerCase().includes(searchTerm);
		}

		// Return true if product matches all criteria
		return categoryMatch && colorMatch && searchMatch;
	});

	// Sort filteredProducts
	const sortSelect = document.getElementById("select_sort");

	// Sort options: az, za, lowhigh, highlow
	// Default is az
	if (sortSelect) {
		// Get selected sort option and sort accordingly
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

	// Update displayed products
	getProducts(filteredProducts, true);
}

// Create filter checkboxes
function createFilters(params) {
	// define filterSection, categoryList, colorList here to avoid ReferenceError
	const filterSection = document.getElementById("filters");
	if (!filterSection) return;
	const categoryList = document.getElementById("category_filter");
	const colorList = document.getElementById("color_filter");
	if (!categoryList || !colorList) return;

	// Create category checkboxes
	params.categories.forEach((category) => {
		const listItem = document.createElement("li");
		const input = document.createElement("input");
		input.type = "checkbox";
		input.name = "category";
		input.value = category;

		// Capitalize first letter of category for label
		const label = document.createElement("label");
		label.textContent = category.charAt(0).toUpperCase() + category.slice(1);

		// Prepend input to label, append label to listItem, append listItem to categoryList
		label.prepend(input);
		listItem.appendChild(label);
		categoryList.appendChild(listItem);
	});

	// Create color checkboxes
	params.colors.forEach((color) => {
		// define listItem, input, label here to avoid ReferenceError
		const listItem = document.createElement("li");
		const input = document.createElement("input");
		input.type = "checkbox";
		input.name = "color";
		input.value = color;

		// Capitalize first letter of color for label
		const label = document.createElement("label");
		label.textContent = color.charAt(0).toUpperCase() + color.slice(1);

		// Prepend input to label, append label to listItem, append listItem to colorList
		label.prepend(input);
		listItem.appendChild(label);
		colorList.appendChild(listItem);
	});

	// Add event listeners to checkboxes
	// Query checkboxes each time to avoid ReferenceError
	const categoryInputs = filterSection.querySelectorAll('#category_filter input[type="checkbox"]');
	const colorInputs = filterSection.querySelectorAll('#color_filter input[type="checkbox"]');

	// Add change event listeners to checkboxes
	categoryInputs.forEach((input, idx) => {
		input.addEventListener("change", filterProducts);
	});

	// Add change event listeners to color checkboxes
	colorInputs.forEach((input, idx) => {
		input.addEventListener("change", filterProducts);
	});

	// Add search input event listener
	const searchInput = document.getElementById("search");
	if (searchInput) {
		searchInput.addEventListener("input", filterProducts);
	}
}

// Initialize products and filters
function initProductsAndFilters() {
	// Fetch products from JSON file
	// On success, store products in allProducts, display initial products, create filters
	// On failure, log error to console
	fetch("products.json")
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		})

		// Sort products alphabetically by name
		// Store in allProducts and filteredProducts
		// Display initial products
		// Create filters based on unique categories and colors
		.then((products) => {
			allProducts = products.sort((a, b) => a.name.localeCompare(b.name));
			filteredProducts = allProducts;
			getProducts(filteredProducts, true);

			// Create filters
			// Get unique categories and colors, sort alphabetically
			// Pass to createFilters
			const categories = [...new Set(products.flatMap((product) => product.category))].sort();
			const colors = [...new Set(products.flatMap((product) => product.colors))].sort();
			createFilters({ categories, colors });

			// Add Load More button event listener
			// Query Load More button each time to avoid ReferenceError
			const loadMoreBtn = document.getElementById("load_more");
			if (loadMoreBtn) {
				loadMoreBtn.addEventListener("click", () => {
					getProducts(filteredProducts);
				});
			}
		})

		// Log fetch error to console
		.catch((err) => {
			console.error("Failed to load products: ", err);
		});
}

// Sort products based on selected option
function sortProducts() {
	const sortSelect = document.getElementById("select_sort");
	// Add change event listener to sort select
	// Query sort select each time to avoid ReferenceError
	if (sortSelect) {
		sortSelect.addEventListener("change", filterProducts);
	}
}

// Reset all filters and search
function resetFilters() {
	// Query reset button each time to avoid ReferenceError
	const resetBtn = document.getElementById("reset_products");

	// Add click event listener to reset button
	// On click, uncheck all checkboxes, clear search input, reset sort select,
	// show all products
	if (resetBtn) {
		resetBtn.addEventListener("click", () => {
			// Query checkboxes each time to avoid ReferenceError
			const categoryInputs = document.querySelectorAll('#category_filter input[type="checkbox"]');
			const colorInputs = document.querySelectorAll('#color_filter input[type="checkbox"]');

			// Uncheck all checkboxes
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
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
	toggleMenu();
	initProductsAndFilters();
	sortProducts();
	resetFilters();
});
