'use strict';

class InsuranceStudy {
    constructor() {
        const savedState = this.loadSavedState();
        this.currentCard = savedState.currentCard || 0;
        this.responses = savedState.responses || [];
        this.userData = savedState.userData || {};
        this.lastResponseTime = savedState.lastResponseTime || null;

        // URL del endpoint de Google Apps Script (Web App desplegado como "Anyone")
        this.SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHH7CM7eEBrlrFa0Y_PBSLwa0UiDLIW4hcHWUHJ27oIKrgw8sFSDbD320G5Z8536vk/exec';

        this.insuranceDecks = this.generateInsuranceDecks();

        console.log('Estado cargado:', {
            currentCard: this.currentCard,
            responsesCount: this.responses.length,
            userData: this.userData
        });

        this.initializeEventListeners();
        this.showCurrentStep();
    }

    loadSavedState() {
        try {
            const saved = sessionStorage.getItem('insuranceStudyState');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error cargando estado guardado:', error);
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
        } catch (error) {
            console.error('Error guardando estado:', error);
        }
    }

    clearSavedState() {
        try {
            sessionStorage.removeItem('insuranceStudyState');
            sessionStorage.removeItem('insuranceResponses');
        } catch (error) {
            console.error('Error limpiando estado:', error);
        }
    }

    generateInsuranceDecks() {
        return [
            [
                {prima: 300, suma: 50000, copago: 0.1},
                {prima: 200, suma: 30000, copago: 0.2},
                {prima: 150, suma: 20000, copago: 0.3}
            ],
            [
                {prima: 500, suma: 100000, copago: 0.1},
                {prima: 350, suma: 70000, copago: 0.15},
                {prima: 250, suma: 40000, copago: 0.25}
            ],
            [
                {prima: 400, suma: 60000, copago: 0.05},
                {prima: 280, suma: 45000, copago: 0.1},
                {prima: 180, suma: 30000, copago: 0.2}
            ],
            [
                {prima: 180, suma: 25000, copago: 0.3},
                {prima: 120, suma: 15000, copago: 0.4},
                {prima: 80,  suma: 10000, copago: 0.5}
            ],
            [
                {prima: 600, suma: 150000, copago: 0.05},
                {prima: 350, suma: 80000,  copago: 0.1},
                {prima: 200, suma: 40000,  copago: 0.2}
            ],
            [
                {prima: 320, suma: 55000, copago: 0.1},
                {prima: 270, suma: 50000, copago: 0.2},
                {prima: 220, suma: 45000, copago: 0.3}
            ],
            [
                {prima: 450, suma: 120000, copago: 0.15},
                {prima: 300, suma: 75000,  copago: 0.2},
                {prima: 190, suma: 45000,  copago: 0.25}
            ],
            [
                {prima: 280, suma: 60000, copago: 0.15},
                {prima: 210, suma: 45000, copago: 0.25},
                {prima: 160, suma: 35000, copago: 0.35}
            ],
            [
                {prima: 700, suma: 200000, copago: 0.05},
                {prima: 450, suma: 120000, copago: 0.1},
                {prima: 300, suma: 70000,  copago: 0.15}
            ],
            [
                {prima: 150, suma: 30000, copago: 0.25},
                {prima: 100, suma: 20000, copago: 0.35},
                {prima: 70,  suma: 15000, copago: 0.45}
            ]
        ];
    }

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
            startStudyBtn.addEventListener('click', () => {
                this.startStudy();
            });
        }

        const noBuyBtn = document.getElementById('no-buy');
        if (noBuyBtn) {
            noBuyBtn.addEventListener('click', () => {
                // Convención: 3 representa "No comprar"
                this.recordResponse(3);
            });
        }

        window.addEventListener('beforeunload', (e) => {
            if (this.userData.age && this.userData.gender &&
                this.currentCard > 0 && this.currentCard < 10) {
                e.preventDefault();
                e.returnValue = 'Tienes respuestas sin completar. ¿Estás seguro de que quieres salir?';
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

        // Inicializa el cronómetro de la primera respuesta
        this.lastResponseTime = Date.now();
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
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });

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
            container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error cargando las opciones. Por favor, recarga la página.</div></div>';
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
                container.querySelectorAll('.insurance-card').forEach(c => {
                    c.classList.remove('selected');
                });

                e.currentTarget.classList.add('selected');

                const selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                setTimeout(() => {
                    this.recordResponse(selectedIndex);
                }, 500);
            });
        });

        this.updateProgress();
    }

    updateProgress() {
        const currentCardElement = document.getElementById('current-card');
        const progressBar = document.getElementById('progress-bar');

        if (currentCardElement) {
            currentCardElement.textContent = this.currentCard + 1;
        }

        if (progressBar) {
            const progress = ((this.currentCard + 1) / 10) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${Math.round(progress)}%`;
        }
    }

    recordResponse(choiceIndex) {
        const currentDeck = this.insuranceDecks[this.currentCard];

        if (!currentDeck) {
            console.error('No hay deck actual para registrar respuesta');
            return;
        }

        const now = Date.now();
        const responseTime = this.lastResponseTime ? (now - this.lastResponseTime) : 0;

        this.responses.push({
            card: this.currentCard,
            options: [...currentDeck],
            chosen: choiceIndex,                 // 0,1,2 ó 3 (No comprar)
            timestamp: new Date().toISOString(),
            responseTime: responseTime
        });

        // Reinicia cronómetro para la próxima tarjeta
        this.lastResponseTime = now;

        console.log(`Respuesta registrada: Tarjeta ${this.currentCard + 1}, Opción ${choiceIndex}`);
        this.saveState();
        this.currentCard++;

        if (this.currentCard < 10) {
            setTimeout(() => {
                this.displayCurrentCard();
            }, 300);
        } else {
            this.completeStudy();
        }
    }

    async completeStudy() {
        try {
            console.log('Completando estudio, enviando datos...', {
                user: this.userData,
                responsesCount: this.responses.length
            });

            const payload = {
                user: {
                    ...this.userData,
                    endTime: new Date().toISOString(),
                    totalTime: Math.round((new Date() - new Date(this.userData.startTime)) / 1000)
                },
                responses: this.responses
            };

            // Envío con estrategia sin CORS: sendBeacon -> fetch(no-cors)
            const response = await this.sendDataNoCors(payload);

            if (response && response.success) {
                console.log('Datos enviados (sin CORS) con éxito');
                this.clearSavedState();
                this.showStep('completion-step');
                this.showCompletionSummary();
            } else {
                throw new Error('No se pudo confirmar el envío (sin CORS)');
            }
        } catch (error) {
            console.error('Error completando el estudio:', error);
            this.saveBackupData();

            alert('El estudio se completó, pero hubo un problema al enviar los datos al servidor. ' +
                  'Tus respuestas se han guardado localmente en tu navegador. ' +
                  'Por favor, contacta al administrador del estudio y menciona este error.');
        }
    }

    /**
     * Estrategia de envío sin CORS:
     * 1) Intentar navigator.sendBeacon (no bloquea unload, ideal para "fin del estudio")
     * 2) Si no disponible o falla, fetch con mode: "no-cors" (respuesta opaca, asumimos éxito)
     */
    async sendDataNoCors(payload) {
        try {
            // 1) Intento con sendBeacon (mejor para envíos al terminar)
            const beaconOk = navigator.sendBeacon(
                this.SCRIPT_URL,
                new Blob([JSON.stringify(payload)], { type: 'text/plain' }) // text/plain evita preflight
            );
            if (beaconOk) {
                return { success: true, message: 'Datos enviados con sendBeacon' };
            }
        } catch (e) {
            console.warn('sendBeacon no disponible/falló:', e);
        }

        // 2) Respaldo: fetch en no-cors (no podemos leer respuesta → asumimos éxito)
        try {
            await fetch(this.SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain' // evita preflight CORS
                },
                body: JSON.stringify(payload)
            });
            return { success: true, message: 'Datos enviados con fetch no-cors (respuesta opaca)' };
        } catch (e2) {
            console.error('Error en fetch no-cors:', e2);
            throw e2;
        }
    }

    saveBackupData() {
        try {
            const backupData = {
                user: this.userData,
                responses: this.responses,
                backupTime: new Date().toISOString()
            };

            // Guardar en localStorage como respaldo permanente
            localStorage.setItem('insuranceStudyBackup', JSON.stringify(backupData));
            console.log('Datos guardados como respaldo en localStorage');

            // Crear descarga para el usuario
            this.createDownloadableBackup(backupData);
        } catch (error) {
            console.error('Error guardando respaldo:', error);
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
                // Dispara la descarga automáticamente
                setTimeout(() => downloadBtn.click(), 300);
            }
        } catch (error) {
            console.error('Error creando descarga:', error);
        }
    }

    showCompletionSummary() {
        const insuranceChoices = this.responses.filter(r => r.chosen !== 3).length;
        const noBuyChoices = this.responses.filter(r => r.chosen === 3).length;

        console.log(`Resumen: ${insuranceChoices} seguros elegidos, ${noBuyChoices} veces "No Comprar"`);
    }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    try {
        new InsuranceStudy();
        console.log('Aplicación de estudio de seguros inicializada');
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        alert('Error cargando la aplicación. Por favor, recarga la página.');
    }
});
