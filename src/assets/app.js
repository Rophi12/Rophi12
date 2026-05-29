const STORAGE_KEYS = {
  users: 'toppilyUsers',
  features: 'toppilyFeatures',
  adminSession: 'toppilyAdminSession',
  userSession: 'toppilyUserSession'
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
const saveUserSession = (user) => setStoredJson(STORAGE_KEYS.userSession, {
  id: user.id,
  username: user.username,
  email: user.email,
  signedInAt: new Date().toISOString()
});

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

const registerUser = async (form) => {
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
    passwordHash: await digest(form.password.value),
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  saveUsers(users);
  form.reset();
  return '';
};

const loginUser = async (form) => {
  const identifier = form.identifier.value.trim().toLowerCase();
  const passwordHash = await digest(form.password.value);

  if (identifier === ADMIN_EMAIL && passwordHash === ADMIN_PASSWORD_HASH) {
    setStoredJson(STORAGE_KEYS.adminSession, { email: ADMIN_EMAIL, signedInAt: new Date().toISOString() });
    window.location.href = '../admin/index.html';
    return 'redirect';
  }

  const user = loadUsers().find((candidate) => (
    candidate.username?.toLowerCase() === identifier ||
    candidate.email?.toLowerCase() === identifier ||
    candidate.phone?.toLowerCase() === identifier
  ));

  if (!user) return 'No account was found with those details. Please sign up first.';
  if (!user.passwordHash) return 'This account was created before login was enabled. Please sign up again so a secure password hash can be saved.';
  if (user.passwordHash !== passwordHash) return 'The password you entered is incorrect.';
  if (user.status !== 'approved') return `Your account is ${user.status}. Please wait for admin approval before signing in.`;

  saveUserSession(user);
  form.reset();
  return '';
};


const rotateRight = (value, amount) => (value >>> amount) | (value << (32 - amount));

const sha256Fallback = (value) => {
  const bytes = Array.from(new TextEncoder().encode(value));
  const bitLength = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  for (let index = 7; index >= 0; index -= 1) bytes.push((bitLength / (2 ** (index * 8))) & 255);

  const hashes = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  const constants = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  for (let chunk = 0; chunk < bytes.length; chunk += 64) {
    const words = new Array(64).fill(0);
    for (let index = 0; index < 16; index += 1) {
      words[index] = (
        (bytes[chunk + (index * 4)] << 24) |
        (bytes[chunk + (index * 4) + 1] << 16) |
        (bytes[chunk + (index * 4) + 2] << 8) |
        bytes[chunk + (index * 4) + 3]
      ) >>> 0;
    }
    for (let index = 16; index < 64; index += 1) {
      const s0 = rotateRight(words[index - 15], 7) ^ rotateRight(words[index - 15], 18) ^ (words[index - 15] >>> 3);
      const s1 = rotateRight(words[index - 2], 17) ^ rotateRight(words[index - 2], 19) ^ (words[index - 2] >>> 10);
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = hashes;
    for (let index = 0; index < 64; index += 1) {
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const choice = (e & f) ^ ((~e) & g);
      const temp1 = (h + s1 + choice + constants[index] + words[index]) >>> 0;
      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const majority = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + majority) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    hashes[0] = (hashes[0] + a) >>> 0;
    hashes[1] = (hashes[1] + b) >>> 0;
    hashes[2] = (hashes[2] + c) >>> 0;
    hashes[3] = (hashes[3] + d) >>> 0;
    hashes[4] = (hashes[4] + e) >>> 0;
    hashes[5] = (hashes[5] + f) >>> 0;
    hashes[6] = (hashes[6] + g) >>> 0;
    hashes[7] = (hashes[7] + h) >>> 0;
  }

  return hashes.map((hash) => hash.toString(16).padStart(8, '0')).join('');
};

const digest = async (value) => {
  if (window.crypto?.subtle) {
    const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return sha256Fallback(value);
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
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const mode = form.dataset.enhanced;
    const validationMessage = mode === 'register' ? validateRegister(form) : '';

    if (validationMessage) {
      showAlert(form, validationMessage, 'danger');
      return;
    }

    setButtonLoading(button, form.dataset.loading || 'Processing...');

    if (mode === 'register') {
      const registrationMessage = await registerUser(form);
      if (registrationMessage) {
        showAlert(form, registrationMessage, 'danger');
        return;
      }
    }

    if (mode === 'login') {
      const loginMessage = await loginUser(form);
      if (loginMessage === 'redirect') return;
      if (loginMessage) {
        showAlert(form, loginMessage, 'danger');
        return;
      }
    }

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
