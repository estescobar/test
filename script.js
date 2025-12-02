'use strict';

class InsuranceStudy {
  constructor() {
    const savedState = this.loadSavedState();
    this.currentCard = savedState.currentCard || 0;
    this.responses = savedState.responses || [];
    this.userData = savedState.userData || {};
    this.lastResponseTime = savedState.lastResponseTime || null;

    // Tu Web App (Deploy > Web app > Anyone with the link)
    this.SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9dgdSn4KY75SojsfELoLAEvfkaWjrgurWUBJ0uj42dh40raDmL22bhSIDL7ACVgHc/exec';

    this.insuranceDecks = this.generateInsuranceDecks();
    this.initializeEventListeners();
    this.showCurrentStep();
  }

  // ------- Estado -------
  loadSavedState() {
    try {
      const saved = sessionStorage.getItem('insuranceStudyState');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  }
  saveState() {
    sessionStorage.setItem('insuranceStudyState', JSON.stringify({
      currentCard: this.currentCard,
      responses: this.responses,
      userData: this.userData,
      lastResponseTime: this.lastResponseTime
    }));
  }
  clearSavedState() {
    sessionStorage.removeItem('insuranceStudyState');
    sessionStorage.removeItem('insuranceResponses');
  }

  // ------- Datos de las tarjetas -------
  generateInsuranceDecks() {
    return [
      [{ prima:300,suma:50000,copago:0.1 },{ prima:200,suma:30000,copago:0.2 },{ prima:150,suma:20000,copago:0.3 }],
      [{ prima:500,suma:100000,copago:0.1 },{ prima:350,suma:70000,copago:0.15 },{ prima:250,suma:40000,copago:0.25 }],
      [{ prima:400,suma:60000,copago:0.05 },{ prima:280,suma:45000,copago:0.1 },{ prima:180,suma:30000,copago:0.2 }],
      [{ prima:180,suma:25000,copago:0.3 },{ prima:120,suma:15000,copago:0.4 },{ prima:80,suma:10000,copago:0.5 }],
      [{ prima:600,suma:150000,copago:0.05 },{ prima:350,suma:80000,copago:0.1 },{ prima:200,suma:40000,copago:0.2 }],
      [{ prima:320,suma:55000,copago:0.1 },{ prima:270,suma:50000,copago:0.2 },{ prima:220,suma:45000,copago:0.3 }],
      [{ prima:450,suma:120000,copago:0.15 },{ prima:300,suma:75000,copago:0.2 },{ prima:190,suma:45000,copago:0.25 }],
      [{ prima:280,suma:60000,copago:0.15 },{ prima:210,suma:45000,copago:0.25 },{ prima:160,suma:35000,copago:0.35 }],
      [{ prima:700,suma:200000,copago:0.05 },{ prima:450,suma:120000,copago:0.1 },{ prima:300,suma:70000,copago:0.15 }],
      [{ prima:150,suma:30000,copago:0.25 },{ prima:100,suma:20000,copago:0.35 },{ prima:70,suma:15000,copago:0.45 }]
    ];
  }

  // ------- UI / eventos -------
  initializeEventListeners() {
    const demographicForm = document.getElementById('demographic-form');
    if (demographicForm) {
      demographicForm.addEventListener('submit', (e) => { e.preventDefault(); this.handleDemographicSubmit(); });
    }
    const startStudyBtn = document.getElementById('start-study');
    if (startStudyBtn) startStudyBtn.addEventListener('click', () => this.startStudy());
    const noBuyBtn = document.getElementById('no-buy');
    if (noBuyBtn) noBuyBtn.addEventListener('click', () => this.recordResponse(3)); // 3 = No comprar

    window.addEventListener('beforeunload', (e) => {
  if (
    this.userData.age &&
    this.userData.gender &&
    this.userData.income &&
    this.userData.visits &&
    this.userData.preference &&
    this.currentCard > 0 && this.currentCard < 10
  ) {
    e.preventDefault();
    e.returnValue = 'Tienes respuestas sin completar. ¿Estás seguro de salir?';
  }
});
  }

handleDemographicSubmit() {
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const income = document.getElementById('income').value;
  const visits = document.getElementById('visits').value;
  const prefEl = document.querySelector('input[name="preference"]:checked');
  const preference = prefEl ? prefEl.value : '';

  const ageNum = parseInt(age, 10);

  if (Number.isNaN(ageNum) || ageNum < 18 || ageNum > 80) {
    return alert('Edad válida: entre 18 y 80 años.');
  }
  if (!gender) {
    return alert('Selecciona tu género.');
  }
  if (!income) {
    return alert('Selecciona tu rango de ingreso mensual.');
  }
  if (!visits) {
    return alert('Selecciona cuántas veces has ido al médico en los últimos 12 meses.');
  }
  if (!preference) {
    return alert('Selecciona la frase que mejor te describe.');
  }

  this.userData = {
    age,
    gender,
    income,
    visits,
    preference,
    startTime: new Date().toISOString()
  };

  this.saveState();
  this.showStep('explanation-step');
}


  startStudy() {
    if (this.responses.length >= 10) {
      if (!confirm('Ya completaste este estudio. ¿Reiniciar?')) return;
      this.currentCard = 0;
      this.responses = [];
      this.lastResponseTime = null;
      this.clearSavedState();
    }
    this.lastResponseTime = Date.now();
    this.saveState();
    this.showStep('cards-step');
    this.displayCurrentCard();
  }

  showCurrentStep() {
    if (this.userData.age && this.userData.gender) {
      if (this.currentCard > 0 && this.currentCard < 10) {
        this.showStep('cards-step'); this.displayCurrentCard();
      } else if (this.currentCard >= 10) {
        this.showStep('completion-step');
      } else {
        this.showStep('explanation-step');
      }
    } else {
      this.showStep('demographic-step');
    }
  }

  showStep(stepId) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(stepId);
    if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
  }

  displayCurrentCard() {
    const container = document.getElementById('cards-container');
    const deck = this.insuranceDecks[this.currentCard];
    if (!container || !deck) return;

    container.innerHTML = deck.map((ins, i) => `
      <div class="col-md-4 mb-4">
        <div class="insurance-card card h-100" data-index="${i}">
          <div class="card-header bg-light">
            <h5 class="card-title mb-0 text-center">Opción ${i + 1}</h5>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="mb-3 text-center">
              <div class="display-6 text-primary">$${ins.prima.toLocaleString()}</div>
              <small class="text-muted">por mes</small>
            </div>
            <div class="mb-2">
              <strong>🏥 Cobertura Máxima:</strong>
              <div class="fs-5 text-success">$${ins.suma.toLocaleString()}</div>
            </div>
            <div class="mb-3">
              <strong>💵 Copago:</strong>
              <div class="fs-6 text-warning">${(ins.copago * 100).toFixed(0)}%</div>
              <small class="text-muted">Tú pagas ${(ins.copago * 100).toFixed(0)}% de cada siniestro</small>
            </div>
            <div class="mt-auto">
              <div class="alert alert-info small">
                <strong>💡 Ejemplo:</strong> Con un tratamiento de $1,000, tú pagas $${(1000 * ins.copago).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.insurance-card').forEach(card => {
      card.addEventListener('click', (e) => {
        container.querySelectorAll('.insurance-card').forEach(c => c.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        setTimeout(() => this.recordResponse(idx), 500);
      });
    });

    const currentCardEl = document.getElementById('current-card');
    const bar = document.getElementById('progress-bar');
    if (currentCardEl) currentCardEl.textContent = this.currentCard + 1;
    if (bar) {
      const p = ((this.currentCard + 1) / 10) * 100;
      bar.style.width = `${p}%`;
      bar.textContent = `${Math.round(p)}%`;
    }
  }

  recordResponse(choiceIndex) {
    const deck = this.insuranceDecks[this.currentCard];
    if (!deck) return;

    const now = Date.now();
    this.responses.push({
      card: this.currentCard,
      options: [...deck],
      chosen: choiceIndex,
      timestamp: new Date().toISOString(),
      responseTime: this.lastResponseTime ? (now - this.lastResponseTime) : 0
    });

    this.lastResponseTime = now;
    this.saveState();
    this.currentCard++;

    if (this.currentCard < 10) {
      setTimeout(() => this.displayCurrentCard(), 300);
    } else {
      this.completeStudy();
    }
  }

  async completeStudy() {
    try {
      const payload = {
        user: {
          ...this.userData,
          endTime: new Date().toISOString(),
          totalTime: Math.round((new Date() - new Date(this.userData.startTime)) / 1000)
        },
        responses: this.responses
      };

      // Envío a Apps Script sin CORS: formulario oculto en iframe
      await this.postViaHiddenForm(payload);

      // Éxito: limpiar estado y finalizar
      this.clearSavedState();
      this.showStep('completion-step');
      this.showCompletionSummary();

    } catch (e) {
      console.error('Error al enviar:', e);
      alert('Se completó el estudio, pero hubo un problema al enviar los datos. Contacta al administrador.');
    }
  }

  /**
   * POST form-urlencoded dentro de un iframe oculto: payload=<JSON>
   * No requiere CORS ni lectura de la respuesta.
   */
  postViaHiddenForm(payloadObj) {
    return new Promise((resolve) => {
      const iframeName = 'hidden_iframe_' + Math.random().toString(36).slice(2);
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';

      const form = document.createElement('form');
      form.action = this.SCRIPT_URL;
      form.method = 'POST';
      form.target = iframeName;
      form.style.display = 'none';
      form.enctype = 'application/x-www-form-urlencoded; charset=UTF-8';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payloadObj);
      form.appendChild(input);

      document.body.appendChild(iframe);
      document.body.appendChild(form);

      iframe.addEventListener('load', () => {
        resolve();
        setTimeout(() => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        }, 1000);
      });

      form.submit();

      // Salvaguarda por si el evento load no dispara (muy raro)
      setTimeout(() => resolve(), 4000);
    });
  }

  showCompletionSummary() {
    const nBuy = this.responses.filter(r => r.chosen !== 3).length;
    const nNoBuy = this.responses.filter(r => r.chosen === 3).length;
    console.log(`Resumen: ${nBuy} compras, ${nNoBuy} "No Comprar"`);
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  try {
    new InsuranceStudy();
  } catch (err) {
    console.error('Error inicializando:', err);
    alert('Error cargando la aplicación. Por favor, recarga la página.');
  }
});
