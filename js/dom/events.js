// js/dom/events.js
import { gameState, ejecutarHabilidad, obtenerCartaActiva, inicializarJuego } from '../logic/game.js';
import {
  renderColeccion,
  renderizarBatallaCompleta,
  dispararTemblor,
  dispararDanoEmergente,
  agregarLogBatalla,
  renderizarFinDeJuego,
  obtenerNombreJugador,
  obtenerIconoJugador,
  guardarNombreJugador,
  mostrarModalNombreJugador,
  renderizarRankingPage,
  AVATARES_DISPONIBLES
} from './render.js';

let filtroTexto = '';
let filtroElemento = 'all';

/**
 * Initializes event listeners on the Collection / Deck Builder page
 */
export function conectarEventosColeccion(todasLasCartas) {
  const searchInput = document.getElementById('card-search-input');
  const filterPills = document.querySelectorAll('.filter-pill');
  const collectionGrid = document.getElementById('collection-grid');
  const slotsContainer = document.getElementById('deck-slots-container');
  const btnStartBattle = document.getElementById('btn-start-battle');

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filtroTexto = e.target.value;
      renderColeccion(todasLasCartas, gameState.selectedDeckIds, filtroTexto, filtroElemento);
    });
  }

  // Element filter pills handler
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      filtroElemento = pill.dataset.filter || 'all';
      renderColeccion(todasLasCartas, gameState.selectedDeckIds, filtroTexto, filtroElemento);
    });
  });

  // Card select/deselect handler in collection grid
  if (collectionGrid) {
    collectionGrid.addEventListener('click', (e) => {
      const cardItem = e.target.closest('.card-item');
      if (!cardItem) return;

      const cardId = parseInt(cardItem.dataset.cardId, 10);
      if (isNaN(cardId)) return;

      toggleSeleccionCarta(cardId, todasLasCartas);
    });
  }

  // Remove card handler in deck slots container
  if (slotsContainer) {
    slotsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-remove-slot')) {
        e.stopPropagation();
        const cardId = parseInt(e.target.dataset.cardId, 10);
        if (!isNaN(cardId)) {
          toggleSeleccionCarta(cardId, todasLasCartas);
        }
      }
    });
  }

  // Start Battle button handler
  if (btnStartBattle) {
    btnStartBattle.addEventListener('click', () => {
      if (gameState.selectedDeckIds.length === 5) {
        localStorage.setItem('selectedDeck', JSON.stringify(gameState.selectedDeckIds));
        const targetPage = window.location.pathname.includes('/pages/') ? 'battle.html' : 'pages/battle.html';
        window.location.href = targetPage;
      } else {
        alert('Debes seleccionar exactamente 5 cartas para tu mazo antes de iniciar la batalla.');
      }
    });
  }
}

/**
 * Toggles a card in the selected deck (up to 5 cards max)
 */
function toggleSeleccionCarta(cardId, todasLasCartas) {
  const index = gameState.selectedDeckIds.indexOf(cardId);
  if (index > -1) {
    gameState.selectedDeckIds.splice(index, 1);
  } else {
    if (gameState.selectedDeckIds.length >= 5) {
      alert('¡Tu mazo ya tiene 5 cartas! Quita una carta antes de agregar otra.');
      return;
    }
    gameState.selectedDeckIds.push(cardId);
  }

  renderColeccion(todasLasCartas, gameState.selectedDeckIds, filtroTexto, filtroElemento);
}

/**
 * Initializes event listeners on the Battle Arena page
 */
export function conectarEventosBatalla(todasLasCartas) {
  const skillsContainer = document.getElementById('skills-container');
  const btnEndTurn = document.getElementById('btn-end-turn');
  const btnRestart = document.getElementById('btn-restart-battle');
  const modal = document.getElementById('game-over-modal');

  // Player skill click handler
  if (skillsContainer) {
    skillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.skill-btn');
      if (!btn || btn.disabled) return;

      if (gameState.juegoTerminado || gameState.turno !== 'jugador') return;

      const skillIndex = parseInt(btn.dataset.skillIndex, 10);
      const cartaJugador = obtenerCartaActiva('jugador');

      if (!cartaJugador || !cartaJugador.habilidades || !cartaJugador.habilidades[skillIndex]) return;

      const habilidadElegida = cartaJugador.habilidades[skillIndex];
      const res = ejecutarHabilidad(habilidadElegida);

      if (!res) return;

      // Handle UI animations & logs for Player action
      if (res.tipo === 'defensa') {
        dispararDanoEmergente('jugador', `🛡️ +${res.escudoOtorgado}`, 'shield');
        agregarLogBatalla(`🛡️ ¡${cartaJugador.name} activó ${res.nombreHabilidad} (+${res.escudoOtorgado} Escudo)!`);
      } else {
        dispararTemblor('rival');
        const txt = res.danoEscudo > 0
          ? `🛡️-${res.danoEscudo} 💥-${res.danoHp}`
          : `💥-${res.danoHp} HP`;
        dispararDanoEmergente('rival', txt, res.tipo === 'especial' ? 'special' : 'normal');
        agregarLogBatalla(`💥 ¡${cartaJugador.name} usó ${res.nombreHabilidad} e infligió ${res.danoTotal} de daño!`);
      }

      renderizarBatallaCompleta();

      if (gameState.juegoTerminado) {
        renderizarFinDeJuego();
        return;
      }

      // Schedule CPU turn after 1000ms delay
      setTimeout(() => {
        ejecutarTurnoRival();
      }, 1000);
    });
  }

  // End turn button handler (pass turn)
  if (btnEndTurn) {
    btnEndTurn.addEventListener('click', () => {
      if (gameState.juegoTerminado || gameState.turno !== 'jugador') return;
      gameState.turno = 'rival';
      agregarLogBatalla('⌛ Has finalizado tu turno.');
      renderizarBatallaCompleta();
      setTimeout(() => {
        ejecutarTurnoRival();
      }, 800);
    });
  }

  // Restart battle button handler
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      reiniciarBatalla(todasLasCartas);
    });
  }

  // Intercept click on "VOLVER A COLECCIÓN" links/buttons in modal or navbar to reset deck
  if (modal) {
    modal.addEventListener('click', (e) => {
      const returnBtn = e.target.closest('a[href*="collection.html"]');
      if (returnBtn) {
        localStorage.removeItem('selectedDeck');
        gameState.selectedDeckIds = [];
      }
    });
  }
}

/**
 * Executes automated turn for CPU (rival)
 */
function ejecutarTurnoRival() {
  if (gameState.juegoTerminado) return;

  const cartaRival = obtenerCartaActiva('rival');
  if (!cartaRival || !cartaRival.habilidades || cartaRival.habilidades.length === 0) return;

  const randIdx = Math.floor(Math.random() * cartaRival.habilidades.length);
  const habilidadRival = cartaRival.habilidades[randIdx];

  const res = ejecutarHabilidad(habilidadRival);
  if (!res) return;

  if (res.tipo === 'defensa') {
    dispararDanoEmergente('rival', `🛡️ +${res.escudoOtorgado}`, 'shield');
    agregarLogBatalla(`🛡️ La IA (${cartaRival.name}) usó ${res.nombreHabilidad} (+${res.escudoOtorgado} Escudo).`);
  } else {
    dispararTemblor('jugador');
    const txt = res.danoEscudo > 0
      ? `🛡️-${res.danoEscudo} 💥-${res.danoHp}`
      : `💥-${res.danoHp} HP`;
    dispararDanoEmergente('jugador', txt, res.tipo === 'especial' ? 'special' : 'normal');
    agregarLogBatalla(`🤖 La IA (${cartaRival.name}) atacó con ${res.nombreHabilidad} e infligió ${res.danoTotal} de daño.`);
  }

  renderizarBatallaCompleta();

  if (gameState.juegoTerminado) {
    renderizarFinDeJuego();
  }
}

/**
 * Restart battle with selected player deck and new random CPU deck
 */
export function reiniciarBatalla(todasLasCartas) {
  const modal = document.getElementById('game-over-modal');
  if (modal) modal.style.display = 'none';

  let playerCardIds = [];
  try {
    const saved = localStorage.getItem('selectedDeck');
    if (saved) playerCardIds = JSON.parse(saved);
  } catch (e) {}

  if (!playerCardIds || playerCardIds.length < 5) {
    playerCardIds = todasLasCartas.slice(0, 5).map(c => c.id);
  }

  const mazoJugador = playerCardIds.map(id => todasLasCartas.find(c => c.id === id)).filter(Boolean);

  const poolCPU = [...todasLasCartas].sort(() => Math.random() - 0.5);
  const mazoRival = poolCPU.slice(0, 5);

  inicializarJuego(mazoJugador, mazoRival);
  renderizarBatallaCompleta();
  agregarLogBatalla('⚔️ ¡Batalla reiniciada! Selecciona tu habilidad para atacar.');
}

/**
 * Initializes global event listeners (such as clicking the user header pill to edit name)
 */
export function conectarEventosGlobales() {
  const userPill = document.getElementById('header-user-pill');
  if (userPill) {
    userPill.addEventListener('click', () => {
      mostrarModalNombreJugador();
    });
  }
}

/**
 * Initializes event listeners on the Profile page (login.html)
 */
export function conectarEventosPerfil() {
  const form = document.getElementById('profile-name-form');
  const input = document.getElementById('profile-username-input');
  const avatarGrid = document.getElementById('profile-avatar-grid');
  let selectedIcon = obtenerIconoJugador();

  if (avatarGrid) {
    avatarGrid.innerHTML = AVATARES_DISPONIBLES.map(icon => `
      <button type="button" class="avatar-option-btn ${icon === selectedIcon ? 'selected' : ''}" data-icon="${icon}">${icon}</button>
    `).join('');

    avatarGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.avatar-option-btn');
      if (!btn) return;

      avatarGrid.querySelectorAll('.avatar-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedIcon = btn.dataset.icon;
    });
  }

  if (form && input) {
    input.value = obtenerNombreJugador();
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        guardarNombreJugador(val, selectedIcon);
        alert('¡Perfil guardado exitosamente! 🚀');
      }
    });
  }
}

/**
 * Initializes event listeners on the Ranking / Match History page
 */
export function conectarEventosRanking() {
  const filterPills = document.querySelectorAll('[data-ranking-filter]');
  const btnClear = document.getElementById('btn-clear-ranking');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filtro = pill.dataset.rankingFilter || 'all';
      renderizarRankingPage(filtro);
    });
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que deseas borrar todo tu historial de partidas y estadísticas?')) {
        localStorage.removeItem('mythicClash_ranking');
        renderizarRankingPage('all');
      }
    });
  }
}