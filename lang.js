// ADC Language Toggle — ES | EN via Google Translate
// Hides Google's own toolbar; exposes a clean two-button switch.

function googleTranslateElementInit() {
  new google.translate.TranslateElement({
    pageLanguage: 'es',
    includedLanguages: 'en',
    layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
    autoDisplay: false
  }, 'google_translate_element');
}

function adcSetLang(lang) {
  var sel = document.querySelector('.goog-te-combo');
  if (!sel) { setTimeout(function(){ adcSetLang(lang); }, 400); return; }
  sel.value = (lang === 'en') ? 'en' : '';
  var evt = document.createEvent('HTMLEvents');
  evt.initEvent('change', true, true);
  sel.dispatchEvent(evt);
  // Update button states
  var btnEs = document.getElementById('lang-es');
  var btnEn = document.getElementById('lang-en');
  if (btnEs) btnEs.classList.toggle('active', lang === 'es');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  try { localStorage.setItem('adcLang', lang); } catch(e) {}
}

// Restore saved preference on load
document.addEventListener('DOMContentLoaded', function() {
  try {
    var saved = localStorage.getItem('adcLang');
    if (saved === 'en') setTimeout(function(){ adcSetLang('en'); }, 900);
  } catch(e) {}
});
