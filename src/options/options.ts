// Options logic for blocklist management (COMP-UI-OPTIONS)
import { getBlocklist, addToBlocklist, removeFromBlocklist } from '../background/blocklist';

// DOM elements
const form = document.getElementById('add-domain-form') as HTMLFormElement;
const input = document.getElementById('domain-input') as HTMLInputElement;
const errorSpan = document.getElementById('domain-error') as HTMLSpanElement;
const chipList = document.getElementById('blocklist-chips') as HTMLUListElement;

// Domain validation regex (simple, matches e.g. facebook.com, sub.domain.co.uk)
const DOMAIN_REGEX = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

// State
let blocklist: string[] = [];

// Utility: Show error message
function showError(msg: string) {
  errorSpan.textContent = msg;
  input.setAttribute('aria-invalid', 'true');
}

// Utility: Clear error message
function clearError() {
  errorSpan.textContent = '';
  input.removeAttribute('aria-invalid');
}

// Render the chip list
function renderBlocklist() {
  chipList.innerHTML = '';
  if (blocklist.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No domains blocked yet.';
    li.className = 'chip-list-empty';
    chipList.appendChild(li);
    return;
  }
  blocklist.forEach(domain => {
    const li = document.createElement('li');
    li.className = 'chip';
    li.setAttribute('role', 'listitem');
    li.setAttribute('tabindex', '-1');

    const span = document.createElement('span');
    span.textContent = domain;
    span.className = 'chip-label';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip-remove-btn';
    btn.setAttribute('aria-label', `Remove ${domain} from blocklist`);
    btn.innerHTML = '&times;';
    btn.addEventListener('click', () => handleRemove(domain));

    li.appendChild(span);
    li.appendChild(btn);
    chipList.appendChild(li);
  });
}

// Load blocklist from service
async function loadBlocklist() {
  try {
    blocklist = await getBlocklist();
    renderBlocklist();
  } catch (e) {
    showError('Failed to load blocklist.');
  }
}

// Add domain handler
async function handleAdd(e: Event) {
  e.preventDefault();
  clearError();
  const domain = input.value.trim().toLowerCase();
  if (!DOMAIN_REGEX.test(domain)) {
    showError('Please enter a valid domain (e.g. facebook.com).');
    input.focus();
    return;
  }
  if (blocklist.includes(domain)) {
    showError('Domain is already in your blocklist.');
    input.focus();
    return;
  }
  try {
    await addToBlocklist(domain);
    blocklist.push(domain);
    renderBlocklist();
    input.value = '';
    input.focus();
  } catch (err) {
    showError('Failed to add domain.');
  }
}

// Remove domain handler
async function handleRemove(domain: string) {
  clearError();
  try {
    await removeFromBlocklist(domain);
    blocklist = blocklist.filter(d => d !== domain);
    renderBlocklist();
    input.focus();
  } catch (err) {
    showError('Failed to remove domain.');
  }
}

// Form submit event
form.addEventListener('submit', handleAdd);

// Initial load
window.addEventListener('DOMContentLoaded', loadBlocklist);
