# Galeria Valentina

Sitio estatico para portfolio fotografico de Valentina Parera.

Incluye:

- Galeria publica con filtros por categoria.
- Lightbox para ver fotos en grande.
- Panel privado en `/admin.html`.
- Subida, edicion y borrado de fotos.
- Alta y baja de categorias.
- Integracion con Supabase para autenticacion, base de datos y storage.

## Como correr localmente

Abrir `index.html` en el navegador funciona para ver la estructura, pero para usar Supabase conviene servir la carpeta:

```bash
python3 -m http.server 5173
```

Luego abrir:

- `http://localhost:5173`
- `http://localhost:5173/admin.html`

## Configuracion de Supabase

1. Crear un proyecto gratis en Supabase.
2. En `Storage`, crear un bucket publico llamado `photos`.
3. En `Authentication`, crear el usuario de Valentina con email y password.
4. En `Project Settings > API`, copiar:
   - Project URL
   - Publishable key
5. Para local, copiar `config.example.js` a `config.js` y completar esos valores.
6. Ejecutar el SQL de `supabase/schema.sql` en el SQL editor de Supabase.
7. Opcional: ejecutar `supabase/seed-existing-photos.sql` para cargar las 8 fotos que ya estaban en el HTML original.

## Deploy en Vercel

1. Subir esta carpeta a GitHub.
2. Importar el repositorio desde Vercel.
3. Configurar variables de entorno:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_STORAGE_BUCKET` con valor `photos`
4. Build command: `npm run build`
5. Output directory: dejar vacio.
6. La URL publica queda lista para compartir.
