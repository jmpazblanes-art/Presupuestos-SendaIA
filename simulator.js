/**
 * SENDAIA SIMULATOR LOGIC v3.0
 */

const CATALOG = [
    { id: "CRM-BASE", name: "Setup CRM Básico", category: "CRM", type: "one_time", min: 700, max: 900 },
    { id: "VOICE-S", name: "Agente Voz Simple", category: "Voz IA", type: "one_time", min: 800, max: 1200 },
    { id: "SUB-CRM", name: "Suscripción CRM", category: "CRM", type: "subscription", price: 150 }
];

let selectedItems = [], useIva = false;

function init() { renderCatalog(); setupListeners(); }

function setupListeners() {
    document.getElementById('search-box').oninput = (e) => renderCatalog(e.target.value);
    document.getElementById('iva-toggle').onchange = (e) => { useIva = e.target.checked; updateEstimate(); };
    document.getElementById('copy-summary').onclick = copyToClipboard;
}

function renderCatalog(filter = "") {
    const list = document.getElementById('full-catalog'); list.innerHTML = "";
    CATALOG.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())).forEach(prod => {
        const item = document.createElement('div'); item.className = "item-inline";
        item.innerHTML = `<div class="item-data"><span class="name">${prod.name}</span></div><button class="add-btn" onclick="addItem('${prod.id}')">Añadir</button>`;
        list.appendChild(item);
    });
}

function addItem(id) {
    const prod = CATALOG.find(p => p.id === id);
    selectedItems.push({ uid: Date.now(), ...prod, currentPrice: prod.type === 'one_time' ? prod.min : prod.price });
    updateEstimate();
}

function removeItem(uid) { selectedItems = selectedItems.filter(i => i.uid !== uid); updateEstimate(); }

function updateEstimate() {
    const list = document.getElementById('selected-items-list'); list.innerHTML = "";
    let setup = 0, monthly = 0;
    selectedItems.forEach(item => {
        const card = document.createElement('div'); card.className = "calc-card-item";
        card.innerHTML = `<div class="header"><span>${item.name}</span><button onclick="removeItem(${item.uid})">×</button></div>`;
        list.appendChild(card);
        if (item.type === 'one_time') setup += item.currentPrice; else monthly += item.currentPrice;
    });
    const mult = useIva ? 1.21 : 1;
    document.getElementById('total-setup').innerText = (setup * mult).toFixed(2) + " €";
    document.getElementById('total-monthly').innerText = (monthly * mult).toFixed(2) + " €";
    document.getElementById('total-year1').innerText = ((setup + monthly * 12) * mult).toFixed(2) + " €";
}

function copyToClipboard() {
    let text = "ESTIMACIÓN RÁPIDA SENDAIA\n";
    selectedItems.forEach(i => text += `- ${i.name}: ${i.currentPrice}€\n`);
    navigator.clipboard.writeText(text); alert("¡Copiado!");
}

window.addItem = addItem; window.removeItem = removeItem; init();
