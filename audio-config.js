// audio-config.js

// Estado inicial del audio
const AUDIO_STATE = {
    // La canción de fondo por defecto (subir `canciones/aria-math.mp3`)
    DEFAULT_TRACK_SRC: 'canciones/aria-math.mp3', 
    
    // Lista de todas las canciones disponibles en el menú de ajustes
    CUSTOM_TRACKS: [
        { 
            id: 'custom1', 
            titulo: 'Melodía para Angie', 
            src: 'assets/audio/melodia-propia.mp3' // Tu archivo 1
        },
        { 
            id: 'custom2', 
            titulo: 'Recuerdos Felices', 
            src: 'https://p.scdn.co/mp3url-de-tu-bandlab-o-soundcloud.mp3' // Tu archivo 2 o URL directa
        },
            { id: 'angel', titulo: 'Angel', src: 'canciones/Angel.mp3' },
            { id: 'teamo', titulo: 'Te Amo Como a Nadie', src: 'canciones/Te Amo Como a Nadie - suei.mp3' },
            { id: 'mivida', titulo: 'Mi vida son tus ojos', src: 'canciones/mi vida son tus ojos.mp3' },
            // Puedes añadir URLs externas o más archivos locales aquí
    ],
    
    // Referencia al elemento de audio (se inicializa en 'main.js')
    player: null 
};

// Función para inicializar o restaurar la música de fondo (Aria Math)
function playDefaultTrack() {
    const player = AUDIO_STATE.player || document.getElementById('bg-audio');
    
    if (player && player.src !== window.location.origin + '/' + AUDIO_STATE.DEFAULT_TRACK_SRC) {
        player.src = AUDIO_STATE.DEFAULT_TRACK_SRC;
        // La reproducción se maneja en main.js para evitar errores de autostart
    }
    
    // Guarda el estado en localStorage
    localStorage.setItem('currentTrackSrc', AUDIO_STATE.DEFAULT_TRACK_SRC);
    localStorage.setItem('isCustomPlaying', 'false');
}

// ====================================================================
// Código de inicialización de audio que se carga en todas las páginas
// ====================================================================

// Obtiene el volumen guardado o usa 50% por defecto
const savedVolume = parseFloat(localStorage.getItem('masterVolume')) || 0.5; 
const savedMute = localStorage.getItem('isMuted') === 'true';

// Comprueba si el archivo local por defecto existe (`canciones/aria-math.mp3`).
// Si no existe, deja la lógica intacta pero avisa en consola para que subas el MP3.
async function ensureDefaultTrackExists() {
    const defaultUrl = AUDIO_STATE.DEFAULT_TRACK_SRC;
    try {
        const resp = await fetch(defaultUrl, { method: 'HEAD' });
        if (resp.ok) return true;
        console.warn(`audio-config: default track not found at ${defaultUrl} (status ${resp.status})`);
        return false;
    } catch (e) {
        console.warn('audio-config: could not verify default track existence:', e);
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Asegura que solo exista un reproductor de audio en el DOM
    let player = document.getElementById('bg-audio');
    if (!player) {
        player = document.createElement('audio');
        player.id = 'bg-audio';
        player.loop = true;
        document.body.appendChild(player);
    }
    AUDIO_STATE.player = player;
    
    // Aplica el estado guardado
    player.volume = savedVolume;
    player.muted = savedMute;
    
    // Decide qué pista usar: la última seleccionada (localStorage) o la por defecto.
    let currentTrackSrc = localStorage.getItem('currentTrackSrc') || AUDIO_STATE.DEFAULT_TRACK_SRC;

    // Si la pista por defecto es local y no existe, intentamos advertir (usando promesas para evitar await)
    if (currentTrackSrc === AUDIO_STATE.DEFAULT_TRACK_SRC) {
        ensureDefaultTrackExists().then(exists => {
            if (!exists) {
                // Si no existe el MP3 local, no podemos reproducir desde YouTube directamente.
                // Mensaje instructivo para que subas `canciones/aria-math.mp3` al repo.
                console.warn('audio-config: please upload the file `canciones/aria-math.mp3` to enable Aria Math playback.');
            }
        }).catch(() => {});
    }
    player.src = currentTrackSrc;

    // Intenta reproducir si no estaba silenciado al cargar la página (puede bloquearse por políticas de autoplay)
    if (!savedMute) {
        player.play().catch(e => {
            console.log("Audio play prevented by browser autoplay policy. The audio will start after user interaction.");
        });
    }

    // Restaurar posición previa y empezar a guardar la posición periódicamente
    try {
        restorePlaybackPosition();
        startPlaybackPositionSaver();
    } catch (e) {
        /* ignore */
    }

    // Lógica para el botón de silenciar (si existe)
    const btn = document.getElementById('audio-toggle');
    if (btn) {
        btn.textContent = savedMute ? '🔈' : '🔊';
        btn.setAttribute('aria-pressed', savedMute ? 'false' : 'true');

        // Ensure a small title element is present next to the button
        let titleEl = document.getElementById('audio-track-title');
        if (!titleEl) {
            titleEl = document.createElement('span');
            titleEl.id = 'audio-track-title';
            titleEl.style.marginLeft = '8px';
            titleEl.style.fontSize = '0.9em';
            titleEl.style.color = '#fff';
            titleEl.style.fontFamily = 'sans-serif';
            btn.insertAdjacentElement('afterend', titleEl);
        }

        // Set initial title from storage or derive from current src
        const savedTitle = localStorage.getItem('currentTrackTitle');
        const currentSrc = localStorage.getItem('currentTrackSrc') || AUDIO_STATE.DEFAULT_TRACK_SRC;
        if (savedTitle) titleEl.textContent = savedTitle;
        else titleEl.textContent = (currentSrc && typeof currentSrc === 'string') ? currentSrc.split('/').pop() : '';

        btn.addEventListener('click', () => {
            const newMutedState = !player.muted;
            player.muted = newMutedState;
            localStorage.setItem('isMuted', newMutedState);
            btn.textContent = newMutedState ? '🔈' : '🔊';
            btn.setAttribute('aria-pressed', newMutedState ? 'false' : 'true');
            
            // Si desmutea, intenta empezar a sonar
            if (!newMutedState && player.paused) {
                 player.play().catch(e => console.error("Error playing audio after toggle:", e));
            }
            // Marca interacción del usuario para evitar overlay y permitir autoplay
            try {
                localStorage.setItem('audio_interaction_seen', 'true');
                const ov = document.getElementById('audio-overlay');
                if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
            } catch (e) {
                console.warn('audio-config: could not remove overlay after toggle', e);
            }
        });
    }
});

// Public API: set the current track, save in localStorage and try to play
function setTrack(src, title) {
    const player = AUDIO_STATE.player || document.getElementById('bg-audio');
    if (!player) return;
    player.src = src;
    localStorage.setItem('currentTrackSrc', src);
    localStorage.setItem('currentTrackTitle', title || src);
    localStorage.setItem('isCustomPlaying', 'true');

    // If muted, unmute so user hears it (but respect saved mute if user explicitly set it)
    if (player.muted) {
        player.muted = false;
        localStorage.setItem('isMuted', 'false');
        const btn = document.getElementById('audio-toggle');
        if (btn) {
            btn.textContent = '🔊';
            btn.setAttribute('aria-pressed', 'true');
        }
    }

    player.play().catch(e => {
        console.warn('audio-config: play prevented by browser; user interaction required', e);
    });

    // Update any visible track title element
    try {
        const titleEl = document.getElementById('audio-track-title');
        if (titleEl) titleEl.textContent = title || src.split('/').pop();
    } catch (e) {
        /* ignore */
    }
}

// Populate a track selector if present in the page (uses AUDIO_STATE.CUSTOM_TRACKS and DEFAULT)
function populateTrackSelector() {
    const sel = document.getElementById('track-selector');
    if (!sel) return;

    // Clear existing
    sel.innerHTML = '';

    // Add default track option
    const defaultOpt = document.createElement('option');
    defaultOpt.value = AUDIO_STATE.DEFAULT_TRACK_SRC;
    defaultOpt.textContent = 'Aria Math (C418) — Predeterminada';
    sel.appendChild(defaultOpt);

    // Add custom tracks
    if (Array.isArray(AUDIO_STATE.CUSTOM_TRACKS)) {
        AUDIO_STATE.CUSTOM_TRACKS.forEach(t => {
            const o = document.createElement('option');
            o.value = t.src;
            o.textContent = t.titulo || t.src;
            sel.appendChild(o);
        });
    }

    // If there is a saved currentTrackSrc, select it
    const saved = localStorage.getItem('currentTrackSrc') || AUDIO_STATE.DEFAULT_TRACK_SRC;
    sel.value = saved;

    sel.addEventListener('change', () => {
        const src = sel.value;
        const title = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : src;
        setTrack(src, title);
    });
}

// Public API: set master volume (0.0 - 1.0), persist and update UI
function setVolume(value) {
    const player = AUDIO_STATE.player || document.getElementById('bg-audio');
    const v = Math.max(0, Math.min(1, parseFloat(value)));
    if (player) player.volume = v;
    localStorage.setItem('masterVolume', String(v));

    const lbl = document.getElementById('volume-label');
    if (lbl) lbl.textContent = Math.round(v * 100) + '%';
    const slider = document.getElementById('volume-slider');
    if (slider) slider.value = Math.round(v * 100);
}

function populateVolumeControl() {
    const slider = document.getElementById('volume-slider');
    const lbl = document.getElementById('volume-label');
    if (!slider && !lbl) return;

    const current = parseFloat(localStorage.getItem('masterVolume')) || savedVolume || 0.5;
    if (lbl) lbl.textContent = Math.round(current * 100) + '%';
    if (slider) {
        slider.value = Math.round(current * 100);
        slider.addEventListener('input', (e) => {
            const perc = parseInt(e.target.value, 10);
            setVolume(perc / 100);
        });
    }
}

// First-visit overlay to guarantee a user interaction for autoplay
function showFirstVisitOverlay() {
    try {
        const seen = localStorage.getItem('audio_interaction_seen');
        if (seen === 'true') return;

        const overlay = document.createElement('div');
        overlay.id = 'audio-overlay';
        overlay.style.position = 'fixed';
        overlay.style.left = '0';
        overlay.style.top = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.zIndex = '9999';

        const box = document.createElement('div');
        box.style.background = '#0f1724';
        box.style.color = '#fff';
        box.style.padding = '20px 28px';
        box.style.borderRadius = '8px';
        box.style.textAlign = 'center';
        box.style.fontFamily = 'sans-serif';

        const p = document.createElement('p');
        p.textContent = 'Toca para escuchar la música de fondo';
        p.style.margin = '0 0 12px 0';

        const btn = document.createElement('button');
        btn.textContent = 'Tocar 🎵';
        btn.style.padding = '8px 14px';
        btn.style.border = 'none';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';

        btn.addEventListener('click', () => {
            const player = AUDIO_STATE.player || document.getElementById('bg-audio');
            if (player) {
                player.muted = false;
                localStorage.setItem('isMuted', 'false');
                player.play().catch(() => {});
            }
            localStorage.setItem('audio_interaction_seen', 'true');
            document.body.removeChild(overlay);
        });

        box.appendChild(p);
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    } catch (e) {
        console.warn('audio-config: overlay failed', e);
    }
}

// Run small inits if DOM already loaded (or will be run after DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
    populateTrackSelector();
    populateVolumeControl();
    showFirstVisitOverlay();
});

// Create a small, fixed "Play" button so users can force playback without DevTools
// Force-play button removed per user request

// Fallback: si el autoplay fue bloqueado y el usuario no vio/dismissó el overlay,
// intentamos reproducir en el primer clic/tap global para cumplir la intención del usuario.
document.addEventListener('pointerdown', function audioFirstUserInteraction() {
    try {
        const player = AUDIO_STATE.player || document.getElementById('bg-audio');
        if (!player) return;

        // Si todavía está pausado o silenciado, intentamos desmutear y reproducir.
        if (player.paused || player.muted) {
            player.muted = false;
            localStorage.setItem('isMuted', 'false');
            player.play().catch(() => {});
        }

        // Marca que hubo interacción para que el overlay no se vuelva a mostrar
        localStorage.setItem('audio_interaction_seen', 'true');

        // Si el overlay existe en el DOM, elimínalo
        const ov = document.getElementById('audio-overlay');
        if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    } catch (e) {
        console.warn('audio-config: user interaction handler failed', e);
    }
}, { once: true });

// Persist playback position so music can resume on navigation between pages
function startPlaybackPositionSaver() {
    try {
        const player = AUDIO_STATE.player || document.getElementById('bg-audio');
        if (!player) return;

        // Save every second
        setInterval(() => {
            try {
                if (!player) return;
                localStorage.setItem('currentTrackPosition', String(player.currentTime || 0));
                localStorage.setItem('currentTrackPlaying', String(!player.paused));
            } catch (e) { /* ignore */ }
        }, 1000);

        // Update flags on play/pause
        player.addEventListener('play', () => {
            try { localStorage.setItem('currentTrackPlaying', 'true'); } catch (e) {}
        });
        player.addEventListener('pause', () => {
            try { localStorage.setItem('currentTrackPlaying', 'false'); } catch (e) {}
        });
    } catch (e) {
        console.warn('audio-config: could not start position saver', e);
    }
}

// Restore saved position (if any) after metadata is available
function restorePlaybackPosition() {
    try {
        const player = AUDIO_STATE.player || document.getElementById('bg-audio');
        if (!player) return;

        const savedPos = parseFloat(localStorage.getItem('currentTrackPosition') || '0');
        const savedPlaying = localStorage.getItem('currentTrackPlaying') === 'true';

        if (!isNaN(savedPos) && savedPos > 0) {
            const applyPosition = () => {
                try {
                    // If requested position is beyond duration, ignore
                    if (player.duration && savedPos > player.duration) return;
                    player.currentTime = savedPos;
                } catch (e) { /* ignore */ }
            };

            if (player.readyState >= 1) {
                applyPosition();
            } else {
                player.addEventListener('loadedmetadata', applyPosition, { once: true });
            }
        }

        // Try to resume playing if it was playing before or user already interacted
        const interacted = localStorage.getItem('audio_interaction_seen') === 'true';
        if (savedPlaying || interacted) {
            player.play().catch(() => {});
        }
    } catch (e) {
        console.warn('audio-config: could not restore playback position', e);
    }
}
