(() => {
  'use strict';

  const CONSENT_KEY = 'nk-cookie-consent-v2';
  const LEGACY_CONSENT_KEY = 'nk-cookie-consent-v1';
  const CONSENT_LIFETIME = 365 * 24 * 60 * 60 * 1000;
  const banner = document.getElementById('privacyBanner');
  const acceptButton = document.getElementById('acceptOptional');
  const rejectButton = document.getElementById('rejectOptional');
  const settingsButton = document.getElementById('managePrivacy');

  // Limpa a decisão anterior para solicitar uma nova escolha após a atualização do aviso.
  try { window.localStorage.removeItem(LEGACY_CONSENT_KEY); } catch { /* armazenamento indisponível */ }

  function readChoice() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(CONSENT_KEY) || 'null');
      if (!saved || !['accepted', 'rejected'].includes(saved.choice)) return null;
      if (!Number.isFinite(saved.expiresAt) || Date.now() >= saved.expiresAt) {
        window.localStorage.removeItem(CONSENT_KEY);
        return null;
      }
      return saved.choice;
    } catch {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify({
        choice,
        expiresAt: Date.now() + CONSENT_LIFETIME
      }));
    } catch {
      // Se o armazenamento estiver bloqueado, a escolha vale apenas nesta visita.
    }
  }

  function loadOptionalFonts() {
    if (document.querySelector('link[data-optional-google-fonts]')) return;

    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    preconnect.dataset.optionalGoogleFonts = 'true';
    document.head.appendChild(preconnect);

    const fontHost = document.createElement('link');
    fontHost.rel = 'preconnect';
    fontHost.href = 'https://fonts.gstatic.com';
    fontHost.crossOrigin = 'anonymous';
    fontHost.dataset.optionalGoogleFonts = 'true';
    document.head.appendChild(fontHost);

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@500;600;700;800&family=Playfair+Display:wght@500;600&display=swap';
    stylesheet.dataset.optionalGoogleFonts = 'true';
    document.head.appendChild(stylesheet);
  }

  function disableOptionalFonts() {
    document.querySelectorAll('link[data-optional-google-fonts]').forEach((link) => link.remove());
  }

  function closeBanner() {
    if (banner) banner.hidden = true;
  }

  function choose(choice) {
    saveChoice(choice);
    if (choice === 'accepted') loadOptionalFonts();
    else disableOptionalFonts();
    closeBanner();
  }

  if (banner) {
    const savedChoice = readChoice();
    if (savedChoice === 'accepted') loadOptionalFonts();
    banner.hidden = Boolean(savedChoice);

    if (acceptButton) acceptButton.addEventListener('click', () => choose('accepted'));
    if (rejectButton) rejectButton.addEventListener('click', () => choose('rejected'));
    if (settingsButton) settingsButton.addEventListener('click', () => {
      banner.hidden = false;
      if (acceptButton) acceptButton.focus();
    });
  }

  const map = document.getElementById('clinicMap');
  const mapButton = document.getElementById('loadClinicMap');
  if (map && mapButton) {
    mapButton.addEventListener('click', () => {
      if (map.querySelector('iframe')) return;
      const frame = document.createElement('iframe');
      frame.title = 'Mapa da Nadia Kroetz Odontologia';
      frame.src = 'https://www.google.com/maps?q=Av.%20Santa%20Rosa%2C%20167%20%E2%80%93%20Crissiumal%2C%20RS&output=embed';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.allowFullscreen = true;
      map.replaceChildren(frame);
    });
  }
})();
