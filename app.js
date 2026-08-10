const BOOKING_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyX_CQhn6vNff_r65V0Re-fmD0zx8hr6w879w2rk5ZG0Z7qGcdJdFtyMCu37n5of_APvQ/exec';

const plans = {
  Starter: { current: '₹499', regular: '₹999' },
  Business: { current: '₹749', regular: '₹1,499' },
  Shop: { current: '₹1,299', regular: '₹2,599' },
};

document.querySelectorAll('.plan-card').forEach((card) => {
  const planName = card.querySelector('h2, h3')?.textContent.trim();
  const plan = plans[planName];
  const price = card.querySelector('.price');
  if (!plan || !price) return;

  price.innerHTML = `<span class="regular-price">${plan.regular}</span><span class="current-price">${plan.current}</span><small>/ month</small><span class="discount-badge">50% off</span>`;
  const setup = card.querySelector('.setup');
  if (setup) setup.innerHTML = 'Setup fee: <small>discussed during consultation</small>';
});

const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
if (menuButton && nav) menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
});

const planSelect = document.querySelector('#plan-select');
const chosenPlan = document.querySelector('#chosen-plan');
const requestedPlan = new URLSearchParams(window.location.search).get('plan');
if (planSelect && requestedPlan && [...planSelect.options].some(o => o.value === requestedPlan)) planSelect.value = requestedPlan;
if (planSelect && chosenPlan) {
  chosenPlan.textContent = planSelect.value;
  planSelect.addEventListener('change', () => chosenPlan.textContent = planSelect.value);
}

document.querySelectorAll('.choose-plan').forEach(link => link.addEventListener('click', () => {
  localStorage.setItem('arcline-plan', link.dataset.plan);
}));
if (planSelect && !requestedPlan) {
  const savedPlan = localStorage.getItem('arcline-plan');
  if (savedPlan && [...planSelect.options].some(o => o.value === savedPlan)) {
    planSelect.value = savedPlan;
    chosenPlan.textContent = savedPlan;
  }
}

const bookingForm = document.querySelector('#booking-form');
if (bookingForm) bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;

  const submitButton = bookingForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.textContent = 'Sending your request…';

  const bookingData = Object.fromEntries(new FormData(bookingForm));

  try {
    await fetch(BOOKING_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(bookingData),
    });

    bookingForm.hidden = true;
    bookingForm.parentElement.querySelector('.selected-plan').hidden = true;
    bookingForm.parentElement.querySelector('.confirmation').hidden = false;
    localStorage.removeItem('arcline-plan');
  } catch (error) {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
    alert('We couldn’t send your request right now. Please try again or contact Arcline on WhatsApp.');
  }
});
