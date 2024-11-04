class StrategyGame {
    constructor() {
        this.players = [];
        this.currentPlayerIndex = 0;
        this.playerColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
        this.selectedCountries = new Map();
        this.gameData = gameData;
        this.pointsMap = new Map();
        this.pawnPlacements = new Map();
        this.gamePhase = 'setup';
        this.init();
    }

    init() {
        this.gameData.points.forEach(point => {
            this.pointsMap.set(point.id, point);
        });
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        
        const countryButtons = document.querySelectorAll('.country-btn');
        countryButtons.forEach(button => {
            button.addEventListener('click', (e) => this.selectCountry(e.target));
        });
    }

    // Добавен липсващ метод
    updateCurrentPlayerDisplay() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        const currentPlayerDiv = document.getElementById('current-player');
        if (this.gamePhase === 'country-selection') {
            currentPlayerDiv.innerHTML = `
                <h3>Играч ${currentPlayer.id} избира държава</h3>
                <p>Избрани държави: ${currentPlayer.countries.map(c => this.gameData.countries[c].name).join(', ')}</p>
            `;
        }
    }

    // Добавен липсващ метод
    calculateMaxCountriesPerPlayer() {
        const playerCount = this.players.length;
        if (playerCount === 2) return 4;
        if (playerCount === 3) return 3;
        if (playerCount === 4) return 2;
        return 0;
    }

    startGame() {
        const playerCount = parseInt(document.getElementById('players-count').value);
        const pawnsCount = parseInt(document.getElementById('pawns-count').value);

        if (pawnsCount < 1) {
            alert('Моля въведете валиден брой пулове');
            return;
        }

        this.players = Array.from({length: playerCount}, (_, i) => ({
            id: i + 1,
            pawns: pawnsCount,
            remainingPawns: pawnsCount,
            color: this.playerColors[i],
            countries: [],
            territory: new Set()
        }));

        this.gamePhase = 'country-selection';
        document.getElementById('setup-menu').classList.add('hidden');
        document.getElementById('country-selection').classList.remove('hidden');
        this.updateCurrentPlayerDisplay();
    }

    // Добавен липсващ метод
    getPointColor(point) {
        if (point.country && this.selectedCountries.has(point.country)) {
            return this.selectedCountries.get(point.country).color;
        }
        return '#808080';
    }

    // Добавен липсващ метод
    nextTurn() {
        const maxCountriesPerPlayer = this.calculateMaxCountriesPerPlayer();
        const allPlayersSelected = this.players.every(player => 
            player.countries.length >= maxCountriesPerPlayer);

        if (allPlayersSelected) {
            this.startMainGame();
            return;
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.updateCurrentPlayerDisplay();
    }

    selectCountry(button) {
        if (button.classList.contains('selected')) return;

        const country = button.dataset.country;
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        const maxCountriesPerPlayer = this.calculateMaxCountriesPerPlayer();
        if (currentPlayer.countries.length >= maxCountriesPerPlayer) return;

        button.classList.add('selected');
        button.disabled = true;
        
        currentPlayer.countries.push(country);
        this.selectedCountries.set(country, currentPlayer);
        
        this.gameData.points.forEach(point => {
            if (point.country === country) {
                currentPlayer.territory.add(point.id);
            }
        });

        this.nextTurn();
    }

    startMainGame() {
        this.gamePhase = 'pawn-placement';
        document.getElementById('country-selection').classList.add('hidden');
        document.getElementById('game-board').classList.remove('hidden');
        document.getElementById('info-panel').classList.remove('hidden');
        this.drawMap();
        this.updateGameInfo();
        this.setupPawnPlacement();
    }

    setupPawnPlacement() {
        const pointsGroup = document.getElementById('points');
        const circles = pointsGroup.getElementsByTagName('circle');
        
        Array.from(circles).forEach(circle => {
            circle.addEventListener('click', (e) => {
                const pointId = e.target.getAttribute('data-id');
                this.handlePointClick(pointId);
            });
        });
    }

    handlePointClick(pointId) {
        if (this.gamePhase !== 'pawn-placement') return;

        // Намиране на играча, който притежава тази точка
        const player = this.players.find(p => p.territory.has(pointId));
        if (!player) return; // Точката не принадлежи на никой играч
        
        if (player.remainingPawns <= 0) {
            alert(`Играч ${player.id} няма повече пулове за поставяне`);
            return;
        }

        const currentPawns = this.pawnPlacements.get(pointId) || 0;
        const input = prompt(
            `Колко пула искате да поставите на тази точка? (Налични: ${player.remainingPawns})`,
            "1"
        );

        const pawnsToPlace = parseInt(input);
        if (isNaN(pawnsToPlace) || pawnsToPlace < 0) return;
        if (pawnsToPlace > player.remainingPawns) {
            alert('Нямате достатъчно пулове за поставяне');
            return;
        }

        // Обновяване на поставените пулове и оставащите пулове
        this.pawnPlacements.set(pointId, currentPawns + pawnsToPlace);
        player.remainingPawns -= pawnsToPlace;

        // Обновяване на визуализацията
        this.updatePawnVisualization(pointId);
        this.updateGameInfo();

        // Проверка дали всички играчи са поставили пуловете си
        if (this.players.every(p => p.remainingPawns === 0)) {
            this.gamePhase = 'gameplay';
            alert('Всички пулове са поставени! Играта започва!');
        }
    }

    updatePawnVisualization(pointId) {
        const pawnsGroup = document.getElementById('pawns');
        const existingPawn = pawnsGroup.querySelector(`[data-point-id="${pointId}"]`);
        if (existingPawn) {
            pawnsGroup.removeChild(existingPawn);
        }

        const point = this.pointsMap.get(pointId);
        const player = this.players.find(p => p.territory.has(pointId));
        const pawnCount = this.pawnPlacements.get(pointId);

        if (pawnCount && player) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('data-point-id', pointId);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', '12');
            circle.setAttribute('fill', player.color);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', point.x);
            text.setAttribute('y', point.y);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('fill', 'white');
            text.textContent = pawnCount;

            g.appendChild(circle);
            g.appendChild(text);
            pawnsGroup.appendChild(g);
        }
    }

    drawMap() {
        const pointsGroup = document.getElementById('points');
        const connectionsGroup = document.getElementById('connections');
        
        // Изчистване на съществуващите елементи
        pointsGroup.innerHTML = '';
        connectionsGroup.innerHTML = '';

        // Изчертаване на връзките
        this.gameData.points.forEach(point => {
            point.connections.forEach(targetId => {
                const targetPoint = this.pointsMap.get(targetId);
                if (targetPoint) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', point.x);
                    line.setAttribute('y1', point.y);
                    line.setAttribute('x2', targetPoint.x);
                    line.setAttribute('y2', targetPoint.y);
                    line.setAttribute('stroke', '#000');
                    line.setAttribute('stroke-width', '2');
                    connectionsGroup.appendChild(line);
                }
            });
        });

        // Изчертаване на точките
        this.gameData.points.forEach(point => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', point.x);
            circle.setAttribute('cy', point.y);
            circle.setAttribute('r', point.capital ? '8' : '6');
            circle.setAttribute('fill', this.getPointColor(point));
            circle.setAttribute('data-id', point.id);
            pointsGroup.appendChild(circle);
        });
    }

    updateGameInfo() {
        const playersInfo = document.getElementById('players-info');
        playersInfo.innerHTML = this.players.map(player => `
            <div class="player-info">
                <h4 class="player-color-${player.id - 1}">Играч ${player.id}</h4>
                <p>Държави: ${player.countries.map(c => this.gameData.countries[c].name).join(', ')}</p>
                <p>Оставащи пулове за поставяне: ${player.remainingPawns}</p>
            </div>
        `).join('');

        // Обновяване на информацията за текущата фаза
        const currentTurn = document.getElementById('current-turn');
        if (this.gamePhase === 'pawn-placement') {
            currentTurn.innerHTML = '<h3>Фаза: Разполагане на пулове</h3>';
        }
    }

    // ... (останалите съществуващи методи остават същите)
}

// Инициализиране на играта при зареждане на страницата
document.addEventListener('DOMContentLoaded', () => {
    new StrategyGame();
});