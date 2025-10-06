// script.js — secure hashed NIN lookup

const DATA_PATH = 'data/assignments.json';
const SALT = 'EPSP-Berriane-2025'; // must match Python SALT

let assignments = null;

// Elements
const lookupForm = document.getElementById('lookupForm');
const ninInput = document.getElementById('ninInput');
ninInput.addEventListener('input', () => {
  ninInput.value = ninInput.value.replace(/\D/g, '').slice(0, 18);
});
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
  const fullname = [item.lastname, item.firstname].filter(Boolean).join(' ') || 'غير متوفر';
  const fathername = item.fathername || 'غير متوفر';
  const birthdate = item.birthdate || 'غير متوفر';
  const examCenter = item.center || 'متوسطة المجاهد أولاد الطاهر أحمد بن بابية - بريان';
  const assignedClass = item.assigned_class || 'غير متوفر';
  const wing = item.wing || 'غير متوفر';

  resultText.textContent = '';

  resultDetails.innerHTML = `
    <div class="info-line">
      <span>👤 <strong>الإسم الكامل:</strong> ${fullname}</span>
      <small class="en">Full Name</small>
    </div>

    <div class="info-line">
      <span>👨‍👦 <strong>اسم الأب:</strong> ${fathername}</span>
      <small class="en">Father's Name</small>
    </div>

    <div class="info-line">
      <span>🎂 <strong>تاريخ الميلاد:</strong> ${birthdate}</span>
      <small class="en">Date of Birth</small>
    </div>

    <div class="info-line">
      <span>🏫 <strong>المركز:</strong> ${examCenter}</span>
      <small class="en">Exam Center</small>
    </div>

    <div class="info-line highlight class">
      <span>📘 <strong>القسم:</strong> ${assignedClass}</span>
      <small class="en">Assigned Class</small>
    </div>

    <div class="info-line highlight wing">
      <span>🏢 <strong>الجناح:</strong> ${wing}</span>
      <small class="en">Wing</small>
    </div>
  `;

  show(result);
  hide(notFound);
}




function displayNotFound(nin) {
  notFoundText.textContent = `لايوجد اي طالب يحمل رقم "${nin}". تأكد من الرقم المدخل او ابحث عن اسمك في القوائم الإسمية.`;
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



const previewBtn = document.getElementById('previewBtn');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('examImage');
const closeModal = document.getElementById('closeModal');

previewBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// إغلاق عند الضغط خارج الصورة
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// تكبير/تصغير الصورة بالنقر عليها
modalImg.addEventListener('click', () => {
  modalImg.classList.toggle('zoomed');
});




