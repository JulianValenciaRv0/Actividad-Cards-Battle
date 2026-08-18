// js/dom/render.js
import { gameState, obtenerCartaActiva, obtenerHpTotal, obtenerCartasVivasCount } from '../logic/game.js';

export function fixImagePath(path) {
  if (!path) return '../assets/images/dragon.jpg';
  const isPagesFolder = window.location.pathname.includes('/pages/');
  if (isPagesFolder && path.startsWith('assets/')) {
    return '../' + path;
  }
  if (!isPagesFolder && path.startsWith('../assets/')) {
    return path.replace('../', '');
  }
  return path;
}

export function getElementTag(element) {
  switch (element ? element.toLowerCase() : '') {
    case 'fuego': case 'fire': return '🔥';
    case 'agua': case 'water': return '❄️';
    case 'tierra': case 'earth': return '🌿';
    case 'oscuridad': case 'dark': return '🔮';
    case 'aire': case 'air': return '⚡';
    default: return '✨';
  }
}

export function getRarityColor(rarity) {
  switch (rarity ? rarity.toLowerCase() : '') {
    case 'legendary': case 'legendaria': return 'var(--rarity-legendary)';
    case 'epic': case 'épica': case 'epica': return 'var(--rarity-epic)';
    case 'rare': case 'rara': return 'var(--rarity-rare)';
    default: return 'var(--rarity-common)';
  }
}

export function renderColeccion(cartas, selectedIds, filtroNombre = '', filtroElemento = 'all') {
  const container = document.getElementById('collection-grid');
  if (!container) return;

  container.innerHTML = '';

  const cartasFiltradas = cartas.filter(carta => {
    const coincideNombre = carta.name.toLowerCase().includes(filtroNombre.toLowerCase());
    let coincideElemento = true;
    if (filtroElemento !== 'all') {
      coincideElemento = carta.element.toLowerCase() === filtroElemento.toLowerCase();
    }
    return coincideNombre && coincideElemento;
  });

  if (cartasFiltradas.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #94a3b8;">
        <h3>No se encontraron cartas</h3>
        <p>Prueba con otros términos de búsqueda o filtros.</p>
      </div>
    `;
    return;
  }

  cartasFiltradas.forEach(carta => {
    const estaSeleccionada = selectedIds.includes(carta.id);
    const cardEl = document.createElement('div');
    cardEl.className = `card-item ${estaSeleccionada ? 'selected-card' : ''}`;
    cardEl.dataset.cardId = carta.id;
    cardEl.dataset.rarity = carta.rarity || 'common';

    const habs = carta.habilidades || [];
    const previewHabs = habs.slice(0, 2).map(h => `<li class="card-skill-item">${h.nombre}</li>`).join('');

    cardEl.innerHTML = `
      <div class="card-header-bar">
        <span class="card-mana-badge">${carta.id}</span>
        <span class="card-name-title">${carta.name}</span>
        <span class="card-element-tag">${getElementTag(carta.element)}</span>
      </div>
      <div class="card-image-wrapper">
        <img src="${fixImagePath(carta.image)}" alt="${carta.name}" loading="lazy">
      </div>
      <div class="card-body-details">
        <div class="card-type-rarity">
          <span>${carta.element || 'Místico'}</span>
          <span style="color: ${getRarityColor(carta.rarity)}; font-weight: bold;">${carta.rarity || 'Común'}</span>
        </div>
        <p class="card-description">${carta.description || 'Sin descripción disponible.'}</p>
        <div class="card-skills-container">
          <span class="card-skills-title">Habilidades (${habs.length}):</span>
          <ul class="card-skills-list">
            ${previewHabs}
          </ul>
        </div>
        <div class="card-stats-footer">
          <span class="stat-badge hp">❤️ HP: ${carta.hpMax}</span>
          <span class="stat-badge damage">💥 Daño: ${carta.damage || 150}</span>
        </div>
        <button class="card-action-btn ${estaSeleccionada ? 'btn-remove' : ''}" data-card-id="${carta.id}">
          ${estaSeleccionada ? '✓ Quitar del Mazo' : '+ Agregar al Mazo'}
        </button>
      </div>
    `;

    container.appendChild(cardEl);
  });

  renderMazoSeleccionado(cartas, selectedIds);
}

export function renderMazoSeleccionado(todasLasCartas, selectedIds) {
  const counterEl = document.getElementById('deck-counter');
  const manaEl = document.getElementById('stat-mana');
  const damageEl = document.getElementById('stat-damage');
  const btnStart = document.getElementById('btn-start-battle');
  const slotsContainer = document.getElementById('deck-slots-container');

  if (counterEl) counterEl.textContent = `${selectedIds.length} / 5 Cartas`;

  const cartasSeleccionadas = selectedIds.map(id => todasLasCartas.find(c => c.id === id)).filter(Boolean);

  if (damageEl) {
    const danoTotal = cartasSeleccionadas.reduce((sum, c) => sum + (c.damage || 150), 0);
    damageEl.textContent = danoTotal;
  }
  if (manaEl) {
    const hpProm = cartasSeleccionadas.length > 0
      ? (cartasSeleccionadas.reduce((sum, c) => sum + c.hpMax, 0) / cartasSeleccionadas.length).toFixed(0)
      : '0';
    manaEl.textContent = hpProm;
  }

  if (btnStart) {
    if (selectedIds.length === 5) {
      btnStart.removeAttribute('disabled');
      btnStart.style.opacity = '1';
      btnStart.style.cursor = 'pointer';
      btnStart.classList.add('pulse-glow');
    } else {
      btnStart.setAttribute('disabled', 'true');
      btnStart.style.opacity = '0.5';
      btnStart.style.cursor = 'not-allowed';
      btnStart.classList.remove('pulse-glow');
    }
  }

  if (!slotsContainer) return;

  slotsContainer.innerHTML = '';

  for (let i = 0; i < 5; i++) {
    const carta = cartasSeleccionadas[i];
    const slotEl = document.createElement('div');
    slotEl.dataset.slot = i + 1;

    if (carta) {
      slotEl.className = 'deck-slot filled';
      slotEl.innerHTML = `
        <div class="card-header-bar" style="width: 100%; padding: 0.2rem 0.5rem; font-size: 0.7rem;">
          <span class="card-name-title">${carta.name}</span>
          <button class="btn-remove-slot" data-card-id="${carta.id}" title="Quitar">✕</button>
        </div>
        <div style="width: 100%; height: 75%; overflow: hidden; position: relative;">
          <img src="${fixImagePath(carta.image)}" alt="${carta.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="font-size: 0.7rem; font-family: var(--font-stats); color: var(--neon-cyan); padding: 0.2rem;">
          ❤️ ${carta.hpMax} | 💥 ${carta.damage || 150}
        </div>
      `;
    } else {
      slotEl.className = 'deck-slot empty';
      slotEl.innerHTML = `
        <div class="slot-icon">➕</div>
        <div class="slot-number">SLOT ${i + 1}</div>
        <span style="font-size: 0.7rem; color: #94a3b8; margin-top: 0.2rem;">Vacío</span>
      `;
    }

    slotsContainer.appendChild(slotEl);
  }
}


export function renderizarBatallaCompleta() {
  actualizarHUDGlobal();
  renderizarCartaActiva1vs1('jugador');
  renderizarCartaActiva1vs1('rival');
  renderizarHabilidadesActivas();
  renderizarTablero5vs5();
  actualizarIndicadorTurno();
}

/**
 * Renders battle arena when no deck is loaded (empty slots)
 */
export function renderizarBatallaVacia() {
  actualizarHUDGlobal();

  const playerSlot = document.getElementById('player-active-card');
  const aiSlot = document.getElementById('ai-active-card');
  const skillsContainer = document.getElementById('skills-container');
  const playerBoard = document.getElementById('player-full-board');
  const aiBoard = document.getElementById('ai-full-board');
  const turnEl = document.getElementById('turn-indicator');

  if (playerSlot) {
    playerSlot.innerHTML = `
      <div style="padding: 2.5rem 1rem; text-align: center; color: #94a3b8; font-family: var(--font-heading); font-size: 0.85rem;">
        ⚠️ SLOT VACÍO<br><br>
        <span style="font-size: 0.75rem; color: var(--neon-cyan);">Ve a la Colección y elige 5 cartas para combatir</span>
      </div>
    `;
  }

  if (aiSlot) {
    aiSlot.innerHTML = `
      <div style="padding: 2.5rem 1rem; text-align: center; color: #94a3b8; font-family: var(--font-heading); font-size: 0.85rem;">
        🤖 OPONENTE IA<br><br>
        <span style="font-size: 0.75rem; color: #ff0055;">Esperando desafío de mazo</span>
      </div>
    `;
  }

  if (skillsContainer) {
    skillsContainer.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 1.5rem; color: #94a3b8; font-family: var(--font-body);">
        <a href="collection.html" class="btn btn-primary">🎴 Ir a Colección y Armar Mazo</a>
      </div>
    `;
  }

  if (playerBoard) {
    playerBoard.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      playerBoard.innerHTML += `
        <div class="board-card-slot empty">
          <div class="slot-icon">🎮</div>
          <div class="slot-number">TU SLOT ${i}</div>
        </div>
      `;
    }
  }

  if (aiBoard) {
    aiBoard.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      aiBoard.innerHTML += `
        <div class="board-card-slot empty">
          <div class="slot-icon">🤖</div>
          <div class="slot-number">SLOT IA ${i}</div>
        </div>
      `;
    }
  }

  if (turnEl) {
    turnEl.textContent = 'ESPERANDO MAZO DE 5 CARTAS... 🎴';
    turnEl.style.borderColor = 'var(--neon-gold)';
  }

  agregarLogBatalla('⚠️ No has cargado un mazo de 5 cartas. Haz clic en "Ir a Colección y Armar Mazo", selecciona tus 5 cartas y dale a "¡INICIAR BATALLA!".');
}

/**
 * Updates global HUD team HP bars
 */
export function actualizarHUDGlobal() {
  const hpPlayer = obtenerHpTotal('jugador');
  const hpRival = obtenerHpTotal('rival');

  const playerHpText = document.getElementById('player-hp-text');
  const playerHpBar = document.getElementById('player-hp-bar');
  const aiHpText = document.getElementById('ai-hp-text');
  const aiHpBar = document.getElementById('ai-hp-bar');

  if (playerHpText && playerHpBar) {
    playerHpText.textContent = `${hpPlayer.hpActual} / ${hpPlayer.hpMax}`;
    const pct = hpPlayer.hpMax > 0 ? (hpPlayer.hpActual / hpPlayer.hpMax) * 100 : 0;
    playerHpBar.style.width = `${pct}%`;
  }

  if (aiHpText && aiHpBar) {
    aiHpText.textContent = `${hpRival.hpActual} / ${hpRival.hpMax}`;
    const pct = hpRival.hpMax > 0 ? (hpRival.hpActual / hpRival.hpMax) * 100 : 0;
    aiHpBar.style.width = `${pct}%`;
  }
}

/**
 * Renders 1vs1 active card slot for Player or Rival
 */
export function renderizarCartaActiva1vs1(bando) {
  const carta = obtenerCartaActiva(bando);
  const containerId = bando === 'jugador' ? 'player-active-card' : 'ai-active-card';
  const valId = bando === 'jugador' ? 'player-card-hp-val' : 'ai-card-hp-val';
  const fillId = bando === 'jugador' ? 'player-card-hp-fill' : 'ai-card-hp-fill';

  const slotContainer = document.getElementById(containerId);
  const hpValEl = document.getElementById(valId);
  const hpFillEl = document.getElementById(fillId);

  if (!slotContainer) return;

  if (!carta) {
    slotContainer.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #ff0055; font-family: var(--font-heading);">
        💀 CARTA ELIMINADA
      </div>
    `;
    if (hpValEl) hpValEl.textContent = '0 / 0';
    if (hpFillEl) hpFillEl.style.width = '0%';
    return;
  }

  slotContainer.dataset.rarity = carta.rarity || 'common';
  slotContainer.innerHTML = `
    <div class="card-header-bar">
      <span class="card-mana-badge">${carta.id}</span>
      <span class="card-name-title">${carta.name}</span>
      <span class="card-element-tag">${getElementTag(carta.element)}</span>
    </div>
    <div class="card-image-wrapper">
      <img src="${fixImagePath(carta.image)}" alt="${carta.name}">
    </div>
    <div class="card-body-details" style="padding: 0.4rem;">
      <div class="card-stats-footer">
        <span class="stat-badge hp">❤️ ${carta.hpActual} / ${carta.hpMax}</span>
        <span class="stat-badge damage">${carta.escudo > 0 ? `🛡️ ${carta.escudo}` : `💥 ${carta.damage || 150}`}</span>
      </div>
    </div>
  `;

  if (hpValEl) hpValEl.textContent = `${carta.hpActual} / ${carta.hpMax}`;
  if (hpFillEl) {
    const pct = (carta.hpActual / carta.hpMax) * 100;
    hpFillEl.style.width = `${pct}%`;
  }
}

/**
 * Dynamic rendering of the active player card's 6 skills (4 normal, 1 special, 1 shield)
 */
export function renderizarHabilidadesActivas() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  const cartaActiva = obtenerCartaActiva('jugador');
  container.innerHTML = '';

  if (!cartaActiva || gameState.juegoTerminado) return;

  const habilidades = cartaActiva.habilidades || [];

  habilidades.forEach((hab, index) => {
    const btn = document.createElement('button');
    btn.className = 'skill-btn';
    btn.dataset.skillIndex = index;

    let icon = '⚔️';
    let typeClass = 'skill-normal';

    if (hab.tipo === 'defensa') {
      icon = '🛡️';
      typeClass = 'skill-shield';
    } else if (hab.tipo === 'especial') {
      icon = '🔮';
      typeClass = 'skill-special';
    } else {
      const icons = ['⚔️', '🔥', '💥', '⚡'];
      icon = icons[index % icons.length];
    }

    btn.classList.add(typeClass);

    const valorText = hab.tipo === 'defensa' ? `🛡️ +${hab.escudo}` : `💥 ${hab.dano}`;

    btn.innerHTML = `
      <span class="skill-cost-badge">${index + 1}</span>
      <div class="skill-icon">${icon}</div>
      <span class="skill-name">${hab.nombre}</span>
      <span style="font-size: 0.65rem; color: #cbd5e1;">${valorText}</span>
    `;

    if (gameState.turno !== 'jugador') {
      btn.setAttribute('disabled', 'true');
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    }

    container.appendChild(btn);
  });
}

/**
 * Dynamic rendering of the 5vs5 full board for both teams
 */
export function renderizarTablero5vs5() {
  const playerBoard = document.getElementById('player-full-board');
  const aiBoard = document.getElementById('ai-full-board');

  if (playerBoard) {
    playerBoard.innerHTML = '';
    gameState.mazoJugador.forEach((carta, i) => {
      const isCurrentActive = i === gameState.indexCartaActivaJugador && carta.hpActual > 0;
      const isDefeated = carta.hpActual <= 0;

      const cardEl = document.createElement('div');
      cardEl.className = `card-item ${isCurrentActive ? 'board-card-active' : ''} ${isDefeated ? 'board-card-defeated' : ''}`;
      cardEl.dataset.rarity = carta.rarity || 'common';

      cardEl.innerHTML = `
        <div class="card-header-bar">
          <span class="card-mana-badge">${i + 1}</span>
          <span class="card-name-title">${carta.name}</span>
          <span class="card-element-tag">${getElementTag(carta.element)}</span>
        </div>
        <div class="card-image-wrapper">
          <img src="${fixImagePath(carta.image)}" alt="${carta.name}">
        </div>
        <div class="card-body-details" style="padding: 0.4rem;">
          <div class="card-stats-footer">
            <span class="stat-badge hp">❤️ ${carta.hpActual} / ${carta.hpMax}</span>
            <span class="stat-badge damage">${carta.escudo > 0 ? `🛡️ ${carta.escudo}` : `💥 ${carta.damage || 150}`}</span>
          </div>
        </div>
      `;
      playerBoard.appendChild(cardEl);
    });
  }

  if (aiBoard) {
    aiBoard.innerHTML = '';
    gameState.mazoRival.forEach((carta, i) => {
      const isCurrentActive = i === gameState.indexCartaActivaRival && carta.hpActual > 0;
      const isDefeated = carta.hpActual <= 0;

      const cardEl = document.createElement('div');
      cardEl.className = `card-item ${isCurrentActive ? 'board-card-active' : ''} ${isDefeated ? 'board-card-defeated' : ''}`;
      cardEl.dataset.rarity = carta.rarity || 'common';

      cardEl.innerHTML = `
        <div class="card-header-bar">
          <span class="card-mana-badge">${i + 1}</span>
          <span class="card-name-title">${carta.name}</span>
          <span class="card-element-tag">${getElementTag(carta.element)}</span>
        </div>
        <div class="card-image-wrapper">
          <img src="${fixImagePath(carta.image)}" alt="${carta.name}">
        </div>
        <div class="card-body-details" style="padding: 0.4rem;">
          <div class="card-stats-footer">
            <span class="stat-badge hp">❤️ ${carta.hpActual} / ${carta.hpMax}</span>
            <span class="stat-badge damage">${carta.escudo > 0 ? `🛡️ ${carta.escudo}` : `💥 ${carta.damage || 150}`}</span>
          </div>
        </div>
      `;
      aiBoard.appendChild(cardEl);
    });
  }
}

/**
 * Updates turn indicator banner
 */
export function actualizarIndicadorTurno() {
  const turnEl = document.getElementById('turn-indicator');
  if (!turnEl) return;

  if (gameState.juegoTerminado) {
    turnEl.textContent = `BATALLA FINALIZADA • ${gameState.ganador === 'jugador' ? '¡VICTORIA!' : 'DERROTA'}`;
    turnEl.style.borderColor = gameState.ganador === 'jugador' ? 'var(--neon-gold)' : 'var(--neon-crimson)';
  } else if (gameState.turno === 'jugador') {
    turnEl.textContent = `RONDA ${gameState.ronda} • TU TURNO ⚔️`;
    turnEl.style.borderColor = 'var(--neon-cyan)';
  } else {
    turnEl.textContent = `RONDA ${gameState.ronda} • TURNO DE LA IA 🤖`;
    turnEl.style.borderColor = 'var(--neon-crimson)';
  }
}

/**
 * Appends entry to battle log ticker
 */
export function agregarLogBatalla(mensaje) {
  const logEl = document.getElementById('battle-log');
  if (logEl) {
    logEl.textContent = mensaje;
  }
}

/**
 * Triggers card shake animation on target container
 */
export function dispararTemblor(bando) {
  const containerId = bando === 'jugador' ? 'player-active-card' : 'ai-active-card';
  const cardEl = document.getElementById(containerId);
  if (!cardEl) return;

  cardEl.classList.remove('card-damage-shake');
  void cardEl.offsetWidth;
  cardEl.classList.add('card-damage-shake');

  setTimeout(() => {
    cardEl.classList.remove('card-damage-shake');
  }, 500);
}

/**
 * Spawns floating damage text popup above the target 1v1 clash card container
 */
export function dispararDanoEmergente(bando, texto, tipo = 'normal') {
  const selector = bando === 'jugador' ? '.active-clash-card.player-side' : '.active-clash-card.ai-side';
  let parent = document.querySelector(selector);
  if (!parent) {
    parent = document.getElementById(bando === 'jugador' ? 'player-active-card' : 'ai-active-card');
  }
  if (!parent) return;

  const popup = document.createElement('div');
  popup.className = `damage-popup ${tipo}-popup`;
  popup.textContent = texto;

  parent.style.position = 'relative';
  parent.appendChild(popup);

  setTimeout(() => {
    if (popup && popup.parentNode) {
      popup.parentNode.removeChild(popup);
    }
  }, 1200);
}

/**
 * Renders victory or defeat modal screen
 */
export function renderizarFinDeJuego() {
  if (!gameState.juegoTerminado) return;

  guardarResultadoBatalla();

  const modal = document.getElementById('game-over-modal');
  if (!modal) return;

  const card = modal.querySelector('.game-over-card');
  const badge = document.getElementById('modal-result-badge');
  const title = document.getElementById('modal-title');
  const desc = document.getElementById('modal-desc');
  const cardsLeft = document.getElementById('modal-cards-left');

  const esGanador = gameState.ganador === 'jugador';
  const vivas = obtenerCartasVivasCount('jugador');

  if (card) {
    if (esGanador) {
      card.classList.remove('defeat');
    } else {
      card.classList.add('defeat');
    }
  }

  if (badge) badge.textContent = esGanador ? '🏆 ¡VICTORIA!' : '💀 DERROTA';
  if (title) title.textContent = esGanador ? '¡Has Conquistado la Arena!' : '¡Tus Cartas Han Sido Caídas!';
  if (desc) desc.textContent = esGanador
    ? 'Derrotaste a las 5 cartas del Comandante IA.'
    : 'La IA ha eliminado todas tus cartas en combate.';
  if (cardsLeft) cardsLeft.textContent = `${vivas} / 5 Cartas Con Vida`;

  modal.style.display = 'flex';
}

export const AVATARES_DISPONIBLES = ['⚔️', '🧙‍♂️', '🦁', '🐲', '🛡️', '⚡', '👑', '🔮', '💀', '🔥', '🌊', '🤖'];

/**
 * Player Name & Icon Management Helpers
 */
export function obtenerNombreJugador() {
  const saved = localStorage.getItem('mythicClash_playerName');
  return (saved && saved.trim()) ? saved.trim() : 'Jugador';
}

export function obtenerIconoJugador() {
  const saved = localStorage.getItem('mythicClash_playerIcon');
  return (saved && saved.trim()) ? saved.trim() : '⚔️';
}

export function guardarNombreJugador(nombre, icono) {
  if (nombre && nombre.trim()) {
    localStorage.setItem('mythicClash_playerName', nombre.trim());
  }
  if (icono && icono.trim()) {
    localStorage.setItem('mythicClash_playerIcon', icono.trim());
  }
  actualizarPildorasNombreUsuario();
}

export function actualizarPildorasNombreUsuario() {
  const nombre = obtenerNombreJugador();
  const icono = obtenerIconoJugador();

  const nameEl = document.getElementById('header-user-name');
  const avatarEl = document.getElementById('header-user-avatar');
  if (nameEl) nameEl.textContent = nombre;
  if (avatarEl) avatarEl.textContent = icono;

  const battleNameEl = document.getElementById('battle-player-name');
  if (battleNameEl) battleNameEl.textContent = `${icono} ${nombre} (Tú)`;

  const battleAvatarEl = document.getElementById('battle-player-avatar');
  if (battleAvatarEl) battleAvatarEl.textContent = icono;

  const profileInput = document.getElementById('profile-username-input');
  if (profileInput) profileInput.value = nombre;
}

/**
 * Player Prompt Modal (asks for name and avatar icon)
 */
export function mostrarModalNombreJugador(onComplete) {
  if (document.getElementById('player-name-modal-overlay')) return;

  const actualNombre = obtenerNombreJugador();
  const actualIcono = obtenerIconoJugador();
  let iconoSeleccionado = actualIcono;

  const overlay = document.createElement('div');
  overlay.className = 'player-modal-overlay';
  overlay.id = 'player-name-modal-overlay';

  const avatarButtonsHtml = AVATARES_DISPONIBLES.map(icon => `
    <button type="button" class="avatar-option-btn ${icon === actualIcono ? 'selected' : ''}" data-icon="${icon}">${icon}</button>
  `).join('');

  overlay.innerHTML = `
    <div class="player-modal-card">
      <div class="player-modal-icon" id="modal-preview-icon">${actualIcono}</div>
      <h2 class="player-modal-title">¡Bienvenido a Mythic Clash!</h2>
      <p class="player-modal-desc">Ingresa tu nombre y selecciona tu icono de Invocador para comenzar a batallar.</p>
      
      <form id="player-modal-form">
        <div class="player-modal-input-group">
          <label for="player-modal-name-input">Nombre de Invocador</label>
          <input type="text" id="player-modal-name-input" class="player-modal-input" placeholder="Ej: InvocadorX" value="${actualNombre !== 'Jugador' ? actualNombre : ''}" required minlength="2" maxlength="20">
        </div>

        <div class="player-modal-input-group">
          <label>Elige tu Ícono / Avatar</label>
          <div class="avatar-selector-grid" id="modal-avatar-grid">
            ${avatarButtonsHtml}
          </div>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center; margin-top: 0.5rem;">¡GUARDAR Y ENTRAR! 🚀</button>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const form = overlay.querySelector('#player-modal-form');
  const input = overlay.querySelector('#player-modal-name-input');
  const previewIcon = overlay.querySelector('#modal-preview-icon');
  const avatarGrid = overlay.querySelector('#modal-avatar-grid');

  if (input) setTimeout(() => input.focus(), 100);

  avatarGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.avatar-option-btn');
    if (!btn) return;

    avatarGrid.querySelectorAll('.avatar-option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    iconoSeleccionado = btn.dataset.icon;
    if (previewIcon) previewIcon.textContent = iconoSeleccionado;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (val) {
      guardarNombreJugador(val, iconoSeleccionado);
      document.body.removeChild(overlay);
      if (typeof onComplete === 'function') onComplete(val, iconoSeleccionado);
    }
  });
}

/**
 * Saves completed match outcome to localStorage ranking history
 */
let ultimoDueloGuardadoId = null;

export function guardarResultadoBatalla() {
  if (!gameState.juegoTerminado) return;

  // Prevent double saving the exact same match run
  if (gameState.idPartidaActual && ultimoDueloGuardadoId === gameState.idPartidaActual) {
    return;
  }
  gameState.idPartidaActual = Date.now();
  ultimoDueloGuardadoId = gameState.idPartidaActual;

  let rankingHistory = [];
  try {
    const saved = localStorage.getItem('mythicClash_ranking');
    if (saved) rankingHistory = JSON.parse(saved);
  } catch (e) {}

  if (!Array.isArray(rankingHistory)) rankingHistory = [];

  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
                  now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const esGanador = gameState.ganador === 'jugador';
  const vivasJugador = obtenerCartasVivasCount('jugador');
  const vivasRival = obtenerCartasVivasCount('rival');

  const mazoJugadorSnap = (gameState.mazoJugador || []).map(c => ({
    name: c.name,
    image: c.image,
    element: c.element,
    rarity: c.rarity,
    hpMax: c.hpMax,
    damage: c.damage
  }));

  const mazoRivalSnap = (gameState.mazoRival || []).map(c => ({
    name: c.name,
    image: c.image,
    element: c.element,
    rarity: c.rarity,
    hpMax: c.hpMax,
    damage: c.damage
  }));

  const matchRecord = {
    id: gameState.idPartidaActual,
    date: dateStr,
    winner: gameState.ganador,
    playerName: obtenerNombreJugador(),
    playerIcon: obtenerIconoJugador(),
    rivalName: 'Comandante IA',
    esGanador: esGanador,
    cardsLeftPlayer: vivasJugador,
    cardsLeftRival: vivasRival,
    rondas: gameState.ronda,
    playerDeck: mazoJugadorSnap,
    rivalDeck: mazoRivalSnap
  };

  rankingHistory.unshift(matchRecord);
  if (rankingHistory.length > 50) rankingHistory = rankingHistory.slice(0, 50);

  localStorage.setItem('mythicClash_ranking', JSON.stringify(rankingHistory));
}

/**
 * Renders the LoL-style ranking/history page
 */
export function renderizarRankingPage(filtro = 'all') {
  const container = document.getElementById('ranking-cards-container');
  const totalMatchesEl = document.getElementById('stat-total-matches');
  const winsCountEl = document.getElementById('stat-wins-count');
  const lossesCountEl = document.getElementById('stat-losses-count');
  const winrateEl = document.getElementById('stat-winrate');

  let rankingHistory = [];
  try {
    const saved = localStorage.getItem('mythicClash_ranking');
    if (saved) rankingHistory = JSON.parse(saved);
  } catch (e) {}

  if (!Array.isArray(rankingHistory)) rankingHistory = [];

  const total = rankingHistory.length;
  const wins = rankingHistory.filter(m => m.esGanador).length;
  const losses = total - wins;
  const wr = total > 0 ? ((wins / total) * 100).toFixed(0) : 0;

  if (totalMatchesEl) totalMatchesEl.textContent = total;
  if (winsCountEl) winsCountEl.textContent = wins;
  if (lossesCountEl) lossesCountEl.textContent = losses;
  if (winrateEl) winrateEl.textContent = `${wr}%`;

  if (!container) return;

  container.innerHTML = '';

  let partidasFiltradas = rankingHistory;
  if (filtro === 'wins') {
    partidasFiltradas = rankingHistory.filter(m => m.esGanador);
  } else if (filtro === 'losses') {
    partidasFiltradas = rankingHistory.filter(m => !m.esGanador);
  }

  if (partidasFiltradas.length === 0) {
    container.innerHTML = `
      <div class="empty-ranking-state">
        <div class="empty-ranking-icon">📜</div>
        <h3>No hay partidas registradas</h3>
        <p style="margin-top: 0.5rem;">${filtro !== 'all' ? 'No se encontraron partidas con este filtro.' : '¡Juega en la Arena de Batalla contra la IA para ver tus estadísticas e historial de mazos aquí!'}</p>
        <a href="battle.html" class="btn btn-primary" style="margin-top: 1.5rem; display: inline-flex;">⚔️ Ir a la Arena de Batalla</a>
      </div>
    `;
    return;
  }

  partidasFiltradas.forEach(match => {
    const cardEl = document.createElement('div');
    cardEl.className = `match-history-card ${match.esGanador ? 'victory' : 'defeat'}`;

    const renderMiniDeck = (deck) => {
      if (!Array.isArray(deck) || deck.length === 0) return '';
      return deck.map(c => `
        <div class="mini-card-thumb" data-rarity="${c.rarity || 'common'}" title="${c.name} (${c.element || 'Místico'}) - ❤️ ${c.hpMax || 1000} | 💥 ${c.damage || 150}">
          <img src="${fixImagePath(c.image)}" alt="${c.name}" class="mini-card-img" loading="lazy">
          <span class="mini-card-tag">${getElementTag(c.element)}</span>
          <span class="mini-card-name-overlay">${c.name}</span>
        </div>
      `).join('');
    };

    const pIcon = match.playerIcon || '⚔️';
    const ganadorBadge = match.esGanador
      ? `🏆 Victoria de ${pIcon} ${match.playerName}`
      : `💀 Victoria de ${match.rivalName}`;

    cardEl.innerHTML = `
      <div class="match-outcome-stripe"></div>
      <div class="match-card-content">
        <div class="match-card-header">
          <div class="match-result-badge">
            ${ganadorBadge}
          </div>
          <div class="match-meta-info">
            <span>📅 ${match.date}</span>
            <span>⏳ ${match.rondas || 1} Rondas</span>
            <span>❤️ Restantes: ${match.esGanador ? match.cardsLeftPlayer : match.cardsLeftRival}/5</span>
          </div>
        </div>

        <div class="match-decks-clash">
          <!-- Player Deck Side -->
          <div class="deck-team-side player">
            <div class="deck-team-header">
              <span>${pIcon} ${match.playerName} (Tú)</span>
            </div>
            <div class="mini-cards-row">
              ${renderMiniDeck(match.playerDeck)}
            </div>
          </div>

          <!-- Central VS Badge -->
          <div class="match-vs-divider">
            <div class="vs-icon-badge">VS</div>
          </div>

          <!-- Rival Deck Side -->
          <div class="deck-team-side rival">
            <div class="deck-team-header">
              <span>🤖 ${match.rivalName}</span>
            </div>
            <div class="mini-cards-row">
              ${renderMiniDeck(match.rivalDeck)}
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(cardEl);
  });
}