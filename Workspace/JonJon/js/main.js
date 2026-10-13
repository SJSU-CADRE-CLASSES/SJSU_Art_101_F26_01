const detailWindow = document.querySelector('#detail-window');
const introScreen = document.querySelector('#intro-screen');
const detailImage = document.querySelector('#detail-image');
const detailTitle = document.querySelector('#detail-title');
const detailDescription = document.querySelector('#detail-description');
const detailPrice = document.querySelector('#detail-price');
const purchaseButton = document.querySelector('.purchase-button');
const purchaseStatus = document.querySelector('#purchase-status');
const balanceAmount = document.querySelector('#balance-amount');
const cartButton = document.querySelector('#cart-button');
const cartCount = document.querySelector('#cart-count');
const cartWindow = document.querySelector('#cart-window');
const cartClose = document.querySelector('#cart-close');
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
const checkoutButton = document.querySelector('#checkout-button');
const cartStatus = document.querySelector('#cart-status');
const productSearch = document.querySelector('#product-search');
const searchStatus = document.querySelector('#search-status');

let balance = 1000000000;
let selectedPrice = 0;
let selectedProduct = null;
const cart = [];
const productBlocks = [...document.querySelectorAll('.content-block')];

const introSeenKey = 'buysctuff-intro-seen';
let hasSeenIntro = false;
try {
    hasSeenIntro = localStorage.getItem(introSeenKey) === 'true';
} catch (error) {
    hasSeenIntro = false;
}

if (hasSeenIntro) {
    introScreen.remove();
} else {
    document.body.classList.add('intro-active');
    window.setTimeout(() => {
        introScreen.classList.add('is-hidden');
        document.body.classList.remove('intro-active');
        try {
            localStorage.setItem(introSeenKey, 'true');
        } catch (error) {
            // The animation still completes when storage is unavailable.
        }
        window.setTimeout(() => introScreen.remove(), 750);
    }, 1900);
}

const formatCurrency = (amount) => amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
});

const setPurchaseStatus = (message, type) => {
    purchaseStatus.textContent = message;
    purchaseStatus.className = `purchase-status ${type}`;
};

const setCartStatus = (message, type = '') => {
    cartStatus.textContent = message;
    cartStatus.className = `cart-status ${type}`;
};

const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

const renderCart = () => {
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const total = getCartTotal();
    cartCount.textContent = itemCount;
    cartCount.setAttribute('aria-label', `${itemCount} item${itemCount === 1 ? '' : 's'} in cart`);
    cartTotal.textContent = formatCurrency(total);
    checkoutButton.disabled = cart.length === 0;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your cart is empty. Buy some stuff damn it!</p>';
        return;
    }

    cartItems.replaceChildren(...cart.map((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <img src="${item.imageSrc}" alt="">
            <div><p class="cart-item-name">${item.title}</p><p class="cart-item-meta">${formatCurrency(item.price)} × ${item.quantity}</p></div>
            <span class="cart-item-total">${formatCurrency(item.price * item.quantity)}</span>
            <button class="cart-remove" type="button" data-cart-index="${index}" aria-label="Remove ${item.title} from cart">Remove</button>`;
        return row;
    }));
};

const normalizeSearchText = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const filterProducts = () => {
    const query = normalizeSearchText(productSearch.value);
    const terms = query.split(/\s+/).filter(Boolean);
    let visibleCount = 0;

    productBlocks.forEach((block) => {
        const searchableText = normalizeSearchText(`${block.querySelector('.block-title').textContent} ${block.dataset.description || ''}`);
        const matches = terms.length === 0 || terms.every((term) => searchableText.includes(term));
        block.classList.toggle('is-hidden', !matches);
        block.classList.toggle('is-match', terms.length > 0 && matches);
        if (matches) visibleCount += 1;
    });

    if (!query) searchStatus.textContent = '';
    else searchStatus.textContent = `${visibleCount} match${visibleCount === 1 ? '' : 'es'}`;
};

document.querySelectorAll('.content-block').forEach((block) => {
    const openDetails = () => {
        const image = block.querySelector('img');
        const placeholder = block.querySelector('.image-placeholder');
        const title = block.querySelector('.block-title').textContent.trim();
        const priceText = block.dataset.price || title.match(/\$\d+(?:\.\d{2})?/)?.[0] || '$0';

        selectedPrice = Number(priceText.replace('$', ''));
        selectedProduct = {
            title,
            price: selectedPrice,
            imageSrc: image?.getAttribute('src') || ''
        };
        detailImage.replaceChildren((image || placeholder).cloneNode(true));
        detailTitle.textContent = title;
        detailDescription.textContent = block.dataset.description || 'Add a description for this item here.';
        detailPrice.textContent = priceText;
        setPurchaseStatus('', '');
        detailWindow.showModal();
    };

    block.addEventListener('click', openDetails);
    block.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    });
});

purchaseButton.addEventListener('click', () => {
    if (!selectedProduct) return;
    const existingItem = cart.find((item) => item.title === selectedProduct.title);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...selectedProduct, quantity: 1 });
    renderCart();
    setPurchaseStatus('Added to cart. Checkout when you are ready.', 'success');
});

cartButton.addEventListener('click', () => {
    setCartStatus('');
    renderCart();
    cartWindow.showModal();
});

checkoutButton.addEventListener('click', () => {
    const total = getCartTotal();
    if (!total) return;
    if (total > balance) {
        setCartStatus(`Insufficient balance. You need ${formatCurrency(total - balance)} more.`, 'error');
        return;
    }
    balance -= total;
    balanceAmount.textContent = formatCurrency(balance);
    cart.length = 0;
    renderCart();
    setCartStatus('Checkout complete — You bought that? Weird....', 'success');
});

cartItems.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.cart-remove');
    if (!removeButton) return;
    cart.splice(Number(removeButton.dataset.cartIndex), 1);
    setCartStatus('Item removed from cart.');
    renderCart();
});

document.querySelector('.detail-close').addEventListener('click', () => detailWindow.close());
cartClose.addEventListener('click', () => cartWindow.close());
detailWindow.addEventListener('click', (event) => {
    if (event.target === detailWindow) detailWindow.close();
});
cartWindow.addEventListener('click', (event) => {
    if (event.target === cartWindow) cartWindow.close();
});

renderCart();
productSearch.addEventListener('input', filterProducts);
filterProducts();
