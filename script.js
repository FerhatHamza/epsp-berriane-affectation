// script.js — secure hashed NIN lookup

const DATA_PATH = 'data/assignments.json';
const SALT = 'EPSP-Berriane-2025'; // must match Python SALT

let assignments = null;

// Elements
const lookupForm = document.getElementById('lookupFasync function searchNIN() {
  const nin = document.getElementById("ninInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!nin) {
    resultDiv.innerHTML = "⚠️ الرجاء إدخال رقم التعريف الوطني.";
    return;
  }

  resultDiv.innerHTML = "⏳ جاري البحث ...";

  try {
    const response = await fetch("data/assignments.json");
    const data = await response.json();

    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(nin));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    const record = data.find(item => item.nin_hash === hashHex);

    if (record) {
      resultDiv.innerHTML = `
        ✅ <strong>${record.nom} ${record.prenom}</strong><br>
        📍 <b>المركز:</b> ${record["مركز الامتحان"]}<br>
        🏫 <b>القسم:</b> ${record["القسم"]}<br>
        🏢 <b>الجناح:</b> ${record["الجناح"]}
      `;
    } else {
      resultDiv.innerHTML = "❌ لم يتم العثور على أي نتيجة بهذا الرقم.";
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "حدث خطأ أثناء تحميل البيانات.";
  }
}
orm');
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
  resultText.textContent = `Result for NIN: ${nin}`;
  resultDetails.innerHTML = `
    <dt>Full Name</dt><dd>${item.name || '-'}</dd>
    <dt>Assigned Class</dt><dd>${item.assigned_class || '-'}</dd>
    <dt>Notes</dt><dd>${item.notes || '-'}</dd>
  `;
  show(result);
  hide(notFound);
}

function displayNotFound(nin) {
  notFoundText.textContent = `No record found for NIN "${nin}". Please check and try again.`;
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
