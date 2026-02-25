# Ivan Julia — Portfolio

## Cómo agregar un proyecto nuevo

### Paso 1 — Subir las imágenes

Las imágenes van dentro de `assets/images/` en la carpeta de su categoría:

```
assets/images/
├── STILLS MUSIC VIDEOS /
│   └── NOMBRE PROYECTO /
│       ├── still-1.jpg
│       ├── still-2.jpg
│       └── still-3.jpg
├── STILLS COMMERCIALS /
│   └── NOMBRE PROYECTO /
│       └── ...
└── STILLS NARRATIVES /
    └── NOMBRE PROYECTO /
        └── ...
```

---

### Paso 2 — Registrar el proyecto en `js/projects-data.js`

Copiá el bloque comentado al final del archivo y completá los datos:

```js
'nombre-proyecto': {
  title:         'Título del proyecto',
  categoryLabel: 'Music Video',     // o 'Commercial' / 'Narrative'
  director:      'Nombre Director',
  producer:      'Nombre Productora',
  dop:           'Nombre DOP',
  year:          '2025',
  vimeoId:       '123456789',       // ID de Vimeo — dejar '' si no hay video
  stills: [
    '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-1.jpg',
    '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-2.jpg',
    '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-3.jpg',
  ],
},
```

> El ID de Vimeo está en la URL del video: `vimeo.com/`**123456789**
> Para Commercials usá `STILLS COMMERCIALS /`, para Narrative `STILLS NARRATIVES /`

---

### Paso 3 — Agregar la tarjeta en `index.html`

Copiá este bloque dentro de `<main class="projects-section">` y completá:

```html
<article class="project" data-category="music-videos">
  <a href="projects/project.html?id=nombre-proyecto" class="project-link">
    <div class="project-stills">
      <div class="still">
        <img src="assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-1.jpg" alt="Still 1" />
      </div>
      <div class="still">
        <img src="assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-2.jpg" alt="Still 2" />
      </div>
      <div class="still">
        <img src="assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-3.jpg" alt="Still 3" />
      </div>
    </div>
    <div class="project-overlay">
      <span class="project-title">Título del proyecto</span>
      <span class="project-details">Dir. Nombre | Prod. Nombre</span>
    </div>
  </a>
</article>
```

> En `data-category` usá `music-videos`, `commercials` o `narrative` según corresponda.
> El `id=` en el href tiene que coincidir exactamente con la key del paso 2.

---

Eso es todo. La página de detalle (`projects/project.html`) se arma sola con los datos del paso 2.
