let products = [];
const $ = id => document.getElementById(id);
const form = $("productForm");
const statusBox = $("status");

function showStatus(msg, error=false){statusBox.textContent=msg;statusBox.className=`status show${error?" error":""}`;setTimeout(()=>statusBox.classList.remove("show"),3200);}
function money(n){return `₹${Number(n).toLocaleString("en-IN")}`;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}

async function api(url, options={}){
  const res=await fetch(url,{...options,headers:{"Content-Type":"application/json",...(options.headers||{})}});
  const data=await res.json().catch(()=>({ok:false,message:"Server returned an invalid response."}));
  if(!res.ok) throw new Error(data.message||`Request failed (${res.status})`);
  return data;
}
async function load(){
  const me=await api("/api/auth/me",{headers:{}});
  if(!me.ok){$("loginScreen").classList.remove("hidden");$("adminApp").classList.add("hidden");return;}
  $("loginScreen").classList.add("hidden");$("adminApp").classList.remove("hidden");
  const data=await api("/api/products",{headers:{}});
  products=data.products;render();
}
function render(){
  $("count").textContent=`${products.length} product${products.length===1?"":"s"}`;
  $("productList").innerHTML=products.map(p=>`
  <div class="admin-item">
    <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" onerror="this.onerror=null;this.src='/assets/food-fallback.svg'">
    <div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.category)} • ${money(p.price)} • ${escapeHtml(p.unit)}</p><p>Stock: ${p.stockQuantity} • ${p.stockStatus} • ${p.active?"Visible":"Hidden"}${p.featured?" • Featured":""}</p></div>
    <div class="item-actions"><button class="icon-btn" data-edit="${escapeHtml(p.id)}">Edit</button><button class="icon-btn" data-delete="${escapeHtml(p.id)}">Delete</button></div>
  </div>`).join("");
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editProduct(b.dataset.edit));
  document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteProduct(b.dataset.delete));
}
function editProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  $("formTitle").textContent="Edit Product";$("saveBtn").textContent="Save Changes";
  $("productId").value=p.id;$("name").value=p.name;$("category").value=p.category;$("price").value=p.price;$("unit").value=p.unit;$("stockQuantity").value=p.stockQuantity;$("originalPrice").value=p.originalPrice??"";$("image").value=p.image;$("description").value=p.description;$("featured").checked=p.featured;$("active").checked=p.active;
  window.scrollTo({top:0,behavior:"smooth"});
}
function resetForm(){form.reset();$("productId").value="";$("active").checked=true;$("formTitle").textContent="Add Product";$("saveBtn").textContent="Add Product";}
form.onsubmit=async e=>{
  e.preventDefault();
  const id=$("productId").value;
  const payload={name:$("name").value,category:$("category").value,price:Number($("price").value),unit:$("unit").value,stockQuantity:Number($("stockQuantity").value),originalPrice:$("originalPrice").value===""?null:Number($("originalPrice").value),image:$("image").value,description:$("description").value,featured:$("featured").checked,active:$("active").checked};
  try{const data=await api(id?`/api/products/${encodeURIComponent(id)}`:"/api/products",{method:id?"PUT":"POST",body:JSON.stringify(payload)});showStatus(id?"Product updated successfully.":"Product added successfully.");resetForm();await load();}catch(err){showStatus(err.message,true);}
};
async function deleteProduct(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  if(!confirm(`Delete "${p.name}" permanently?`))return;
  try{await api(`/api/products/${encodeURIComponent(id)}`,{method:"DELETE"});showStatus("Product deleted.");await load();}catch(err){showStatus(err.message,true);}
}
$("resetBtn").onclick=resetForm;
$("logoutBtn").onclick=async()=>{await api("/api/auth/logout",{method:"POST"});location.reload();};
$("loginForm").onsubmit=async e=>{e.preventDefault();$("loginError").textContent="";try{await api("/api/auth/login",{method:"POST",body:JSON.stringify({email:$("loginEmail").value,password:$("loginPassword").value})});await load();}catch(err){$("loginError").textContent=err.message;}};
function updateThemeButton(){const btn=$("themeToggle");if(!btn)return;const dark=document.documentElement.classList.contains("dark");btn.innerHTML=dark?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 15.3A8.5 8.5 0 0 1 8.7 3.4 8.5 8.5 0 1 0 20.6 15.3Z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';btn.setAttribute("aria-pressed",String(dark));btn.setAttribute("aria-label",dark?"Switch to light theme":"Switch to dark theme");}
const savedTheme=localStorage.getItem("gokul-theme");if(savedTheme==="dark")document.documentElement.classList.add("dark");updateThemeButton();
$("themeToggle").onclick=()=>{const dark=document.documentElement.classList.toggle("dark");localStorage.setItem("gokul-theme",dark?"dark":"light");updateThemeButton();};
$("eyeBtn").onclick=()=>{const input=$("loginPassword");const show=input.type==="password";input.type=show?"text":"password";$("eyeBtn").innerHTML=show?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A11.8 11.8 0 0 1 12 5c6.1 0 9.5 7 9.5 7a16 16 0 0 1-3.1 3.7M6.1 6.1C3.7 7.7 2.5 12 2.5 12s3.4 7 9.5 7a10.6 10.6 0 0 0 4-.8"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-5 9.5-5 9.5 5 9.5 5-3.4 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>';$("eyeBtn").setAttribute("aria-pressed",String(show));};
load().catch(err=>{console.error(err);$("loginError").textContent=err.message;});
