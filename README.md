# ⚔️ Mythic Clash - Juego de Batalla de Cartas Místicas

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Estado](https://img.shields.io/badge/Estado-Completado-brightgreen?style=for-the-badge)
![Arquitectura](https://img.shields.io/badge/Arquitectura-Vanilla%20JS%20ES6%2B-blueviolet?style=for-the-badge)

**Mythic Clash** es un juego web interactivo de estrategia y combate de cartas por turnos desarrollado en JavaScript Vanilla (ES6+), HTML5 y CSS3. Los jugadores exploran una extensa colección de criaturas elementales, construyen un mazo táctico de 5 cartas y se enfrentan en duelos 1v1 y tableros 5v5 contra un oponente IA inteligente.

---

## 📋 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
- [🎮 Vistas de la Aplicación](#-vistas-de-la-aplicación)
- [⚡ Mecánicas del Juego \& Reglas](#-mecánicas-del-juego--reglas)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📂 Estructura del Proyecto](#-estructura-del-proyecto)
- [🏛️ Arquitectura del Código](#️-arquitectura-del-código)
- [🚀 Instalación y Uso Local](#-instalación-y-uso-local)
- [📜 Convención de Commits](#-convención-de-commits)

---

## ✨ Características Principales

- 🎴 **Armado de Mazo Personalizado (5/5 Cartas):** Selección exacta de 5 cartas de la colección total antes de entrar a la arena de combate.
- 💾 **Persistencia de Datos:** Guardado automático del mazo seleccionado en `localStorage` del navegador para que persista entre sesiones y páginas.
- ⚔️ **Enfrentamiento Clash 1v1 Activo:** Visualización en tiempo real del duelo entre la carta activa del jugador (panel azul - izquierda) y la carta activa de la IA (panel rojo - derecha).
- 🛡️ **Sistema de Salud y Escudo:** Barras de vida (HP) y escudos protectores en vivo con animaciones para cada carta y barras de salud consolidadas para cada bando.
- 🔮 **Panel de 6 Habilidades Únicas por Carta:** Cada carta cuenta con 4 ataques normales, 1 habilidad de escudo defensivo y 1 súper ataque especial devastador.
- 🤖 **Oponente IA Automatizado:** Inteligencia artificial por turnos con selección calculada de ataques o defensas y respuestas en tiempo real.
- 📊 **Tablero Completo 5v5:** Vista en rejilla de las 5 cartas aliadas y las 5 cartas enemigas mostrando su estado actual (Activa, En Espera o Derrotada).
- 🏆 **Pantalla Modal de Resultado de Batalla:** Superposición al finalizar el juego (Victoria o Derrota) con opción para reiniciar el combate.
- 🔍 **Buscador y Filtros en Tiempo Real:** Filtrado por nombre y badges elementales (Fuego, Agua, Tierra, Aire, Luz, Sombra) en la colección de cartas.
- 🔐 **Módulo de Iniciar Sesión / Registro:** Interfaz de autenticación estilizada para la inmersión del usuario.

---

## 🎮 Vistas de la Aplicación

| Vista | Descripción |
| :--- | :--- |
| 🏠 **Inicio (`index.html`)** | Hero Banner dinámico con llamado a la acción y resumen de características destacadas del juego. |
| 🎴 **Colección \& Mazo (`pages/collection.html`)** | Grilla de cartas disponibles, barra de búsqueda en tiempo real, filtros por rareza/elemento y 5 slots interactivos de mazo. |
| ⚔️ **Arena de Batalla (`pages/battle.html`)** | Escenario de combate 1v1, barras de HP consolidadas, panel de 6 habilidades por turno, tablero general 5v5 y modal de finalización. |
| 🔐 **Autenticación (`pages/login.html`)** | Pantalla de inicio de sesión y registro de cuenta para jugadores. |

---

## ⚡ Mecánicas del Juego \& Reglas

### 1. Construcción del Mazo
1. El jugador debe seleccionar **exactamente 5 cartas** desde la vista de Colección.
2. Cada carta aporta estadísticas de salud máx (`hpMax`), daño base (`damage`) y 6 habilidades particulares (`habilidades`).
3. Una vez completado el mazo de 5 cartas, se habilita el botón **"¡INICIAR BATALLA!"**.

### 2. El Combate
- **Duelo 1v1 Activo:** En el centro de la arena luchan las cartas en la posición activa actual de cada mazo.
- **Turnos Intercalados:**
  - En el turno del jugador, el usuario selecciona 1 de las 6 habilidades disponibles.
  - Al ejecutar una habilidad, la IA recibe el turno automáticamente tras un breve retraso estratégico y responde con un movimiento.
- **Escudo y Daño:**
  - El escudo absorbe el daño entrante antes de restar vida al `hpActual`.
  - Si el daño supera el escudo restante, la diferencia se descuenta de los puntos de vida de la carta.
- **Carta Derrotada \& Relevo:**
  - Cuando el `hpActual` de una carta llega a 0, queda marcada como **Derrotada**.
  - La siguiente carta viva del mazo entra automáticamente al duelo 1v1.
- **Condición de Victoria/Derrota:**
  - **Victoria:** El jugador logra derrotar las 5 cartas de la IA.
  - **Derrota:** Las 5 cartas del jugador son derrotadas.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5:** Marcado semántico, accesibilidad y soporte multi-página.
- **CSS3 Moderno:**
  - CSS Custom Properties (Variables de color, sombras y neones).
  - CSS Grid \& Flexbox para diseño responsivo.
  - Efectos Glassmorphism y sombras dinámicas según elemento/rareza.
  - Animaciones y transiciones fluidas.
- **JavaScript (ES6 Modules):**
  - Módulos nativos de JavaScript (`import` / `export`).
  - Programación Asíncrona (`async/await` + `fetch` API).
  - Manipulación eficiente del DOM y Event Delegation.
- **JSON:** Base de datos estructurada en `data/data.json` con información detallada de cartas, elementos, habilidades y assets.
- **LocalStorage API:** Para la persistencia del mazo entre navegación.

---

## 📂 Estructura del Proyecto

```
Actividad-Cards-Battle/
├── assets/                  # Recursos multimedia e imágenes de cartas y fondos
├── css/                     # Hojas de estilo modulares
│   ├── style.css            # Estilos globales, variables CSS, reset y navegación
│   ├── home.css             # Estilos de la página principal (index.html)
│   ├── collection.css       # Estilos de la grilla de colección y slots de mazo
│   ├── battle.css           # Estilos de la arena de batalla 1v1, habilidades y modal
│   └── login.css            # Estilos del formulario de autenticación
├── data/
│   └── data.json            # Base de datos JSON con las cartas y sus habilidades
├── js/                      # Lógica JavaScript modular (ES6)
│   ├── app.js               # Punto de entrada principal y enrutador por página
│   ├── logic/
│   │   └── game.js          # Motor del juego, estado global (gameState) y reglas
│   └── dom/
│       ├── render.js        # Generación y actualización dinámica del DOM
│       └── events.js        # Manejadores de eventos, IA y filtros
├── pages/                   # Vistas secundarias
│   ├── collection.html      # Página de colección y constructor de mazo
│   ├── battle.html          # Página de la arena de batalla 5v5
│   └── login.html           # Página de inicio de sesión / registro
├── index.html               # Página de inicio (Home)
└── README.md                # Documentación del proyecto
```

---

## 🏛️ Arquitectura del Código

El proyecto utiliza una arquitectura limpia basada en **Separación de Responsabilidades**:

1. **`js/app.js` (Orquestador Principal):**
   - Consume `data/data.json` asíncronamente.
   - Detecta la página actual por URL (`window.location.pathname`).
   - Carga el mazo guardado desde `localStorage` e inicializa la vista correspondiente.

2. **`js/logic/game.js` (Capa de Lógica \& Estado):**
   - Mantiene el objeto central `gameState`.
   - Controla las reglas de combate: `ejecutarHabilidad()`, `obtenerCartaActiva()`, `obtenerHpTotal()`, cálculo de escudos y transiciones de turno/ronda.

3. **`js/dom/render.js` (Capa de Presentación / DOM):**
   - Renderiza las cartas de la colección, los 5 slots del mazo y sus estadísticas acumuladas.
   - Construye y actualiza la interfaz de la arena de batalla en tiempo real: barras de salud, escudos, botones de habilidades y modal de fin de juego.

4. **`js/dom/events.js` (Capa de Interacción y Eventos):**
   - Asigna event listeners delegados para clicks en cartas, filtros de búsqueda, selección/deselección de slots y ejecución de ataques.
   - Coordina la respuesta automatizada de la IA rival.

---

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/JulianValenciaRv0/Actividad-Cards-Battle.git
   cd Actividad-Cards-Battle
   ```

2. **Ejecutar un Servidor Local:**
   Debido a que el proyecto utiliza Módulos ES6 (`type="module"`) y realiza peticiones `fetch()` a `data/data.json`, debe ejecutarse a través de un servidor HTTP local (no abriendo el archivo HTML directamente como `file://`).

   - **Opción A (Live Server en VS Code):** Abrir el proyecto en VS Code y dar clic en *Go Live*.
   - **Opción B (Python HTTP Server):**
     ```bash
     python -m http.server 8080
     ```
     Luego abrir `http://localhost:8080` en el navegador.
   - **Opción C (Node.js npx serve):**
     ```bash
     npx serve .
     ```

---

## 📜 Convención de Commits

Este repositorio sigue la convención de **Conventional Commits** acompañada de emojis representativos:

- `✨ feat:` Nuevas características o funcionalidades.
- `📝 docs:` Cambios o añadidos en la documentación (ej. `README.md`).
- `🎨 style:` Cambios de formato, CSS o diseño UI sin afectar la lógica.
- `🐛 fix:` Corrección de errores o bugs.
- `♻️ refactor:` Refactorización o mejora estructural del código.

---

<p align="center">Desarrollado JavaScript Vanilla por <b>Julián Valencia</b>.</p>
