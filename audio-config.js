// audio-config.js

// Estado inicial del audio
const AUDIO_STATE = {
    // La canción de fondo por defecto
    DEFAULT_TRACK_SRC: 'assets/audio/aria-math.mp3', 
    
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
        // Añade más canciones personalizadas aquí
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
    
    // Obtiene la canción que debería sonar (la última reproducida o la de Aria Math)
    const currentTrackSrc = localStorage.getItem('currentTrackSrc') || AUDIO_STATE.DEFAULT_TRACK_SRC;
    player.src = currentTrackSrc;
    
    // Intenta reproducir si no estaba silenciado al cargar la página (requiere interacción previa)
    if (!savedMute) {
        player.play().catch(e => {
            console.log("Audio play prevented, will start on user interaction.");
        });
    }

    // Lógica para el botón de silenciar (si existe)
    const btn = document.getElementById('audio-toggle');
    if (btn) {
        btn.textContent = savedMute ? '🔈' : '🔊';
        btn.setAttribute('aria-pressed', savedMute ? 'false' : 'true');

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
        });
    }
});
