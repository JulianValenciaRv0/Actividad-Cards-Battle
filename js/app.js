// js/app.js
import { gameState, inicializarJuego } from './logic/game.js';
import {
  renderColeccion,
  renderizarBatallaCompleta,
  renderizarBatallaVacia,
  actualizarPildorasNombreUsuario,
  mostrarModalNombreJugador,
  renderizarRankingPage
} from './dom/render.js';
import {
  conectarEventosColeccion,
  conectarEventosBatalla,
  conectarEventosGlobales,
  conectarEventosPerfil,
  conectarEventosRanking
} from './dom/events.js';

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

    // Actualizar nombre e avatar del jugador en el header
    actualizarPildorasNombreUsuario();
    conectarEventosGlobales();

    // Solicitar nombre al jugador si es su primera vez o no tiene nombre guardado
    const nombreGuardado = localStorage.getItem('mythicClash_playerName');
    if (!nombreGuardado) {
      mostrarModalNombreJugador();
    }

    const pagePath = window.location.pathname;

    if (pagePath.includes('collection.html')) {
      inicializarPaginaColeccion(cartas);
    } else if (pagePath.includes('battle.html')) {
      inicializarPaginaBatalla(cartas);
    } else if (pagePath.includes('ranking.html')) {
      inicializarPaginaRanking();
    } else if (pagePath.includes('login.html')) {
      inicializarPaginaPerfil();
    } else {
      inicializarHome(cartas);
    }

  } catch (error) {
    console.error('Error cargando las cartas del juego:', error);
  }
}

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

  const poolCPU = [...todasLasCartas].sort(() => Math.random() - 0.5);
  const mazoRival = poolCPU.slice(0, 5);

  inicializarJuego(mazoJugador, mazoRival);
  renderizarBatallaCompleta();
  conectarEventosBatalla(todasLasCartas);
}

function inicializarPaginaRanking() {
  renderizarRankingPage('all');
  conectarEventosRanking();
}

function inicializarPaginaPerfil() {
  conectarEventosPerfil();
}

function inicializarHome() {
}

document.addEventListener('DOMContentLoaded', iniciarApp);