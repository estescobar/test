class InsuranceStudy {
    constructor() {
        // Cargar estado previo del sessionStorage o inicializar
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
        // 10 decks predefinidos con diferentes combinaciones estratégicas
        return [
            // Deck 1: Opciones balanceadas
            [
                {prima: 300, suma: 50000, copago: 0.1},
                {prima: 200, suma: 30000, copago: 0.2},
                {prima: 150, suma: 20000, copago: 0.3}
            ],
            // Deck 2: Cobertura alta vs precio bajo
            [
                {prima: 500, suma: 100000, copago: 0.1},
                {prima: 350, suma: 70000, copago: 0.15},
                {prima: 250, suma: 40000, copago: 0.25}
            ],
            // Deck 3: Enfoque en bajo copago
            [
                {prima: 400, suma: 60000, copago: 0.05},
                {prima: 280, suma: 45000, copago: 0.1},
                {prima: 180, suma: 30000, copago: 0.2}
            ],
            // Deck 4: Opciones económicas
            [
                {prima: 180, suma: 25000, copago: 0.3},
                {prima: 120, suma: 15000, copago: 0.4},
                {prima: 80, suma: 10000, copago: 0.5}
            ],
            // Deck 5: Premium vs estándar
            [
                {prima: 600, suma: 150000, copago: 0.05},
                {prima: 350, suma: 80000, copago: 0.1},
                {prima: 200, suma: 40000, copago: 0.2}
            ],
            // Deck 6: Variación de copagos
            [
                {prima: 320, suma: 55000, copago: 0.1},
                {prima: 270, suma: 50000, copago: 0.2},
                {prima: 220, suma: 45000, copago: 0.3}
            ],
            // Deck 7: Enfoque en suma asegurada
            [
                {prima: 450, suma: 120000, copago: 0.15},
                {prima: 300, suma: 75000, copago: 0.2},
                {prima: 190, suma: 45000, copago: 0.25}
            ],
            // Deck 8: Opciones balanceadas
            [
                {prima: 280, suma: 60000, copago: 0.15},
                {prima: 210, suma: 45000, copago: 0.25},
                {prima: 160, suma: 35000, copago: 0.35}
            ],
            // Deck 9: Alta gama
            [
                {prima: 700, suma: 200000, copago: 0.05},
                {prima: 450, suma: 120000, copago: 0.1},
                {prima: 300, suma: 70000, copago: 0.15}
            ],
            // Deck 10: Económico final
            [
                {prima: 150, suma: 30000, copago: 0.25},
                {prima: 100, suma: 20000, copago: 0.35},
                {prima: 70, suma: 15000, copago: 0.45}
            ]
        ];
    }

    initializeEventListeners() {
        // Formulario demográfico
        const demographicForm = document.getElementById('demographic-form');
        if (demographicForm) {
            demographicForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleDemographicSubmit();
            });
        }

        // Inicio del estudio
        const startStudyBtn = document.getElementById('start-study');
        if (startStudyBtn) {
            startStudyBtn.addEventListener('click', () => {
                this.startStudy();
            });
        }

        // Botón "No Comprar"
        const noBuyBtn = document.getElementById('no-buy');
        if (noBuyBtn) {
            noBuyBtn.addEventListener('click', () => {
                this.recordResponse(3); // 3 representa "no comprar"
            });
        }

        // Prevenir recarga accidental de la página
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

        // Validaciones adicionales
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
        // Reiniciar si ya completó el estudio antes
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
        // Mostrar el paso apropiado basado en el estado actual
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
        // Ocultar todos los pasos
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Mostrar el paso solicitado
        const stepElement = document.getElementById(stepId);
        if (stepElement) {
            stepElement.classList.add('active');
            
            // Scroll to top cuando cambia de paso
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

        // Verificar que tenemos el deck actual
        const currentDeck = this.insuranceDecks[this.currentCard];
        if (!currentDeck || !Array.isArray(currentDeck)) {
            console.error('Deck actual no válido:', currentDeck);
            container.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error cargando las opciones. Por favor, recarga la página.</div></div>';
            return;
        }

        // Generar las tarjetas de seguro
        container.innerHTML = currentDeck.map((insurance, index) => `
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
        `).join('');

        // Agregar event listeners a las tarjetas
        container.querySelectorAll('.insurance-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Remover selección previa
                container.querySelectorAll('.insurance-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Seleccionar actual
                e.currentTarget.classList.add('selected');
                
                const selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                setTimeout(() => {
                    this.recordResponse(selectedIndex);
                }, 500); // Pequeño delay para feedback visual
            });
        });

        // Actualizar progreso
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

        // Guardar respuesta
        this.responses.push({
            card: this.currentCard,
            options: [...currentDeck], // Copia del array
            chosen: choiceIndex,
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - (this.lastResponseTime || Date.now())
        });

        this.lastResponseTime = Date.now();

        console.log(`Respuesta registrada: Tarjeta ${this.currentCard + 1}, Opción ${choiceIndex}`);

        // Guardar estado inmediatamente
        this.saveState();

        // Avanzar a siguiente tarjeta o completar
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

            // Preparar datos para enviar
            const payload = {
                user: {
                    ...this.userData,
                    endTime: new Date().toISOString(),
                    totalTime: Math.round((new Date() - new Date(this.userData.startTime)) / 1000)
                },
                responses: this.responses
            };

            // Enviar datos al Google Apps Script
            const response = await this.sendDataToGoogleSheets(payload);

            if (response && response.success) {
                console.log('Datos enviados exitosamente');
                this.clearSavedState();
                this.showStep('completion-step');
                
                // Mostrar resumen
                this.showCompletionSummary();
            } else {
                throw new Error(response?.error || 'Error desconocido');
            }

        } catch (error) {
            console.error('Error completando el estudio:', error);
            
            // Guardar datos localmente como respaldo
            this.saveBackupData();
            
            alert('Hubo un error al enviar los datos, pero tus respuestas están guardadas localmente. Por favor, contacta al administrador del estudio.');
        }
    }

    async sendDataToGoogleSheets(payload) {
        // URL de tu Google Apps Script (debes reemplazar esto)
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHH7CM7eEBrlrFa0Y_PBSLwa0UiDLIW4hcHWUHJ27oIKrgw8sFSDbD320G5Z8536vk/exec';
        
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error enviando datos a Google Sheets:', error);
            throw error;
        }
    }

    saveBackupData() {
        try {
            const backupData = {
                user: this.userData,
                responses: this.responses,
                backupTime: new Date().toISOString()
            };
            
            // Guardar en localStorage como respaldo
            localStorage.setItem('insuranceStudyBackup', JSON.stringify(backupData));
            console.log('Datos guardados como respaldo en localStorage');
            
            // Crear descarga opcional
            this.createDownloadableBackup(backupData);
        } catch (error) {
            console.error('Error guardando respaldo:', error);
        }
    }

    createDownloadableBackup(backupData) {
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        // Opcional: ofrecer descarga
        const downloadBtn = document.createElement('a');
        downloadBtn.href = URL.createObjectURL(dataBlob);
        downloadBtn.download = `backup_seguros_${new Date().toISOString().split('T')[0]}.json`;
        downloadBtn.style.display = 'none';
        
        document.body.appendChild(downloadBtn);
        downloadBtn.click();
        document.body.removeChild(downloadBtn);
    }

    showCompletionSummary() {
        // Opcional: mostrar estadísticas de las respuestas
        const insuranceChoices = this.responses.filter(r => r.chosen !== 3).length;
        const noBuyChoices = this.responses.filter(r => r.chosen === 3).length;
        
        console.log(`Resumen: ${insuranceChoices} seguros elegidos, ${noBuyChoices} veces "No Comprar"`);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    try {
        new InsuranceStudy();
        console.log('Aplicación de estudio de seguros inicializada');
    } catch (error) {
        console.error('Error inicializando la aplicación:', error);
        alert('Error cargando la aplicación. Por favor, recarga la página.');
    }
});

// Manejar errores no capturados
window.addEventListener('error', function(e) {
    console.error('Error no capturado:', e.error);
});
