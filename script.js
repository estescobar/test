// script.js
class InsuranceStudy {
    constructor() {
        this.currentCard = 0;
        this.responses = [];
        this.userData = {};
        this.insuranceDecks = this.generateInsuranceDecks();
        
        this.initializeEventListeners();
    }

    // Generar 10 conjuntos predefinidos de opciones de seguro
    generateInsuranceDecks() {
        return [
            // Deck 1
            [
                {prima: 300, suma: 50000, copago: 0.1},
                {prima: 200, suma: 30000, copago: 0.2},
                {prima: 150, suma: 20000, copago: 0.3}
            ],
            // Deck 2
            [
                {prima: 500, suma: 100000, copago: 0.1},
                {prima: 350, suma: 70000, copago: 0.15},
                {prima: 250, suma: 40000, copago: 0.25}
            ],
            // ... 8 decks más con variaciones estratégicas
        ];
    }

    initializeEventListeners() {
        // Formulario demográfico
        document.getElementById('demographic-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.userData = {
                age: document.getElementById('age').value,
                gender: document.getElementById('gender').value,
                timestamp: new Date().toISOString()
            };
            this.showStep('explanation-step');
        });

        // Inicio del estudio
        document.getElementById('start-study').addEventListener('click', () => {
            this.showStep('cards-step');
            this.displayCurrentCard();
        });

        // Botón "No Comprar"
        document.getElementById('no-buy').addEventListener('click', () => {
            this.recordResponse(3); // 3 representa "no comprar"
        });
    }

    showStep(stepId) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.add('d-none');
        });
        document.getElementById(stepId).classList.remove('d-none');
    }

    displayCurrentCard() {
        const container = document.getElementById('cards-container');
        const currentDeck = this.insuranceDecks[this.currentCard];
        
        container.innerHTML = currentDeck.map((insurance, index) => `
            <div class="col-md-4 mb-3">
                <div class="insurance-card card h-100" data-index="${index}">
                    <div class="card-body text-center">
                        <h5>Opción ${index + 1}</h5>
                        <div class="mb-2">
                            <strong>Prima:</strong> $${insurance.prima}/mes
                        </div>
                        <div class="mb-2">
                            <strong>Cobertura:</strong> $${insurance.suma.toLocaleString()}
                        </div>
                        <div class="mb-2">
                            <strong>Copago:</strong> ${(insurance.copago * 100)}%
                        </div>
                        <small class="text-muted">Tú pagas ${(insurance.copago * 100)}% de cada siniestro</small>
                    </div>
                </div>
            </div>
        `).join('');

        // Agregar event listeners a las tarjetas
        container.querySelectorAll('.insurance-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const selectedIndex = parseInt(e.currentTarget.getAttribute('data-index'));
                this.recordResponse(selectedIndex);
            });
        });

        // Actualizar progreso
        document.getElementById('current-card').textContent = this.currentCard + 1;
        document.getElementById('progress-bar').style.width = `${((this.currentCard + 1) / 10) * 100}%`;
    }

    recordResponse(choiceIndex) {
        this.responses.push({
            card: this.currentCard,
            options: this.insuranceDecks[this.currentCard],
            chosen: choiceIndex,
            timestamp: new Date().toISOString()
        });

        this.currentCard++;

        if (this.currentCard < 10) {
            this.displayCurrentCard();
        } else {
            this.completeStudy();
        }
    }

    async completeStudy() {
        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbxHH7CM7eEBrlrFa0Y_PBSLwa0UiDLIW4hcHWUHJ27oIKrgw8sFSDbD320G5Z8536vk/exec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: this.userData,
                    responses: this.responses
                })
            });

            if (response.ok) {
                this.showStep('completion-step');
            } else {
                throw new Error('Error al enviar datos');
            }
        } catch (error) {
            alert('Error al guardar respuestas. Por favor, recarga la página e intenta nuevamente.');
            console.error('Error:', error);
        }
    }
}

// Inicializar la aplicación
new InsuranceStudy();
