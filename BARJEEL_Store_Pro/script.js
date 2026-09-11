
const DEFAULT_STORE = {
  adminPassword: "barjeel2026",
  settings: {
    announcement: "UAE DELIVERY • PREMIUM BICYCLE PROTECTION",
    shipping: 25,
    freeShipping: 500,
    whatsapp: "971500000000",
    email: "hello@barjeel.ae",
    currency: "AED"
  },
  products: [
    {
      id:"core",
      name:"BARJEEL CORE",
      price:299,
      stock:24,
      category:"Core",
      badge:"FIRST RELEASE",
      description:"Premium everyday protection for high-end road and carbon bicycles.",
      variants:["Matte Black / M-L","Carbon Grey / M-L"],
      specs:{"Outer fabric":"600D Oxford option","Water resistance":"Target 3000mm+","Interior":"Soft protective lining","Closure":"Adjustable straps"},
      published:true
    },
    {
      id:"heritage",
      name:"BARJEEL HERITAGE",
      price:349,
      stock:16,
      category:"Heritage",
      badge:"LIMITED",
      description:"A refined UAE-inspired edition with restrained heritage detailing and elevated finishing.",
      variants:["Midnight Gold / M-L","Sandstone / M-L"],
      specs:{"Outer fabric":"600D–900D Oxford option","Finish":"Premium matte","Interior":"Soft protective lining","Edition":"Limited series"},
      published:true
    },
    {
      id:"atelier",
      name:"BARJEEL ATELIER",
      price:449,
      stock:10,
      category:"Atelier",
      badge:"CUSTOM",
      description:"Custom branding and colour direction for teams, clubs and selected private orders.",
      variants:["Custom / Consultation"],
      specs:{"Customization":"Logo + pattern options","Packaging":"Branded pouch/box","MOQ":"Configurable","Production":"By quotation"},
      published:true
    }
  ],
  discounts:[{code:"BARJEEL10",type:"percent",value:10,active:true}],
  orders:[]
};

const I18N = {
  en:{nav_shop:"Shop",nav_engineering:"Engineering",nav_story:"Our Story",nav_contact:"Contact",hero_title:"Protection,<br><em>elevated.</em>",hero_sub:"Premium protection for exceptional road and carbon bicycles, designed with the restraint of a luxury object and the purpose of technical equipment.",shop_collection:"Shop Collection",discover_engineering:"Discover Engineering",collection:"THE COLLECTION",built_for:"Built for the <em>priceless.</em>",collection_desc:"Start with one precise object: a better cover for a better bicycle."},
  ar:{nav_shop:"المتجر",nav_engineering:"الهندسة",nav_story:"قصتنا",nav_contact:"تواصل",hero_title:"حماية،<br><em>بمستوى أعلى.</em>",hero_sub:"حماية فاخرة للدراجات الاحترافية ودراجات الكاربون، بتصميم راقٍ ووظيفة هندسية حقيقية.",shop_collection:"تصفح المجموعة",discover_engineering:"اكتشف الهندسة",collection:"المجموعة",built_for:"صُمم لما هو <em>ثمِين.</em>",collection_desc:"نبدأ بمنتج واحد متقن: غطاء أفضل لدراجة أفضل."}
};

let store = JSON.parse(localStorage.getItem("barjeelStore") || "null") || DEFAULT_STORE;
let cart = JSON.parse(localStorage.getItem("barjeelCart") || "[]");
let currentProduct = null;
let currentLang = localStorage.getItem("barjeelLang") || "en";
let activeCategory = "All";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const money = n => `${store.settings.currency} ${Number(n).toLocaleString("en-AE",{minimumFractionDigits:0,maximumFractionDigits:2})}`;
const saveStore = () => localStorage.setItem("barjeelStore", JSON.stringify(store));
const saveCart = () => localStorage.setItem("barjeelCart", JSON.stringify(cart));

function applySettings(){
  $("#announcement").textContent = store.settings.announcement;
  $("#waLink").href=`https://wa.me/${store.settings.whatsapp}?text=${encodeURIComponent("Hello BARJEEL, I would like to enquire about your bicycle covers.")}`;
  $("#emailLink").href=`mailto:${store.settings.email}?subject=BARJEEL%20Enquiry`;
  $("#year").textContent = new Date().getFullYear();
}
function applyLang(){
  document.documentElement.lang=currentLang;
  document.body.classList.toggle("rtl",currentLang==="ar");
  document.documentElement.dir=currentLang==="ar"?"rtl":"ltr";
  $("#langBtn").textContent=currentLang==="en"?"AR":"EN";
  $$("[data-i18n]").forEach(el=>{let k=el.dataset.i18n;if(I18N[currentLang][k])el.innerHTML=I18N[currentLang][k]});
}
function renderFilters(){
  const cats=["All",...new Set(store.products.filter(p=>p.published).map(p=>p.category))];
  $("#filters").innerHTML=cats.map(c=>`<button class="filter ${c===activeCategory?"active":""}" onclick="setCategory('${c}')">${c}</button>`).join("");
}
window.setCategory=c=>{activeCategory=c;renderFilters();renderProducts();}
function renderProducts(){
  let list=store.products.filter(p=>p.published&&(activeCategory==="All"||p.category===activeCategory));
  $("#productGrid").innerHTML=list.map(p=>`
    <article class="product">
      <div class="product-media"><span class="badge">${p.badge||""}</span>BARJEEL</div>
      <div class="product-body">
        <h3>${p.name}</h3><div class="product-price">${money(p.price)}</div>
        <p>${p.description}</p>
        <div class="product-meta"><span>${p.stock>0?`${p.stock} in stock`:"Sold out"}</span><span>${p.category}</span></div>
        <div class="product-actions">
          <button class="btn secondary" onclick="openProduct('${p.id}')">Details</button>
          <button class="btn primary" onclick="quickAdd('${p.id}')" ${p.stock<=0?"disabled":""}>Add</button>
        </div>
      </div>
    </article>`).join("");
}
window.openProduct=id=>{
  let p=store.products.find(x=>x.id===id); if(!p)return; currentProduct=p;
  $("#pmName").textContent=p.name; $("#pmPrice").textContent=money(p.price); $("#pmDescription").textContent=p.description;
  $("#pmVariant").innerHTML=p.variants.map(v=>`<option>${v}</option>`).join("");
  $("#pmQty").value=1;
  $("#pmSpecs").innerHTML=Object.entries(p.specs||{}).map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join("");
  openModal("productModal");
}
window.quickAdd=id=>{
  let p=store.products.find(x=>x.id===id); if(!p||p.stock<=0)return;
  addToCart(p.id,p.variants[0],1);
}
function addToCart(id,variant,qty){
  const p=store.products.find(x=>x.id===id); if(!p)return;
  const key=id+"|"+variant; const existing=cart.find(x=>x.key===key);
  if(existing) existing.qty += qty; else cart.push({key,id,variant,qty});
  saveCart(); renderCart(); openDrawer();
}
$("#pmAdd").onclick=()=>{ if(currentProduct){addToCart(currentProduct.id,$("#pmVariant").value,Math.max(1,Number($("#pmQty").value)||1)); closeModal("productModal")} };
function renderCart(){
  $("#cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0);
  if(!cart.length){$("#cartItems").innerHTML=`<p class="muted">Your bag is empty.</p>`}
  else $("#cartItems").innerHTML=cart.map((item,i)=>{
    let p=store.products.find(x=>x.id===item.id); if(!p)return"";
    return `<div class="cart-line"><div><strong>${p.name}</strong><small>${item.variant} · Qty ${item.qty}</small><small>${money(p.price*item.qty)}</small></div><button onclick="removeCart(${i})">Remove</button></div>`
  }).join("");
  $("#cartSubtotal").textContent=money(cartSubtotal());
}
window.removeCart=i=>{cart.splice(i,1);saveCart();renderCart();}
function cartSubtotal(){return cart.reduce((s,i)=>{let p=store.products.find(x=>x.id===i.id);return s+(p?p.price*i.qty:0)},0)}
function openDrawer(){$("#cartDrawer").classList.add("open");$("#backdrop").classList.add("show")}
function closeDrawer(){$("#cartDrawer").classList.remove("open");$("#backdrop").classList.remove("show")}
$("#cartBtn").onclick=openDrawer; $("#backdrop").onclick=closeDrawer;
$$("[data-close]").forEach(b=>b.onclick=()=>{let id=b.dataset.close;if(id==="cartDrawer")closeDrawer();else closeModal(id)});
function openModal(id){$("#"+id).classList.add("open")}
function closeModal(id){$("#"+id).classList.remove("open")}
$("#checkoutBtn").onclick=()=>{if(!cart.length)return;closeDrawer();renderCheckoutTotals();openModal("checkoutModal")}
function getDiscount(code){
  if(!code)return null; return store.discounts.find(d=>d.active&&d.code.toLowerCase()===code.trim().toLowerCase())||null;
}
function calcTotals(code=""){
  let subtotal=cartSubtotal(); let d=getDiscount(code); let discount=0;
  if(d) discount=d.type==="percent"?subtotal*d.value/100:d.value;
  discount=Math.min(discount,subtotal);
  let shipping=(subtotal-discount)>=store.settings.freeShipping?0:store.settings.shipping;
  return {subtotal,discount,shipping,total:subtotal-discount+shipping};
}
function renderCheckoutTotals(){
  let t=calcTotals($("#discountInput")?.value||"");
  $("#checkoutTotals").innerHTML=`<div><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div><div><span>Discount</span><strong>-${money(t.discount)}</strong></div><div><span>Shipping</span><strong>${t.shipping?money(t.shipping):"FREE"}</strong></div><div><span>Total</span><strong>${money(t.total)}</strong></div>`;
}
$("#discountInput").addEventListener("input",renderCheckoutTotals);
$("#checkoutForm").onsubmit=e=>{
  e.preventDefault(); if(!cart.length)return;
  const data=Object.fromEntries(new FormData(e.target).entries()); let totals=calcTotals(data.discount);
  const order={
    id:"BJ"+Date.now().toString().slice(-8),
    date:new Date().toISOString(),
    customer:data,
    items:cart.map(i=>({...i})),
    totals,
    status:"Pending"
  };
  // decrement inventory
  cart.forEach(i=>{let p=store.products.find(x=>x.id===i.id);if(p)p.stock=Math.max(0,p.stock-i.qty)});
  store.orders.unshift(order); saveStore(); cart=[]; saveCart();
  renderCart(); renderProducts(); closeModal("checkoutModal");
  $("#successText").textContent=`Order ${order.id} has been saved. Total: ${money(order.totals.total)}.`;
  openModal("successModal"); renderAdmin();
};

$("#langBtn").onclick=()=>{currentLang=currentLang==="en"?"ar":"en";localStorage.setItem("barjeelLang",currentLang);applyLang()}
$("#menuBtn").onclick=()=>{let nav=$("#nav");nav.style.display=nav.style.display==="flex"?"none":"flex"}

// Admin
$("#adminOpen").onclick=()=>openModal("adminModal");
$("#adminLoginBtn").onclick=()=>{
  if($("#adminPassword").value===store.adminPassword){$("#adminLogin").classList.add("hidden");$("#adminPanel").classList.remove("hidden");renderAdmin()}
  else $("#adminError").textContent="Incorrect password.";
}
$("#adminLogout").onclick=()=>{$("#adminPanel").classList.add("hidden");$("#adminLogin").classList.remove("hidden");$("#adminPassword").value=""}
function renderAdmin(){
  if(!$("#adminPanel")||$("#adminPanel").classList.contains("hidden")) return;
  const revenue=store.orders.filter(o=>o.status!=="Cancelled").reduce((s,o)=>s+o.totals.total,0);
  $("#adminKpis").innerHTML=[
    ["Revenue",money(revenue)],["Orders",store.orders.length],["Stock",store.products.reduce((s,p)=>s+p.stock,0)],["Products",store.products.length]
  ].map(([k,v])=>`<div class="kpi"><strong>${v}</strong><span>${k}</span></div>`).join("");
  $("#adminProducts").innerHTML=store.products.map((p,i)=>`
    <div class="admin-product">
      <input value="${escapeHtml(p.name)}" onchange="editProduct(${i},'name',this.value)">
      <input type="number" value="${p.price}" onchange="editProduct(${i},'price',+this.value)">
      <input type="number" value="${p.stock}" onchange="editProduct(${i},'stock',+this.value)">
      <select onchange="editProduct(${i},'published',this.value==='true')"><option value="true" ${p.published?"selected":""}>Published</option><option value="false" ${!p.published?"selected":""}>Hidden</option></select>
      <button onclick="deleteProduct(${i})">Delete</button>
    </div>`).join("");
  $("#adminOrders").innerHTML=store.orders.length?store.orders.map((o,i)=>`
    <div class="order-row"><div><strong>${o.id}</strong><small>${new Date(o.date).toLocaleString()}</small></div><div>${escapeHtml(o.customer.name||"")}</div><div>${money(o.totals.total)}</div><select onchange="setOrderStatus(${i},this.value)">${["Pending","Paid","Processing","Shipped","Delivered","Cancelled","Refunded"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}</select><button onclick="viewOrder(${i})">View</button></div>`).join(""):`<p class="muted">No orders yet.</p>`;
  $("#setAnnouncement").value=store.settings.announcement;$("#setShipping").value=store.settings.shipping;$("#setFreeShipping").value=store.settings.freeShipping;$("#setWhatsapp").value=store.settings.whatsapp;$("#setEmail").value=store.settings.email;$("#setCurrency").value=store.settings.currency;
}
window.editProduct=(i,k,v)=>{store.products[i][k]=v;saveStore();renderProducts();renderAdmin()}
window.deleteProduct=i=>{if(confirm("Delete this product?")){store.products.splice(i,1);saveStore();renderProducts();renderFilters();renderAdmin()}}
$("#addProductBtn").onclick=()=>{store.products.push({id:"p"+Date.now(),name:"NEW BARJEEL PRODUCT",price:299,stock:10,category:"Core",badge:"NEW",description:"Edit this description.",variants:["Default"],specs:{Material:"Edit in script.js or extend dashboard"},published:true});saveStore();renderProducts();renderFilters();renderAdmin()}
window.setOrderStatus=(i,v)=>{store.orders[i].status=v;saveStore();renderAdmin()}
window.viewOrder=i=>{let o=store.orders[i];alert(`${o.id}\n${o.customer.name}\n${o.customer.phone}\n${o.customer.emirate}\n${o.customer.address}\nTotal: ${money(o.totals.total)}\nStatus: ${o.status}`)}
$("#saveSettings").onclick=()=>{store.settings.announcement=$("#setAnnouncement").value;store.settings.shipping=+$("#setShipping").value||0;store.settings.freeShipping=+$("#setFreeShipping").value||0;store.settings.whatsapp=$("#setWhatsapp").value;store.settings.email=$("#setEmail").value;store.settings.currency=$("#setCurrency").value||"AED";saveStore();applySettings();renderProducts();renderCart();renderAdmin()}
$$(".admin-tabs button").forEach(btn=>btn.onclick=()=>{$$(".admin-tabs button").forEach(x=>x.classList.remove("active"));$$(".admin-tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");$("#"+btn.dataset.tab).classList.add("active")});
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

applySettings();applyLang();renderFilters();renderProducts();renderCart();
