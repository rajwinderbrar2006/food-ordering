/* ==========================================================================
   EMBER & BOWL — Application Logic (Menu, Customizer, Feast Builder, Cart,
   Checkout, Live Order Telemetry Tracker & LocalStorage Persistence)
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'ember_bowl_state_v1';
  const FREE_DELIVERY_THRESHOLD = 35.0;
  const BASE_DELIVERY_FEE = 4.99;
  const TAX_RATE = 0.085;

  const DISHES = window.DISHES || [];
  const CATEGORIES = window.MENU_CATEGORIES || [];
  const CATEGORY_SIZES = window.CATEGORY_SIZES || {};
  const CATEGORY_ADDONS = window.CATEGORY_ADDONS || {};
  const SPICE_LEVELS = window.SPICE_LEVELS || [];
  const PROMO_CODES = window.PROMO_CODES || {};

  const TAG_LABELS = {
    signature: "Chef's Pick",
    vegan: 'Vegan',
    gf: 'Gluten-Free',
    spicy: 'Spicy',
    'high-protein': 'High Protein'
  };

  // Persistent + UI State
  const state = {
    theme: 'dark',
    fulfillment: 'delivery', // 'delivery' | 'pickup'
    activeCategory: 'all',
    activeFilters: new Set(),
    searchQuery: '',
    sortBy: 'featured',
    viewMode: 'grid', // 'grid' | 'board'
    cart: [],
    favorites: [],
    orders: [],
    promoCode: null,
    tipRate: 0.10
  };

  // Customizer modal working draft
  let custDraft = null;
  let trackerTimer = null;
  let activeOrder = null;

  // DOM Cache
  const el = {
    html: document.documentElement,
    categoryTabs: document.getElementById('categoryTabs'),
    menuContainer: document.getElementById('menuContainer'),
    menuSearchInput: document.getElementById('menuSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    dietaryFilters: document.getElementById('dietaryFilters'),
    sortSelect: document.getElementById('sortSelect'),
    resultsCountText: document.getElementById('resultsCountText'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    viewBtns: document.querySelectorAll('.view-btn'),

    themeToggleBtn: document.getElementById('themeToggleBtn'),
    favoritesToggleBtn: document.getElementById('favoritesToggleBtn'),
    favCountBadge: document.getElementById('favCountBadge'),
    favFilterChip: document.getElementById('favFilterChip'),
    ordersCountBadge: document.getElementById('ordersCountBadge'),
    openOrdersBtn: document.getElementById('openOrdersBtn'),
    fulfillOpts: document.querySelectorAll('.fulfill-opt'),

    // Cart Drawer
    openCartBtn: document.getElementById('openCartBtn'),
    closeCartBtn: document.getElementById('closeCartBtn'),
    cartBackdrop: document.getElementById('cartBackdrop'),
    cartDrawer: document.getElementById('cartDrawer'),
    headerCartCount: document.getElementById('headerCartCount'),
    headerCartTotal: document.getElementById('headerCartTotal'),
    mobileCartBar: document.getElementById('mobileCartBar'),
    mobileCartOpenBtn: document.getElementById('mobileCartOpenBtn'),
    mobileCartCount: document.getElementById('mobileCartCount'),
    mobileCartTotal: document.getElementById('mobileCartTotal'),
    drawerFulfillmentSubtitle: document.getElementById('drawerFulfillmentSubtitle'),
    clearCartBtn: document.getElementById('clearCartBtn'),
    deliveryProgressBox: document.getElementById('deliveryProgressBox'),
    deliveryProgressText: document.getElementById('deliveryProgressText'),
    deliveryProgressPct: document.getElementById('deliveryProgressPct'),
    deliveryProgressFill: document.getElementById('deliveryProgressFill'),
    cartEmptyState: document.getElementById('cartEmptyState'),
    browseMenuFromCartBtn: document.getElementById('browseMenuFromCartBtn'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartUpsells: document.getElementById('cartUpsells'),
    upsellsRow: document.getElementById('upsellsRow'),
    cartFooter: document.getElementById('cartFooter'),
    promoForm: document.getElementById('promoForm'),
    promoInput: document.getElementById('promoInput'),
    appliedPromoRow: document.getElementById('appliedPromoRow'),
    appliedPromoCode: document.getElementById('appliedPromoCode'),
    removePromoBtn: document.getElementById('removePromoBtn'),
    tipRow: document.getElementById('tipRow'),
    tipPills: document.querySelectorAll('.tip-pill'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartDiscountLine: document.getElementById('cartDiscountLine'),
    cartDiscount: document.getElementById('cartDiscount'),
    cartDeliveryLabel: document.getElementById('cartDeliveryLabel'),
    cartDeliveryFee: document.getElementById('cartDeliveryFee'),
    cartTax: document.getElementById('cartTax'),
    cartTipLine: document.getElementById('cartTipLine'),
    cartTipPctLabel: document.getElementById('cartTipPctLabel'),
    cartTipAmount: document.getElementById('cartTipAmount'),
    cartGrandTotal: document.getElementById('cartGrandTotal'),
    checkoutBtnTotal: document.getElementById('checkoutBtnTotal'),
    proceedCheckoutBtn: document.getElementById('proceedCheckoutBtn'),

    // Feast Builder
    feastMainSelect: document.getElementById('feastMainSelect'),
    feastStarterSelect: document.getElementById('feastStarterSelect'),
    feastTreatSelect: document.getElementById('feastTreatSelect'),
    feastMainPreview: document.getElementById('feastMainPreview'),
    feastStarterPreview: document.getElementById('feastStarterPreview'),
    feastTreatPreview: document.getElementById('feastTreatPreview'),
    feastRegularPrice: document.getElementById('feastRegularPrice'),
    feastBundlePrice: document.getElementById('feastBundlePrice'),
    feastSavingsText: document.getElementById('feastSavingsText'),
    addFeastBundleBtn: document.getElementById('addFeastBundleBtn'),

    // Customizer Modal
    customizerModal: document.getElementById('customizerModal'),
    closeCustomizerBtn: document.getElementById('closeCustomizerBtn'),
    custImage: document.getElementById('custImage'),
    custBadges: document.getElementById('custBadges'),
    custCategory: document.getElementById('custCategory'),
    custTitle: document.getElementById('custTitle'),
    custDesc: document.getElementById('custDesc'),
    custMeta: document.getElementById('custMeta'),
    custSizeGroup: document.getElementById('custSizeGroup'),
    custSizeOptions: document.getElementById('custSizeOptions'),
    custSpiceGroup: document.getElementById('custSpiceGroup'),
    custSpiceOptions: document.getElementById('custSpiceOptions'),
    custAddonsGroup: document.getElementById('custAddonsGroup'),
    custAddonsList: document.getElementById('custAddonsList'),
    custNotes: document.getElementById('custNotes'),
    custQtyMinus: document.getElementById('custQtyMinus'),
    custQtyValue: document.getElementById('custQtyValue'),
    custQtyPlus: document.getElementById('custQtyPlus'),
    custSaveBtn: document.getElementById('custSaveBtn'),
    custTotalPrice: document.getElementById('custTotalPrice'),

    // Checkout Modal
    checkoutModal: document.getElementById('checkoutModal'),
    closeCheckoutBtn: document.getElementById('closeCheckoutBtn'),
    checkoutForm: document.getElementById('checkoutForm'),
    deliveryAddressSection: document.getElementById('deliveryAddressSection'),
    pickupNoticeSection: document.getElementById('pickupNoticeSection'),
    cardMockFields: document.getElementById('cardMockFields'),
    checkoutMiniList: document.getElementById('checkoutMiniList'),
    checkoutTotalsSummary: document.getElementById('checkoutTotalsSummary'),
    checkoutErrorMsg: document.getElementById('checkoutErrorMsg'),
    placeOrderBtnTotal: document.getElementById('placeOrderBtnTotal'),

    // Tracker Modal
    trackerModal: document.getElementById('trackerModal'),
    closeTrackerBtn: document.getElementById('closeTrackerBtn'),
    trackerOrderId: document.getElementById('trackerOrderId'),
    trackerEtaText: document.getElementById('trackerEtaText'),
    trackerStatusBadge: document.getElementById('trackerStatusBadge'),
    trackerSteps: document.getElementById('trackerSteps'),
    trackerFinalTitle: document.getElementById('trackerFinalTitle'),
    trackerFinalDesc: document.getElementById('trackerFinalDesc'),
    trackerReceipt: document.getElementById('trackerReceipt'),
    advanceStageBtn: document.getElementById('advanceStageBtn'),
    trackerDoneBtn: document.getElementById('trackerDoneBtn'),

    // History Modal
    historyModal: document.getElementById('historyModal'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),
    historyBody: document.getElementById('historyBody'),

    // Toast
    toastContainer: document.getElementById('toastContainer')
  };

  /* --------------------------------------------------------------------------
     Utilities & Persistence
     -------------------------------------------------------------------------- */
  function fmt(num) {
    return '$' + Number(num || 0).toFixed(2);
  }

  function uid() {
    return 'item_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.theme === 'light' || saved.theme === 'dark') state.theme = saved.theme;
      if (saved.fulfillment === 'delivery' || saved.fulfillment === 'pickup') state.fulfillment = saved.fulfillment;
      if (Array.isArray(saved.cart)) state.cart = saved.cart;
      if (Array.isArray(saved.favorites)) state.favorites = saved.favorites;
      if (Array.isArray(saved.orders)) state.orders = saved.orders;
      if (typeof saved.promoCode === 'string' && PROMO_CODES[saved.promoCode]) state.promoCode = saved.promoCode;
      if (typeof saved.tipRate === 'number') state.tipRate = saved.tipRate;
    } catch (_) {
      // Ignore malformed storage
    }
  }

  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme: state.theme,
          fulfillment: state.fulfillment,
          cart: state.cart,
          favorites: state.favorites,
          orders: state.orders,
          promoCode: state.promoCode,
          tipRate: state.tipRate
        })
      );
    } catch (_) {
      // Ignore storage quota errors
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 200ms ease';
      setTimeout(() => toast.remove(), 220);
    }, 2400);
  }

  function getDishById(id) {
    return DISHES.find((d) => d.id === id) || null;
  }

  function getCategoryName(catId) {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? cat.name : catId;
  }

  /* --------------------------------------------------------------------------
     Theme & Fulfillment
     -------------------------------------------------------------------------- */
  function applyTheme() {
    el.html.setAttribute('data-theme', state.theme);
  }

  function applyFulfillmentUI() {
    el.fulfillOpts.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === state.fulfillment);
    });
    if (state.fulfillment === 'delivery') {
      el.drawerFulfillmentSubtitle.textContent = 'Delivering in 22–28 min';
    } else {
      el.drawerFulfillmentSubtitle.textContent = 'Express Pickup ready in 15–18 min';
    }
  }

  /* --------------------------------------------------------------------------
     Menu Filtering, Sorting & Rendering
     -------------------------------------------------------------------------- */
  function getFilteredDishes() {
    const q = state.searchQuery.trim().toLowerCase();

    let list = DISHES.filter((dish) => {
      if (state.activeCategory !== 'all' && dish.category !== state.activeCategory) {
        return false;
      }

      if (state.activeFilters.has('favorites') && !state.favorites.includes(dish.id)) {
        return false;
      }

      for (const f of state.activeFilters) {
        if (f === 'favorites') continue;
        if (!dish.tags.includes(f)) return false;
      }

      if (q) {
        const haystack = [
          dish.name,
          dish.description,
          getCategoryName(dish.category),
          ...dish.tags.map((t) => TAG_LABELS[t] || t)
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    switch (state.sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'prep-asc':
        list.sort((a, b) => a.prepTime - b.prepTime);
        break;
      default:
        // Keep chef's featured curated order
        break;
    }

    return list;
  }

  function renderCategoryTabs() {
    el.categoryTabs.innerHTML = CATEGORIES.map((cat) => {
      const count =
        cat.id === 'all'
          ? DISHES.length
          : DISHES.filter((d) => d.category === cat.id).length;
      const active = state.activeCategory === cat.id ? 'active' : '';
      return `
        <button type="button" class="cat-tab ${active}" role="tab" aria-selected="${
        state.activeCategory === cat.id
      }" data-cat="${cat.id}">
          <span>${cat.icon}</span>
          <span>${escapeHtml(cat.name)}</span>
          <span class="cat-count">${count}</span>
        </button>
      `;
    }).join('');
  }

  function renderTagsMarkup(tags) {
    return tags
      .map((t) => `<span class="dish-badge badge-${t}">${escapeHtml(TAG_LABELS[t] || t)}</span>`)
      .join('');
  }

  function renderMenu() {
    const dishes = getFilteredDishes();
    const hasFilters =
      state.activeCategory !== 'all' ||
      state.activeFilters.size > 0 ||
      state.searchQuery.trim().length > 0;

    el.resetFiltersBtn.hidden = !hasFilters;
    el.resultsCountText.textContent = `Showing ${dishes.length} of ${DISHES.length} dishes`;

    if (dishes.length === 0) {
      el.menuContainer.className = 'menu-grid';
      el.menuContainer.innerHTML = `
        <div class="menu-empty-state">
          <h3>No dishes match those filters</h3>
          <p class="muted" style="margin: 0.5rem 0 1.2rem;">Try clearing a dietary tag or searching another ingredient.</p>
          <button type="button" class="btn btn-primary" id="inlineResetBtn">Show All 18 Dishes</button>
        </div>
      `;
      const btn = document.getElementById('inlineResetBtn');
      if (btn) btn.addEventListener('click', resetAllFilters);
      return;
    }

    if (state.viewMode === 'grid') {
      el.menuContainer.className = 'menu-grid';
      el.menuContainer.innerHTML = dishes.map(renderDishCard).join('');
    } else {
      el.menuContainer.className = 'menu-board';
      renderMenuBoard(dishes);
    }
  }

  function renderDishCard(dish) {
    const isFav = state.favorites.includes(dish.id);
    return `
      <article class="dish-card" data-dish-id="${dish.id}">
        <div class="dish-media" data-action="customize" data-id="${dish.id}">
          <img src="${dish.image}" alt="${escapeHtml(dish.name)}" loading="lazy" />
          <div class="dish-top-badges">${renderTagsMarkup(dish.tags)}</div>
          <button type="button" class="fav-heart-btn ${isFav ? 'active' : ''}" data-action="toggle-fav" data-id="${dish.id}" aria-label="Save ${escapeHtml(dish.name)} to favorites">
            <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <span class="prep-chip">${dish.prepTime} min</span>
        </div>
        <div class="dish-body">
          <div class="dish-title-row">
            <h3 class="dish-title" data-action="customize" data-id="${dish.id}">${escapeHtml(dish.name)}</h3>
            <span class="dish-rating">&#9733; ${dish.rating.toFixed(1)}</span>
          </div>
          <p class="dish-desc">${escapeHtml(dish.description)}</p>
          <div class="dish-macros">${dish.calories} kcal &bull; ${dish.protein} protein</div>
          <div class="dish-footer">
            <span class="dish-price">${fmt(dish.price)}</span>
            <div class="dish-actions">
              <button type="button" class="btn btn-secondary btn-sm" data-action="customize" data-id="${dish.id}">Customize</button>
              <button type="button" class="btn btn-primary btn-sm" data-action="quick-add" data-id="${dish.id}">+ Add</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderMenuBoard(dishes) {
    const orderedCats = CATEGORIES.filter((c) => c.id !== 'all');
    const html = orderedCats
      .map((cat) => {
        const items = dishes.filter((d) => d.category === cat.id);
        if (items.length === 0) return '';
        return `
          <div class="board-category-block">
            <div class="board-cat-header">
              <h3>${cat.icon} ${escapeHtml(cat.name)}</h3>
              <span class="mono muted small">${items.length} dishes</span>
            </div>
            <div class="board-items-grid">
              ${items
                .map((dish) => {
                  const isFav = state.favorites.includes(dish.id);
                  return `
                    <div class="board-item">
                      <img src="${dish.image}" alt="${escapeHtml(dish.name)}" class="board-thumb" data-action="customize" data-id="${dish.id}" loading="lazy" />
                      <div class="board-info">
                        <div class="board-title-line">
                          <h4 data-action="customize" data-id="${dish.id}">${escapeHtml(dish.name)}</h4>
                          <span class="mono" style="font-weight:700;">${fmt(dish.price)}</span>
                        </div>
                        <p class="muted small">${escapeHtml(dish.description)}</p>
                        <div class="board-item-actions">
                          <span class="mono small muted">&#9733; ${dish.rating.toFixed(1)} &bull; ${dish.prepTime}m</span>
                          <button type="button" class="text-btn" data-action="toggle-fav" data-id="${dish.id}">${isFav ? '♥ Saved' : '♡ Save'}</button>
                          <button type="button" class="btn btn-secondary btn-sm" data-action="customize" data-id="${dish.id}">Customize</button>
                          <button type="button" class="btn btn-primary btn-sm" data-action="quick-add" data-id="${dish.id}">+ Add</button>
                        </div>
                      </div>
                    </div>
                  `;
                })
                .join('')}
            </div>
          </div>
        `;
      })
      .join('');
    el.menuContainer.innerHTML = html;
  }

  function resetAllFilters() {
    state.activeCategory = 'all';
    state.activeFilters.clear();
    state.searchQuery = '';
    el.menuSearchInput.value = '';
    el.clearSearchBtn.hidden = true;
    document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    el.favoritesToggleBtn.classList.remove('active');
    renderCategoryTabs();
    renderMenu();
  }

  /* --------------------------------------------------------------------------
     Favorites
     -------------------------------------------------------------------------- */
  function toggleFavorite(dishId) {
    const idx = state.favorites.indexOf(dishId);
    const dish = getDishById(dishId);
    if (idx === -1) {
      state.favorites.push(dishId);
      showToast(`Saved "${dish ? dish.name : 'Dish'}" to favorites`);
    } else {
      state.favorites.splice(idx, 1);
      showToast('Removed from favorites');
    }
    saveState();
    updateFavoriteBadge();
    renderMenu();
  }

  function updateFavoriteBadge() {
    const count = state.favorites.length;
    el.favCountBadge.hidden = count === 0;
    el.favCountBadge.textContent = String(count);
  }

  /* --------------------------------------------------------------------------
     Dish Customizer Modal
     -------------------------------------------------------------------------- */
  function openCustomizer(dishId, existingCartUid = null) {
    const dish = getDishById(dishId);
    if (!dish) return;

    const sizes = CATEGORY_SIZES[dish.category] || [{ id: 'std', label: 'Standard', delta: 0 }];
    const addons = CATEGORY_ADDONS[dish.category] || [];

    let initial = {
      editUid: existingCartUid,
      dish,
      sizeId: sizes[0].id,
      spiceId: dish.spicyDefault || 'mild',
      selectedAddons: new Set(),
      notes: '',
      qty: 1
    };

    if (existingCartUid) {
      const existing = state.cart.find((item) => item.uid === existingCartUid);
      if (existing) {
        initial.sizeId = existing.sizeId || sizes[0].id;
        initial.spiceId = existing.spiceId || dish.spicyDefault || 'mild';
        initial.selectedAddons = new Set((existing.addons || []).map((a) => a.id));
        initial.notes = existing.notes || '';
        initial.qty = existing.qty || 1;
      }
    }

    custDraft = initial;

    el.custImage.src = dish.image;
    el.custImage.alt = dish.name;
    el.custBadges.innerHTML = renderTagsMarkup(dish.tags);
    el.custCategory.textContent = getCategoryName(dish.category);
    el.custTitle.textContent = dish.name;
    el.custDesc.textContent = dish.description;
    el.custMeta.textContent = `★ ${dish.rating.toFixed(1)}  •  ${dish.prepTime} min prep  •  ${dish.calories} kcal  •  ${dish.protein} protein`;
    el.custNotes.value = custDraft.notes;

    // Sizes
    el.custSizeOptions.innerHTML = sizes
      .map((s) => {
        const deltaStr = s.delta > 0 ? ` (+${fmt(s.delta)})` : '';
        return `<button type="button" class="opt-pill ${s.id === custDraft.sizeId ? 'active' : ''}" data-size-id="${s.id}">${escapeHtml(s.label)}${deltaStr}</button>`;
      })
      .join('');

    // Spice
    el.custSpiceGroup.hidden = !dish.allowSpice;
    if (dish.allowSpice) {
      el.custSpiceOptions.innerHTML = SPICE_LEVELS.map(
        (sp) => `<button type="button" class="opt-pill ${sp.id === custDraft.spiceId ? 'active' : ''}" data-spice-id="${sp.id}">${escapeHtml(sp.label)}</button>`
      ).join('');
    }

    // Add-ons
    el.custAddonsGroup.hidden = addons.length === 0;
    el.custAddonsList.innerHTML = addons
      .map(
        (ad) => `
        <label class="addon-row">
          <span style="display:flex;align-items:center;gap:0.45rem;">
            <input type="checkbox" value="${ad.id}" ${custDraft.selectedAddons.has(ad.id) ? 'checked' : ''} />
            <span>${escapeHtml(ad.label)}</span>
          </span>
          <span class="mono small">+${fmt(ad.price)}</span>
        </label>
      `
      )
      .join('');

    updateCustomizerPrice();
    el.customizerModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeCustomizer() {
    el.customizerModal.hidden = true;
    custDraft = null;
    if (el.checkoutModal.hidden && el.trackerModal.hidden && el.historyModal.hidden && !el.cartDrawer.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  function computeCustomizerUnitPrice() {
    if (!custDraft) return 0;
    const dish = custDraft.dish;
    const sizes = CATEGORY_SIZES[dish.category] || [];
    const sizeObj = sizes.find((s) => s.id === custDraft.sizeId) || { delta: 0 };
    const addonsList = CATEGORY_ADDONS[dish.category] || [];
    let addonsTotal = 0;
    custDraft.selectedAddons.forEach((id) => {
      const found = addonsList.find((a) => a.id === id);
      if (found) addonsTotal += found.price;
    });
    return dish.price + sizeObj.delta + addonsTotal;
  }

  function updateCustomizerPrice() {
    if (!custDraft) return;
    el.custQtyValue.textContent = String(custDraft.qty);
    const total = computeCustomizerUnitPrice() * custDraft.qty;
    el.custTotalPrice.textContent = fmt(total);
    el.custSaveBtn.innerHTML = `${custDraft.editUid ? 'Update Item' : 'Add to Order'} &bull; <span class="mono">${fmt(total)}</span>`;
  }

  function saveCustomizerToCart() {
    if (!custDraft) return;
    const dish = custDraft.dish;
    const sizes = CATEGORY_SIZES[dish.category] || [{ id: 'std', label: 'Standard', delta: 0 }];
    const sizeObj = sizes.find((s) => s.id === custDraft.sizeId) || sizes[0];
    const spiceObj = dish.allowSpice ? SPICE_LEVELS.find((s) => s.id === custDraft.spiceId) : null;
    const allAddons = CATEGORY_ADDONS[dish.category] || [];
    const chosenAddons = allAddons.filter((a) => custDraft.selectedAddons.has(a.id));
    const notes = el.custNotes.value.trim();

    const itemPayload = {
      uid: custDraft.editUid || uid(),
      dishId: dish.id,
      title: dish.name,
      image: dish.image,
      category: dish.category,
      unitBasePrice: dish.price,
      sizeId: sizeObj.id,
      sizeLabel: sizeObj.label,
      sizeDelta: sizeObj.delta,
      spiceId: spiceObj ? spiceObj.id : null,
      spiceLabel: spiceObj ? spiceObj.label : null,
      addons: chosenAddons,
      notes,
      qty: custDraft.qty
    };

    const wasEditing = Boolean(custDraft.editUid);
    if (wasEditing) {
      const idx = state.cart.findIndex((i) => i.uid === custDraft.editUid);
      if (idx !== -1) state.cart[idx] = itemPayload;
      showToast(`Updated "${dish.name}" in your order`);
    } else {
      mergeOrPushCartItem(itemPayload);
      showToast(`Added "${dish.name}" to your order`);
    }

    saveState();
    renderCart();
    bumpCartBadge();
    closeCustomizer();
    if (wasEditing) openCartDrawer();
  }

  /* --------------------------------------------------------------------------
     Feast 3-Course Builder
     -------------------------------------------------------------------------- */
  function initFeastBuilder() {
    const mains = DISHES.filter((d) => ['pizza', 'burgers', 'bowls'].includes(d.category));
    const starters = DISHES.filter((d) => d.category === 'starters');
    const treats = DISHES.filter((d) => ['desserts', 'drinks'].includes(d.category));

    el.feastMainSelect.innerHTML = mains
      .map((d) => `<option value="${d.id}">${escapeHtml(d.name)} — ${fmt(d.price)}</option>`)
      .join('');
    el.feastStarterSelect.innerHTML = starters
      .map((d) => `<option value="${d.id}">${escapeHtml(d.name)} — ${fmt(d.price)}</option>`)
      .join('');
    el.feastTreatSelect.innerHTML = treats
      .map((d) => `<option value="${d.id}">${escapeHtml(d.name)} — ${fmt(d.price)}</option>`)
      .join('');

    updateFeastPreview();
  }

  function renderSlotPreview(container, dish) {
    if (!dish) return;
    container.innerHTML = `
      <img src="${dish.image}" alt="${escapeHtml(dish.name)}" />
      <div class="slot-preview-text">
        <strong>${escapeHtml(dish.name)}</strong>
        <div class="muted mono">${fmt(dish.price)} &bull; ${dish.prepTime}m</div>
      </div>
    `;
  }

  function updateFeastPreview() {
    const main = getDishById(el.feastMainSelect.value);
    const starter = getDishById(el.feastStarterSelect.value);
    const treat = getDishById(el.feastTreatSelect.value);

    renderSlotPreview(el.feastMainPreview, main);
    renderSlotPreview(el.feastStarterPreview, starter);
    renderSlotPreview(el.feastTreatPreview, treat);

    const regular = (main?.price || 0) + (starter?.price || 0) + (treat?.price || 0);
    const discounted = Number((regular * 0.85).toFixed(2));
    const savings = Number((regular - discounted).toFixed(2));

    el.feastRegularPrice.textContent = fmt(regular);
    el.feastBundlePrice.textContent = fmt(discounted);
    el.feastSavingsText.textContent = `Save ${fmt(savings)}`;
  }

  function addFeastBundleToCart() {
    const main = getDishById(el.feastMainSelect.value);
    const starter = getDishById(el.feastStarterSelect.value);
    const treat = getDishById(el.feastTreatSelect.value);
    if (!main || !starter || !treat) return;

    const regular = main.price + starter.price + treat.price;
    const bundlePrice = Number((regular * 0.85).toFixed(2));

    state.cart.push({
      uid: uid(),
      dishId: `feast_${main.id}_${starter.id}_${treat.id}`,
      title: '3-Course Curated Feast (15% Off)',
      image: main.image,
      category: 'bundle',
      unitBasePrice: bundlePrice,
      sizeId: 'bundle',
      sizeLabel: `${main.name} + ${starter.name} + ${treat.name}`,
      sizeDelta: 0,
      spiceId: null,
      spiceLabel: null,
      addons: [],
      notes: '',
      qty: 1,
      isFeastBundle: true
    });

    saveState();
    renderCart();
    bumpCartBadge();
    openCartDrawer();
    showToast('Added 3-Course Feast Bundle (15% off) to cart!');
  }

  /* --------------------------------------------------------------------------
     Cart Logic & Pricing Calculations
     -------------------------------------------------------------------------- */
  function quickAddDish(dishId) {
    const dish = getDishById(dishId);
    if (!dish) return;
    const sizes = CATEGORY_SIZES[dish.category] || [{ id: 'std', label: 'Standard', delta: 0 }];
    const spiceObj = dish.allowSpice ? SPICE_LEVELS.find((s) => s.id === (dish.spicyDefault || 'mild')) : null;

    mergeOrPushCartItem({
      uid: uid(),
      dishId: dish.id,
      title: dish.name,
      image: dish.image,
      category: dish.category,
      unitBasePrice: dish.price,
      sizeId: sizes[0].id,
      sizeLabel: sizes[0].label,
      sizeDelta: sizes[0].delta,
      spiceId: spiceObj ? spiceObj.id : null,
      spiceLabel: spiceObj ? spiceObj.label : null,
      addons: [],
      notes: '',
      qty: 1
    });

    saveState();
    renderCart();
    bumpCartBadge();
    showToast(`Added "${dish.name}" to cart`);
  }

  function mergeOrPushCartItem(newItem) {
    const sig = (item) =>
      JSON.stringify({
        d: item.dishId,
        s: item.sizeId,
        sp: item.spiceId,
        a: (item.addons || []).map((x) => x.id).sort(),
        n: (item.notes || '').trim()
      });

    const newSig = sig(newItem);
    const existing = state.cart.find((item) => !item.isFeastBundle && sig(item) === newSig);
    if (existing) {
      existing.qty += newItem.qty;
    } else {
      state.cart.push(newItem);
    }
  }

  function getItemUnitPrice(item) {
    const addonsSum = (item.addons || []).reduce((acc, a) => acc + a.price, 0);
    return item.unitBasePrice + (item.sizeDelta || 0) + addonsSum;
  }

  function computeTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + getItemUnitPrice(item) * item.qty, 0);

    let discount = 0;
    const promo = state.promoCode ? PROMO_CODES[state.promoCode] : null;
    if (promo && subtotal >= promo.minOrder) {
      if (promo.type === 'percent') discount = subtotal * promo.value;
      else if (promo.type === 'fixed') discount = Math.min(subtotal, promo.value);
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);

    let deliveryFee = 0;
    if (state.fulfillment === 'delivery' && subtotal > 0) {
      const freeByThreshold = subtotal >= FREE_DELIVERY_THRESHOLD;
      const freeByPromo = promo && promo.type === 'freeship';
      deliveryFee = freeByThreshold || freeByPromo ? 0 : BASE_DELIVERY_FEE;
    }

    const tax = discountedSubtotal * TAX_RATE;
    const tip = discountedSubtotal * state.tipRate;
    const grandTotal = discountedSubtotal + deliveryFee + tax + tip;
    const itemCount = state.cart.reduce((sum, item) => sum + item.qty, 0);

    return {
      itemCount,
      subtotal,
      discount,
      deliveryFee,
      tax,
      tip,
      grandTotal
    };
  }

  function bumpCartBadge() {
    el.openCartBtn.classList.remove('bump');
    void el.openCartBtn.offsetWidth;
    el.openCartBtn.classList.add('bump');
  }

  function renderCart() {
    const totals = computeTotals();

    // Header & Mobile Bar Badges
    el.headerCartCount.textContent = String(totals.itemCount);
    el.headerCartTotal.textContent = fmt(totals.grandTotal);
    el.mobileCartBar.hidden = totals.itemCount === 0;
    el.mobileCartCount.textContent = `${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'}`;
    el.mobileCartTotal.textContent = fmt(totals.grandTotal);

    const isEmpty = state.cart.length === 0;
    el.cartEmptyState.hidden = !isEmpty;
    el.clearCartBtn.hidden = isEmpty;
    el.cartFooter.hidden = isEmpty;
    el.cartUpsells.hidden = isEmpty;

    // Free delivery progress
    if (state.fulfillment === 'pickup') {
      el.deliveryProgressBox.hidden = true;
    } else {
      el.deliveryProgressBox.hidden = false;
      const pct = Math.min(100, Math.round((totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100));
      el.deliveryProgressFill.style.width = `${pct}%`;
      el.deliveryProgressPct.textContent = `${pct}%`;
      if (totals.subtotal >= FREE_DELIVERY_THRESHOLD) {
        el.deliveryProgressText.innerHTML = 'Unlocked: <strong style="color:var(--emerald)">FREE Express Delivery!</strong>';
      } else {
        const rem = FREE_DELIVERY_THRESHOLD - totals.subtotal;
        el.deliveryProgressText.innerHTML = `Add <strong class="mono">${fmt(rem)}</strong> more for FREE delivery`;
      }
    }

    if (isEmpty) {
      el.cartItemsList.innerHTML = '';
      return;
    }

    // Line items
    el.cartItemsList.innerHTML = state.cart
      .map((item) => {
        const unit = getItemUnitPrice(item);
        const lineTotal = unit * item.qty;
        const details = [];
        if (item.sizeLabel) details.push(item.sizeLabel);
        if (item.spiceLabel) details.push(item.spiceLabel);
        if (item.addons && item.addons.length > 0) {
          details.push('+ ' + item.addons.map((a) => a.label).join(', '));
        }
        if (item.notes) details.push(`Note: "${item.notes}"`);

        return `
          <li class="cart-item" data-uid="${item.uid}">
            <img src="${item.image}" alt="${escapeHtml(item.title)}" class="cart-item-img" />
            <div>
              <div class="cart-item-top">
                <span class="cart-item-title">${escapeHtml(item.title)}</span>
                <span class="mono" style="font-weight:700;">${fmt(lineTotal)}</span>
              </div>
              <p class="cart-item-options">${escapeHtml(details.join(' • '))}</p>
              <div class="cart-item-bottom">
                <div class="qty-stepper">
                  <button type="button" data-cart-action="dec" data-uid="${item.uid}" aria-label="Decrease quantity">&minus;</button>
                  <span class="mono">${item.qty}</span>
                  <button type="button" data-cart-action="inc" data-uid="${item.uid}" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-links">
                  ${
                    !item.isFeastBundle
                      ? `<button type="button" class="text-btn" data-cart-action="edit" data-uid="${item.uid}">Edit</button>`
                      : ''
                  }
                  <button type="button" class="text-btn danger" data-cart-action="remove" data-uid="${item.uid}">Remove</button>
                </div>
              </div>
            </div>
          </li>
        `;
      })
      .join('');

    renderCartUpsells();

    // Promo display
    if (state.promoCode && PROMO_CODES[state.promoCode]) {
      el.appliedPromoRow.hidden = false;
      el.appliedPromoCode.textContent = `${state.promoCode} (${PROMO_CODES[state.promoCode].label})`;
      el.promoForm.hidden = true;
    } else {
      el.appliedPromoRow.hidden = true;
      el.promoForm.hidden = false;
    }

    // Tip pills
    el.tipPills.forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.tip) === state.tipRate);
    });

    // Breakdown numbers
    el.cartSubtotal.textContent = fmt(totals.subtotal);
    el.cartDiscountLine.hidden = totals.discount <= 0;
    el.cartDiscount.textContent = `-${fmt(totals.discount)}`;

    if (state.fulfillment === 'pickup') {
      el.cartDeliveryLabel.textContent = 'Self-Pickup';
      el.cartDeliveryFee.textContent = 'FREE';
    } else {
      el.cartDeliveryLabel.textContent = 'Delivery Fee';
      el.cartDeliveryFee.textContent = totals.deliveryFee === 0 ? 'FREE' : fmt(totals.deliveryFee);
    }

    el.cartTax.textContent = fmt(totals.tax);
    el.cartTipPctLabel.textContent = `${Math.round(state.tipRate * 100)}%`;
    el.cartTipAmount.textContent = fmt(totals.tip);
    el.cartGrandTotal.textContent = fmt(totals.grandTotal);
    el.checkoutBtnTotal.textContent = fmt(totals.grandTotal);
  }

  function renderCartUpsells() {
    const inCartIds = new Set(state.cart.map((i) => i.dishId));
    const candidates = DISHES.filter(
      (d) => ['drinks', 'desserts', 'starters'].includes(d.category) && !inCartIds.has(d.id)
    ).slice(0, 2);

    if (candidates.length === 0) {
      el.cartUpsells.hidden = true;
      return;
    }

    el.cartUpsells.hidden = false;
    el.upsellsRow.innerHTML = candidates
      .map(
        (d) => `
        <div class="upsell-card">
          <img src="${d.image}" alt="${escapeHtml(d.name)}" />
          <div class="upsell-info">
            <div class="upsell-name" title="${escapeHtml(d.name)}">${escapeHtml(d.name)}</div>
            <div class="mono small muted">${fmt(d.price)}</div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" data-upsell-add="${d.id}">+</button>
        </div>
      `
      )
      .join('');
  }

  function applyPromoCode(rawCode) {
    const code = String(rawCode || '').trim().toUpperCase();
    const promo = PROMO_CODES[code];
    if (!promo) {
      showToast('Invalid promo code. Try EMBER20, WELCOME10, or FREESHIP.');
      return;
    }
    const totals = computeTotals();
    if (totals.subtotal < promo.minOrder && totals.subtotal > 0) {
      showToast(`${code} requires a minimum order of ${fmt(promo.minOrder)}`);
      return;
    }
    state.promoCode = code;
    saveState();
    renderCart();
    showToast(`Promo ${code} applied: ${promo.label}`);
  }

  function openCartDrawer() {
    el.cartBackdrop.hidden = false;
    el.cartDrawer.classList.add('open');
    el.cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    el.cartDrawer.classList.remove('open');
    el.cartDrawer.setAttribute('aria-hidden', 'true');
    el.cartBackdrop.hidden = true;
    if (el.customizerModal.hidden && el.checkoutModal.hidden && el.trackerModal.hidden && el.historyModal.hidden) {
      document.body.style.overflow = '';
    }
  }

  /* --------------------------------------------------------------------------
     Checkout, Order Creation & Live Tracker
     -------------------------------------------------------------------------- */
  function openCheckoutModal() {
    if (state.cart.length === 0) {
      showToast('Add items to your cart before checking out.');
      return;
    }
    closeCartDrawer();

    const isDelivery = state.fulfillment === 'delivery';
    el.deliveryAddressSection.hidden = !isDelivery;
    el.pickupNoticeSection.hidden = isDelivery;
    document.getElementById('custAddressInput').required = isDelivery;

    el.checkoutMiniList.innerHTML = state.cart
      .map((item) => {
        const line = getItemUnitPrice(item) * item.qty;
        return `
          <li class="checkout-mini-item">
            <span><strong>${item.qty}x</strong> ${escapeHtml(item.title)}</span>
            <span class="mono">${fmt(line)}</span>
          </li>
        `;
      })
      .join('');

    const t = computeTotals();
    el.checkoutTotalsSummary.innerHTML = `
      <div class="total-line"><span>Subtotal</span><span class="mono">${fmt(t.subtotal)}</span></div>
      ${t.discount > 0 ? `<div class="total-line discount"><span>Promo (${state.promoCode})</span><span class="mono">-${fmt(t.discount)}</span></div>` : ''}
      <div class="total-line"><span>${isDelivery ? 'Delivery Fee' : 'Pickup'}</span><span class="mono">${t.deliveryFee === 0 ? 'FREE' : fmt(t.deliveryFee)}</span></div>
      <div class="total-line"><span>Tax (8.5%)</span><span class="mono">${fmt(t.tax)}</span></div>
      <div class="total-line"><span>Tip</span><span class="mono">${fmt(t.tip)}</span></div>
      <div class="total-line grand-total"><span>Total</span><span class="mono">${fmt(t.grandTotal)}</span></div>
    `;

    el.placeOrderBtnTotal.textContent = fmt(t.grandTotal);
    el.checkoutErrorMsg.hidden = true;
    el.checkoutModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    el.checkoutModal.hidden = true;
    document.body.style.overflow = '';
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('custNameInput').value.trim();
    const phone = document.getElementById('custPhoneInput').value.trim();
    const address = document.getElementById('custAddressInput').value.trim();
    const isDelivery = state.fulfillment === 'delivery';

    if (!name || !phone || (isDelivery && !address)) {
      el.checkoutErrorMsg.textContent = 'Please fill in all required contact and delivery fields.';
      el.checkoutErrorMsg.hidden = false;
      return;
    }

    const totals = computeTotals();
    const order = {
      id: 'EMB-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
      fulfillment: state.fulfillment,
      customerName: name,
      address: isDelivery ? address : '420 Mercer St (Express Pickup)',
      items: JSON.parse(JSON.stringify(state.cart)),
      totals,
      stage: 0
    };

    state.orders.unshift(order);
    state.cart = [];
    state.promoCode = null;
    saveState();

    renderCart();
    updateOrdersBadge();
    closeCheckoutModal();
    openOrderTracker(order);
  }

  function openOrderTracker(order) {
    activeOrder = order;
    if (trackerTimer) clearInterval(trackerTimer);

    el.trackerOrderId.textContent = '#' + order.id;
    const isPickup = order.fulfillment === 'pickup';
    el.trackerFinalTitle.textContent = isPickup ? 'Ready at Express Counter' : 'Out for Express Delivery';
    el.trackerFinalDesc.textContent = isPickup
      ? 'Walk right up to the Mercer Street counter.'
      : `Courier is en route to ${order.address}.`;

    el.trackerReceipt.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:0.4rem;">
        <strong>${escapeHtml(order.customerName)} (${isPickup ? 'Pickup' : 'Delivery'})</strong>
        <strong class="mono">${fmt(order.totals.grandTotal)}</strong>
      </div>
      <div class="muted small">${order.items.map((i) => `${i.qty}x ${escapeHtml(i.title)}`).join(', ')}</div>
    `;

    renderTrackerStage();
    el.trackerModal.hidden = false;
    document.body.style.overflow = 'hidden';

    trackerTimer = setInterval(() => {
      if (!activeOrder || activeOrder.stage >= 3) {
        clearInterval(trackerTimer);
        return;
      }
      activeOrder.stage += 1;
      renderTrackerStage();
    }, 5500);
  }

  function renderTrackerStage() {
    if (!activeOrder) return;
    const stages = [
      { badge: 'Order Confirmed', eta: activeOrder.fulfillment === 'pickup' ? '16 mins' : '24 mins' },
      { badge: 'Firing on Ember', eta: activeOrder.fulfillment === 'pickup' ? '11 mins' : '18 mins' },
      { badge: 'Quality Check', eta: activeOrder.fulfillment === 'pickup' ? '4 mins' : '10 mins' },
      {
        badge: activeOrder.fulfillment === 'pickup' ? 'Ready for Pickup!' : 'Out for Delivery!',
        eta: activeOrder.fulfillment === 'pickup' ? 'Ready Now' : '4 mins away'
      }
    ];

    const info = stages[activeOrder.stage] || stages[3];
    el.trackerStatusBadge.textContent = info.badge;
    el.trackerEtaText.textContent = info.eta;

    el.trackerSteps.querySelectorAll('.track-step').forEach((stepEl, idx) => {
      stepEl.classList.remove('active', 'done');
      if (idx < activeOrder.stage) stepEl.classList.add('done');
      else if (idx === activeOrder.stage) stepEl.classList.add('active');
    });

    el.advanceStageBtn.disabled = activeOrder.stage >= 3;
    el.advanceStageBtn.textContent =
      activeOrder.stage >= 3 ? 'Final Stage Reached' : 'Simulate Next Kitchen Stage';
  }

  function closeTrackerModal() {
    if (trackerTimer) clearInterval(trackerTimer);
    el.trackerModal.hidden = true;
    document.body.style.overflow = '';
  }

  /* --------------------------------------------------------------------------
     Order History
     -------------------------------------------------------------------------- */
  function updateOrdersBadge() {
    const count = state.orders.length;
    el.ordersCountBadge.hidden = count === 0;
    el.ordersCountBadge.textContent = String(count);
  }

  function openHistoryModal() {
    if (state.orders.length === 0) {
      el.historyBody.innerHTML = `
        <div class="cart-empty">
          <div class="empty-illustration">&#129534;</div>
          <h3>No past orders yet</h3>
          <p class="muted">Once you place an order, it will appear here for instant tracking and 1-click reordering.</p>
        </div>
      `;
    } else {
      el.historyBody.innerHTML = `
        <div class="history-list">
          ${state.orders
            .map(
              (ord, idx) => `
              <div class="history-order-card">
                <div class="history-order-top">
                  <strong class="mono">#${ord.id}</strong>
                  <span class="mono" style="font-weight:700;">${fmt(ord.totals.grandTotal)}</span>
                </div>
                <p class="muted small" style="margin-bottom:0.5rem;">
                  ${new Date(ord.createdAt).toLocaleString()} &bull; ${ord.fulfillment.toUpperCase()}
                </p>
                <p class="small" style="margin-bottom:0.8rem;">
                  ${ord.items.map((i) => `${i.qty}x ${escapeHtml(i.title)}`).join(' • ')}
                </p>
                <div style="display:flex;gap:0.5rem;justify-content:flex-end;">
                  <button type="button" class="btn btn-secondary btn-sm" data-track-order="${idx}">Track Status</button>
                  <button type="button" class="btn btn-primary btn-sm" data-reorder="${idx}">Reorder All</button>
                </div>
              </div>
            `
            )
            .join('')}
        </div>
      `;
    }

    el.historyModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeHistoryModal() {
    el.historyModal.hidden = true;
    document.body.style.overflow = '';
  }

  /* --------------------------------------------------------------------------
     Event Binding
     -------------------------------------------------------------------------- */
  function bindEvents() {
    // Theme toggle
    el.themeToggleBtn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme();
      saveState();
    });

    // Fulfillment toggle
    el.fulfillOpts.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.fulfillment = btn.dataset.mode;
        applyFulfillmentUI();
        saveState();
        renderCart();
        showToast(
          state.fulfillment === 'delivery'
            ? 'Switched to Express Delivery'
            : 'Switched to Self-Pickup (No Delivery Fee)'
        );
      });
    });

    // Category tabs
    el.categoryTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.cat-tab');
      if (!tab) return;
      state.activeCategory = tab.dataset.cat;
      renderCategoryTabs();
      renderMenu();
    });

    // Search
    el.menuSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      el.clearSearchBtn.hidden = state.searchQuery.length === 0;
      renderMenu();
    });

    el.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      el.menuSearchInput.value = '';
      el.clearSearchBtn.hidden = true;
      renderMenu();
    });

    // Dietary filters
    el.dietaryFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      const key = chip.dataset.filter;
      if (state.activeFilters.has(key)) {
        state.activeFilters.delete(key);
        chip.classList.remove('active');
      } else {
        state.activeFilters.add(key);
        chip.classList.add('active');
      }
      if (key === 'favorites') {
        el.favoritesToggleBtn.classList.toggle('active', state.activeFilters.has('favorites'));
      }
      renderMenu();
    });

    // Header favorites shortcut
    el.favoritesToggleBtn.addEventListener('click', () => {
      if (state.activeFilters.has('favorites')) {
        state.activeFilters.delete('favorites');
      } else {
        state.activeFilters.add('favorites');
      }
      const isFavFilter = state.activeFilters.has('favorites');
      el.favoritesToggleBtn.classList.toggle('active', isFavFilter);
      el.favFilterChip.classList.toggle('active', isFavFilter);
      renderMenu();
      document.getElementById('menu-explorer').scrollIntoView({ behavior: 'smooth' });
    });

    // Sort & View switcher
    el.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderMenu();
    });

    el.viewBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.viewMode = btn.dataset.view;
        el.viewBtns.forEach((b) => b.classList.toggle('active', b.dataset.view === state.viewMode));
        renderMenu();
      });
    });

    el.resetFiltersBtn.addEventListener('click', resetAllFilters);

    // Menu delegation (Customize, Quick Add, Favorite)
    el.menuContainer.addEventListener('click', (e) => {
      const actionEl = e.target.closest('[data-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      const id = actionEl.dataset.id;
      if (action === 'customize') openCustomizer(id);
      else if (action === 'quick-add') quickAddDish(id);
      else if (action === 'toggle-fav') toggleFavorite(id);
    });

    // Hero Quick Add
    document.querySelectorAll('.quick-add-hero').forEach((btn) => {
      btn.addEventListener('click', () => quickAddDish(btn.dataset.dishId));
    });

    // Copy/Apply Promo chips in header/footer
    document.querySelectorAll('.copy-promo-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        applyPromoCode(btn.dataset.promo);
      });
    });

    // Feast Builder listeners
    [el.feastMainSelect, el.feastStarterSelect, el.feastTreatSelect].forEach((sel) => {
      sel.addEventListener('change', updateFeastPreview);
    });
    el.addFeastBundleBtn.addEventListener('click', addFeastBundleToCart);

    // Customizer Modal listeners
    el.closeCustomizerBtn.addEventListener('click', closeCustomizer);
    el.customizerModal.addEventListener('click', (e) => {
      if (e.target === el.customizerModal) closeCustomizer();
    });
    el.custSizeOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-size-id]');
      if (!btn || !custDraft) return;
      custDraft.sizeId = btn.dataset.sizeId;
      el.custSizeOptions.querySelectorAll('.opt-pill').forEach((p) => p.classList.toggle('active', p === btn));
      updateCustomizerPrice();
    });
    el.custSpiceOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-spice-id]');
      if (!btn || !custDraft) return;
      custDraft.spiceId = btn.dataset.spiceId;
      el.custSpiceOptions.querySelectorAll('.opt-pill').forEach((p) => p.classList.toggle('active', p === btn));
    });
    el.custAddonsList.addEventListener('change', (e) => {
      if (!custDraft || e.target.type !== 'checkbox') return;
      if (e.target.checked) custDraft.selectedAddons.add(e.target.value);
      else custDraft.selectedAddons.delete(e.target.value);
      updateCustomizerPrice();
    });
    el.custQtyMinus.addEventListener('click', () => {
      if (!custDraft || custDraft.qty <= 1) return;
      custDraft.qty -= 1;
      updateCustomizerPrice();
    });
    el.custQtyPlus.addEventListener('click', () => {
      if (!custDraft) return;
      custDraft.qty += 1;
      updateCustomizerPrice();
    });
    el.custSaveBtn.addEventListener('click', saveCustomizerToCart);

    // Cart Drawer listeners
    el.openCartBtn.addEventListener('click', openCartDrawer);
    el.mobileCartOpenBtn.addEventListener('click', openCartDrawer);
    el.closeCartBtn.addEventListener('click', closeCartDrawer);
    el.cartBackdrop.addEventListener('click', closeCartDrawer);
    el.browseMenuFromCartBtn.addEventListener('click', () => {
      closeCartDrawer();
      document.getElementById('menu-explorer').scrollIntoView({ behavior: 'smooth' });
    });

    el.clearCartBtn.addEventListener('click', () => {
      state.cart = [];
      state.promoCode = null;
      saveState();
      renderCart();
      showToast('Cart cleared');
    });

    el.cartItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-action]');
      if (!btn) return;
      const action = btn.dataset.cartAction;
      const itemUid = btn.dataset.uid;
      const idx = state.cart.findIndex((i) => i.uid === itemUid);
      if (idx === -1) return;

      if (action === 'inc') {
        state.cart[idx].qty += 1;
      } else if (action === 'dec') {
        if (state.cart[idx].qty > 1) state.cart[idx].qty -= 1;
        else state.cart.splice(idx, 1);
      } else if (action === 'remove') {
        state.cart.splice(idx, 1);
      } else if (action === 'edit') {
        closeCartDrawer();
        openCustomizer(state.cart[idx].dishId, itemUid);
        return;
      }

      saveState();
      renderCart();
    });

    el.upsellsRow.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-upsell-add]');
      if (!btn) return;
      quickAddDish(btn.dataset.upsellAdd);
    });

    el.promoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      applyPromoCode(el.promoInput.value);
      el.promoInput.value = '';
    });

    el.removePromoBtn.addEventListener('click', () => {
      state.promoCode = null;
      saveState();
      renderCart();
      showToast('Promo removed');
    });

    el.tipPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.tipRate = Number(btn.dataset.tip);
        saveState();
        renderCart();
      });
    });

    // Checkout Modal listeners
    el.proceedCheckoutBtn.addEventListener('click', openCheckoutModal);
    el.closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
    el.checkoutModal.addEventListener('click', (e) => {
      if (e.target === el.checkoutModal) closeCheckoutModal();
    });
    document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        el.cardMockFields.hidden = e.target.value !== 'card';
      });
    });
    el.checkoutForm.addEventListener('submit', handleCheckoutSubmit);

    // Tracker Modal listeners
    el.closeTrackerBtn.addEventListener('click', closeTrackerModal);
    el.trackerDoneBtn.addEventListener('click', closeTrackerModal);
    el.advanceStageBtn.addEventListener('click', () => {
      if (!activeOrder || activeOrder.stage >= 3) return;
      activeOrder.stage += 1;
      renderTrackerStage();
    });

    // History Modal listeners
    el.openOrdersBtn.addEventListener('click', openHistoryModal);
    el.closeHistoryBtn.addEventListener('click', closeHistoryModal);
    el.historyModal.addEventListener('click', (e) => {
      if (e.target === el.historyModal) closeHistoryModal();
    });
    el.historyBody.addEventListener('click', (e) => {
      const trackBtn = e.target.closest('[data-track-order]');
      if (trackBtn) {
        const ord = state.orders[Number(trackBtn.dataset.trackOrder)];
        if (ord) {
          closeHistoryModal();
          openOrderTracker(ord);
        }
        return;
      }
      const reorderBtn = e.target.closest('[data-reorder]');
      if (reorderBtn) {
        const ord = state.orders[Number(reorderBtn.dataset.reorder)];
        if (ord) {
          ord.items.forEach((it) => {
            const clone = JSON.parse(JSON.stringify(it));
            clone.uid = uid();
            state.cart.push(clone);
          });
          saveState();
          renderCart();
          bumpCartBadge();
          closeHistoryModal();
          openCartDrawer();
          showToast(`Reordered ${ord.items.length} item(s) from #${ord.id}`);
        }
      }
    });

    // Escape key closes open overlays
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!el.customizerModal.hidden) closeCustomizer();
      else if (!el.checkoutModal.hidden) closeCheckoutModal();
      else if (!el.trackerModal.hidden) closeTrackerModal();
      else if (!el.historyModal.hidden) closeHistoryModal();
      else if (el.cartDrawer.classList.contains('open')) closeCartDrawer();
    });
  }

  /* --------------------------------------------------------------------------
     Bootstrap
     -------------------------------------------------------------------------- */
  function init() {
    loadState();
    applyTheme();
    applyFulfillmentUI();
    renderCategoryTabs();
    renderMenu();
    initFeastBuilder();
    updateFavoriteBadge();
    updateOrdersBadge();
    renderCart();
    bindEvents();
  }

  init();
})();
