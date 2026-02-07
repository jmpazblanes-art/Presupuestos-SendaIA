/**
 * SENDAIA PRICING ENGINE v4.0
 */

const SENDAIA_CATALOG = {
    VOICE: {
        setups: [{ id: "AG-VOICE-SIMPLE", name: "Agente Voz Básico", min: 800, max: 1200, default: 950 }, { id: "AG-VOICE-ADV", name: "Agente Voz Avanzado", min: 1500, max: 3000, default: 1800 }],
        subs: [{ id: "VOICE-100", name: "100 llamadas/mes", price: 90 }, { id: "VOICE-300", name: "300 llamadas/mes", price: 240 }, { id: "VOICE-500", name: "500 llamadas/mes", price: 380 }]
    },
    CHAT: {
        setups: [{ id: "AG-CHAT-SIMPLE", name: "Chatbot Sencillo", min: 350, max: 500, default: 450 }, { id: "AG-CHAT-ADV", name: "Chatbot Avanzado", min: 750, max: 1200, default: 900 }],
        subs: [{ id: "CHAT-500", name: "500 conversaciones", price: 50 }, { id: "CHAT-1500", name: "1.500 conversaciones", price: 120 }]
    },
    WSP: {
        setups: [{ id: "AG-WSP-SIMPLE", name: "WhatsApp Básico", min: 400, max: 650, default: 500 }, { id: "AG-WSP-ADV", name: "WhatsApp Avanzado", min: 800, max: 1500, default: 1100 }],
        subs: [{ id: "WSP-300", name: "300 mensajes", price: 40 }, { id: "WSP-800", name: "800 mensajes", price: 80 }]
    },
    OCR: {
        setups: [{ id: "OCR-SETUP", name: "Setup OCR", min: 300, max: 600, default: 450 }],
        subs: [{ id: "OCR-100", name: "100 documentos", price: 50 }, { id: "OCR-300", name: "300 documentos", price: 120 }]
    },
    CRM: {
        setups: [{ id: "SETUP-CRM-BASE", name: "Setup CRM Básico", min: 700, max: 900, default: 800 }, { id: "SETUP-CRM-FULL", name: "Setup CRM Completo", min: 1500, max: 2500, default: 1850 }],
        subs: [{ id: "SUB-CRM-ONLY", name: "Solo CRM GHL", price: 150 }, { id: "SUB-CRM-MKT", name: "CRM + Marketing", price: 300 }]
    },
    SUPPORT: {
        setups: [],
        subs: [{ id: "SUB-SUP-BASIC", name: "Soporte Básico", price: 60 }, { id: "SUB-SUP-PRO", name: "Soporte Pro", price: 150 }]
    }
};

const SENDAIA_PACKS_FIJOS = [
    { id: "PACK-INI", name: "Pack Inicio", setup: 1200, sub: 177 },
    { id: "PACK-PRO", name: "Pack Pro", setup: 1800, sub: 290 }
];

class PricingEngine {
    constructor() {
        this.selected = {
            VOICE: { setupId: null, setupPrice: 0, subId: null }, CHAT: { setupId: null, setupPrice: 0, subId: null },
            WSP: { setupId: null, setupPrice: 0, subId: null }, OCR: { setupId: null, setupPrice: 0, subId: null },
            CRM: { setupId: null, setupPrice: 0, subId: null }, SUPPORT: { subId: null }, PACK: null
        };
    }
    calculate() {
        let setupTotal = 0, monthlyTotal = 0, errors = [], items = [];
        if (this.selected.PACK) {
            const p = SENDAIA_PACKS_FIJOS.find(x => x.id === this.selected.PACK);
            if (p) { setupTotal = p.setup; monthlyTotal = p.sub; items.push({ name: p.name, setup: p.setup, sub: p.sub }); }
        } else {
            ['VOICE', 'CHAT', 'WSP', 'OCR', 'CRM'].forEach(cat => {
                const sel = this.selected[cat];
                if (sel.subId && !sel.setupId) errors.push(`❌ FALTA SETUP ${cat}`);
                if (sel.setupId) {
                    setupTotal += sel.setupPrice;
                    const sData = SENDAIA_CATALOG[cat].setups.find(s => s.id === sel.setupId);
                    items.push({ name: `Setup ${cat}: ${sData.name}`, price: sel.setupPrice, type: 'setup' });
                }
                if (sel.subId) {
                    const subData = SENDAIA_CATALOG[cat].subs.find(s => s.id === sel.subId);
                    monthlyTotal += subData.price; items.push({ name: `${cat}: ${subData.name}`, price: subData.price, type: 'sub' });
                }
            });
            if (this.selected.SUPPORT.subId) {
                const subData = SENDAIA_CATALOG.SUPPORT.subs.find(s => s.id === this.selected.SUPPORT.subId);
                monthlyTotal += subData.price; items.push({ name: `Soporte: ${subData.name}`, price: subData.price, type: 'sub' });
            }
        }
        return { setupTotal, monthlyTotal, year1Total: setupTotal + (monthlyTotal * 12), year2Total: monthlyTotal * 12, items, errors, margin: 65 };
    }
}

window.PricingEngine = PricingEngine; window.SENDAIA_CATALOG = SENDAIA_CATALOG; window.SENDAIA_PACKS_FIJOS = SENDAIA_PACKS_FIJOS;
