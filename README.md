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
