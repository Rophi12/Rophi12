const STORAGE_KEYS = {
  users: 'toppilyUsers',
  features: 'toppilyFeatures',
  adminSession: 'toppilyAdminSession'
};

const ADMIN_EMAIL = 'bediemmanuel456@gmail.com';
const ADMIN_PASSWORD_HASH = '4588725ca73f16f44193603aa78b4c36e042ca3dc832086b480858a3809ce1e7';

const defaultFeatures = [
  { id: 'dataBundles', label: 'Data bundles', description: 'Allow agents to sell MTN, Airtel, Glo, and 9mobile data packages.', enabled: true },
  { id: 'bulkDiscounts', label: 'Bulk discounts', description: 'Show bulk pricing and referral incentives to approved agents.', enabled: true },
  { id: 'whatsappSupport', label: 'WhatsApp support', description: 'Keep the WhatsApp community and support prompts visible.', enabled: true },
  { id: 'otpRecovery', label: 'OTP recovery', description: 'Enable the password recovery OTP user journey.', enabled: false }
];

const getStoredJson = (key, fallback) => {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const setStoredJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const loadUsers = () => getStoredJson(STORAGE_KEYS.users, []);
const saveUsers = (users) => setStoredJson(STORAGE_KEYS.users, users);
const loadFeatures = () => getStoredJson(STORAGE_KEYS.features, defaultFeatures);
const saveFeatures = (features) => setStoredJson(STORAGE_KEYS.features, features);

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('\"', '&quot;')
  .replaceAll("'", '&#39;');

const formatDate = (value) => {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const setButtonLoading = (button, loadingText) => {
  if (!button) return;
  const original = button.dataset.originalText || button.textContent.trim();
  button.dataset.originalText = original;
  button.disabled = true;
  button.textContent = loadingText;
  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = original;
  }, 900);
};

const showAlert = (form, message, tone = 'success') => {
  const alert = form.querySelector('[data-alert]');
  if (!alert) return;
  alert.textContent = message;
  alert.dataset.tone = tone;
  alert.classList.add('show');
};

const validateRegister = (form) => {
  const firstName = form.firstName.value.trim().toLowerCase();
  const lastName = form.lastName.value.trim().toLowerCase();
  const username = form.username.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;
  const usernameValid = /^[a-z]{1,15}\d{0,4}$/.test(username) && username.length >= 4 && username !== firstName && username !== lastName;

  if (firstName.length < 3 || lastName.length < 3) return 'First and last name must contain at least 3 letters.';
  if (!usernameValid) return 'Username must be 4-15 lowercase characters, with no spaces and no more than 4 digits.';
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || password.length < 8) return 'Password must be at least 8 characters with uppercase, lowercase, and a number.';
  if (password !== confirmPassword) return 'Password confirmation does not match.';
  return '';
};

const registerUser = (form) => {
  const users = loadUsers();
  const username = form.username.value.trim();
  const email = form.email.value.trim().toLowerCase();
  const duplicate = users.some((user) => user.username.toLowerCase() === username.toLowerCase() || user.email.toLowerCase() === email);

  if (duplicate) return 'A user with this username or email is already waiting for admin review.';

  users.push({
    id: `user-${Date.now()}`,
    firstName: form.firstName.value.trim(),
    lastName: form.lastName.value.trim(),
    username,
    email,
    phone: form.phone.value.trim(),
    businessName: form.businessName.value.trim(),
    whatsapp: form.whatsapp.value.trim(),
    referral: form.referral.value.trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  saveUsers(users);
  form.reset();
  return '';
};

const digest = async (value) => {
  const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

const isAdminSignedIn = () => getStoredJson(STORAGE_KEYS.adminSession, null)?.email === ADMIN_EMAIL;

const applyFeatureFlags = () => {
  const features = loadFeatures();
  const enabled = new Map(features.map((feature) => [feature.id, feature.enabled]));

  document.querySelectorAll('[data-feature]').forEach((element) => {
    const featureId = element.dataset.feature;
    element.hidden = enabled.has(featureId) && !enabled.get(featureId);
  });
};

const renderAdmin = () => {
  const adminApp = document.querySelector('[data-admin-app]');
  if (!adminApp) return;

  const loginPanel = adminApp.querySelector('[data-admin-login]');
  const dashboard = adminApp.querySelector('[data-admin-dashboard]');
  const signedIn = isAdminSignedIn();

  loginPanel.hidden = signedIn;
  dashboard.hidden = !signedIn;
  if (!signedIn) return;

  const users = loadUsers();
  const features = loadFeatures();
  const userList = adminApp.querySelector('[data-user-list]');
  const featureList = adminApp.querySelector('[data-feature-list]');

  adminApp.querySelector('[data-total-users]').textContent = users.length;
  adminApp.querySelector('[data-pending-users]').textContent = users.filter((user) => user.status === 'pending').length;
  adminApp.querySelector('[data-active-features]').textContent = features.filter((feature) => feature.enabled).length;

  userList.innerHTML = users.length ? users.map((user) => {
    const safeStatus = escapeHtml(user.status);
    const safeBusiness = user.businessName ? ` • Business: ${escapeHtml(user.businessName)}` : '';

    return `
      <article class="admin-item" data-user-id="${escapeHtml(user.id)}">
        <div>
          <h3>${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)} <span class="status-pill ${safeStatus}">${safeStatus}</span></h3>
          <p>${escapeHtml(user.email)} • ${escapeHtml(user.phone)}</p>
          <p>Username: ${escapeHtml(user.username)}${safeBusiness}</p>
          <small>Joined ${formatDate(user.createdAt)}</small>
        </div>
        <div class="admin-actions">
          <button type="button" data-user-action="approved">Approve</button>
          <button type="button" class="secondary" data-user-action="suspended">Suspend</button>
          <button type="button" class="danger" data-user-action="delete">Delete</button>
        </div>
      </article>
    `;
  }).join('') : '<p class="empty-state">No new users yet. Submit the registration form to see user requests here.</p>';

  featureList.innerHTML = features.map((feature) => `
    <label class="feature-toggle">
      <input type="checkbox" data-feature-id="${escapeHtml(feature.id)}" ${feature.enabled ? 'checked' : ''} />
      <span>
        <strong>${escapeHtml(feature.label)}</strong>
        <small>${escapeHtml(feature.description)}</small>
      </span>
    </label>
  `).join('');
};

const setupAdmin = () => {
  const adminApp = document.querySelector('[data-admin-app]');
  if (!adminApp) return;

  adminApp.querySelector('[data-admin-email]').textContent = ADMIN_EMAIL;
  renderAdmin();

  adminApp.querySelector('[data-admin-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.email.value.trim().toLowerCase();
    const passwordHash = await digest(form.password.value);

    if (email !== ADMIN_EMAIL || passwordHash !== ADMIN_PASSWORD_HASH) {
      showAlert(form, 'Admin email or password is incorrect.', 'danger');
      return;
    }

    setStoredJson(STORAGE_KEYS.adminSession, { email, signedInAt: new Date().toISOString() });
    form.reset();
    renderAdmin();
  });

  adminApp.addEventListener('click', (event) => {
    const userAction = event.target.closest('[data-user-action]');
    if (userAction) {
      const item = userAction.closest('[data-user-id]');
      const userId = item.dataset.userId;
      const action = userAction.dataset.userAction;
      const users = loadUsers();
      saveUsers(action === 'delete' ? users.filter((user) => user.id !== userId) : users.map((user) => user.id === userId ? { ...user, status: action } : user));
      renderAdmin();
    }

    if (event.target.matches('[data-admin-logout]')) {
      window.localStorage.removeItem(STORAGE_KEYS.adminSession);
      renderAdmin();
    }
  });

  adminApp.addEventListener('change', (event) => {
    if (!event.target.matches('[data-feature-id]')) return;
    const featureId = event.target.dataset.featureId;
    const features = loadFeatures().map((feature) => feature.id === featureId ? { ...feature, enabled: event.target.checked } : feature);
    saveFeatures(features);
    applyFeatureFlags();
    renderAdmin();
  });
};

document.querySelectorAll('form[data-enhanced]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const mode = form.dataset.enhanced;
    const validationMessage = mode === 'register' ? validateRegister(form) : '';

    if (validationMessage) {
      showAlert(form, validationMessage, 'danger');
      return;
    }

    if (mode === 'register') {
      const registrationMessage = registerUser(form);
      if (registrationMessage) {
        showAlert(form, registrationMessage, 'danger');
        return;
      }
    }

    setButtonLoading(button, form.dataset.loading || 'Processing...');
    showAlert(form, form.dataset.success || 'Thanks! Your request is ready to send. Connect this form to your secure backend for production.');
  });
});

document.querySelectorAll('[data-modal-target]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    document.querySelector(trigger.dataset.modalTarget)?.classList.add('open');
  });
});

document.querySelectorAll('[data-modal-close]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    trigger.closest('.modal-backdrop')?.classList.remove('open');
  });
});

document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) backdrop.classList.remove('open');
  });
});

applyFeatureFlags();
setupAdmin();
