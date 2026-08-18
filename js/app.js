// js/app.js
import { gameState, inicializarJuego } from './logic/game.js';
import { renderColeccion, renderizarBatallaCompleta, renderizarBatallaVacia } from './dom/render.js';
import { conectarEventosColeccion, conectarEventosBatalla } from './dom/events.js';

/**
 * Main application initializer
 */
async function iniciarApp() {
  try {
    const isPagesFolder = window.location.pathname.includes('/pages/');
    const jsonPath = isPagesFolder ? '../data/data.json' : 'data/data.json';

    const respuesta = await fetch(jsonPath);
    if (!respuesta.ok) {
      throw new Error(`HTTP error status: ${respuesta.status}`);
    }

    const cartas = await respuesta.json();
    gameState.todasLasCartas = cartas;

    const pagePath = window.location.pathname;

    if (pagePath.includes('collection.html')) {
      inicializarPaginaColeccion(cartas);
    } else if (pagePath.includes('battle.html')) {
      inicializarPaginaBatalla(cartas);
    } else {
      inicializarHome(cartas);
    }

  } catch (error) {
    console.error('Error cargando las cartas del juego:', error);
  }
}

/**
 * Page setup: Collection & Deck Builder
 */
function inicializarPaginaColeccion(todasLasCartas) {
  let savedDeck = [];
  try {
    const saved = localStorage.getItem('selectedDeck');
    if (saved) savedDeck = JSON.parse(saved);
  } catch (e) {}

  if (!Array.isArray(savedDeck) || savedDeck.length !== 5) {
    savedDeck = [];
  }

  gameState.selectedDeckIds = savedDeck;

  renderColeccion(todasLasCartas, gameState.selectedDeckIds);
  conectarEventosColeccion(todasLasCartas);
}

/**
 * Page setup: Battle Arena
 */
function inicializarPaginaBatalla(todasLasCartas) {
  let playerCardIds = [];
  try {
    const saved = localStorage.getItem('selectedDeck');
    if (saved) playerCardIds = JSON.parse(saved);
  } catch (e) {}

  if (!Array.isArray(playerCardIds) || playerCardIds.length !== 5) {
    inicializarJuego([], []);
    renderizarBatallaVacia();
    conectarEventosBatalla(todasLasCartas);
    return;
  }

  const mazoJugador = playerCardIds
    .map(id => todasLasCartas.find(c => c.id === id))
    .filter(Boolean);

  if (mazoJugador.length !== 5) {
    inicializarJuego([], []);
    renderizarBatallaVacia();
    conectarEventosBatalla(todasLasCartas);
    return;
  }

  // Random CPU team assignment: 5 random cards from pool
  const poolCPU = [...todasLasCartas].sort(() => Math.random() - 0.5);
  const mazoRival = poolCPU.slice(0, 5);

  inicializarJuego(mazoJugador, mazoRival);
  renderizarBatallaCompleta();
  conectarEventosBatalla(todasLasCartas);
}

/**
 * Home page setup
 */
function inicializarHome() {
  // Home page setup if needed
}

document.addEventListener('DOMContentLoaded', iniciarApp);