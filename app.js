/**
 * SENDAIA DASHBOARD APP v4.2
 * Independencia Total: Google Apps Script Integration
 */

const engine = new PricingEngine();

const state = {
    currentStep: 1,
    clientData: { company: "", contact: "", sector: "", size: "" }
};

const els = {
    dots: [document.getElementById('dot-1'), document.getElementById('dot-2'), document.getElementById('dot-3')],
    steps: [document.getElementById('step-1'), document.getElementById('step-2'), document.getElementById('step-3')],
    sidebar: document.getElementById('main-sidebar'),
    summary: document.getElementById('summary-panel'),
    grid: document.getElementById('product-grid'),
    summaryItems: document.getElementById('summary-items'),
    setupTotal: document.getElementById('setup-total'),
    monthlyTotal: document.getElementById('monthly-total'),
    year1Total: document.getElementById('year1-total'),
    year2Total: document.getElementById('year2-total'),
    bossProfit: document.getElementById('boss-profit'),
    bossMargin: document.getElementById('boss-margin'),
    bossDays: document.getElementById('boss-days'),
    authProgress: document.getElementById('auth-progress'),
    authLabel: document.getElementById('auth-level-label'),
    roiSavingInput: document.getElementById('roi-saving'),
    roiResult: document.getElementById('roi-result'),
    btnStart: document.getElementById('start-discovery'),
    formCompany: document.getElementById('client-company'),
    formContact: document.getElementById('client-name'),
    formSector: document.getElementById('client-sector'),
    formSize: document.getElementById('client-size'),
    btnFinish: document.getElementById('finish-selection'),
    reviewClient: document.getElementById('review-client-text'),
    reviewList: document.getElementById('review-items-list'),
    finalSetup: document.getElementById('final-setup'),
    finalMonthly: document.getElementById('final-monthly'),
    finalYear1: document.getElementById('final-year1'),
    finalYear2: document.getElementById('final-year2'),
    finalMargin: document.getElementById('final-margin'),
    btnBack: document.getElementById('back-to-edit'),
    btnConfirm: document.getElementById('confirm-all'),
    categoryTitle: document.getElementById('category-title'),
    categoryDesc: document.getElementById('category-desc')
};

const titles_map = {
    VOICE: "Voz IA", CHAT: "Chatbot Web", WSP: "WhatsApp IA",
    OCR: "OCR Automático", CRM: "CRM SendaIA", SUPPORT: "Soporte", PACKS: "Packs de Autoridad"
};

function init() {
    setupWizard();
    setupNavigation();
    updateWizardUI();
}

function setupWizard() {
    if (els.btnStart) {
        els.btnStart.onclick = () => {
            state.clientData = {
                company: els.formCompany.value,
                contact: els.formContact.value,
                sector: els.formSector.value,
                size: els.formSize.value
            };
            if (!state.clientData.company) return alert("Indica la Empresa");
            goToStep(2);
        };
    }
    if (els.btnFinish) {
        els.btnFinish.onclick = () => {
            const res = engine.calculate();
            if (res.errors.length > 0) return alert(res.errors.join("\n"));
            goToStep(3);
        };
    }
    if (els.btnBack) els.btnBack.onclick = () => goToStep(2);
    if (els.btnConfirm) els.btnConfirm.onclick = saveAndFinish;
}

function goToStep(num) {
    state.currentStep = num;
    updateWizardUI();
}

function updateWizardUI() {
    els.steps.forEach((s, i) => s && s.classList.toggle('active', (i + 1) === state.currentStep));
    els.dots.forEach((d, i) => d && d.classList.toggle('active', (i + 1) <= state.currentStep));
    if (state.currentStep === 2) {
        if (els.sidebar) els.sidebar.style.display = 'flex';
        if (els.summary) els.summary.style.display = 'flex';
        renderCategory('VOICE');
    } else {
        if (els.sidebar) els.sidebar.style.display = 'none';
        if (els.summary) els.summary.style.display = (state.currentStep === 1) ? 'none' : 'flex';
    }
    if (state.currentStep === 3) renderReview();
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCategory(btn.dataset.category);
        };
    });
}

function renderCategory(cat) {
    if (!els.categoryTitle || !els.grid) return;
    els.categoryTitle.innerText = titles_map[cat] || "Configuración";
    els.grid.innerHTML = "";
    if (cat === 'PACKS') renderPacks(); else renderVolumeCards(cat);
}

function renderVolumeCards(cat) {
    const data = SENDAIA_CATALOG[cat];
    if (!data) return;
    const card = document.createElement('div');
    card.className = "volume-selection-card";
    let setupsHtml = data.setups.length > 0 ? `
        <div class="volume-option-group">
            <label>Nivel de Implementación</label>
            <select class="volume-dropdown" id="sel-setup-${cat}">
                <option value="">-- Sin Setup --</option>
                ${data.setups.map(s => `<option value="${s.id}" ${engine.selected[cat].setupId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
            <div id="slider-container-${cat}" class="setup-slider-box" style="display: ${engine.selected[cat].setupId ? 'block' : 'none'}">
                <label>Ajuste de Inversión <span id="val-price-${cat}" class="slider-price-val">${engine.selected[cat].setupPrice}€</span></label>
                <input type="range" id="range-${cat}" min="0" max="100" value="50">
            </div>
        </div>` : "";
    let subsHtml = `<div class="volume-option-group"><label>Volumen Mensual</label>
        <select class="volume-dropdown" id="sel-sub-${cat}"><option value="">-- Sin Suscripción --</option>
            ${data.subs.map(s => `<option value="${s.id}" ${engine.selected[cat].subId === s.id ? 'selected' : ''}>${s.name} (${s.price}€/m)</option>`).join('')}
        </select></div>`;
    card.innerHTML = `<h3>Configuración ${titles_map[cat]}</h3>` + setupsHtml + subsHtml;
    els.grid.appendChild(card);
    setTimeout(() => {
        const setupSel = document.getElementById(`sel-setup-${cat}`);
        const subSel = document.getElementById(`sel-sub-${cat}`);
        const sliderBox = document.getElementById(`slider-container-${cat}`);
        const slider = document.getElementById(`range-${cat}`);
        const valLabel = document.getElementById(`val-price-${cat}`);
        if (setupSel) setupSel.onchange = () => {
            const sid = setupSel.value; engine.selected[cat].setupId = sid; engine.selected.PACK = null;
            if (sid) {
                const sData = data.setups.find(x => x.id === sid); engine.selected[cat].setupPrice = sData.default;
                valLabel.innerText = sData.default + "€"; sliderBox.style.display = 'block';
            } else { sliderBox.style.display = 'none'; engine.selected[cat].setupPrice = 0; }
            updateUI();
        };
        if (slider) slider.oninput = () => {
            const sid = engine.selected[cat].setupId; const sData = data.setups.find(x => x.id === sid);
            const finalPrice = sData.min + Math.round((slider.value / 100) * (sData.max - sData.min));
            engine.selected[cat].setupPrice = finalPrice; valLabel.innerText = finalPrice + "€"; updateUI();
        };
        if (subSel) subSel.onchange = () => { engine.selected[cat].subId = subSel.value; engine.selected.PACK = null; updateUI(); };
    }, 0);
}

function renderPacks() {
    SENDAIA_PACKS_FIJOS.forEach(p => {
        const card = document.createElement('div');
        card.className = "product-card";
        card.innerHTML = `<div class="card-tag">PACK FIJO</div><h4>${p.name}</h4>
            <div class="main-price">${p.setup}€ <span class="sub">+ ${p.sub}€/m</span></div><button class="btn-primary-small">${engine.selected.PACK === p.id ? 'Seleccionado' : 'Elegir Pack'}</button>`;
        card.querySelector('button').onclick = () => {
            engine.selected = {
                VOICE: { setupId: null, setupPrice: 0, subId: null }, CHAT: { setupId: null, setupPrice: 0, subId: null },
                WSP: { setupId: null, setupPrice: 0, subId: null }, OCR: { setupId: null, setupPrice: 0, subId: null },
                CRM: { setupId: null, setupPrice: 0, subId: null }, SUPPORT: { subId: null }, PACK: p.id
            };
            updateUI(); renderCategory('PACKS');
        };
        els.grid.appendChild(card);
    });
}

function updateUI() {
    const res = engine.calculate();
    if (els.summaryItems) {
        els.summaryItems.innerHTML = "";
        res.items.forEach(it => {
            const div = document.createElement('div'); div.className = "summary-item";
            div.innerHTML = `<span>${it.name}</span><span class="gold">${it.price ? it.price + '€' : ''}</span>`;
            els.summaryItems.appendChild(div);
        });
    }
    if (els.setupTotal) els.setupTotal.innerText = res.setupTotal.toLocaleString() + " €";
    if (els.monthlyTotal) els.monthlyTotal.innerText = res.monthlyTotal.toLocaleString() + " €";
    if (els.year1Total) els.year1Total.innerText = res.year1Total.toLocaleString() + " €";
    if (els.year2Total) els.year2Total.innerText = res.year2Total.toLocaleString() + " €";
    if (els.bossProfit) els.bossProfit.innerText = (res.year1Total * 0.65).toFixed(0) + " €";
    if (els.bossMargin) els.bossMargin.innerText = res.margin + "%";
    const authScore = Math.min(100, Math.floor((res.items.length / 6) * 100));
    if (els.authProgress) els.authProgress.style.width = authScore + "%";
    if (els.authLabel) els.authLabel.innerText = authScore < 30 ? "Básico" : (authScore < 70 ? "Estratégico" : "Alta Autoridad");
    const saving = parseFloat(els.roiSavingInput.value) || 2000;
    const monthsToPay = (res.setupTotal / (saving - res.monthlyTotal)).toFixed(1);
    if (els.roiResult) els.roiResult.innerText = (res.setupTotal > 0 && (saving - res.monthlyTotal) > 0) ? `Recuperación: ${monthsToPay} meses` : "Ajusta parámetros ROI";
}

function renderReview() {
    const res = engine.calculate();
    if (els.reviewClient) els.reviewClient.innerText = `Propuesta Estratégica para ${state.clientData.company}`;
    if (els.reviewList) {
        els.reviewList.innerHTML = `<div class="review-tables-container">
            <div class="review-table-box"><h4>IMPLEMENTACIÓN</h4><table class="review-table">
                ${res.items.filter(i => i.type === 'setup' || i.setup).map(i => `<tr><td>${i.name}</td><td style="text-align:right">${i.price || i.setup}€</td></tr>`).join('')}
            </table></div>
            <div class="review-table-box"><h4>SUSCRIPCIÓN</h4><table class="review-table">
                ${res.items.filter(i => i.type === 'sub' || i.sub).map(i => `<tr><td>${i.name}</td><td style="text-align:right">${i.price || i.sub}€/m</td></tr>`).join('')}
            </table></div></div>`;
    }
    if (els.finalSetup) els.finalSetup.innerText = res.setupTotal + "€";
    if (els.finalMonthly) els.finalMonthly.innerText = res.monthlyTotal + "€";
    if (els.finalYear1) els.finalYear1.innerText = res.year1Total + "€";
    if (els.finalYear2) els.finalYear2.innerText = res.year2Total + "€";
    if (els.finalMargin) els.finalMargin.innerText = res.margin + "%";
}

// CONFIGURACIÓN INDEPENDIENTE: Pega aquí la URL de tu "Implementación" de Google Apps Script
const GOOGLE_SHEET_URL = ""; 

async function saveAndFinish() {
    const res = engine.calculate();
    if (res.errors.length > 0) return alert(res.errors[0]);

    if (!GOOGLE_SHEET_URL) {
        alert("Configuración pendiente: Falta la URL de Google Sheets en app.js. Por ahora, solo generaremos el PDF.");
        generatePDF();
        return;
    }

    els.btnConfirm.innerText = "Guardando en Google Sheets...";
    els.btnConfirm.disabled = true;

    try {
        const payload = {
            company: state.clientData.company,
            contact: state.clientData.contact,
            sector: state.clientData.sector,
            size: state.clientData.size,
            setupTotal: res.setupTotal,
            monthlyTotal: res.monthlyTotal,
            year1Total: res.year1Total,
            profit: Math.round(res.year1Total * 0.65),
            itemsList: res.items.map(i => i.name).join(", ")
        };

        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors', // Necesario para Google Apps Script
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        alert("¡Datos guardados en Google Sheets y Propuesta Generada!");
        generatePDF();

    } catch (err) {
        console.error("Error al guardar:", err);
        alert("Hubo un error al conectar con Google Sheets, pero generaremos el PDF de todos modos.");
        generatePDF();
    } finally {
        els.btnConfirm.innerText = "Confirmar y Enviar 🚀";
        els.btnConfirm.disabled = false;
    }
}


function generatePDF() {
    window.print();
}
window.onload = init;
