/* ─── ADC Virtual Assistant ─── */
(function () {
  'use strict';

  var FAQS = [
    {
      triggers: ['donar', 'donacion', 'apoyar', 'contribuir', 'ayuda economica', 'dar dinero'],
      answer: '¡Gracias por tu interés en apoyar! Puedes hacer una donación en nuestra página. Cada aporte transforma vidas en Curundú.<br><a href="donar.html" class="chat-link">💚 Hacer una donación →</a>'
    },
    {
      triggers: ['voluntario', 'voluntaria', 'voluntariado', 'participar', 'colaborar', 'unirme', 'unirse'],
      answer: '¡Nos encanta que quieras unirte! Visita nuestra página de participación para saber cómo colaborar.<br><a href="participar.html" class="chat-link">🤝 Ver cómo participar →</a>'
    },
    {
      triggers: ['contacto', 'contactar', 'correo', 'email', 'telefono', 'llamar', 'escribir', 'mensaje'],
      answer: 'Puedes contactarnos por nuestro formulario. Respondemos en menos de 48 horas.<br><a href="contactanos.html" class="chat-link">📧 Contáctanos →</a>'
    },
    {
      triggers: ['evento', 'eventos', 'calendario', 'actividad', 'actividades', 'horario', 'entrenamiento', 'partido', 'torneo'],
      answer: 'Tenemos entrenamientos, talleres y eventos durante toda la semana.<br><a href="calendario.html" class="chat-link">📅 Ver Calendario →</a>'
    },
    {
      triggers: ['quienes', 'historia', 'fundacion', 'mision', 'sobre adc', 'sobre nosotros', 'que es adc', 'conocer'],
      answer: 'ADC es una fundación sin fines de lucro que desde 2014 transforma vidas en Curundú a través del deporte, la educación y la nutrición.<br><a href="quienessomos.html" class="chat-link">ℹ️ Conocer más →</a>'
    },
    {
      triggers: ['blog', 'noticias', 'noticia', 'articulo', 'publicacion', 'novedades'],
      answer: 'Encuentra las últimas noticias y artículos de ADC en nuestro blog.<br><a href="blog.html" class="chat-link">📰 Ir al Blog →</a>'
    },
    {
      triggers: ['atleta', 'nino', 'nina', 'inscribir', 'inscripcion', 'registrar', 'hijo', 'hija', 'edad'],
      answer: 'Para inscribir a un atleta entre 6 y 16 años, visita nuestra página de participación o escríbenos directamente.<br><a href="participar.html" class="chat-link">⚽ Inscribir un atleta →</a>'
    },
    {
      triggers: ['verano feliz', 'verano'],
      answer: 'El Verano Feliz ADC es nuestro programa de vacaciones de verano para niños y jóvenes de Curundú. Incluye actividades deportivas, educativas y recreativas. ¡Revisa el calendario para más info!<br><a href="calendario.html" class="chat-link">📅 Ver Calendario →</a>'
    },
    {
      triggers: ['gracias', 'muchas gracias', 'thank', 'excelente', 'perfecto'],
      answer: '¡Con mucho gusto! Si tienes más preguntas, aquí estaré. 😊'
    },
    {
      triggers: ['hola', 'buenas', 'buenos', 'hey', 'hello', 'saludos', 'buen dia', 'buenas tardes'],
      answer: '¡Hola! Soy el asistente virtual de ADC. ¿En qué te puedo ayudar hoy?'
    }
  ];

  var SUGGESTIONS = [
    '¿Cómo puedo donar?',
    '¿Cómo ser voluntario?',
    '¿Cuáles son los eventos?',
    '¿Quiénes son?'
  ];

  function normalize(s) {
    return s.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ');
  }

  function findAnswer(text) {
    var n = normalize(text);
    for (var i = 0; i < FAQS.length; i++) {
      for (var j = 0; j < FAQS[i].triggers.length; j++) {
        if (n.indexOf(normalize(FAQS[i].triggers[j])) !== -1) {
          return FAQS[i].answer;
        }
      }
    }
    return 'No encontré una respuesta exacta, pero puedo conectarte con nuestro equipo para ayudarte mejor.<br><a href="contactanos.html" class="chat-link">📧 Ir a Contáctanos →</a>';
  }

  function init() {
    var wrap = document.createElement('div');
    wrap.id = 'adc-chat';
    wrap.innerHTML = [
      '<button id="chat-toggle" aria-label="Abrir chat de ayuda" aria-expanded="false">',
      '  <svg class="ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      '  <svg class="ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      '  <span class="chat-badge" aria-label="1 mensaje nuevo">1</span>',
      '</button>',
      '<div id="chat-win" aria-hidden="true" role="dialog" aria-label="Chat de soporte ADC">',
      '  <div id="chat-hdr">',
      '    <div class="ch-left">',
      '      <div class="ch-av">ADC</div>',
      '      <div><div class="ch-nm">Asistente ADC</div><div class="ch-st">● En línea</div></div>',
      '    </div>',
      '    <button class="ch-close-btn" aria-label="Cerrar chat">✕</button>',
      '  </div>',
      '  <div id="chat-msgs" role="log" aria-live="polite" aria-relevant="additions"></div>',
      '  <div id="chat-sugg" aria-label="Preguntas sugeridas"></div>',
      '  <div id="chat-inp">',
      '    <input type="text" id="chat-field" placeholder="Escribe tu pregunta..." autocomplete="off" aria-label="Escribe tu mensaje">',
      '    <button id="chat-send" aria-label="Enviar mensaje">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
      '    </button>',
      '  </div>',
      '</div>'
    ].join('\n');
    document.body.appendChild(wrap);

    var toggle = document.getElementById('chat-toggle');
    var win    = document.getElementById('chat-win');
    var msgs   = document.getElementById('chat-msgs');
    var field  = document.getElementById('chat-field');
    var sendBtn = document.getElementById('chat-send');
    var sugg   = document.getElementById('chat-sugg');
    var badge  = wrap.querySelector('.chat-badge');
    var isOpen = false;

    function openChat() {
      isOpen = true;
      win.classList.add('open');
      win.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      wrap.querySelector('.ic-chat').style.display = 'none';
      wrap.querySelector('.ic-close').style.display = 'block';
      badge.style.display = 'none';
      if (msgs.children.length === 0) welcome();
      setTimeout(function() { field.focus(); }, 350);
    }

    function closeChat() {
      isOpen = false;
      win.classList.remove('open');
      win.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      wrap.querySelector('.ic-chat').style.display = 'block';
      wrap.querySelector('.ic-close').style.display = 'none';
    }

    toggle.addEventListener('click', function() { isOpen ? closeChat() : openChat(); });
    wrap.querySelector('.ch-close-btn').addEventListener('click', closeChat);

    function addMsg(who, html) {
      var d = document.createElement('div');
      d.className = 'cm cm--' + who;
      d.innerHTML = '<div class="cb">' + html + '</div>';
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
      var d = document.createElement('div');
      d.className = 'cm cm--bot';
      d.id = 'chat-typ';
      d.innerHTML = '<div class="cb cb--typing"><span></span><span></span><span></span></div>';
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
    }

    function stopTyping() {
      var t = document.getElementById('chat-typ');
      if (t) t.remove();
    }

    function sendMsg(text) {
      if (!text.trim()) return;
      sugg.innerHTML = '';
      addMsg('user', text);
      field.value = '';
      showTyping();
      setTimeout(function() {
        stopTyping();
        addMsg('bot', findAnswer(text));
      }, 700 + Math.random() * 600);
    }

    function showSuggestions() {
      sugg.innerHTML = SUGGESTIONS.map(function(s) {
        return '<button class="cs" type="button">' + s + '</button>';
      }).join('');
      sugg.querySelectorAll('.cs').forEach(function(b) {
        b.addEventListener('click', function() { sendMsg(b.textContent); });
      });
    }

    function welcome() {
      setTimeout(function() {
        addMsg('bot', '¡Hola! 👋 Soy el asistente virtual de <strong>AD Curundú</strong>. ¿En qué puedo ayudarte?');
        showSuggestions();
      }, 350);
    }

    sendBtn.addEventListener('click', function() { sendMsg(field.value); });
    field.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMsg(field.value);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
