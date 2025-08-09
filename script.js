function getProducts() {
	const grid = document.getElementById("products");
	if (!grid) return;

	const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

	fetch("products.json")
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		})

		.then((products) => {
			products.forEach((product) => {
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
		})

		.catch((err) => {
			console.error("Failed to load products: ", err);
		});
}

document.addEventListener("DOMContentLoaded", () => {
	getProducts();
});
