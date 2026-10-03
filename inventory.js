const SESSION_KEY = "stockroom_session";
const INVENTORY_KEY = "stockroom_inventory";

const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
if (!session) location.href = "index.html";

const defaultItems = [
  {id: crypto.randomUUID(), name:"Wireless Mouse", sku:"WM-101", location:"Rack A1", qty:42, reorder:10},
  {id: crypto.randomUUID(), name:"Mechanical Keyboard", sku:"KB-204", location:"Rack A2", qty:8, reorder:12},
  {id: crypto.randomUUID(), name:"USB-C Cable", sku:"UC-330", location:"Rack B1", qty:75, reorder:20},
  {id: crypto.randomUUID(), name:"HDMI Adapter", sku:"HD-118", location:"Rack B2", qty:5, reorder:8}
];

if (!localStorage.getItem(INVENTORY_KEY)) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(defaultItems));
}

let items = JSON.parse(localStorage.getItem(INVENTORY_KEY) || "[]");
const save = () => localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));

welcomeUser.textContent = session.email;
userName.textContent = session.name.split(" ")[0];

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;
  const filtered = items.filter(item => {
    const text = `${item.name} ${item.sku} ${item.location}`.toLowerCase();
    const matchesText = text.includes(query);
    const low = item.qty <= item.reorder;
    const matchesFilter = filter === "all" || (filter === "low" && low) || (filter === "healthy" && !low);
    return matchesText && matchesFilter;
  });

  totalItems.textContent = items.length;
  totalUnits.textContent = items.reduce((sum, i) => sum + Number(i.qty), 0);
  lowStock.textContent = items.filter(i => Number(i.qty) <= Number(i.reorder)).length;
  locations.textContent = new Set(items.map(i => i.location)).size;
  itemCount.textContent = `${filtered.length} shown`;

  inventoryBody.innerHTML = filtered.map(item => {
    const low = Number(item.qty) <= Number(item.reorder);
    return `<tr>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td>${escapeHtml(item.sku)}</td>
      <td>${escapeHtml(item.location)}</td>
      <td>${item.qty}</td>
      <td>${item.reorder}</td>
      <td><span class="badge ${low ? "low" : "ok"}">${low ? "Low stock" : "In stock"}</span></td>
      <td class="actions">
        <button class="text-btn" onclick="editItem('${item.id}')">Edit</button>
        <button class="text-btn danger" onclick="deleteItem('${item.id}')">Delete</button>
      </td>
    </tr>`;
  }).join("");

  emptyState.classList.toggle("hidden", filtered.length !== 0);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function openDialog(item = null) {
  dialogTitle.textContent = item ? "Edit inventory item" : "Add inventory item";
  itemId.value = item?.id || "";
  itemName.value = item?.name || "";
  itemSku.value = item?.sku || "";
  itemLocation.value = item?.location || "";
  itemQty.value = item?.qty ?? "";
  itemReorder.value = item?.reorder ?? "";
  itemDialog.showModal();
}

window.editItem = id => openDialog(items.find(i => i.id === id));

window.deleteItem = id => {
  const item = items.find(i => i.id === id);
  if (confirm(`Delete "${item.name}"?`)) {
    items = items.filter(i => i.id !== id);
    save(); render();
  }
};

addBtn.addEventListener("click", () => openDialog());
closeDialog.addEventListener("click", () => itemDialog.close());
cancelBtn.addEventListener("click", () => itemDialog.close());
searchInput.addEventListener("input", render);
filterSelect.addEventListener("change", render);

itemForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    id: itemId.value || crypto.randomUUID(),
    name: itemName.value.trim(),
    sku: itemSku.value.trim(),
    location: itemLocation.value.trim(),
    qty: Number(itemQty.value),
    reorder: Number(itemReorder.value)
  };
  const index = items.findIndex(i => i.id === data.id);
  if (index >= 0) items[index] = data; else items.push(data);
  save(); render(); itemDialog.close();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  location.href = "index.html";
});

render();