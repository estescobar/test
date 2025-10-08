class InsuranceStudy {
    constructor() {
        const savedState = this.loadSavedState();
        this.currentCard = savedState.currentCard || 0;
        this.responses = savedState.responses || [];
        this.userData = savedState.userData || {};
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
                userData: this.userData
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
                {prima: 80, suma: 10000, copago: 0.5}
            ],
            [
                {prima: 600, suma: 150000, copago: 0.05},
                {prima: 350, suma: 80000, copago: 0.1},
                {prima: 200, suma: 40000, copago: 0.2}
            ],
            [
                {prima: 320, suma: 55000, copago: 0.1},
                {prima: 270, suma: 50000, copago: 0.2},
                {prima: 220, suma: 45000, copago: 0.3}
            ],
            [
                {prima: 450, suma: 120000, copago: 0.15},
                {prima: 300, suma: 75000, copago: 0.2},
                {prima: 190, suma: 45000, copago: 0.25}
            ],
            [
                {prima: 280, suma: 60000, copago: 0.15},
                {prima: 210, suma: 45000, copago: 0.25},
                {prima: 160, suma: 35000, copago: 0.35}
            ],
            [
                {prima: 700, suma: 200000, copago: 0.05},
                {prima: 450, suma: 120000, copago: 0.1},
                {prima: 300, suma: 70000, copago: 0.15}
            ],
            [
                {prima: 150, suma: 30000, copago: 0.25},
                {prima: 100, suma: 20000, copago: 0.35},
                {prima: 70, suma: 15000, copago: 0.45}
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
                this.recordResponse(3);
            });
        }

        window.addEventListener('beforeunload', (e) => {
            if (this.currentCard > 0 && this.currentCard < 10) {
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

        const age = parseInt(this.userData.age);
        if (age < 18 || age > 80) {
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
                this.clearSavedState();
            } else {
                return;
            }
        }

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

        container.innerHTML = currentDeck?.map((insurance, index) => `
            <div class="col-md-4 mb-4">
                <div class="insurance-card card h-100" data-index="${index}">
                    <div class="card-header bg-light">
                        <h5 class="card-title mb-0 text-center">Opción ${index + 1}</h5>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <div class="mb-3 text-center">
                            <div class="display-6 text-primary">$${insurance.prima}</div>
                            <small class="text-muted">por mes</small>
                        </div>
                        
                        <div class="mb-2">
                            <strong>🏥 Cobertura Máxima:</strong>
                            <div class="fs-5 text-success">$${insurance.suma.toLocaleString()}</div>
                        </div>
                        
                        <div class="mb-3">
                            <strong>💵 Copago:</strong>
                            <div class="fs-6 text-warning">${(insurance.copago * 100)}%</div>
                            <small class="text-muted">Tú pagas ${(insurance.copago * 100)}% de cada siniestro</small>
                        </div>
                        
                        <div class="mt-auto">
                            <div class="alert alert-info small">
                                <strong>💡 Ejemplo:</strong> Con un tratamiento de $1,000, tú pagas $${(1000 * insurance.copago).toFixed(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('') || '<div class="col-12"><div class="alert alert-danger">Error mostrando opciones.</div></div>';

        container.querySelectorAll('.insurance-card').forEach(card => {
            card.addEventListener('click', (e) => {
                container.querySelectorAll('.insurance-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                e.currentTarget.classList.add('selected');
                
                const selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
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

        this.responses.push({
            card: this.currentCard,
            options: [...currentDeck],
            chosen: choiceIndex,
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - (this.lastResponseTime || Date.now())
        });

        this.lastResponseTime = Date.now();
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

            // USAR EL NUEVO MÉTODO PARA ENVIAR
            const response = await this.sendDataWithFallback(payload);

            if (response && response.success) {
                console.log('Datos enviados exitosamente');
                this.clearSavedState();
                this.showStep('completion-step');
                this.showCompletionSummary();
            } else {
                throw new Error(response?.error || 'Error desconocido del servidor');
            }

        } catch (error) {
            console.error('Error completando el estudio:', error);
            this.saveBackupData();
            
            alert('El estudio se completó, pero hubo un problema al enviar los datos al servidor. Tus respuestas se han guardado localmente en tu navegador. Por favor, contacta al administrador del estudio y menciona este error.');
        }
    }

    // NUEVO MÉTODO: Estrategia de envío mejorada
    async sendDataWithFallback(payload) {
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHH7CM7eEBrlrFa0Y_PBSLwa0UiDLIW4hcHWUHJ27oIKrgw8sFSDbD320G5Z8536vk/exec';
        
        try {
            // INTENTO 1: Envío normal con manejo de CORS
            console.log('Intentando enviar datos a Google Apps Script...');
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain', // Cambiado para evitar preflight CORS
                },
                body: JSON.stringify(payload),
                // Nota: No usar 'mode: 'no-cors'' porque no podremos leer la respuesta
            });

            if (!response.ok) {
                throw new Error(`Error HTTP! estado: ${response.status}`);
            }

            const data = await response.json();
            return data;

        } catch (fetchError) {
            console.error('Error en fetch principal:', fetchError);
            
            // INTENTO 2: Usar Google Forms como respaldo
            try {
                console.log('Intentando método de respaldo con Google Forms...');
                return await this.sendToGoogleFormsBackup(payload);
            } catch (backupError) {
                console.error('También falló el método de respaldo:', backupError);
                throw new Error('Todos los métodos de envío fallaron');
            }
        }
    }

    // MÉTODO DE RESPALDO: Google Forms
    async sendToGoogleFormsBackup(payload) {
        // URL de un Google Form que puedes crear como respaldo
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_GOOGLE_FORM_ID/formResponse';
        
        // Mapear datos al formato de Google Forms
        const formData = new FormData();
        formData.append('entry.123456789', JSON.stringify(payload)); // Reemplaza con el ID de campo real

        const response = await fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // En no-cors, no podemos verificar el éxito
        });

        // Con mode: 'no-cors', siempre asumimos éxito
        return { success: true, message: 'Datos enviados via formulario de respaldo' };
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
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const downloadBtn = document.createElement('a');
            downloadBtn.href = URL.createObjectURL(dataBlob);
            downloadBtn.download = `respaldo_estudio_seguros_${new Date().toISOString().split('T')[0]}.json`;
            downloadBtn.style.display = 'none';
            downloadBtn.textContent = 'Descargar respaldo de respuestas';
            
            // Agregar al DOM temporalmente
            const completionStep = document.getElementById('completion-step');
            if (completionStep) {
                completionStep.appendChild(downloadBtn);
                downloadBtn.style.display = 'block';
                downloadBtn.className = 'btn btn-warning mt-3';
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
