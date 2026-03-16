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
      '../assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /1 - Violento - Stills - 9.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /1 - Violento - Stills - 11.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /VIOLENTO TRUENO /Frame inicio pagina .jpg',
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
      '../assets/images/STILLS MUSIC VIDEOS /LAURYN/Frame inicio pagina .jpg',
      '../assets/images/STILLS MUSIC VIDEOS /LAURYN/1 - Lauryn - Stills - 1.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /LAURYN/1 - Lauryn - Stills - 11.jpg',
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
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN /Still 2024-12-09 144612_1.13.6.jpg',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN /Still 2024-12-09 144612_1.14.2.jpg',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN /Still 2024-12-09 144612_1.19.1.jpg',
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
      '../assets/images/STILLS MUSIC VIDEOS /MONTONERO BROKE CARREY /thumb.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /MONTONERO BROKE CARREY /default_1.1.13.PNG',
      '../assets/images/STILLS MUSIC VIDEOS /MONTONERO BROKE CARREY /default_1.1.42.PNG',
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
      '../assets/images/STILLS MUSIC VIDEOS /LLAMALO/Imagen 18-11-24 a las 16.16.JPG',
      '../assets/images/STILLS MUSIC VIDEOS /LLAMALO/LLAMALO 2.PNG',
      '../assets/images/STILLS MUSIC VIDEOS /LLAMALO/LLAMALO 3.PNG',
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
      '../assets/images/STILLS COMMERCIALS/AY NOT DEAD /default_1.1.12.jpg',
      '../assets/images/STILLS COMMERCIALS/AY NOT DEAD /default_1.1.21.jpg',
      '../assets/images/STILLS COMMERCIALS/AY NOT DEAD /default_1.1.28_1.jpg',
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
      '../assets/images/STILLS MUSIC VIDEOS /CORTAME AHI /frame inicial.PNG',
      '../assets/images/STILLS MUSIC VIDEOS /CORTAME AHI /CortameAhi_1.2.2.PNG',
      '../assets/images/STILLS MUSIC VIDEOS /CORTAME AHI /CortameAhi_2.39.1.PNG',
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
      '../assets/images/STILLS MUSIC VIDEOS /344 TRUENO /1 - 344 - Stills - 1.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /344 TRUENO /1 - 344 - Stills - 20.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /344 TRUENO /1 - 344 - Stills - 21.jpg',
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
      '../assets/images/STILLS COMMERCIALS/PEDIDOS YA /Untitled_2.1.1.jpg',
      '../assets/images/STILLS COMMERCIALS/PEDIDOS YA /Untitled_2.1.2.jpg',
      '../assets/images/STILLS COMMERCIALS/PEDIDOS YA /Untitled_2.1.5 2.jpg',
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
      '../assets/images/STILLS MUSIC VIDEOS /7 ROJAS BARRO /Frame incial .jpeg',
      '../assets/images/STILLS MUSIC VIDEOS /7 ROJAS BARRO /fotos_1.94.1.JPG',
      '../assets/images/STILLS MUSIC VIDEOS /7 ROJAS BARRO /Untitled_1.6.1 2.PNG',
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
      '../assets/images/STILLS COMMERCIALS/YPF COLAPINTO /Untitled_1.1.1.jpg',
      '../assets/images/STILLS COMMERCIALS/YPF COLAPINTO /Untitled_1.1.2.jpg',
      '../assets/images/STILLS COMMERCIALS/YPF COLAPINTO /Untitled_1.1.3.jpg',
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
      '../assets/images/STILLS MUSIC VIDEOS /CACHETAZO /Frame inciial .jpg',
      '../assets/images/STILLS MUSIC VIDEOS /CACHETAZO /Imagen 18-11-24 a las 16.20.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /CACHETAZO /Imagen 18-11-24 a las 16.28.jpg',
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
      '../assets/images/STILLS MUSIC VIDEOS /EL RUBIO MARTTEIN /still-1.png',
      '../assets/images/STILLS MUSIC VIDEOS /EL RUBIO MARTTEIN /still-2.png',
      '../assets/images/STILLS MUSIC VIDEOS /EL RUBIO MARTTEIN /still-3.png',
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
      '../assets/images/STILLS COMMERCIALS/KD /Sin título_1.1.1 3.JPG',
      '../assets/images/STILLS COMMERCIALS/KD /Sin título_1.1.2 2.JPG',
      '../assets/images/STILLS COMMERCIALS/KD /Sin título_1.1.8.JPG',
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
      '../assets/images/STILLS MUSIC VIDEOS /GRAND MASTER TRUENO /WhatsApp Image 2025-05-26 at 13.58.56.jpeg',
      '../assets/images/STILLS MUSIC VIDEOS /GRAND MASTER TRUENO /1 - Grandmaster - Stills - 5.jpg',
      '../assets/images/STILLS MUSIC VIDEOS /GRAND MASTER TRUENO /1 - Grandmaster - Stills - 14.jpg',
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
      '../assets/images/STILLS MUSIC VIDEOS /NUNCA TE VAYAS DE CASA CHECHI /0901_NuncaTeVayas.00_00_30_19.Still068 2.PNG',
      '../assets/images/STILLS MUSIC VIDEOS /NUNCA TE VAYAS DE CASA CHECHI /0901_NuncaTeVayas.00_01_31_10.Still104.PNG',
      '../assets/images/STILLS MUSIC VIDEOS /NUNCA TE VAYAS DE CASA CHECHI /0901_NuncaTeVayas.00_02_45_16.Still134.PNG',
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
      '../assets/images/STILLS COMMERCIALS/DONT SYNC/Still_1.3.1.jpg',
      '../assets/images/STILLS COMMERCIALS/DONT SYNC/Still_4.1.1.jpg',
      '../assets/images/STILLS COMMERCIALS/DONT SYNC/Still_4.4.1.jpg',
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
      '../assets/images/STILLS COMMERCIALS/SHELL LA JOYA /la joya _1.1.1.jpg',
      '../assets/images/STILLS COMMERCIALS/SHELL LA JOYA /la joya _1.1.2.jpg',
      '../assets/images/STILLS COMMERCIALS/SHELL LA JOYA /la joya _1.1.4.jpg',
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
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN EP 3 /Still 2024-12-09 144612_1.3.2.jpg',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN EP 3 /Still 2024-12-09 144612_1.4.2.jpg',
      '../assets/images/STILLS COMMERCIALS/THE CHICKEN EP 3 /Still 2024-12-09 144612_1.6.2.jpg',
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
      '../assets/images/STILLS NARRATIVES/La biblioteca /jornada.01._1.12.1.PNG',
      '../assets/images/STILLS NARRATIVES/La biblioteca /jornada.01._1.13.2.PNG',
      '../assets/images/STILLS NARRATIVES/La biblioteca /jornada.03._1.27.2.PNG',
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
      '../assets/images/STILLS NARRATIVES/mal trago /Diseño sin título-4.png',
      '../assets/images/STILLS NARRATIVES/mal trago /Frame ellos sRGB_centrado.png',
      '../assets/images/STILLS NARRATIVES/mal trago /Frame Martín baño 2 sRGB.png',
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
  //     '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-1.jpg',
  //     '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-2.jpg',
  //     '../assets/images/STILLS MUSIC VIDEOS /NOMBRE PROYECTO /still-3.jpg',
  //   ],
  // },

};
