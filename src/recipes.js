// ─── DONNÉES RECETTES ────────────────────────────────────────────────────────
// Sources : World Coffee Championships, James Hoffmann, champions officiels

export const METHODS = [
  { id: 'v60',        label: 'V60 (Hario)',      desc: 'Pour-over conique classique' },
  { id: 'switch',     label: 'V60 Switch',        desc: 'Hybride immersion + percolation' },
  { id: 'chemex',     label: 'Chemex',            desc: 'Pour-over à filtre épais' },
  { id: 'french-press', label: 'French Press',   desc: 'Cafetière à piston' },
  { id: 'aeropress',  label: 'AeroPress',         desc: 'Pression manuelle' },
  { id: 'drip',       label: 'Filtre auto',       desc: 'Cafetière filtre automatique' },
  { id: 'kalita',     label: 'Kalita Wave',       desc: 'Pour-over à fond plat' },
  { id: 'origami',    label: 'Origami',           desc: 'Pour-over flexible (V60/Wave)' },
  { id: 'syphon',     label: 'Syphon',            desc: 'Cafetière à dépression' },
  { id: 'cold-brew',  label: 'Cold Brew',         desc: 'Extraction à froid' },
  { id: 'turkish',    label: 'Turc / Ibrik',      desc: 'Cezve / Ibrik' },
]

// badge.type → 'world2025' | 'world2024' | 'world2023' | 'world2019' | 'world2016' | 'expert' | 'standard'
export const BADGE_COLORS = {
  world2025: { bg: '#EAF3DE', text: '#27500A' },
  world2024: { bg: '#FCEBEB', text: '#791F1F' },
  world2023: { bg: '#FAEEDA', text: '#633806' },
  world2019: { bg: '#FAEEDA', text: '#633806' },
  world2016: { bg: '#E6F1FB', text: '#0C447C' },
  expert:    { bg: '#EEEDFE', text: '#3C3489' },
  standard:  { bg: '#E6F1FB', text: '#0C447C' },
}

export const RECIPES = [

  // ─── V60 ────────────────────────────────────────────────────────────────────

  {
    id: 'v60-orthodox-april',
    method: 'v60',
    title: 'The Orthodox — April Brewer Recipe',
    author: 'Patrik Rolf, April Coffee Roasters',
    badge: { type: 'world2019', label: 'Médaille d\'argent WBrC 2019' },
    params: {
      coffee: '13 g',
      water: '200 g',
      ratio: '1:15,4',
      temperature: '90°C',
      grind: 'Grossière (30 clics Comandante)',
      totalTime: '2:20–2:30',
    },
    grindµm: 888,
    steps: [
      { time: 'Avant', instruction: 'Rincer le filtre. Doser 13 g de café. Eau à 90°C pour faire ressortir l\'acidité et la vivacité.' },
      { time: '0:00',  instruction: 'Verser 50 g d\'eau. Laisser reposer 30 secondes (bloom).' },
      { time: '0:30',  instruction: 'Verser 50 g supplémentaires (total 100 g) — verses continues.' },
      { time: '1:00',  instruction: '3e verse de 50 g (total 150 g).' },
      { time: '1:30',  instruction: 'Dernière verse de 50 g (total 200 g). Petit swirl + tap léger pour aplatir le lit.' },
      { time: '2:20',  instruction: 'Fin de l\'extraction. Laisser reposer 1 minute.' },
    ],
    tip: 'Recette à basse température (90°C) pour amplifier l\'acidité et la clarté. Total brew time visé en dessous de 3 minutes.',
  },

  {
    id: 'v60-wbrc2024-wolfl',
    method: 'v60',
    title: 'World Brewers Cup 2024',
    author: 'Martin Wölfl (Autriche)',
    badge: { type: 'world2024', label: 'Champion Monde WBrC 2024' },
    params: {
      coffee: '17 g',
      water: '270 g',
      ratio: '1:15,9',
      temperature: '93°C',
      grind: '490 µm (21–25 clics Comandante)',
      totalTime: '2:00–2:25',
      equipment: 'Orea V4 fast bottom + filtre Sibarist FAST',
    },
    grindµm: 490,
    steps: [
      { time: 'Avant', instruction: 'Aérer le lit avec un needling tool.' },
      { time: '0:00',  instruction: 'Bloom : 60 g pendant ~30 secondes.' },
      { time: '0:30',  instruction: '2e verse : 60 g jusqu\'à 0:40 (total 120 g).' },
      { time: '0:40',  instruction: '50 g jusqu\'à 1:20 (total 170 g).' },
      { time: '1:20',  instruction: 'Dernière verse de 100 g jusqu\'à 2:00 (total 270 g).' },
      { time: '2:25',  instruction: 'Fin.' },
    ],
    tip: 'Café Geisha de Finca Maya (Panama), double fermentation. Augmenter à 95°C pour plus d\'intensité.',
  },

  {
    id: 'v60-wbrc2025-peng',
    method: 'v60',
    title: 'World Brewers Cup 2025',
    author: 'George Jinyang Peng (Chine)',
    badge: { type: 'world2025', label: 'Champion Monde WBrC 2025' },
    params: {
      coffee: '15 g (3 × 5 g, 3 torréfactions différentes)',
      water: '210 g (120 g chaud + 90 g tiède)',
      temperature: '96°C + 80°C',
      grind: 'Médium (11 clics FM grinder)',
      equipment: 'Solo Dripper (Jackie Tran)',
    },
    grindµm: 750,
    steps: [
      { time: 'Avant', instruction: 'Préchauffer le brewer avec 80 g d\'eau à 96°C. Préchauffer le bec de la bouilloire.' },
      { time: '0:00',  instruction: 'Verser 30 g à 96°C en 3 cercles antihoraires sur ~6 secondes.' },
      { time: '~0:30', instruction: 'Verser 90 g à 96°C (total 120 g).' },
      { time: '~1:30', instruction: 'Verser 90 g à 80°C avec un Melodrip (total 210 g).' },
      { time: 'Service', instruction: 'Laisser reposer jusqu\'à 65°C dans la carafe. Verser dans une tasse céramique préchauffée. Service final à 50°C.' },
    ],
    tip: 'Café Geisha de Mount Totumas (Panama). 3 profils de torréfaction (185°C floral, 187°C fruité, 189°C subtil). Concept : "La température est une histoire".',
  },

  {
    id: 'v60-46-kasuya',
    method: 'v60',
    title: 'Méthode 4:6',
    author: 'Tetsu Kasuya (Japon)',
    badge: { type: 'world2016', label: 'Champion Monde WBrC 2016' },
    params: {
      coffee: '20 g',
      water: '300 g',
      ratio: '1:15',
      temperature: '93°C',
      grind: 'Grossière',
      totalTime: '~3:30',
    },
    grindµm: 900,
    steps: [
      { time: '0:00', instruction: '1re verse (40%) : 60 g — contrôle de l\'acidité/sucrosité.' },
      { time: '0:45', instruction: '2e verse (40%) : 60 g.' },
      { time: '1:25', instruction: '3e verse (60%) : 60 g — contrôle de la force.' },
      { time: '2:05', instruction: '4e verse : 60 g.' },
      { time: '2:35', instruction: '5e verse : 60 g.' },
    ],
    tip: 'Réduire à 4 verses pour un café plus léger ; augmenter à 6 verses pour plus de corps.',
  },

  {
    id: 'v60-hoffmann-ultimate',
    method: 'v60',
    title: 'The Ultimate V60 Technique',
    author: 'James Hoffmann',
    badge: { type: 'expert', label: 'Champion WBC 2007' },
    params: {
      coffee: '30 g',
      water: '500 g',
      ratio: '1:16,7',
      temperature: '95–100°C',
      grind: 'Médium-fine',
      totalTime: '~3:30',
    },
    grindµm: 650,
    steps: [
      { time: '0:00', instruction: 'Bloom : 60 g d\'eau. Tourbillonner.' },
      { time: '0:45', instruction: 'Verser jusqu\'à 300 g en 30 secondes.' },
      { time: '1:15', instruction: 'Verser jusqu\'à 500 g en 30 secondes.' },
      { time: '1:45', instruction: 'Stir clockwise puis counter-clockwise. Tourbillonner.' },
      { time: '3:30', instruction: 'Fin du tirage.' },
    ],
    tip: 'Café clair → eau à l\'ébullition. Café foncé → laisser refroidir 15–20 secondes.',
  },

  // ─── V60 SWITCH ─────────────────────────────────────────────────────────────

  {
    id: 'switch-devils-kasuya',
    method: 'switch',
    title: 'The Devil\'s Recipe',
    author: 'Tetsu Kasuya (Japon)',
    badge: { type: 'world2016', label: 'Champion Monde WBrC 2016' },
    params: {
      coffee: '20 g',
      water: '60 + 60 + 160 g',
      temperature: '93°C → 70°C',
      grind: 'Médium-grossière',
    },
    grindµm: 820,
    steps: [
      { time: '0:00', instruction: 'Switch ouvert. Verser 60 g à 93°C.' },
      { time: '0:30', instruction: 'Switch ouvert. Verser 60 g à 93°C.' },
      { time: '1:15', instruction: 'Refroidir l\'eau à 70°C. Fermer le switch.' },
      { time: '1:30', instruction: 'Verser 160 g à 70°C. Infuser 30 secondes.' },
      { time: '2:00', instruction: 'Ouvrir le switch.' },
    ],
    tip: 'Basse température en 2e phase → moins d\'amertume, plus de sucrosité.',
  },

  {
    id: 'switch-wbrc2025-escobar',
    method: 'switch',
    title: 'WBrC 2025 Switch',
    author: 'Carlos Escobar (Colombie)',
    badge: { type: 'world2025', label: '3e place WBrC 2025' },
    params: {
      coffee: '14,5 g',
      water: '200 g',
      temperature: '90°C',
      equipment: 'Hario Switch (selective flow, bypass enlevé)',
    },
    steps: [
      { time: 'Phase 1', instruction: '1re verse — extraction initiale avec switch fermé.' },
      { time: 'Phase 2', instruction: '2e verse — ouverture contrôlée du switch.' },
    ],
    tip: 'Maracaturra de Peña Blancas (Colombie), levure cultivée et bioréacteur. Eau "wave" magnétisée.',
  },

  // ─── CHEMEX ─────────────────────────────────────────────────────────────────

  {
    id: 'chemex-hoffmann',
    method: 'chemex',
    title: 'Recette Chemex',
    author: 'James Hoffmann',
    badge: { type: 'expert', label: 'Champion WBC 2007' },
    params: {
      coffee: '30 g',
      water: '500 g',
      ratio: '1:16,7',
      temperature: '95°C',
      grind: 'Médium-fine',
      totalTime: '~4:10',
    },
    grindµm: 700,
    steps: [
      { time: '0:00', instruction: 'Rincer le filtre épais (côté triple vers le bec). Verser 60–90 g pour le bloom.' },
      { time: '0:10', instruction: 'Remuer pour mouiller tous les grains.' },
      { time: '0:45', instruction: 'Verser jusqu\'à 300 g en cercles.' },
      { time: '1:15', instruction: 'Continuer jusqu\'à 500 g.' },
      { time: '1:45', instruction: 'Stir clockwise + counter-clockwise. Tourbillonner.' },
      { time: '4:10', instruction: 'Fin du tirage.' },
    ],
    tip: 'Filtre Chemex 20–30% plus épais que V60 → tirage plus long.',
  },

  // ─── FRENCH PRESS ────────────────────────────────────────────────────────────

  {
    id: 'french-press-hoffmann',
    method: 'french-press',
    title: 'The Ultimate French Press Technique',
    author: 'James Hoffmann',
    badge: { type: 'expert', label: 'Champion WBC 2007' },
    params: {
      coffee: '30 g',
      water: '500 g',
      ratio: '1:16,7',
      temperature: '95°C',
      grind: 'Médium-grossière',
      totalTime: '~10:00',
    },
    grindµm: 900,
    steps: [
      { time: '0:00', instruction: 'Verser 500 g d\'eau en 10–15 secondes.' },
      { time: '4:00', instruction: 'Briser la croûte avec une cuillère.' },
      { time: '4:30', instruction: 'Écumer la mousse en surface. Couvrir sans plonger.' },
      { time: '9:30', instruction: 'Enfoncer le piston très doucement jusqu\'à la surface du liquide.' },
      { time: '10:00', instruction: 'Verser immédiatement.' },
    ],
    tip: 'Ne pas foncer le piston jusqu\'au fond. Café propre sans texture boueuse.',
  },

  // ─── AEROPRESS ───────────────────────────────────────────────────────────────

  {
    id: 'aeropress-wac2025-pop',
    method: 'aeropress',
    title: 'World AeroPress Championship 2025',
    author: 'Némo Pop (Australie)',
    badge: { type: 'world2025', label: 'Champion Monde WAC 2025' },
    params: {
      coffee: '18 g',
      temperature: '84°C + bypass à 50°C',
      grind: 'Comandante 31 clics, tamisé à 200 µm',
      equipment: 'Flow Control + 2 papiers',
    },
    grindµm: 909,
    steps: [
      { time: 'Méthode', instruction: 'Position standard (upright). Extraction basse température avec flow control.' },
      { time: 'Bypass', instruction: 'Diluer avec eau à 50°C après extraction.' },
    ],
    tip: 'Café Sidra lavé du Finca la Carolina (Équateur). Approche "low temp + flow control". Eau à 125 ppm.',
  },

  {
    id: 'aeropress-wac2024-stanica',
    method: 'aeropress',
    title: 'World AeroPress Championship 2024',
    author: 'George Stanica (Roumanie)',
    badge: { type: 'world2024', label: 'Champion Monde WAC 2024' },
    params: {
      coffee: '18 g',
      water: '240–255 g (divisée)',
      temperature: '96°C + ambiante (0 ppm)',
      grind: '870 µm (Comandante 58 clics)',
      equipment: '1 × filtre Aesir, rincé — position inversée 4e marque',
    },
    grindµm: 870,
    steps: [
      { time: '0:00',  instruction: 'AeroPress inversée. 18 g de café. Verser ~50 g avec Melodrip (5–6 sec).' },
      { time: '0:30',  instruction: 'Bloom 30 secondes.' },
      { time: '~0:35', instruction: '2e verse Melodrip ~50 g.' },
      { time: '~0:45', instruction: 'Stir Nord-Sud-Est-Ouest, 10 secondes.' },
      { time: '1:20',  instruction: 'Cap + retirer l\'air doucement (10 sec).' },
      { time: '1:35',  instruction: 'Swirl + presser en 30–40 secondes (rendement ~76–79 g).' },
      { time: 'Final', instruction: 'Diluer : eau chaude jusqu\'à 130–135 g + 20–30 g d\'eau ambiante 0 ppm.' },
    ],
    tip: 'Café Heirloom lavé d\'Arsosala (Guji, Éthiopie). Eau Aquacode ~85–90 ppm.',
  },

  {
    id: 'aeropress-hoffmann-ultimate',
    method: 'aeropress',
    title: 'The Ultimate AeroPress Recipe',
    author: 'James Hoffmann',
    badge: { type: 'expert', label: 'Champion WBC 2007' },
    params: {
      coffee: '11 g',
      water: '200 g',
      ratio: '1:18',
      temperature: '100°C',
      grind: 'Fin côté médium',
      totalTime: '~3:25',
    },
    grindµm: 480,
    steps: [
      { time: 'Avant', instruction: 'Position normale. Pas de rinçage ni préchauffage.' },
      { time: '0:00', instruction: '11 g de café + 200 g d\'eau bouillante.' },
      { time: '0:10', instruction: 'Insérer le piston ~1 cm pour créer un vide.' },
      { time: '2:00', instruction: 'Tourbillonner doucement. Attendre 30 sec.' },
      { time: '2:30', instruction: 'Presser doucement (~30 secondes).' },
    ],
    tip: 'Pas de rinçage du filtre, pas d\'inversion, eau directement à l\'ébullition.',
  },

  // ─── FILTRE AUTO ─────────────────────────────────────────────────────────────

  {
    id: 'drip-sca-gold-cup',
    method: 'drip',
    title: 'SCA Gold Cup',
    author: 'Specialty Coffee Association',
    badge: { type: 'standard', label: 'Standard mondial' },
    params: {
      coffee: '55 g/litre',
      ratio: '1:18 (SCA) — adapter à 1:15–1:16 maison',
      temperature: '92–96°C',
      grind: 'Médium',
      totalTime: '4–8 min',
    },
    grindµm: 700,
    steps: [
      { time: 'Avant', instruction: 'Utiliser une machine certifiée SCA (Technivorm Moccamaster, Breville Precision Brewer, Fellow Aiden).' },
      { time: 'Mesure', instruction: 'Peser systématiquement café et eau.' },
      { time: 'Eau', instruction: 'Eau filtrée 50–150 mg/L TDS.' },
      { time: 'Après', instruction: 'Transvaser dans un thermos après brassage.' },
    ],
    tip: 'Machines classiques chauffent à 75–85°C → compenser avec ratio 1:15 ou 1:16.',
  },

  // ─── KALITA ──────────────────────────────────────────────────────────────────

  {
    id: 'kalita-rao',
    method: 'kalita',
    title: 'Kalita Wave 185',
    author: 'Scott Rao',
    badge: { type: 'expert', label: 'Consultant café spécialité' },
    params: {
      coffee: '20 g',
      water: '340 g',
      ratio: '1:17',
      temperature: '94–96°C',
      grind: 'Médium',
      totalTime: '~3:00',
    },
    grindµm: 750,
    steps: [
      { time: 'Avant', instruction: 'Rincer le filtre. Aplatir le lit de 20 g.' },
      { time: '0:00', instruction: 'Bloom : 60 g d\'eau en cercles. Rao spin.' },
      { time: '0:45', instruction: 'Verser jusqu\'à 210 g.' },
      { time: '1:30', instruction: 'Quand niveau à mi-hauteur, verser jusqu\'à 340 g.' },
      { time: '2:00', instruction: 'Rao spin pour aplatir.' },
      { time: '3:00', instruction: 'Fin du tirage.' },
    ],
    tip: 'Sur Kalita en inox, insérer un filtre maille métallique sous le filtre papier.',
  },

  // ─── ORIGAMI ─────────────────────────────────────────────────────────────────

  {
    id: 'origami-wbrc2023-medina',
    method: 'origami',
    title: 'World Brewers Cup 2023',
    author: 'Carlos Medina (Chili)',
    badge: { type: 'world2023', label: 'Champion Monde WBrC 2023' },
    params: {
      coffee: '15,5 g',
      water: '250 g',
      ratio: '~1:16',
      temperature: '91°C',
      grind: 'Médium-grossière (28 clics Comandante)',
      equipment: 'Origami Air S (résine AS) + filtre conique V60',
    },
    grindµm: 845,
    steps: [
      { time: '0:00', instruction: 'Verser 50 g.' },
      { time: '0:30', instruction: 'Verser 50 g (total 100 g).' },
      { time: '1:00', instruction: 'Verser 50 g (total 150 g).' },
      { time: '1:30', instruction: 'Verser 50 g (total 200 g) puis 50 g final (total 250 g).' },
      { time: '~3:00', instruction: 'Fin du tirage. Stir final.' },
    ],
    tip: 'Café Natural Sidra de Café Granja La Esperanza (Colombie). Eau TDS 65 ppm (Ca/Mg équilibré).',
  },

  {
    id: 'origami-wbrc2019-du',
    method: 'origami',
    title: 'World Brewers Cup 2019',
    author: 'Jia Ning Du (Chine)',
    badge: { type: 'world2019', label: 'Champion Monde WBrC 2019' },
    params: {
      coffee: '16 g',
      water: '240 g',
      temperature: '94°C',
      grind: 'Médium (26 clics Comandante)',
      equipment: 'Filtre Kalita Wave (fond plat)',
    },
    grindµm: 803,
    steps: [
      { time: 'Avant', instruction: 'Moudre 2 fois pour granulométrie uniforme.' },
      { time: '0:00', instruction: 'Bloom ~45 g. Aérer avec cure-dent ou fourchette.' },
      { time: '0:45', instruction: 'Verser en cercles concentriques jusqu\'à 240 g.' },
      { time: '~3:00', instruction: 'Fin du tirage.' },
    ],
    tip: 'Filtre Kalita Wave avec Origami → brewer hybride. Double mouture améliore l\'uniformité. Eau TDS 80 ppm (4 Ca, 15 Mg).',
  },

  // ─── SYPHON ──────────────────────────────────────────────────────────────────

  {
    id: 'syphon-hario-classic',
    method: 'syphon',
    title: 'Hario Syphon — Méthode classique',
    author: 'Hario Japan',
    badge: { type: 'standard', label: 'Méthode standard' },
    params: {
      coffee: '23 g',
      water: '300 g',
      ratio: '~1:13',
      grind: 'Médium-fine',
      equipment: 'Filtre tissu (cloth) recommandé',
      totalTime: '60–90 sec infusion',
    },
    grindµm: 550,
    steps: [
      { time: 'Étape 1', instruction: 'Tremper le filtre tissu dans l\'eau chaude. L\'installer dans la chambre haute.' },
      { time: 'Étape 2', instruction: '300 g d\'eau préchauffée dans la chambre basse. Allumer le brûleur.' },
      { time: 'Étape 3', instruction: 'Quand l\'eau monte, sceller la chambre haute à angle droit.' },
      { time: 'Étape 4', instruction: 'Ajouter le café. Remuer 3–5 fois en cercle (palette bambou).' },
      { time: 'Étape 5', instruction: 'Baisser la chaleur. Après 45 sec, remuer doucement pour casser la croûte.' },
      { time: 'Étape 6', instruction: 'À 60–90 secondes, éteindre le brûleur.' },
      { time: 'Étape 7', instruction: 'Retirer la chambre haute. Servir.' },
    ],
    tip: 'Idéal pour cafés légers à arômes fruités. Café amer = mouture trop fine ou infusion trop longue.',
  },

  // ─── COLD BREW ───────────────────────────────────────────────────────────────

  {
    id: 'cold-brew-classic',
    method: 'cold-brew',
    title: 'Cold Brew classique (concentré)',
    author: 'Counter Culture / Méthode spécialité',
    badge: { type: 'expert', label: 'Spécialité' },
    params: {
      coffee: '80 g',
      water: '1 litre (froid)',
      ratio: '1:5 à 1:8 (concentré)',
      grind: 'Grossière',
      totalTime: '12–16h au frigo (max 24h)',
    },
    grindµm: 1050,
    steps: [
      { time: 'Étape 1', instruction: 'Moudre grossièrement. Verser dans un bocal ou Hario Mizudashi.' },
      { time: 'Étape 2', instruction: 'Ajouter 1 litre d\'eau froide filtrée. Remuer.' },
      { time: 'Étape 3', instruction: 'Réfrigérateur 12–16 heures.' },
      { time: 'Étape 4', instruction: 'Filtrer 2 fois : passoire fine puis filtre papier.' },
      { time: 'Étape 5', instruction: 'Diluer 1:1 (concentré:eau). Conserver jusqu\'à 2 semaines.' },
    ],
    tip: 'Hoffmann préfère le "Japanese iced coffee" pour les cafés de spécialité.',
  },

  {
    id: 'cold-brew-japanese-iced-hoffmann',
    method: 'cold-brew',
    title: 'Japanese Iced Coffee',
    author: 'James Hoffmann',
    badge: { type: 'expert', label: 'Méthode préférée — Champion WBC 2007' },
    params: {
      coffee: '30 g',
      water: '250 g chaud + 250 g glaçons',
      temperature: '95°C',
      grind: 'Légèrement plus fine',
    },
    grindµm: 600,
    steps: [
      { time: 'Avant', instruction: '250 g de glaçons dans le serveur sous V60/Chemex.' },
      { time: '0:00', instruction: 'Brasser normalement avec 250 g d\'eau chaude.' },
      { time: 'Fin', instruction: 'Tourbillonner pour faire fondre les glaçons. Verser sur de nouveaux glaçons.' },
    ],
    tip: 'Préserve les arômes fruités/floraux que le cold brew perd.',
  },

  // ─── CAFÉ TURC ────────────────────────────────────────────────────────────────

  {
    id: 'turkish-specialty',
    method: 'turkish',
    title: 'Méthode Specialty',
    author: 'Nisan Agca & Konstantinos Komninakis',
    badge: { type: 'expert', label: 'Champions Cezve/Ibrik' },
    params: {
      coffee: '7–8 g par tasse',
      water: '~100 ml par tasse (+10 ml évaporation)',
      grind: 'Ultra-fine (poudre, finer than espresso)',
      equipment: 'Cezve / Ibrik en cuivre',
    },
    grindµm: 100,
    steps: [
      { time: 'Étape 1', instruction: 'Mesurer l\'eau avec la tasse de service. Verser dans le cezve.' },
      { time: 'Étape 2', instruction: 'Ajouter le café ultra-moulu (et le sucre si désiré — ne pas sucrer après).' },
      { time: 'Étape 3', instruction: 'Feu moyen. Remuer 2–3 fois au début seulement.' },
      { time: 'Étape 4', instruction: 'Surveiller la mousse. Ne pas laisser bouillir.' },
      { time: 'Étape 5', instruction: 'Juste avant débordement, retirer du feu. Répartir la mousse dans les tasses.' },
      { time: 'Étape 6', instruction: 'Remettre 10–15 secondes. Verser dans les tasses en mouvement continu.' },
      { time: 'Étape 7', instruction: 'Attendre 2–3 minutes que le marc se dépose.' },
    ],
    tip: 'Champions du monde ne font monter la mousse qu\'une seule fois. Nisan Agca recommande les cafés éthiopiens naturels.',
  },
]
