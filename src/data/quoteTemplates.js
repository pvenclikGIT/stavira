// Quote templates — pre-built section structures and starter lines.
// Secretary picks a template and fills in quantities — saves 30 min per quote.

export const QUOTE_TEMPLATES = {
  blank: {
    id: 'blank',
    label: 'Prázdná nabídka',
    description: 'Začít od nuly bez předloh.',
    type: null,
    sections: [],
  },

  rd_novostavba: {
    id: 'rd_novostavba',
    label: 'RD — novostavba na klíč',
    description: 'Typická nabídka pro novostavbu rodinného domu 4+kk.',
    type: 'novostavba',
    sections: [
      {
        title: 'Zemní práce a základy',
        lines: [
          { type: 'work', name: 'Vytyčení stavby a vyměření', quantity: 1, unit: 'kpl', unitPrice: 18000 },
          { type: 'work', name: 'Výkop základových pasů', quantity: 1, unit: 'kpl', unitPrice: 65000 },
          { type: 'work', name: 'Bednění a betonáž základů', quantity: 1, unit: 'kpl', unitPrice: 145000 },
          { type: 'material', materialId: 'mat_zelezo_12', quantity: 800 },
          { type: 'material', materialId: 'mat_kari_kh20', quantity: 25 },
          { type: 'material', materialId: 'mat_cement_bm325', quantity: 50 },
        ],
      },
      {
        title: 'Hrubá stavba',
        lines: [
          { type: 'material', materialId: 'mat_pt_38_p15', quantity: 480 },
          { type: 'material', materialId: 'mat_pt_115_p10', quantity: 220 },
          { type: 'material', materialId: 'mat_pt_kp7_200', quantity: 8 },
          { type: 'material', materialId: 'mat_pt_kp7_150', quantity: 6 },
          { type: 'work', name: 'Zdění obvodových stěn', quantity: 280, unit: 'm²', unitPrice: 1450 },
          { type: 'work', name: 'Zdění příček', quantity: 180, unit: 'm²', unitPrice: 980 },
          { type: 'work', name: 'Stropní konstrukce + věnce', quantity: 142, unit: 'm²', unitPrice: 1850 },
        ],
      },
      {
        title: 'Střecha',
        lines: [
          { type: 'work', name: 'Krov a střešní konstrukce', quantity: 1, unit: 'kpl', unitPrice: 280000 },
          { type: 'work', name: 'Střešní krytina + klempířina', quantity: 1, unit: 'kpl', unitPrice: 220000 },
          { type: 'material', materialId: 'mat_lat_50_30', quantity: 80 },
          { type: 'material', materialId: 'mat_bituflex_pv', quantity: 18 },
        ],
      },
      {
        title: 'Sítě a rozvody',
        lines: [
          { type: 'work', name: 'Vnitřní kanalizace — montáž', quantity: 1, unit: 'kpl', unitPrice: 65000 },
          { type: 'material', materialId: 'mat_kg_125_2', quantity: 14 },
          { type: 'material', materialId: 'mat_kg_160_2', quantity: 8 },
          { type: 'work', name: 'Elektroinstalace — silnoproud', quantity: 1, unit: 'kpl', unitPrice: 180000 },
          { type: 'work', name: 'Vodoinstalace + topení', quantity: 1, unit: 'kpl', unitPrice: 220000 },
        ],
      },
      {
        title: 'Omítky a povrchy',
        lines: [
          { type: 'material', materialId: 'mat_tom_mvc8', quantity: 120 },
          { type: 'material', materialId: 'mat_kn_mp75', quantity: 60 },
          { type: 'work', name: 'Vnitřní omítky', quantity: 380, unit: 'm²', unitPrice: 380 },
          { type: 'work', name: 'Štuky a malby', quantity: 380, unit: 'm²', unitPrice: 220 },
        ],
      },
      {
        title: 'Zateplení a fasáda',
        lines: [
          { type: 'material', materialId: 'mat_eps_70f_15', quantity: 240 },
          { type: 'material', materialId: 'mat_weber_700', quantity: 36 },
          { type: 'material', materialId: 'mat_vertex_145', quantity: 130 },
          { type: 'work', name: 'Zateplení fasády ETICS', quantity: 120, unit: 'm²', unitPrice: 950 },
        ],
      },
      {
        title: 'Doprava a zařízení staveniště',
        lines: [
          { type: 'other', name: 'Doprava materiálu', quantity: 1, unit: 'kpl', unitPrice: 35000 },
          { type: 'other', name: 'Lešení a stavební zařízení', quantity: 1, unit: 'kpl', unitPrice: 45000 },
          { type: 'other', name: 'Likvidace odpadu', quantity: 1, unit: 'kpl', unitPrice: 18000 },
        ],
      },
    ],
  },

  rek_koupelna: {
    id: 'rek_koupelna',
    label: 'Rekonstrukce — koupelna',
    description: 'Kompletní rekonstrukce koupelny 5–8 m².',
    type: 'rekonstrukce',
    sections: [
      {
        title: 'Bourací práce',
        lines: [
          { type: 'work', name: 'Demontáž stávajícího vybavení', quantity: 1, unit: 'kpl', unitPrice: 14000 },
          { type: 'work', name: 'Vybourání obkladů a dlažby', quantity: 18, unit: 'm²', unitPrice: 580 },
          { type: 'other', name: 'Likvidace stavebního odpadu', quantity: 1, unit: 'kpl', unitPrice: 8000 },
        ],
      },
      {
        title: 'Rozvody a hydroizolace',
        lines: [
          { type: 'work', name: 'Nové rozvody vody', quantity: 1, unit: 'kpl', unitPrice: 18000 },
          { type: 'work', name: 'Nové odpady', quantity: 1, unit: 'kpl', unitPrice: 14000 },
          { type: 'work', name: 'Elektroinstalace v koupelně', quantity: 1, unit: 'kpl', unitPrice: 16000 },
          { type: 'material', materialId: 'mat_lep_kp_5', quantity: 4 },
          { type: 'work', name: 'Aplikace hydroizolace', quantity: 18, unit: 'm²', unitPrice: 280 },
        ],
      },
      {
        title: 'Obklady a dlažby',
        lines: [
          { type: 'material', materialId: 'mat_kn_flex25', quantity: 6 },
          { type: 'material', materialId: 'mat_kn_fugen5', quantity: 3 },
          { type: 'work', name: 'Pokládka obkladů', quantity: 18, unit: 'm²', unitPrice: 850 },
          { type: 'work', name: 'Pokládka dlažby', quantity: 6, unit: 'm²', unitPrice: 920 },
        ],
      },
      {
        title: 'Sanita a finální montáž',
        lines: [
          { type: 'work', name: 'Montáž sanity (bez materiálu)', quantity: 1, unit: 'kpl', unitPrice: 22000 },
          { type: 'work', name: 'Silikony a finální úklid', quantity: 1, unit: 'kpl', unitPrice: 4500 },
        ],
      },
    ],
  },

  rd_garaz: {
    id: 'rd_garaz',
    label: 'Garáž / přístavek',
    description: 'Zděná garáž ~20 m² s plochou střechou.',
    type: 'novostavba',
    sections: [
      {
        title: 'Základy',
        lines: [
          { type: 'work', name: 'Zemní práce a základová deska', quantity: 1, unit: 'kpl', unitPrice: 78000 },
          { type: 'material', materialId: 'mat_zelezo_10', quantity: 280 },
          { type: 'material', materialId: 'mat_kari_kh20', quantity: 7 },
          { type: 'material', materialId: 'mat_cement_bm325', quantity: 24 },
        ],
      },
      {
        title: 'Hrubá stavba',
        lines: [
          { type: 'material', materialId: 'mat_pt_30_p15', quantity: 80 },
          { type: 'material', materialId: 'mat_pt_kp7_300', quantity: 1 },
          { type: 'work', name: 'Zdění + věnec', quantity: 21, unit: 'm²', unitPrice: 1450 },
        ],
      },
      {
        title: 'Střecha + dokončení',
        lines: [
          { type: 'work', name: 'Plochá střecha s izolací', quantity: 21, unit: 'm²', unitPrice: 2200 },
          { type: 'work', name: 'Omítky a fasáda', quantity: 65, unit: 'm²', unitPrice: 920 },
          { type: 'material', materialId: 'mat_eps_70f_15', quantity: 38 },
          { type: 'work', name: 'Podlaha (beton + epoxid)', quantity: 21, unit: 'm²', unitPrice: 850 },
        ],
      },
      {
        title: 'Doprava',
        lines: [
          { type: 'other', name: 'Doprava materiálu', quantity: 1, unit: 'kpl', unitPrice: 12000 },
        ],
      },
    ],
  },
};

// Section icons for client-facing display
export const SECTION_ICONS = {
  'Zemní práce a základy':       'shovel',
  'Základy':                     'shovel',
  'Hrubá stavba':                'wall',
  'Střecha':                     'home',
  'Sítě a rozvody':              'cable',
  'Omítky a povrchy':            'paintbrush',
  'Zateplení a fasáda':          'shield',
  'Bourací práce':               'hammer',
  'Rozvody a hydroizolace':      'droplets',
  'Obklady a dlažby':            'grid',
  'Sanita a finální montáž':     'check',
  'Doprava a zařízení staveniště': 'truck',
  'Doprava':                     'truck',
  'Střecha + dokončení':         'home',
};
