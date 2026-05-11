// ===== PHONE FORMATTING =====
function formatPhone(el) {
    let val = el.value.replace(/\D/g, '').slice(0, 10);
    if (val.length >= 7) {
        val = '(' + val.slice(0,3) + ')' + val.slice(3,6) + '-' + val.slice(6);
    } else if (val.length >= 4) {
        val = '(' + val.slice(0,3) + ')' + val.slice(3);
    } else if (val.length > 0) {
        val = '(' + val;
    }
    el.value = val;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="tel"]').forEach(el => {
        el.addEventListener('input', () => formatPhone(el));
    });
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// ===== MOBILE MENU =====
function toggleMenu() {
    const links = document.getElementById('navLinks');
    const burger = document.getElementById('hamburger');
    if (!links || !burger) return;
    links.classList.toggle('open');
    burger.classList.toggle('open');
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        const links = document.getElementById('navLinks');
        const burger = document.getElementById('hamburger');
        if (links) links.classList.remove('open');
        if (burger) burger.classList.remove('open');
    });
});

// ===== CART (shop page only) =====
let cart = [];

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (!sidebar) return;
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    sessionStorage.setItem('ccd_cart', JSON.stringify(cart));
    renderCart();
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar && !sidebar.classList.contains('open')) toggleCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function renderCart() {
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('cartItems');
    const footerEl = document.getElementById('cartFooter');
    const totalEl = document.getElementById('cartTotal');
    if (!itemsEl) return;

    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (countEl) countEl.textContent = count;

    if (cart.length === 0) {
        itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
        if (footerEl) footerEl.style.display = 'none';
    } else {
        itemsEl.innerHTML = cart.map((item, i) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <span>Starting at $${item.price} &times; ${item.qty}</span>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${i})" aria-label="Remove">&times;</button>
            </div>
        `).join('');
        if (footerEl) footerEl.style.display = 'block';
        if (totalEl) totalEl.textContent = `$${total}`;
    }
}

// ===== PREFILL ORDER FORM FROM SHOP =====
document.addEventListener('DOMContentLoaded', () => {
    const productSelect = document.getElementById('productType');
    if (!productSelect) return;

    // Check URL param first, then sessionStorage cart
    const params = new URLSearchParams(window.location.search);
    const urlProduct = params.get('product');
    const savedCart = JSON.parse(sessionStorage.getItem('ccd_cart') || '[]');

    let selectedProduct = '';
    let selectedQty = 1;
    let cartSummary = '';

    if (urlProduct) {
        selectedProduct = urlProduct;
    } else if (savedCart.length > 0) {
        if (savedCart.length === 1) {
            selectedProduct = savedCart[0].name;
            selectedQty = savedCart[0].qty;
        } else {
            selectedProduct = 'Multiple Items';
            selectedQty = savedCart.reduce((s, i) => s + i.qty, 0);
            cartSummary = savedCart.map(i => `- ${i.name} (qty: ${i.qty})`).join('\n');
        }
    }

    if (selectedProduct) {
        // Pre-fill the dropdown
        productSelect.value = selectedProduct;

        // Pre-fill quantity
        const qtyEl = document.getElementById('quantity');
        if (qtyEl && selectedQty > 1) qtyEl.value = selectedQty;

        // Pre-fill notes with cart list if multiple items
        if (cartSummary) {
            const notesEl = document.getElementById('notes');
            if (notesEl && !notesEl.value) notesEl.value = 'Items selected from shop:\n' + cartSummary;
        }

        // Show the prefill notice
        const notice = document.getElementById('prefillNotice');
        const noticeText = document.getElementById('prefillNoticeText');
        if (notice && noticeText) {
            if (selectedProduct === 'Multiple Items') {
                noticeText.innerHTML = '<strong>Multiple items added from the shop!</strong><p>Your product types and quantities have been pre-filled below. Just add your design details and we\'ll take care of the rest.</p>';
            } else {
                noticeText.innerHTML = `<strong>${selectedProduct} selected from the shop!</strong><p>Your product type has been pre-filled below. Just fill in your details and design description and you\'re good to go.</p>`;
            }
            notice.style.display = 'flex';
        }
    }
});

// ===== ORDER FORM (contact page) =====
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const btn = document.getElementById('submitBtn');
        if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

        const data = {
            id: Date.now(),
            submittedAt: new Date().toISOString(),
            status: 'new',
            firstName: (orderForm.firstName && orderForm.firstName.value.trim()) || '',
            lastName:  (orderForm.lastName  && orderForm.lastName.value.trim())  || '',
            email:     (orderForm.email     && orderForm.email.value.trim())     || '',
            phone:     (orderForm.phone     && orderForm.phone.value.trim())     || '',
            productType:       (orderForm.productType       && orderForm.productType.value)       || '',
            quantity:          (orderForm.quantity          && orderForm.quantity.value)           || '',
            sizes:             (orderForm.sizes             && orderForm.sizes.value.trim())       || '',
            colors:            (orderForm.colors            && orderForm.colors.value.trim())      || '',
            designDescription: (orderForm.designDescription && orderForm.designDescription.value.trim()) || '',
            neededBy:          (orderForm.neededBy          && orderForm.neededBy.value)           || '',
            budget:            (orderForm.budget            && orderForm.budget.value.trim())      || '',
            heardFrom:         (orderForm.heardFrom         && orderForm.heardFrom.value)          || '',
            notes:             (orderForm.notes             && orderForm.notes.value.trim())       || ''
        };

        const orders = JSON.parse(localStorage.getItem('ccd_orders') || '[]');
        orders.unshift(data);
        localStorage.setItem('ccd_orders', JSON.stringify(orders));
        sessionStorage.removeItem('ccd_cart');

        orderForm.style.display = 'none';
        const successEl = document.getElementById('orderSuccess');
        if (successEl) successEl.style.display = 'block';

        if (btn) { btn.textContent = 'Submit Order Request'; btn.disabled = false; }
    });
}

function resetForm() {
    if (orderForm) {
        orderForm.reset();
        orderForm.style.display = 'block';
    }
    const successEl = document.getElementById('orderSuccess');
    if (successEl) successEl.style.display = 'none';
}

// ===== SMOOTH ANCHOR SCROLL (same-page anchors only) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight : 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});
