// Initializing state and base elements and data for the application

images = {
	hdd: 'src/images/hdd.png',
	sdd: 'src/images/sdd.jpg',
	usbdrive: 'src/images/usb.png',
};

let budgetInput = document.querySelector('#budget-input');
let budgetCount = document.querySelector('#budget-count');
let totalView = document.querySelector('#total');

const state = {
	budget: null,
	total: 0,
};

budgetInput.value = state.budget;

// Button logic to clear a cart

document
	.querySelector('#clearButton')
	.addEventListener('click', () => {
		const myNode = document.querySelector('.field');
		myNode.innerHTML = '';
		state.total = 0;
		state.budget = null;
		budgetCount.textContent = null;
		totalView.textContent = `Total: ${state.total}`;
	});

// Button logic for setting a budget

document
	.querySelector('#setBudgetButton')
	.addEventListener('click', () => {
		state.budget = Number(budgetInput.value);
		budgetCount.textContent = `Budget: ${state.budget}`;
	});

// Function to add item to cart with title and price arguments.
// Possible to use with Drag-and-Drop

const addToCart = (title, price) => {
	let content = `
			<div>
				<img 
					src="${images[title]}" 
					alt="${title}" 
					width="128"
				<div>${price}$</div>
			</div>
		`;
	if (state.budget === null) {
		document.querySelector('.field').insertAdjacentHTML('afterbegin', content);
		state.total += parseInt(price);
		totalView.textContent = `Total: ${state.total}`;
	} else if (state.budget - parseInt(price) >= 0) {
		document.querySelector('.field').insertAdjacentHTML('afterbegin', content);
		state.budget -= parseInt(price);
		state.total += parseInt(price);
		budgetCount.textContent = `Budget: ${state.budget}`;
		totalView.textContent = `Total: ${state.total}`;
	} else {
		alert('You out of budget');
	}
};

// Initializing Class to make some similar items

class CartItem extends HTMLElement {
	constructor() {
		super();
		const shadow = this.attachShadow({ mode: 'open' });
		let content = document.importNode(document.querySelector('#cart-item').content, true);

		this.title = this.querySelector('[slot=title]').textContent;
		this.price = this.querySelector('[slot=price]').textContent;

		shadow.appendChild(content);

		shadow
			.querySelector('#addToCartButton')
			.addEventListener('click', () => addToCart(this.title, parseInt(this.price)));
	}
}

// Connect Class to template

customElements.define('cart-item', CartItem);

// Rendering data with fetching the server

const renderData = () => {
	document.addEventListener('DOMContentLoaded', async () => {
		let data = await fetch('https://kodaktor.ru/cart_data.json').then(data => data.json());
		Object.keys(data).forEach(key => {
			const template = `
			<cart-item>
	   		<div slot="image">
	   			<img
	   			  id="${key}"
	   				src=${images[key]} 
	   				alt="${key}" 
	   				width="128" 
	   				draggable="true"
	   				ondragstart="drag(event)"
          >
	   		</div>
    		<div slot="title">${key}</div>
    		<div id="price" slot="price">${data[key]}$</div>
 	  	</cart-item>
			`;
			document.querySelector('.cart-items').insertAdjacentHTML('afterbegin', template);
			document.querySelector('img').addEventListener('click', () => addToCart(key, data[key]))
		});
	});
};

renderData();

// Creating functions for Drag-and-Drop functionality

function allowDrop(e) {
	e.preventDefault();
}

function dragenter(e) {
	e.preventDefault();
	document.querySelector('.field').classList.add('active');
}

function dragend(e) {
	e.preventDefault();
}

function drag(e) {
	let data = {
		title: e.target.id,
		price: e
			.target
			.parentElement
			.parentElement
			.querySelector('#price')
			.textContent
	};
	e.dataTransfer.setData('text/plain', JSON.stringify(data));
}

function drop(e) {
	e.preventDefault();
	let { title, price } = JSON.parse(e.dataTransfer.getData('text/plain'));
	price = parseInt(price)
	addToCart(title, price);
	document.querySelector('.field').classList.remove('active');
}
