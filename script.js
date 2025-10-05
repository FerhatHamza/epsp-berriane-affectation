// script.js — robust hashed NIN lookup (works with object-by-hash OR array)
const DATA_PATH = 'data/assignments.json';
const SALT = 'EPSP-Berriane-2025'; // must match Python SALT

let assignments = null; // map: hash -> record

// DOM
const lookupForm = document.getElementById('lookupForm');
const ninInput = document.getElementById('ninInput');
const result = document.getElementById('result');
const resultText = document.getElementById('resultText');
const resultDetails = document.getElementById('resultDetails');
const notFound = document.getElementById('notFound');
const notFoundText = document.getElementById('notFoundText');
const copyBtn = document.getElementById('copyBtn');
const printBtn = document.getElementById('printBtn');
const clearBtn = document.getElementById('clearBtn');
const historyList = document.getElementById('historyList');
const historySection = document.getElementById('history');

function show(el){ el.classList.remove('hidden'); }
function hide(el){ el.classList.add('hidden'); }

// Hashing helper
async function hashNIN(nin){
  const data = new TextEncoder().encode(SALT + nin.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

// Load and normalize data into a map {hash: record}
async function loadData(){
  const r = await fetch(DATA_PATH);
  if (!r.ok) throw new Error('Failed to load data file: ' + r.status);
  const json = await r.json();

  // If object keyed by hash (recommended)
  if (!Array.isArray(json)){
    return json;
  }

  // If array, normalize: try to use nin_hash field, else compute hash from nin field
  const map = {};
  for (const item of json){
    if (!item) continue;
    if (item.nin_hash) {
      map[String(item.nin_hash)] = item;
    } else if (item.nin) {
      // compute hash from provided plain NIN (not recommended for production - avoid storing plain NINs)
      const h = await hashNIN(String(item.nin));
      map[h] = item;
    } else if (item.ninHash) {
      map[String(item.ninHash)] = item;
    } else if (item.hash) {
      map[String(item.hash)] = item;
    }
  }
  return map;
}

// Local history (localStorage)
function addToHistory(nin, dataOrNull){
  try {
    let hist = JSON.parse(localStorage.getItem('lookupHistory') || '[]');
    hist.unshift({
      nin,
      found: !!dataOrNull,
      at: new Date().toISOString(),
      result: dataOrNull ? (dataOrNull.assigned_class || dataOrNull['القسم'] || '') : ''
    });
    hist = hist.slice(0, 10);
    localStorage.setItem('lookupHistory', JSON.stringify(hist));
    renderHistory();
  } catch (e) { /* ignore storage errors */ }
}
function renderHistory(){
  const hist = JSON.parse(localStorage.getItem('lookupHistory') || '[]');
  if (!hist.length) return hide(historySection);
  show(historySection);
  historyList.innerHTML = hist.map(h => {
    const time = new Date(h.at).toLocaleString();
    return `<li><strong>${h.nin}</strong> — ${h.found ? 'Found' : 'Not found'} ${h.result?('— '+h.result):''} <small class="muted">(${time})</small></li>`;
  }).join('');
}

function displayResult(item, nin){
  // Support different field names (English or Arabic)
  const name = item.name || item.nom || `${item.firstname || item.الاسم || ''} ${item.lastname || item.اللقب || ''}`.trim();
  const assigned = item.assigned_class || item.classe || item['القسم'] || item.assigned || '';
  const notes = item.notes || item.remarks || item['ملاحظات'] || '';

  resultText.textContent = `NIN: ${nin} — Assigned class: ${assigned || '—'}`;
  resultDetails.innerHTML = `
    <dt>Full name</dt><dd>${name || '-'}</dd>
    <dt>Assigned class</dt><dd>${assigned || '-'}</dd>
    <dt>Notes</dt><dd>${notes || '-'}</dd>
  `;
  show(result);
  hide(notFound);
}

function displayNotFound(nin){
  notFoundText.textContent = `No record found for NIN "${nin}". Please verify and try again.`;
  show(notFound);
  hide(result);
}

lookupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nin = (ninInput.value || '').trim();
  if (!nin) return;
  try {
    if (!assignments) assignments = await loadData();
  } catch (err) {
    alert('Error loading data: ' + err.message);
    return;
  }

  const hashed = await hashNIN(nin);
  const item = assignments[hashed];

  if (item) {
    displayResult(item, nin);
    addToHistory(nin, item);
  } else {
    displayNotFound(nin);
    addToHistory(nin, null);
  }
});

copyBtn.addEventListener('click', () => {
  const text = resultText.textContent + '\n' + Array.from(resultDetai
