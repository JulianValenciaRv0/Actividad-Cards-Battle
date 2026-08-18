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

function esRecargaDePagina() {
  try {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries.length > 0) {
      return navEntries[0].type === 'reload';
    }
    return performance.navigation && performance.navigation.type === 1;
  } catch (e) {
    return false;
  }
}

function esPaginaPrincipal() {
  const path = window.location.pathname;
  return path.endsWith('index.html') || path === '/' || path.endsWith('/') ||
    (!path.includes('collection.html') && !path.includes('battle.html') && !path.includes('ranking.html') && !path.includes('login.html'));
}

function irAPaginaPrincipal() {
  const isPagesFolder = window.location.pathname.includes('/pages/');
  const target = isPagesFolder ? '../index.html' : 'index.html';
  window.location.href = target;
}

async function iniciarApp() {
  try {
    const isReload = esRecargaDePagina();

    // Si la página se recargó (F5), invalidamos la sesión activa
    if (isReload) {
      sessionStorage.removeItem('mythicClash_sessionActive');
    }

    const sessionActive = sessionStorage.getItem('mythicClash_sessionActive') === 'true';

    // Si NO hay sesión activa (primera entrada, recarga F5 o pestaña/puerto nuevo):
    if (!sessionActive) {
      // Redirigir a la página principal si está en una subpágina
      if (!esPaginaPrincipal()) {
        irAPaginaPrincipal();
        return;
      }
      // Mostrar modal para solicitar nombre e icono en la página principal
      mostrarModalNombreJugador();
    }

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