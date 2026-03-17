/* ─────────────────────────────────────────
   Datos de proyectos
   Para agregar un proyecto nuevo:
   1. Añadí una entrada aquí con su ID como key
   2. En index.html agregá el article con href="projects/project.html?id=TU_ID"
   ───────────────────────────────────────── */

const PROJECTS = {

  // ── MUSIC VIDEOS ───────────────────────────────────────────────────

  'violento': {
    title:         "Trueno - Violento",
    categoryLabel: 'Music Video',
    director:      'Lautaro Furiolo',
    producer:      'Rebolución',
    dop:           '',
    year:          '',
    vimeoId:       '1087538165',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /1 - Violento - Stills - 9.webp',
      '../assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /1 - Violento - Stills - 11.webp',
      '../assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /Frame inicio pagina .webp',
    ],
  },

  'lauryn': {
    title:         'Trueno - Lauryn',
    categoryLabel: 'Music Video',
    director:      'Lautaro Furiolo',
    producer:      'Rebolución',
    dop:           '',
    year:          '',
    vimeoId:       '1087432295',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /LAURYN/Frame inicio pagina .webp',
      '../assets/images/STILLS MUSIC VIDEOS /LAURYN/1 - Lauryn - Stills - 1.webp',
      '../assets/images/STILLS MUSIC VIDEOS /LAURYN/1 - Lauryn - Stills - 11.webp',
    ],
  },

  'the-chicken': {
    title:         'The Chicken EP 1',
    categoryLabel: 'Commercial',
    director:      'Luchi Nobile',
    producer:      'Doce Studios',
    dop:           '',
    year:          '',
    vimeoId:       '1042658327',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN /Still 2024-12-09 144612_1.13.6.webp',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN /Still 2024-12-09 144612_1.14.2.webp',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN /Still 2024-12-09 144612_1.19.1.webp',
    ],
  },

  'montonero-broke-carrey': {
    title:         'Broke Carrey - Montonero',
    categoryLabel: 'Music Video',
    director:      'Juan Manuel Pinzon & Juan Lanzillotta',
    producer:      'Bohemian Groove',
    dop:           '',
    year:          '',
    vimeoId:       '1006271726',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /MONTONERO BROKE CARREY /thumb.webp',
      '../assets/images/STILLS MUSIC VIDEOS /MONTONERO BROKE CARREY /default_1.1.13.webp',
      '../assets/images/STILLS MUSIC VIDEOS /MONTONERO BROKE CARREY /default_1.1.42.webp',
    ],
  },

  'llamalo': {
    title:         'Marttein ft. Dillom - Llámalo',
    categoryLabel: 'Music Video',
    director:      'Clemente Bruzzone & José Fogwill',
    producer:      'The movement land',
    dop:           '',
    year:          '',
    vimeoId:       '',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /LLAMALO/Imagen 18-11-24 a las 16.16.webp',
      '../assets/images/STILLS MUSIC VIDEOS /LLAMALO/LLAMALO 2.webp',
      '../assets/images/STILLS MUSIC VIDEOS /LLAMALO/LLAMALO 3.webp',
    ],
  },

'ay-not-dead': {
    title:         'Ay Not Dead - FW 24',
    categoryLabel: 'Commercial',
    director:      'Juan Manuel Pinzon & Mateo Caride',
    producer:      '',
    dop:           '',
    year:          '',
    vimeoId:       '994107718',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS COMMERCIALS/AY NOT DEAD /default_1.1.12.webp',
      '../assets/images/STILLS COMMERCIALS/AY NOT DEAD /default_1.1.21.webp',
      '../assets/images/STILLS COMMERCIALS/AY NOT DEAD /default_1.1.28_1.webp',
    ],
  },

 'cortame-ahi': {
    title:         'Juana Rozas ft. Marttein - Cortame Ahí',
    categoryLabel: 'Music Video',
    director:      'Valentine Torre',
    producer:      '',
    dop:           '',
    year:          '',
    vimeoId:       '838814267',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /CORTAME AHI /frame inicial.webp',
      '../assets/images/STILLS MUSIC VIDEOS /CORTAME AHI /CortameAhi_1.2.2.webp',
      '../assets/images/STILLS MUSIC VIDEOS /CORTAME AHI /CortameAhi_2.39.1.webp',
    ],
  },

  '344-trueno': {
    title:         'Trueno - 344',
    categoryLabel: 'Music Video',
    director:      'Lautaro Furiolo',
    producer:      'Rebolución',
    dop:           '',
    year:          '',
    vimeoId:       '1091619677',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /344 TRUENO /1 - 344 - Stills - 1.webp',
      '../assets/images/STILLS MUSIC VIDEOS /344 TRUENO /1 - 344 - Stills - 20.webp',
      '../assets/images/STILLS MUSIC VIDEOS /344 TRUENO /1 - 344 - Stills - 21.webp',
    ],
  },

 'pedidos-ya': {
    title:         'Igual prefiero pedir - Pedidos Ya',
    categoryLabel: 'Commercial',
    director:      'Nico Poniemann',
    producer:      'Argentina Cine',
    dop:           '',
    year:          '',
    vimeoId:       '1091612207',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS COMMERCIALS/PEDIDOS YA /Untitled_2.1.1.webp',
      '../assets/images/STILLS COMMERCIALS/PEDIDOS YA /Untitled_2.1.2.webp',
      '../assets/images/STILLS COMMERCIALS/PEDIDOS YA /Untitled_2.1.5 2.webp',
    ],
  },

  '7-rojas-barro': {
    title:         'Barro - 7 Rojas',
    categoryLabel: 'Music Video',
    director:      'Valentine Torre',
    producer:      '',
    dop:           '',
    year:          '',
    vimeoId:       '857177923',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /7 ROJAS BARRO /Frame incial .webp',
      '../assets/images/STILLS MUSIC VIDEOS /7 ROJAS BARRO /fotos_1.94.1.webp',
      '../assets/images/STILLS MUSIC VIDEOS /7 ROJAS BARRO /Untitled_1.6.1 2.webp',
    ],
  },

  'ypf-colapinto': {
    title:         'Colapinto banderas - YPF',
    categoryLabel: 'Commercial',
    director:      'Milton Kremer',
    producer:      'Landia',
    dop:           '',
    year:          '',
    vimeoId:       '1148723478',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS COMMERCIALS/YPF COLAPINTO /Untitled_1.1.1.webp',
      '../assets/images/STILLS COMMERCIALS/YPF COLAPINTO /Untitled_1.1.2.webp',
      '../assets/images/STILLS COMMERCIALS/YPF COLAPINTO /Untitled_1.1.3.webp',
    ],
  },

  'cachetazo': {
    title:         'Marttein ft. Juana Rozas - Cachetazo',
    categoryLabel: 'Music Video',
    director:      'Clemente Bruzzone & José Fogwill',
    producer:      'The Movement Land',
    dop:           '',
    year:          '',
    vimeoId:       '',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /CACHETAZO /Frame inciial .webp',
      '../assets/images/STILLS MUSIC VIDEOS /CACHETAZO /Imagen 18-11-24 a las 16.20.webp',
      '../assets/images/STILLS MUSIC VIDEOS /CACHETAZO /Imagen 18-11-24 a las 16.28.webp',
    ],
  },

  'el-rubio-marttein': {
    title:         'Marttein - El Rubio',
    categoryLabel: 'Music Video',
    director:      'Clemente Bruzzone & José Fogwill',
    producer:      'The Movement Land',
    dop:           '',
    year:          '',
    vimeoId:       '1026266849',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /EL RUBIO MARTTEIN /still-1.webp',
      '../assets/images/STILLS MUSIC VIDEOS /EL RUBIO MARTTEIN /still-2.webp',
      '../assets/images/STILLS MUSIC VIDEOS /EL RUBIO MARTTEIN /still-3.webp',
    ],
  },

  'kd': {
    title:         "It's gotta be KD - KD",
    categoryLabel: 'Commercial',
    director:      'Martin Kalina',
    producer:      'Primo Content',
    dop:           'Khalid Mohtaseb',
    year:          '',
    vimeoId:       '939602351',
    secdirector:   'Valentine Torre',
    secdop:        'Iván Juliá',
    stills: [
      '../assets/images/STILLS COMMERCIALS/KD /Sin título_1.1.1 3.webp',
      '../assets/images/STILLS COMMERCIALS/KD /Sin título_1.1.2 2.webp',
      '../assets/images/STILLS COMMERCIALS/KD /Sin título_1.1.8.webp',
    ],
  },

  'grandmaster-trueno': {
    title:         'Trueno - Grandmaster',
    categoryLabel: 'Music Video',
    director:      'Lautaro Furiolo',
    producer:      'Rebolución',
    dop:           '',
    year:          '',
    vimeoId:       '1091630332',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /GRAND MASTER TRUENO /WhatsApp Image 2025-05-26 at 13.58.56.webp',
      '../assets/images/STILLS MUSIC VIDEOS /GRAND MASTER TRUENO /1 - Grandmaster - Stills - 5.webp',
      '../assets/images/STILLS MUSIC VIDEOS /GRAND MASTER TRUENO /1 - Grandmaster - Stills - 14.webp',
    ],
  },

  'nunca-te-vayas': {
    title:         'Nunca Te Vayas de Casa - Cechi Di Marco',
    categoryLabel: 'Music Video',
    director:      'Tomas Murphy & Clara Bunge',
    producer:      '',
    dop:           '',
    year:          '',
    vimeoId:       '1006458917',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS MUSIC VIDEOS /NUNCA TE VAYAS DE CASA CHECHI /0901_NuncaTeVayas.00_00_30_19.Still068 2.webp',
      '../assets/images/STILLS MUSIC VIDEOS /NUNCA TE VAYAS DE CASA CHECHI /0901_NuncaTeVayas.00_01_31_10.Still104.webp',
      '../assets/images/STILLS MUSIC VIDEOS /NUNCA TE VAYAS DE CASA CHECHI /0901_NuncaTeVayas.00_02_45_16.Still134.webp',
    ],
  },

  // ── COMMERCIALS ────────────────────────────────────────────────────

  
  'dont-sync': {
    title:         "Don't Sync - The Kitchen",
    categoryLabel: 'Commercial',
    director:      'Luchi Nobile',
    producer:      'Doce Studios',
    dop:           '',
    year:          '',
    vimeoId:       '1072688254',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS COMMERCIALS/DONT SYNC/Still_1.3.1.webp',
      '../assets/images/STILLS COMMERCIALS/DONT SYNC/Still_4.1.1.webp',
      '../assets/images/STILLS COMMERCIALS/DONT SYNC/Still_4.4.1.webp',
    ],
  },

  'shell-la-joya': {
    title:         'La Joya - Shell',
    categoryLabel: 'Commercial',
    director:      'Mati Moltrasio',
    producer:      'Landia',
    dop:           '',
    year:          '',
    vimeoId:       '1117770024',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS COMMERCIALS/SHELL LA JOYA /la joya _1.1.1.webp',
      '../assets/images/STILLS COMMERCIALS/SHELL LA JOYA /la joya _1.1.2.webp',
      '../assets/images/STILLS COMMERCIALS/SHELL LA JOYA /la joya _1.1.4.webp',
    ],
  },

  'the-chicken-ep3': {
    title:         'The Chicken EP 3',
    categoryLabel: 'Commercial',
    director:      'Luchi Nobile',
    producer:      'Doce Studios',
    dop:           '',
    year:          '',
    vimeoId:       '1048155809',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN EP 3 /Still 2024-12-09 144612_1.3.2.webp',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN EP 3 /Still 2024-12-09 144612_1.4.2.webp',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN EP 3 /Still 2024-12-09 144612_1.6.2.webp',
    ],
  },

  // ── NARRATIVE ───────────────────────────────────────────────────────

  'la-biblioteca': {
    title:         'La Biblioteca',
    categoryLabel: 'Narrative',
    director:      'Gaspar Werthein',
    producer:      '',
    dop:           '',
    year:          '',
    vimeoId:       '',
    secdop:        'Iván Juliá',
    stills: [
      '../assets/images/STILLS NARRATIVES/La biblioteca /jornada.01._1.12.1.webp',
      '../assets/images/STILLS NARRATIVES/La biblioteca /jornada.01._1.13.2.webp',
      '../assets/images/STILLS NARRATIVES/La biblioteca /jornada.03._1.27.2.webp',
    ],
  },

  'mal-trago': {
    title:         'Mal Trago',
    categoryLabel: 'Narrative',
    director:      'Santino Taratuto',
    producer:      '',
    dop:           '',
    year:          '',
    vimeoId:       '936050784',
    secdirector:   '',
    secdop:        '',
    stills: [
      '../assets/images/STILLS NARRATIVES/mal trago /Diseño sin título-4.webp',
      '../assets/images/STILLS NARRATIVES/mal trago /Frame ellos sRGB_centrado.webp',
      '../assets/images/STILLS NARRATIVES/mal trago /Frame Martín baño 2 sRGB.webp',
    ],
  },

  // ── Plantilla para nuevo proyecto ──────────────────────────────────
  // 'mi-proyecto': {
  //   title:         'Título del proyecto',
  //   categoryLabel: 'Music Video',       // o 'Commercial' / 'Narrative'
  //   director:      'Nombre Director',
  //   producer:      'Nombre Productora',
  //   dop:           'Nombre DOP',
  //   year:          '2025',
  //   vimeoId:       '123456789',         // dejar '' si no hay video todavía
  //   stills: [
  //     '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-1.webp',
  //     '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-2.webp',
  //     '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-3.webp',
  //   ],
  // },

};
