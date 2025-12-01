/* app.js — o'zbekcha, professional menu + cart + admin + kuryer */
const BACKEND = window.BACKEND_URL || '';
let products = [];
let cart = {};
let currentUser = null;

const $ = id => document.getElementById(id);

// Get URL params (e.g., ?tab=admin)
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function fetchProducts(){
  showSkeleton(true);
  try{
    // Backendda /api/foods ga murojaat qilamiz; GitHub Pages uchun demo JSON fallback mavjud
    const url = (BACKEND && BACKEND !== '') ? BACKEND + 'api/foods' : '/data/foods.json';
    const res = await fetch(url);
    const payload = await res.json();
    products = payload.foods || payload;
    renderCategories();
    renderProducts(products);
  }catch(e){
    console.error('fetchProducts error', e);
    document.getElementById('products').innerHTML = '<p>Mahsulotlarni olishda xato.</p>';
  }finally{ showSkeleton(false) }
}

function showSkeleton(show){
  const s = $('skeleton');
  if(s) s.style.display = show ? 'grid' : 'none';
}

function renderCategories(){
  const sel = $('categoryFilter');
  sel.innerHTML = '<option value="">Barcha kategoriyalar</option>';
  const cats = [...new Set(products.map(p=>p.category || 'Boshqa'))];
  cats.forEach(c=>{ const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); })
}

function renderProducts(list){
  const container = $('products');
  container.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('article'); card.className='card';
    card.innerHTML = `
      <div class="media"><img src="${p.image_url||'https://via.placeholder.com/400x300'}" alt="${p.name}"></div>
      <div class="meta">
        <h4>${p.name}</h4>
        <p class="small">${p.description||''}</p>
        <div class="row" style="align-items:center;margin-top:8px">
          <div class="product-controls">
            <div class="qty" data-id="${p.id}">
              <button class="minus">-</button>
              <div class="count">1</div>
              <button class="plus">+</button>
            </div>
            <div style="width:10px"></div>
            <div class="price" data-base="${p.price}">${formatPrice(p.price)}</div>
          </div>
          <div>
            <button class="btn add-btn" data-id="${p.id}">Tanlash</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Attach controls
  document.querySelectorAll('.qty').forEach(el=>{
    const id = el.dataset.id;
    const minus = el.querySelector('.minus');
    const plus = el.querySelector('.plus');
    const countEl = el.querySelector('.count');
    minus.addEventListener('click', ()=>{
      let v = Number(countEl.textContent); if(v>1) v--; countEl.textContent = v; updatePrice(id, v);
    });
    plus.addEventListener('click', ()=>{ let v = Number(countEl.textContent); v++; countEl.textContent = v; updatePrice(id, v); });
  });
  document.querySelectorAll('.add-btn').forEach(b=> b.addEventListener('click', ()=> addToCart(b.dataset.id)));
}

function updatePrice(id, qty){
  const priceEl = document.querySelector(`.price[data-base][data-base][data-base]`) || null; // avoid lint
  // find price element for this id
  const card = document.querySelector(`.qty[data-id='${id}']`);
  if(!card) return;
  const base = Number(card.parentElement.querySelector('.price').dataset.base);
  const newPrice = base * Number(card.querySelector('.count').textContent||1);
  card.parentElement.querySelector('.price').textContent = formatPrice(newPrice);
}

function formatPrice(v){ return '$' + Number(v||0).toFixed(2) }

function addToCart(id){
  const prod = products.find(p=>String(p.id)===String(id));
  if(!prod) return;
  const card = document.querySelector(`.qty[data-id='${id}']`);
  const qty = card ? Number(card.querySelector('.count').textContent) : 1;
  if(!cart[id]) cart[id] = { ...prod, quantity: 0 };
  cart[id].quantity += qty;
  showToast('Mahsulot savatga qo\'shildi');
  updateCartUI();
}

function removeFromCart(id){ delete cart[id]; updateCartUI(); }

function updateCartUI(){
  const count = Object.values(cart).reduce((s,i)=>s + (i.quantity||0),0);
  $('cartCount').textContent = count;
  $('bottomCartCount').textContent = count;
  // Toggle bottom nav count visibility
  if(count===0){ $('bottomCartCount').style.display='inline-block'; $('cartCount').style.display='none'; } else { $('cartCount').style.display='inline-block' }

  const items = $('cartItems'); items.innerHTML = '';
  let total = 0;
  Object.values(cart).forEach(it=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<div style="flex:1"><strong>${it.name}</strong><div class='small'>${it.quantity} x ${formatPrice(it.price)}</div></div><div><button class='btn' data-id='${it.id}'>✖</button></div>`;
    items.appendChild(div);
    div.querySelector('button').addEventListener('click', ()=> removeFromCart(it.id));
    total += (it.quantity||0) * Number(it.price||0);
  });
  $('cartTotal').textContent = formatPrice(total);
}

function switchView(view){
  if(view==='menu'){ $('viewMenu').classList.remove('hidden'); $('viewCart').classList.add('hidden'); $('viewAdmin').classList.add('hidden'); $('viewCourier').classList.add('hidden'); $('navMenu').classList.add('active'); $('navCart').classList.remove('active'); $('navAdmin').classList.remove('active'); $('navCourier').classList.remove('active'); }
  else if(view==='cart'){ $('viewMenu').classList.add('hidden'); $('viewCart').classList.remove('hidden'); $('viewAdmin').classList.add('hidden'); $('viewCourier').classList.add('hidden'); $('navMenu').classList.remove('active'); $('navCart').classList.add('active'); $('navAdmin').classList.remove('active'); $('navCourier').classList.remove('active'); }
  else if(view==='admin'){ $('viewMenu').classList.add('hidden'); $('viewCart').classList.add('hidden'); $('viewAdmin').classList.remove('hidden'); $('viewCourier').classList.add('hidden'); $('navMenu').classList.remove('active'); $('navCart').classList.remove('active'); $('navAdmin').classList.add('active'); $('navCourier').classList.remove('active'); }
  else if(view==='courier'){ $('viewMenu').classList.add('hidden'); $('viewCart').classList.add('hidden'); $('viewAdmin').classList.add('hidden'); $('viewCourier').classList.remove('hidden'); $('navMenu').classList.remove('active'); $('navCart').classList.remove('active'); $('navAdmin').classList.remove('active'); $('navCourier').classList.add('active'); }
}

// UI events
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'navMenu') switchView('menu');
  if(e.target && e.target.id === 'navCart') switchView('cart');
  if(e.target && e.target.id === 'navAdmin') switchView('admin');
  if(e.target && e.target.id === 'navCourier') switchView('courier');
});

$('checkoutBtn').addEventListener('click', ()=>{ $('checkoutModal').classList.remove('hidden'); });
$('closeCheckout').addEventListener('click', ()=>{ $('checkoutModal').classList.add('hidden'); });
$('sendLocationBtn').addEventListener('click', ()=>{
  if(!navigator.geolocation){ alert('Brauzer joylashuvni qo\'llab-quvvatlamaydi'); return }
  navigator.geolocation.getCurrentPosition(pos=>{ $('checkoutAddress').value = `${pos.coords.latitude}, ${pos.coords.longitude}`; }, e=> alert('Joylashuv olinmadi'))
});

$('sendOrderBtn').addEventListener('click', async ()=>{
  const phone = $('checkoutPhone').value.trim();
  const address = $('checkoutAddress').value.trim();
  if(!phone) return alert('Iltimos telefon raqamini kiriting');
  const items = Object.values(cart).map(i=>({ food_id: i.id, quantity: i.quantity, portions: 1 }));
  const payload = { delivery_address: address, delivery_latitude:null, delivery_longitude:null, payment_method:'card', items };
  if(address.includes(',')){
    const [lat,lng] = address.split(',').map(s=>s.trim()); payload.delivery_latitude = parseFloat(lat); payload.delivery_longitude = parseFloat(lng);
  }
  try{
    const res = await fetch((BACKEND && BACKEND !== '' ? BACKEND : '') + 'api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if(res.ok){ const data = await res.json(); alert('Buyurtma qabul qilindi. ID: ' + (data.order && data.order.id || '—')); cart = {}; updateCartUI(); $('checkoutModal').classList.add('hidden'); switchView('menu'); }
    else { const txt = await res.text(); alert('Xato: ' + txt); }
  }catch(e){ alert('Serverga bog\'lanishda xato') }
});

// Search & filter
$('search').addEventListener('input', e=>{ const qv = e.target.value.toLowerCase(); const cat = $('categoryFilter').value; const filtered = products.filter(p=> (p.name||'').toLowerCase().includes(qv) && (cat? p.category===cat:true) ); renderProducts(filtered); });
$('categoryFilter').addEventListener('change', ()=>{ const qv = $('search').value.toLowerCase(); const cat = $('categoryFilter').value; const filtered = products.filter(p=> (p.name||'').toLowerCase().includes(qv) && (cat? p.category===cat:true) ); renderProducts(filtered); });

// Theme toggle
$('toggleTheme').addEventListener('click', ()=>{ const t = document.documentElement.getAttribute('data-theme'); if(t==='dark'){ document.documentElement.removeAttribute('data-theme'); $('toggleTheme').textContent='🌙' } else { document.documentElement.setAttribute('data-theme','dark'); $('toggleTheme').textContent='☀' } });

function showToast(msg){ const t = document.getElementById('emptyCartToast'); t.textContent = msg; t.classList.remove('hidden'); setTimeout(()=> t.classList.add('hidden'), 1800); }

// Boot
fetchProducts();
updateCartUI();

// Check for URL tab param and switch view
const tabParam = getUrlParam('tab');
if(tabParam === 'admin') {
  switchView('admin');
} else if(tabParam === 'courier') {
  switchView('courier');
} else {
  switchView('menu');
}

// Service worker
if('serviceWorker' in navigator){ navigator.serviceWorker.register('/service-worker.js').catch(e=>console.warn('SW error',e)); }
