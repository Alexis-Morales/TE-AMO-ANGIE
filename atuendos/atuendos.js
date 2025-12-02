// atuendos.js

document.addEventListener('DOMContentLoaded', () => {
    const skinItems = document.querySelectorAll('.skin-item');
    const currentSkinImg = document.getElementById('current-skin-img');
    const modal = document.getElementById('modal-mensaje');
    const modalText = document.getElementById('modal-text');
    const modalImage = document.getElementById('modal-image');
    const closeModalButton = document.querySelector('.close-button');

    // --- Configuración de Imágenes de Mensaje ---
    // Coloca aquí las URLs de las fotos que quieres que aparezcan en el modal.
    const MESSAGE_IMAGES = {
        'pyramid': 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=400&auto=format&fit=crop',
        'alex': '/TE-AMO-ANGIE/video/pagina1.jpeg?v=20251202T0000',
        'steve': 'https://images.unsplash.com/photo-1502444330042-434ae45dd9c1?q=80&w=400&auto=format&fit=crop'
    };
    
    // --- Lógica del Modal y Selección de Skin ---

    skinItems.forEach(item => {
        item.addEventListener('click', () => {
            const skinType = item.dataset.skin;
            const message = item.dataset.message;

            // 1. Cambia la skin en la previsualización actual
            const skinSrc = item.querySelector('img').getAttribute('src');
            currentSkinImg.setAttribute('src', skinSrc);

            // 2. Prepara el contenido del modal
            modalText.textContent = message;
            modalImage.src = MESSAGE_IMAGES[skinType] || '';
            
            // Opcional: Establecer un título más claro en el modal usando la leyenda visible
            const caption = item.querySelector('p') ? item.querySelector('p').textContent.trim() : skinType.toUpperCase();
            document.getElementById('modal-titulo').textContent = `¡Mensaje de ${caption}!`;

            // 3. Muestra el modal
            modal.style.display = 'block';
        });
    });

    // --- Lógica de Cierre del Modal ---

    // Cierra el modal al hacer clic en la "x"
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cierra el modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
