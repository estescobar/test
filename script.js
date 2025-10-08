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

    console.log('Estado cargado:', {
      currentCard: this.currentCard,
      responsesCount: this.responses.length,
      userData: this.userData
    });

    this.initializeEventListeners();
    this.showCurrentStep();
  }

  // ------- Estado -------

  loadSavedState() {
    try {
      const saved = sessionStorage.getItem('insuranceStudyState');
      return saved ? JSON.parse(saved) : {};
    } catch (err) {
      console.error('Error cargando estado:', err);
      return {};
    }
  }

  saveState() {
    try {
      const state = {
        currentCard: this.currentCard,
        responses: this.responses,
        userData: this.userData,
        lastResponseTime: this.lastResponseTime
      };
      sessionStorage.setItem('insuranceStudyState', JSON.stringify(state));
    } catch (err) {
      console.error('Error guardando estado:', err);
    }
  }

  clearSavedState() {
    try {
      sessionStorage.removeItem('insuranceStudyState');
      sessionStorage.removeItem('insuranceResponses');
    } catch (err) {
      console.error('Error limpiando estado:', err);
    }
  }

  // ------- Datos de las tarjetas -------

  generateInsuranceDecks() {
    return [
      [
        { prima: 300, suma: 50000, copago: 0.1 },
        { prima: 200, suma: 30000, copago: 0.2 },
        { prima: 150, suma: 20000, copago: 0.3 }
      ],
      [
        { prima: 500, suma: 100000, copago: 0.1 },
        { prima: 350, suma: 70000, copago: 0.15 },
        { prima: 250, suma: 40000, copago: 0.25 }
      ],
      [
        { prima: 400, suma: 60000, copago: 0.05 },
        { prima: 280, suma: 45000, copago: 0.1 },
        { prima: 180, suma: 30000, copago: 0.2 }
      ],
      [
        { prima: 180, suma: 25000, copago: 0.3 },
        { prima: 120, suma: 15000, copago: 0.4 },
        { prima: 80,  suma: 10000, copago: 0.5 }
      ],
      [
        { prima: 600, suma: 150000, copago: 0.05 },
        { prima: 350, suma: 80000,  copago: 0.1 },
        { prima: 200, suma: 40000,  copago: 0.2 }
      ],
      [
        { prima: 320, suma: 55000, copago: 0.1 },
        { prima: 270, suma: 50000, copago: 0.2 },
        { prima: 220, suma: 45000, copago: 0.3 }
      ],
      [
        { prima: 450, suma: 120000, copago: 0.15 },
        { prima: 300, suma: 75000,  copago: 0.2 },
        { prima: 190, suma: 45000,  copago: 0.25 }
      ],
      [
        { prima: 280, suma: 60000, copago: 0.15 },
        { prima: 210, suma: 45000, copago: 0.25 },
        { prima: 160, suma: 35000, copago: 0.35 }
      ],
      [
        { prima: 700, suma: 200000, copago: 0.05 },
        { prima: 450, suma: 120000, copago: 0.1 },
        { prima: 300, suma: 70000,  copago: 0.15 }
      ],
      [
        { prima: 150, suma: 30000, copago: 0.25 },
        { prima: 100, suma: 20000, copago: 0.35 },
        { prima: 70,  suma: 15000, copago: 0.45 }
      ]
    ];
  }

  // ------- UI / eventos -------

  initializeEventListeners() {
    const demographicForm = document.getElementById('demographic-form');
    if (demographicForm) {
      demographicForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleDemographicSubmit();
      });
    }

    const startStudyBtn = document.getElementById('start-study');
    if (startStudyBtn) {
      startStudyBtn.addEventListener('click', () => this.startStudy());
    }

    const noBuyBtn = document.getElementById('no-buy');
    if (noBuyBtn) {
      noBuyBtn.addEventListener('click', () => this.recordResponse(3)); // 3 = No comprar
    }

    window.addEventListener('beforeunload', (e) => {
      if (this.userData.age && this.userData.gender &&
          this.currentCard > 0 && this.currentCard < 10) {
        e.preventDefault();
        e.returnValue = 'Tienes respuestas sin completar. ¿Estás seguro de salir?';
        return e.returnValue;
      }
    });
  }

  handleDemographicSubmit() {
    this.userData = {
      age: document.getElementById('age').value,
      gender: document.getElementById('gender').value,
      startTime: new Date().toISOString()
    };

    const age = parseInt(this.userData.age, 10);
    if (Number.isNaN(age) || age < 18 || age > 80) {
      alert('Por favor, ingresa una edad válida entre 18 y 80 años.');
      return;
    }
    if (!this.userData.gender) {
      alert('Por favor, selecciona tu género.');
      return;
    }

    this.saveState();
    this.showStep('explanation-step');
  }

  startStudy() {
    if (this.responses.length >= 10) {
      if (confirm('Ya completaste este estudio. ¿Quieres empezar de nuevo?')) {
        this.currentCard = 0;
        this.responses = [];
        this.lastResponseTime = null;
        this.clearSavedState();
      } else {
        return;
      }
    }

    this.lastResponseTime = Date.now(); // cronómetro
    this.saveState();

    this.showStep('cards-step');
    this.displayCurrentCard();
  }

  showCurrentStep() {
    if (this.userData.age && this.userData.gender) {
      if (this.currentCard > 0 && this.currentCard < 10) {
        this.showStep('cards-step');
        this.displayCurrentCard();
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
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      stepElement.classList.add('active');
      window.scrollTo(0, 0);
    } else {
      console.error('Paso no encontrado:', stepId);
    }
  }

  displayCurrentCard() {
    const container = document.getElementById('cards-container');
    if (!container) {
      console.error('Contenedor de tarjetas no encontrado');
      return;
    }

    const currentDeck = this.insuranceDecks[this.currentCard];
    if (!currentDeck || !Array.isArray(currentDeck)) {
      console.error('Deck actual no válido:', currentDeck);
      container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error cargando las opciones. Recarga la página.</div></div>';
      return;
    }

    container.innerHTML = currentDeck.map((insurance, index) => `
      <div class="col-md-4 mb-4">
        <div class="insurance-card card h-100" data-index="${index}">
          <div class="card-header bg-light">
            <h5 class="card-title mb-0 text-center">Opción ${index + 1}</h5>
          </div>
          <div class="card-body d-flex flex-column">
            <div class="mb-3 text-center">
              <div class="display-6 text-primary">$${insurance.prima.toLocaleString()}</div>
              <small class="text-muted">por mes</small>
            </div>
            <div class="mb-2">
              <strong>🏥 Cobertura Máxima:</strong>
              <div class="fs-5 text-success">$${insurance.suma.toLocaleString()}</div>
            </div>
            <div class="mb-3">
              <strong>💵 Copago:</strong>
              <div class="fs-6 text-warning">${(insurance.copago * 100).toFixed(0)}%</div>
              <small class="text-muted">Tú pagas ${(insurance.copago * 100).toFixed(0)}% de cada siniestro</small>
            </div>
            <div class="mt-auto">
              <div class="alert alert-info small">
                <strong>💡 Ejemplo:</strong> Con un tratamiento de $1,000, tú pagas $${(1000 * insurance.copago).toFixed(0)}
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
        const selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        setTimeout(() => this.recordResponse(selectedIndex), 500);
      });
    });

    this.updateProgress();
  }

  updateProgress() {
    const currentCardElement = document.getElementById('current-card');
    const progressBar = document.getElementById('progress-bar');

    if (currentCardElement) currentCardElement.textContent = this.currentCard + 1;
    if (progressBar) {
      const progress = ((this.currentCard + 1) / 10) * 100;
      progressBar.style.width = `${progress}%`;
      progressBar.textContent = `${Math.round(progress)}%`;
    }
  }

  recordResponse(choiceIndex) {
    const currentDeck = this.insuranceDecks[this.currentCard];
    if (!currentDeck) {
      console.error('No hay deck actual');
      return;
    }

    const now = Date.now();
    const responseTime = this.lastResponseTime ? (now - this.lastResponseTime) : 0;

    this.responses.push({
      card: this.currentCard,
      options: [...currentDeck],
      chosen: choiceIndex, // 0,1,2 o 3 = No comprar
      timestamp: new Date().toISOString(),
      responseTime: responseTime
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

      // 1) Envío principal: POST por formulario oculto (iframe) -> no requiere CORS ni lectura de respuesta
      await this.postViaHiddenForm(payload);

      // 2) Limpia estado y muestra final
      this.clearSavedState();
      this.showStep('completion-step');
      this.showCompletionSummary();
      // 3) (Opcional) descarga respaldo igualmente
      this.saveBackupData();

    } catch (err) {
      console.error('Error completando el estudio:', err);
      this.saveBackupData();
      alert('El estudio se completó, pero hubo un problema al enviar los datos. Tus respuestas se guardaron localmente. Contacta al administrador.');
    }
  }

  /**
   * Envío "a prueba de CORS y ad-blockers": POST form-urlencoded dentro de un iframe oculto.
   * Envía un solo campo: payload=<JSON>
   * No podemos leer la respuesta (no es necesario).
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

      // Campo form-urlencoded: payload=<JSON>
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payloadObj);

      form.appendChild(input);
      document.body.appendChild(iframe);
      document.body.appendChild(form);

      // Dar tiempo suficiente a que el request se dispare
      iframe.addEventListener('load', () => {
        // El load indica que la navegación del iframe terminó (no el éxito del guardado),
        // pero para nuestro propósito es suficiente para resolver.
        resolve();
        // Limpieza
        setTimeout(() => {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        }, 1000);
      });

      form.submit();

      // Salvaguarda: si por alguna razón 'load' no llega (muy raro), resolvemos a los 4s
      setTimeout(() => resolve(), 4000);
    });
  }

  // ------- Respaldo local -------

  saveBackupData() {
    try {
      const backupData = {
        user: this.userData,
        responses: this.responses,
        backupTime: new Date().toISOString()
      };
      localStorage.setItem('insuranceStudyBackup', JSON.stringify(backupData));
      console.log('Respaldo guardado en localStorage');
      this.createDownloadableBackup(backupData);
    } catch (err) {
      console.error('Error guardando respaldo:', err);
    }
  }

  createDownloadableBackup(backupData) {
    try {
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const downloadBtn = document.createElement('a');
      downloadBtn.href = URL.createObjectURL(dataBlob);
      downloadBtn.download = `respaldo_estudio_seguros_${new Date().toISOString().split('T')[0]}.json`;
      downloadBtn.style.display = 'none';
      downloadBtn.textContent = 'Descargar respaldo de respuestas';

      const completionStep = document.getElementById('completion-step');
      if (completionStep) {
        completionStep.appendChild(downloadBtn);
        downloadBtn.className = 'btn btn-warning mt-3';
        downloadBtn.style.display = 'block';
        setTimeout(() => downloadBtn.click(), 300);
      }
    } catch (err) {
      console.error('Error creando descarga:', err);
    }
  }

  showCompletionSummary() {
    const insuranceChoices = this.responses.filter(r => r.chosen !== 3).length;
    const noBuyChoices = this.responses.filter(r => r.chosen === 3).length;
    console.log(`Resumen: ${insuranceChoices} seguros elegidos, ${noBuyChoices} veces "No Comprar"`);
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  try {
    new InsuranceStudy();
    console.log('Aplicación inicializada');
  } catch (err) {
    console.error('Error inicializando:', err);
    alert('Error cargando la aplicación. Por favor, recarga la página.');
  }
});
