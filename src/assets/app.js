const setButtonLoading = (button, loadingText) => {
  const original = button.dataset.originalText || button.textContent.trim();
  button.dataset.originalText = original;
  button.disabled = true;
  button.textContent = loadingText;
  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = original;
  }, 900);
};

const showAlert = (form, message) => {
  const alert = form.querySelector('[data-alert]');
  if (!alert) return;
  alert.textContent = message;
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

document.querySelectorAll('form[data-enhanced]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const mode = form.dataset.enhanced;
    const validationMessage = mode === 'register' ? validateRegister(form) : '';

    if (validationMessage) {
      showAlert(form, validationMessage);
      return;
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
