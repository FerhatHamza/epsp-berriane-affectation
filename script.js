// script.js — secure hashed NIN lookup

const DATA_PATH = 'data/assignments.json';
const SALT = 'EPSP-Berriane-2025'; // must match Python SALT

let assignments = null;

// Elements
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

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

async function loadData() {
  const res = await fetch(DATA_PATH);
  if (!res.ok) throw new Error('Cannot load assignments file');
  return await res.json();
}

// Hashing function using Web Crypto API (same as Python hashlib.sha256)
async function hashNIN(nin) {
  const data = new TextEncoder().encode(SALT + nin.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function displayResult(item, nin) {
  resultText.textContent = `نتيجة البحث عن NIN: ${nin}`;
  resultDetails.innerHTML = `
    <dt>الإسم الكامل</dt><dd>${(item.lastname + ' ' + item.firstname) || '-'}</dd>
    <dt>القسم</dt><dd>${item.assigned_class || '-'}</dd>
    <dt>الجناح</dt><dd>${item.wing || '-'}</dd>
  `;
  show(result);
  hide(notFound);
}

function displayNotFound(nin) {
  notFoundText.textContent = `لايوجد اي طالب يحمل رقم NIN "${nin}". تأكد من الرقم المدخل او ابحث عن اسمك في القوائم الإسمية.`;
  show(notFound);
  hide(result);
}

// --- Event Listeners ---

lookupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nin = ninInput.value.trim();
  if (!nin) return;

  try {
    if (!assignments) assignments = await loadData();
    const hashed = await hashNIN(nin);
    const record = assignments[hashed];
    if (record) displayResult(record, nin);
    else displayNotFound(nin);
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

copyBtn.addEventListener('click', () => {
  const text = resultText.textContent + '\n' + resultDetails.textContent;
  navigator.clipboard?.writeText(text).then(() => alert('Copied to clipboard!'));
});

printBtn.addEventListener('click', () => window.print());

clearBtn.addEventListener('click', () => {
  ninInput.value = '';
  hide(result);
  hide(notFound);
});
