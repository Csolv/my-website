// ADC Language Toggle — ES | EN via Google Translate (cookie method)
// The widget applies the `googtrans` cookie automatically on page load, so we
// just set/clear that cookie and reload — no dependency on the combo <select>.

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

function adcWriteCookie(value) {
  var host = location.hostname;
  document.cookie = 'googtrans=' + value + ';path=/';
  if (host && host.indexOf('.') !== -1) {
    document.cookie = 'googtrans=' + value + ';path=/;domain=.' + host;
  }
}

function adcClearCookie() {
  var exp = ';expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  var host = location.hostname;
  document.cookie = 'googtrans=' + exp;
  if (host && host.indexOf('.') !== -1) {
    document.cookie = 'googtrans=' + exp + ';domain=.' + host;
  }
}

function adcSetLang(lang) {
  if (lang === adcCurrentLang()) return;          // no change
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
