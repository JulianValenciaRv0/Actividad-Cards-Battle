// js/logic/game.js

export const gameState = {
  todasLasCartas: [],
  mazoJugador: [],
  mazoRival: [],
  indexCartaActivaJugador: 0,
  indexCartaActivaRival: 0,
  turno: 'jugador', // 'jugador' | 'rival'
  ronda: 1,
  juegoTerminado: false,
  ganador: null,
  selectedDeckIds: [] // Array of selected card IDs in collection view
};

/**
 * Normalizes card data cloned for battle
 */
function clonarCarta(cartaOriginal) {
  return {
    ...cartaOriginal,
    hpMax: cartaOriginal.hpMax || 1000,
    hpActual: cartaOriginal.hpActual !== undefined ? cartaOriginal.hpMax : (cartaOriginal.hpMax || 1000),
    escudo: 0,
    defeated: false,
    habilidades: cartaOriginal.habilidades ? cartaOriginal.habilidades.map(h => ({ ...h })) : []
  };
}

/**
 * Initializes the battle state with selected player deck and random CPU deck
 */
export function inicializarJuego(cartasJugador, cartasRival) {
  gameState.mazoJugador = cartasJugador.map(clonarCarta);
  gameState.mazoRival = cartasRival.map(clonarCarta);
  gameState.indexCartaActivaJugador = 0;
  gameState.indexCartaActivaRival = 0;
  gameState.turno = 'jugador';
  gameState.ronda = 1;
  gameState.juegoTerminado = false;
  gameState.ganador = null;
}

/**
 * Obtains the active non-defeated card for a given side
 */
export function obtenerCartaActiva(bando) {
  const mazo = bando === 'jugador' ? gameState.mazoJugador : gameState.mazoRival;
  let index = bando === 'jugador' ? gameState.indexCartaActivaJugador : gameState.indexCartaActivaRival;
  
  if (!mazo || mazo.length === 0) return null;

  // Search for the first non-defeated card starting from index
  while (index < mazo.length && mazo[index].hpActual <= 0) {
    index++;
  }

  if (bando === 'jugador') {
    gameState.indexCartaActivaJugador = index;
  } else {
    gameState.indexCartaActivaRival = index;
  }

  return mazo[index] || null;
}

/**
 * Calculates remaining alive cards count for player or rival
 */
export function obtenerCartasVivasCount(bando) {
  const mazo = bando === 'jugador' ? gameState.mazoJugador : gameState.mazoRival;
  return mazo.filter(c => c.hpActual > 0).length;
}

/**
 * Calculates total combined HP for a side
 */
export function obtenerHpTotal(bando) {
  const mazo = bando === 'jugador' ? gameState.mazoJugador : gameState.mazoRival;
  const hpActual = mazo.reduce((sum, c) => sum + c.hpActual, 0);
  const hpMax = mazo.reduce((sum, c) => sum + c.hpMax, 0);
  return { hpActual, hpMax };
}

/**
 * Executes a skill casted by the current active turn card
 */
export function ejecutarHabilidad(habilidad) {
  if (gameState.juegoTerminado) return null;

  const atacante = gameState.turno;
  const defensor = atacante === 'jugador' ? 'rival' : 'jugador';

  const cartaAtacante = obtenerCartaActiva(atacante);
  const cartaDefensora = obtenerCartaActiva(defensor);

  if (!cartaAtacante || !cartaDefensora) return null;

  const resultado = {
    atacante,
    defensor,
    nombreHabilidad: habilidad.nombre,
    tipo: habilidad.tipo,
    bandoObjetivo: null,
    danoTotal: 0,
    danoEscudo: 0,
    danoHp: 0,
    escudoOtorgado: 0,
    cartaDefensoraDerrotada: false
  };

  if (habilidad.tipo === 'defensa') {
    const valorEscudo = habilidad.escudo || 120;
    cartaAtacante.escudo += valorEscudo;
    resultado.bandoObjetivo = atacante;
    resultado.escudoOtorgado = valorEscudo;
  } else if (habilidad.tipo === 'ataque' || habilidad.tipo === 'especial') {
    let dano = habilidad.dano || cartaAtacante.damage || 100;
    resultado.danoTotal = dano;
    resultado.bandoObjetivo = defensor;

    let danoRestante = dano;

    if (cartaDefensora.escudo > 0) {
      if (cartaDefensora.escudo >= danoRestante) {
        cartaDefensora.escudo -= danoRestante;
        resultado.danoEscudo = danoRestante;
        danoRestante = 0;
      } else {
        resultado.danoEscudo = cartaDefensora.escudo;
        danoRestante -= cartaDefensora.escudo;
        cartaDefensora.escudo = 0;
      }
    }

    if (danoRestante > 0) {
      resultado.danoHp = danoRestante;
      cartaDefensora.hpActual -= danoRestante;
      if (cartaDefensora.hpActual <= 0) {
        cartaDefensora.hpActual = 0;
        cartaDefensora.defeated = true;
        resultado.cartaDefensoraDerrotada = true;
      }
    }

    // Process defeated state if defender HP is 0
    if (cartaDefensora.hpActual === 0) {
      procesarCartaDerrotada(defensor);
    }
  }

  // Switch turn if game is not finished
  if (!gameState.juegoTerminado) {
    gameState.turno = defensor;
    if (defensor === 'jugador') {
      gameState.ronda++;
    }
  }

  return resultado;
}

/**
 * Handles logic when a card is defeated
 */
function procesarCartaDerrotada(bandoDefensor) {
  if (bandoDefensor === 'jugador') {
    let nextIndex = gameState.indexCartaActivaJugador + 1;
    while (nextIndex < gameState.mazoJugador.length && gameState.mazoJugador[nextIndex].hpActual <= 0) {
      nextIndex++;
    }
    gameState.indexCartaActivaJugador = nextIndex;
    if (nextIndex >= gameState.mazoJugador.length) {
      finalizarJuego('rival');
    }
  } else {
    let nextIndex = gameState.indexCartaActivaRival + 1;
    while (nextIndex < gameState.mazoRival.length && gameState.mazoRival[nextIndex].hpActual <= 0) {
      nextIndex++;
    }
    gameState.indexCartaActivaRival = nextIndex;
    if (nextIndex >= gameState.mazoRival.length) {
      finalizarJuego('jugador');
    }
  }
}

function finalizarJuego(ganador) {
  gameState.juegoTerminado = true;
  gameState.ganador = ganador;
}