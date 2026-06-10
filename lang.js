// ADC Language Toggle — ES | EN via Google Translate (cookie method)
// The widget applies the `googtrans` cookie automatically on page load, so we
// set/clear that cookie and reload — no dependency on the combo <select>.

function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    { pageLanguage: 'es', includedLanguages: 'en,es', autoDisplay: false },
    'google_translate_element'
  );
}

function adcCurrentLang() {
  var m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  return (m && decodeURIComponent(m[1]).indexOf('/en') !== -1) ? 'en' : 'es';
}

// All cookie-domain scopes Google Translate might use, so set/clear always match.
// e.g. on www.adcurundu.org Google sets the cookie on the registrable domain
// (.adcurundu.org), so we must operate on that scope too — not just the host.
function adcCookieDomains() {
  var host = location.hostname;            // e.g. "www.adcurundu.org"
  var scopes = [null, host, '.' + host];   // null = host-only (no domain attr)
  var parts = host.split('.');
  if (parts.length > 2) {
    var registrable = parts.slice(-2).join('.'); // "adcurundu.org"
    scopes.push(registrable, '.' + registrable);
  }
  return scopes;
}

function adcWriteCookie(value) {
  // Write on host-only + the registrable domain (what Google itself uses).
  document.cookie = 'googtrans=' + value + ';path=/';
  var parts = location.hostname.split('.');
  if (parts.length > 2) {
    document.cookie = 'googtrans=' + value + ';path=/;domain=.' + parts.slice(-2).join('.');
  } else {
    document.cookie = 'googtrans=' + value + ';path=/;domain=.' + location.hostname;
  }
}

function adcClearCookie() {
  var past = 'expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  adcCookieDomains().forEach(function (d) {
    document.cookie = 'googtrans=;' + past + (d ? ';domain=' + d : '');
  });
}

function adcSetLang(lang) {
  if (lang === adcCurrentLang()) return;          // already in that language
  if (lang === 'en') adcWriteCookie('/es/en');    // translate ES -> EN
  else adcClearCookie();                          // restore original Spanish
  location.reload();
}

// Reflect the active language on the buttons after each load
document.addEventListener('DOMContentLoaded', function () {
  var cur = adcCurrentLang();
  var es = document.getElementById('lang-es');
  var en = document.getElementById('lang-en');
  if (es) es.classList.toggle('active', cur === 'es');
  if (en) en.classList.toggle('active', cur === 'en');
});
