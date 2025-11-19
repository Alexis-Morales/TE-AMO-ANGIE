# TE-AMO-ANGIE

Sitio estático (Minecraft-style menu) publicado con GitHub Pages.

Cómo actualizar la página (rápido)

- Haz tus cambios locales en el repo (por ejemplo `index.html`, `styles.css`, `video/descarga.png`).
- Ejecuta el script de despliegue para commitear y subir todo:

```bash
./scripts/deploy.sh "Mensaje de cambio corto"
```

- Opcional: si tienes la GitHub CLI (`gh`) instalada y autenticada, el script intentará disparar un build de Pages inmediatamente.

Notas
- El script hace `git add -A` y `git push origin <branch>`; asegúrate de tener permisos para pushear.
- Si quieres una acción automática en tu máquina (watcher), puedo añadirla — dímelo y la incluyo.

URL pública:

- https://alexis-morales.github.io/TE-AMO-ANGIE/

Contacto
- Si quieres que los botones enlacen a lugares concretos o que cambie el layout, dime los enlaces o el comportamiento.

Audio
- Para que la pista por defecto ("Aria Math" de C418) suene al abrir la página, sube el archivo
	`aria-math.mp3` a la ruta `assets/audio/aria-math.mp3` en el repo. El archivo debe ser un MP3
	válido. Una vez subido, el script `audio-config.js` lo detectará y lo reproducirá en bucle.

- Nota importante: los navegadores modernos pueden bloquear la reproducción automática de audio
	no silenciado hasta que el usuario interactúe con la página (click o toque). Si la reproducción
	se bloquea, haz clic en el botón de audio (`🔈`) para activarla.
