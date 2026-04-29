import { useState, useEffect, useRef } from 'react'
import { METHODS, RECIPES, BADGE_COLORS } from './recipes.js'

// ─── THÈMES ───────────────────────────────────────────────────────────────────
const DARK = {
  bg:'#0f0f12', bg2:'#16161c', bg3:'#1e1e28', bg4:'#252535',
  border:'#2e2e3e', border2:'#3a3a50',
  text:'#e0e0f0', textDim:'#9090b8', textMute:'#52526e',
  gold:'#d4b06a', blue:'#6ab4d4', green:'#7acca0',
  red:'#d47a7a', orange:'#d4a06a', purple:'#a88ad4',
  inputBg:'#0a0a0e', shadow:'rgba(0,0,0,0.4)',
}
const LIGHT = {
  bg:'#f4f4f8', bg2:'#ffffff', bg3:'#eaeaf2', bg4:'#dddded',
  border:'#c8c8de', border2:'#b0b0cc',
  text:'#1a1a2e', textDim:'#44446a', textMute:'#8888aa',
  gold:'#9a6e20', blue:'#2a7aaa', green:'#2a8a60',
  red:'#aa3a3a', orange:'#9a6020', purple:'#6a4aaa',
  inputBg:'#f8f8ff', shadow:'rgba(0,0,0,0.12)',
}

// ─── MOULINS ──────────────────────────────────────────────────────────────────
// minµm/maxµm = plage totale · clicks = nb total réglages
// espresso/filter/aeropress/chemex/moka = [minRéglage, maxRéglage] en unité native
const GRINDERS = {
  none: { label:'— Sélectionner un moulin —', brand:'', clicks:null, minµm:0, maxµm:1200 },

  // ── Breville / Sage ──
  breville_sgp:  { label:'Smart Grinder Pro',    brand:'Breville (Sage)', clicks:60,  unit:'réglage', minµm:200, maxµm:820,  espresso:[1,18],  filter:[11,60], aeropress:[13,60], chemex:[21,60], moka:[17,44], description:'60 réglages · 200–820µm' },
  breville_dcp:  { label:'Dose Control Pro',      brand:'Breville (Sage)', clicks:40,  unit:'réglage', minµm:200, maxµm:820,  espresso:[1,12],  filter:[8,40],  aeropress:[8,40],  chemex:[14,40], moka:[11,30], description:'40 réglages · 200–820µm' },

  // ── Baratza ──
  baratza_encore:      { label:'Encore',          brand:'Baratza', clicks:40,  unit:'clic',    minµm:250, maxµm:1150, espresso:[5,12],  filter:[18,28], aeropress:[10,22], chemex:[20,30], moka:[8,14],  description:'40 réglages · 250–1150µm' },
  baratza_encore_esp:  { label:'Encore ESP',      brand:'Baratza', clicks:40,  unit:'clic',    minµm:200, maxµm:1150, espresso:[2,12],  filter:[16,28], aeropress:[8,22],  chemex:[18,30], moka:[6,14],  description:'40 réglages · 200–1150µm' },
  baratza_virtuoso:    { label:'Virtuoso+',        brand:'Baratza', clicks:40,  unit:'clic',    minµm:250, maxµm:1100, espresso:[5,12],  filter:[18,28], aeropress:[10,22], chemex:[20,28], moka:[8,14],  description:'40 réglages · 250–1100µm' },
  baratza_vario:       { label:'Vario / Vario+',  brand:'Baratza', clicks:230, unit:'clic',    minµm:200, maxµm:1300, espresso:[40,80], filter:[100,180],aeropress:[60,140],chemex:[120,200],moka:[50,90], description:'230 réglages · 200–1300µm' },
  baratza_sette270:    { label:'Sette 270',        brand:'Baratza', clicks:270, unit:'réglage', minµm:200, maxµm:700,  espresso:[1,60],  filter:[120,200],aeropress:[60,150],chemex:[140,220],moka:[30,80], description:'270 micro-réglages · espresso' },

  // ── Mahlkönig ──
  mahlkonig_e65s: { label:'E65S',  brand:'Mahlkönig', clicks:null, unit:'µm', minµm:100, maxµm:1200, espresso:[200,400], filter:[500,900], aeropress:[350,700], chemex:[600,900],  moka:[300,500], description:'Affichage µm direct · professionnel' },
  mahlkonig_x54:  { label:'X54',   brand:'Mahlkönig', clicks:null, unit:'µm', minµm:150, maxµm:1100, espresso:[200,400], filter:[500,850], aeropress:[350,700], chemex:[600,900],  moka:[280,480], description:'Affichage µm · domestic haut de gamme' },
  mahlkonig_ek43: { label:'EK43',  brand:'Mahlkönig', clicks:10,   unit:'numéro', minµm:200, maxµm:1400, espresso:[1,3],   filter:[6,9],    aeropress:[4,7],     chemex:[7,9],     moka:[2,4],   description:'Référence filtre/single dose 0–10' },

  // ── Eureka ──
  eureka_specialita: { label:'Mignon Specialità', brand:'Eureka', clicks:null, unit:'µm', minµm:170, maxµm:600, espresso:[170,280], filter:[380,550], aeropress:[280,480], chemex:[400,550], moka:[220,340], description:'Affichage µm · très précis espresso' },
  eureka_silenzio:   { label:'Mignon Silenzio',   brand:'Eureka', clicks:null, unit:'µm', minµm:170, maxµm:600, espresso:[170,280], filter:[380,550], aeropress:[280,480], chemex:[400,550], moka:[220,340], description:'Version silencieuse · même gamme' },

  // ── Niche ──
  niche_zero: { label:'Zero', brand:'Niche', clicks:50, unit:'numéro', minµm:200, maxµm:1100, espresso:[15,22], filter:[30,45], aeropress:[22,38], chemex:[35,48], moka:[18,26], description:'50 numéros · single-dose de référence' },
  niche_duo:  { label:'Duo',  brand:'Niche', clicks:50, unit:'numéro', minµm:200, maxµm:1100, espresso:[15,22], filter:[30,45], aeropress:[22,38], chemex:[35,48], moka:[18,26], description:'50 numéros · double sortie' },

  // ── Comandante ──
  comandante_c40:      { label:'C40 MK4',                 brand:'Comandante', clicks:40, unit:'clic', minµm:250, maxµm:1100, espresso:[12,22], filter:[24,36], aeropress:[18,30], chemex:[28,38], moka:[14,22], description:'40 clics/tour · référence manuel' },
  comandante_c40_red:  { label:'C40 MK4 (Red Clix)',      brand:'Comandante', clicks:40, unit:'clic', minµm:160, maxµm:750,  espresso:[16,30], filter:[32,48], aeropress:[24,40], chemex:[38,52], moka:[18,28], description:'Résolution fine · 160–750µm' },
  comandante_c60:      { label:'C60 Baracuda',            brand:'Comandante', clicks:40, unit:'clic', minµm:230, maxµm:1100, espresso:[10,20], filter:[22,34], aeropress:[16,28], chemex:[26,36], moka:[12,20], description:'60mm burrs · puissant' },

  // ── 1Zpresso ──
  zpresso_jmax:    { label:'J-Max',    brand:'1Zpresso', clicks:90,  unit:'clic', minµm:150, maxµm:1000, espresso:[10,25], filter:[45,70], aeropress:[25,55], chemex:[55,80], moka:[15,28], description:'90 clics/tour · précision maximale' },
  zpresso_jxpro:   { label:'JX-Pro',   brand:'1Zpresso', clicks:90,  unit:'clic', minµm:150, maxµm:900,  espresso:[10,22], filter:[40,65], aeropress:[22,50], chemex:[50,70], moka:[12,25], description:'90 clics/tour · polyvalent' },
  zpresso_kmax:    { label:'K-Max',    brand:'1Zpresso', clicks:90,  unit:'clic', minµm:150, maxµm:900,  espresso:[8,22],  filter:[40,65], aeropress:[22,50], chemex:[50,70], moka:[10,24], description:'90 clics/tour · option acier inox' },
  zpresso_zp6:     { label:'ZP6',      brand:'1Zpresso', clicks:180, unit:'clic', minµm:100, maxµm:900,  espresso:[10,40], filter:[80,130],aeropress:[45,100],chemex:[100,140],moka:[15,35], description:'180 clics/tour · ultra précis espresso' },

  // ── Timemore ──
  timemore_c2:     { label:'C2',       brand:'Timemore', clicks:20, unit:'clic', minµm:250, maxµm:1000, espresso:[8,15],  filter:[14,22], aeropress:[10,18], chemex:[16,24], moka:[9,14],  description:'20 clics/tour · rapport qualité/prix' },
  timemore_c3pro:  { label:'C3 Pro',   brand:'Timemore', clicks:20, unit:'clic', minµm:200, maxµm:1000, espresso:[7,14],  filter:[13,21], aeropress:[9,17],  chemex:[15,22], moka:[8,13],  description:'20 clics/tour · burrs améliorés' },
  timemore_slim6:  { label:'Slim 6',   brand:'Timemore', clicks:60, unit:'clic', minµm:200, maxµm:900,  espresso:[6,12],  filter:[18,30], aeropress:[10,22], chemex:[20,32], moka:[7,14],  description:'60 réglages · compact voyage' },

  // ── Fellow ──
  fellow_ode2:  { label:'Ode Gen 2',  brand:'Fellow', clicks:110, unit:'réglage', minµm:350, maxµm:1100, espresso:[2,10],  filter:[40,80], aeropress:[20,60],  chemex:[55,90], moka:[15,35], description:'11 macro × 10 micro · optimisé filter' },
  fellow_opus:  { label:'Opus',       brand:'Fellow', clicks:110, unit:'réglage', minµm:200, maxµm:1100, espresso:[2,18],  filter:[50,90], aeropress:[20,65],  chemex:[60,95], moka:[10,30], description:'110 réglages · espresso + filter' },

  // ── Wilfa ──
  wilfa_svart: { label:'Svart Aroma',  brand:'Wilfa', clicks:6, unit:'position', minµm:300, maxµm:1000, espresso:[1,2], filter:[3,5], aeropress:[2,4], chemex:[4,6], moka:[1,3], description:'6 positions · simple et efficace' },

  // ── Hario ──
  hario_skerton: { label:'Skerton Pro', brand:'Hario', clicks:null, unit:'tours',  minµm:200, maxµm:900, espresso:[0.5,2], filter:[3,5], aeropress:[2,4], chemex:[4,6], moka:[1,3], description:'Manuel · nb de tours depuis serré' },

  // ── Porlex ──
  porlex_mini2: { label:'Mini II',  brand:'Porlex', clicks:15, unit:'clic', minµm:250, maxµm:850, espresso:[4,8],  filter:[9,13], aeropress:[6,11], chemex:[10,14], moka:[5,9], description:'15 clics · ultra compact voyage' },

  // ── Kinu ──
  kinu_m47: { label:'M47 Phoenix/Classic', brand:'Kinu', clicks:null, unit:'µm', minµm:150, maxµm:1000, espresso:[150,280], filter:[450,800], aeropress:[300,650], chemex:[550,800], moka:[200,380], description:'Affichage µm · ingénierie allemande' },

  // ── Rancilio ──
  rancilio_rocky: { label:'Rocky', brand:'Rancilio', clicks:55, unit:'réglage', minµm:180, maxµm:1100, espresso:[10,20], filter:[30,45], aeropress:[18,35], chemex:[32,48], moka:[12,22], description:'55 réglages · robuste semi-pro' },

  // ── De\'Longhi ──
  delonghi_kg79: { label:'KG79 / KG89',  brand:"De'Longhi", clicks:18, unit:'réglage', minµm:200, maxµm:1000, espresso:[1,4],  filter:[8,14], aeropress:[5,12],  chemex:[10,16], moka:[3,7],  description:'18 réglages · entrée de gamme' },

  // ── Weber ──
  weber_key: { label:'Key', brand:'Weber', clicks:null, unit:'µm', minµm:200, maxµm:1000, espresso:[200,300], filter:[450,750], aeropress:[300,650], chemex:[550,750], moka:[250,420], description:'Précision µm · single dose premium' },

  // ── Lagom ──
  lagom_p64: { label:'P64', brand:'Lagom', clicks:11, unit:'numéro', minµm:200, maxµm:1200, espresso:[0,2], filter:[5,9], aeropress:[3,7], chemex:[6,10], moka:[1,3], description:'Numéros 0–11 · burrs 64mm' },

  // ── DF64 ──
  df64: { label:'DF64 (Turin)', brand:'Turin/DF', clicks:11, unit:'numéro', minµm:150, maxµm:800, espresso:[2,4], filter:[7,10], aeropress:[4,8], chemex:[8,11], moka:[3,5], description:'Single-dose 64mm burrs' },

  // ── Mazzer ──
  mazzer_mini: { label:'Mini E (Type A)', brand:'Mazzer', clicks:null, unit:'numéro', minµm:150, maxµm:700, espresso:[150,280], filter:[400,650], aeropress:[300,550], chemex:[450,650], moka:[200,350], description:'Professionnel · semi-com.' },

  // ── Capresso ──
  capresso_infinity: { label:'Infinity Plus', brand:'Capresso', clicks:20, unit:'réglage', minµm:200, maxµm:1000, espresso:[1,4], filter:[8,16], aeropress:[5,13], chemex:[10,18], moka:[3,7], description:'20 réglages · conique acier' },
}

// ─── MÉTHODES ─────────────────────────────────────────────────────────────────
const BREW_METHODS = {
  espresso:  { label:'Espresso',  icon:'☕', targetRatioMin:1.5, targetRatioMax:2.5,  targetTimeMin:20,  targetTimeMax:35,  grindBaseµm:200, grindRangeµm:[150,380],  description:'1:2 · 20–35s' },
  filter:    { label:'Filtre',    icon:'▽', targetRatioMin:14,  targetRatioMax:18,   targetTimeMin:180, targetTimeMax:300, grindBaseµm:700, grindRangeµm:[300,900],  description:'1:15 · 3–5min' },
  aeropress: { label:'AeroPress', icon:'⬡', targetRatioMin:6,   targetRatioMax:12,   targetTimeMin:60,  targetTimeMax:150, grindBaseµm:500, grindRangeµm:[320,960],  description:'1:8 · 1–2.5min' },
  chemex:    { label:'Chemex',    icon:'◇', targetRatioMin:15,  targetRatioMax:17,   targetTimeMin:210, targetTimeMax:360, grindBaseµm:800, grindRangeµm:[600,1000], description:'1:16 · 3.5–6min' },
  moka:      { label:'Moka',      icon:'◈', targetRatioMin:6,   targetRatioMax:8,    targetTimeMin:180, targetTimeMax:300, grindBaseµm:400, grindRangeµm:[360,660],  description:'1:7 · 3–5min' },
}

const MC = '#6ab4d4'
const STORAGE_KEY = 'torrea_v3'
const COFFEE_LIB_KEY = 'torrea_coffees'
const PARAMS_KEY = 'torrea_params_v1'
function loadSavedParams() {
  try { return JSON.parse(localStorage.getItem(PARAMS_KEY)||'{}') } catch { return {} }
}

// ─── CATALOGUE TORREA ─────────────────────────────────────────────────────────
const COFFEE_CATALOG = [
  { name:'Capucas',  country:'Honduras',  variety:'', profile:'Chocolat, caramel, réglisse — gourmand et puissant', process:'Lavé', notes:'Riche, longue persistance · 1300–1800m · idéal espresso' },
  { name:'El Palomar', country:'Pérou',   variety:'', profile:'Fruits secs, agrumes — doux et raffiné',             process:'Lavé', notes:'Acidité légère · finale douce · 1400–1900m' },
  { name:'El Triunfo', country:'Mexique', variety:'', profile:'Chocolat — rond et gourmand',                        process:'Lavé', notes:'Équilibré et puissant · 1200–1600m · crowd pleaser' },
  { name:'Palanda',  country:'Équateur',  variety:'', profile:'Chocolat, caramel, miel, malt — doux et sucré',      process:'Naturel', notes:'Très gourmand, peu d\'acidité · forêt nuageuse' },
  { name:'Kitché',   country:'Guatemala', variety:'', profile:'Fruits secs, agrumes, floral — complexe et équilibré',process:'Lavé', notes:'Corps intense · 1000–1500m' },
  { name:'Salomon',  country:'Éthiopie',  variety:'Heirloom', profile:'Caramel, chocolat noir, citron, pêche — fin et expressif', process:'Lavé', notes:'84 SCA · acidité vive · 1900–2200m' },
]

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)) }
function r2(v) { return Math.round(v * 100) / 100 }
function formatTime(s) {
  if (s < 60) return `${s}s`
  const m = Math.floor(s/60), r = s%60
  return r > 0 ? `${m}m${String(r).padStart(2,'0')}s` : `${m}min`
}

// Convert µm value to native grinder setting
function µmToSetting(µm, g) {
  if (!g || g.label === '— Sélectionner un moulin —' || !g.clicks || !g.minµm) return null
  const pct = (µm - g.minµm) / (g.maxµm - g.minµm)
  return Math.max(1, Math.round(pct * g.clicks))
}

// ─── ALGORITHMES ──────────────────────────────────────────────────────────────
function computeDialIn({ method, doseG, yieldG, extractionTimeSec, currentGrindµm }) {
  const m = BREW_METHODS[method]
  if (!m || !doseG || !yieldG || !extractionTimeSec) return null
  const ratio = yieldG / doseG
  const rS = ratio<m.targetRatioMin ? ratio/m.targetRatioMin : ratio>m.targetRatioMax ? m.targetRatioMax/ratio : 1
  const tS = extractionTimeSec<m.targetTimeMin ? extractionTimeSec/m.targetTimeMin : extractionTimeSec>m.targetTimeMax ? m.targetTimeMax/extractionTimeSec : 1
  const score = Math.round((rS*0.45+tS*0.55)*100)
  let delta=0, dir=null, reasons=[]
  const fast=extractionTimeSec<m.targetTimeMin, slow=extractionTimeSec>m.targetTimeMax
  if (fast)  { delta -= Math.round(((m.targetTimeMin-extractionTimeSec)/m.targetTimeMin)*80+10); dir='finer';   reasons.push(`Trop rapide (${formatTime(extractionTimeSec)})`) }
  if (slow)  { delta += Math.round(((extractionTimeSec-m.targetTimeMax)/m.targetTimeMax)*80+10); dir='coarser'; reasons.push(`Trop lent (${formatTime(extractionTimeSec)})`) }
  if (ratio<m.targetRatioMin&&!fast){delta-=10;if(!dir)dir='finer'}
  if (ratio>m.targetRatioMax&&!slow){delta+=10;if(!dir)dir='coarser'}
  const ng = clamp(Math.round((currentGrindµm+delta)/5)*5, m.grindRangeµm[0], m.grindRangeµm[1])
  return { score, ratioScore:Math.round(rS*100), timeScore:Math.round(tS*100), ratio, grindDelta:ng-currentGrindµm, newGrind:ng, dir, steps:Math.round(Math.abs(delta)/5), reasons, isPerfect:score>=90 }
}

function computeTasteGrind({ taste, method, doseG, yieldG, currentGrindµm }, T) {
  const m = BREW_METHODS[method]; if (!m) return null
  if (taste==='perfect') return { taste, delta:0, newGrind:currentGrindµm, newYield:yieldG, detail:[], color:T.green, message:'✓ RECETTE SAUVEGARDÉE', steps:0 }
  const ratio=yieldG/doseG; let delta=0, newYield=yieldG, detail=[]
  if (taste==='acid') {
    delta = -(15+Math.round(Math.max(0,m.targetRatioMin-ratio)*8))
    detail.push('Mouture plus fine → extraction accrue')
    if (ratio>=m.targetRatioMin&&ratio<=m.targetRatioMax) { newYield=Math.max(Math.round(doseG*m.targetRatioMin),yieldG-Math.round(doseG*0.3)); if(newYield!==yieldG)detail.push(`Rendement → ${newYield}g`) }
  } else {
    delta = +(15+Math.round(Math.max(0,ratio-m.targetRatioMax)*8))
    detail.push('Mouture plus grossière → extraction réduite')
    if (ratio>=m.targetRatioMin&&ratio<=m.targetRatioMax) { newYield=Math.min(Math.round(doseG*m.targetRatioMax),yieldG+Math.round(doseG*0.3)); if(newYield!==yieldG)detail.push(`Rendement → ${newYield}g`) }
  }
  const ng = clamp(Math.round((currentGrindµm+delta)/5)*5, m.grindRangeµm[0], m.grindRangeµm[1])
  const actual = ng-currentGrindµm
  return { taste, delta:actual, newGrind:ng, newYield, detail, color:taste==='acid'?T.blue:T.orange, message:taste==='acid'?`← PLUS FIN · ${ng}µm`:`→ PLUS GROSSIER · ${ng}µm`, steps:Math.round(Math.abs(actual)/5) }
}

function computeMachineDialIn({ doseG, yieldG, timeSec, tempC, preInfPct, preInfSec, classic=false }) {
  if (!doseG||!yieldG||!timeSec) return null
  const ratio=yieldG/doseG
  const rS=ratio<1.5?ratio/1.5:ratio>2.5?2.5/ratio:1
  const tS=timeSec<20?timeSec/20:timeSec>35?35/timeSec:1
  const tmpS=tempC<90?tempC/90:tempC>96?96/tempC:1
  const score=Math.round((rS*0.35+tS*0.4+tmpS*0.25)*100)
  let suggestions=[], newTemp=tempC, newPreInfSec=preInfSec, newPreInfPct=preInfPct
  if (timeSec<20){
    suggestions.push(classic?'Trop rapide → baisser la température':'Trop rapide → baisser temp. ou augmenter pré-infusion')
    newTemp=clamp(tempC-1,85,96)
    if(!classic) newPreInfSec=clamp(preInfSec+2,1,30)
  } else if (timeSec>35){
    suggestions.push(classic?'Trop lent → monter la température':'Trop lent → monter temp. ou réduire pré-infusion')
    newTemp=clamp(tempC+1,85,96)
    if(!classic) newPreInfSec=clamp(preInfSec-1,1,30)
  }
  if (ratio<1.5) suggestions.push(`Rendement faible (1:${ratio.toFixed(1)}) → vérifier mouture`)
  if (ratio>2.5) suggestions.push(`Rendement élevé (1:${ratio.toFixed(1)}) → réduire le yield`)
  return { score, ratioScore:Math.round(rS*100), timeScore:Math.round(tS*100), tempScore:Math.round(tmpS*100), ratio, suggestions, newTemp, newPreInfSec, newPreInfPct, isPerfect:score>=90 }
}

function computeTasteMachine({ taste, tempC, preInfPct, preInfSec, yieldG, classic=false }, T) {
  if (taste==='perfect') return { taste, color:T.green, message:'✓ RECETTE SAUVEGARDÉE', detail:[], newTemp:tempC, newPreInfPct:preInfPct, newPreInfSec:preInfSec, newYield:yieldG }
  let newTemp=tempC, newPreInfPct=preInfPct, newPreInfSec=preInfSec, detail=[]
  if (taste==='acid') {
    newTemp=clamp(tempC+1,85,96)
    detail.push(`Température → ${newTemp}°C`)
    if(!classic){newPreInfSec=clamp(preInfSec+2,1,30);newPreInfPct=clamp(preInfPct+5,55,99);detail.push(`Pré-infusion → ${newPreInfSec}s à ${newPreInfPct}%`)}
    detail.push("Extraction accrue → réduit l'acidité")
  } else {
    newTemp=clamp(tempC-1,85,96)
    detail.push(`Température → ${newTemp}°C`)
    if(!classic){newPreInfSec=clamp(preInfSec-1,1,30);newPreInfPct=clamp(preInfPct-5,55,99);detail.push(`Pré-infusion → ${newPreInfSec}s à ${newPreInfPct}%`)}
    detail.push("Extraction réduite → moins d'amertume")
  }
  return { taste, color:taste==='acid'?T.blue:T.orange, message:taste==='acid'?'↑ PLUS CHAUD':'↓ PLUS FROID', detail, newTemp, newPreInfPct, newPreInfSec, newYield:yieldG }
}

// ─── FOND ANIMÉ : MOLÉCULE CAFÉINE ────────────────────────────────────────────
const CAF_ATOMS = [
  {id:'N1', x:-30,y:-14,el:'N'},{id:'C2', x:-18,y:-34,el:'C'},{id:'N3', x:6,  y:-34,el:'N'},
  {id:'C4', x:20, y:-14,el:'C'},{id:'C5', x:12, y:8,  el:'C'},{id:'C6', x:-18,y:8,  el:'C'},
  {id:'N9', x:28, y:-22,el:'N'},{id:'C8', x:38, y:0,  el:'C'},{id:'N7', x:28, y:22, el:'N'},
  {id:'O2', x:-24,y:-54,el:'O'},{id:'O6', x:-30,y:28, el:'O'},
  {id:'Me1',x:-54,y:-14,el:'CH₃'},{id:'Me3',x:12,y:-54,el:'CH₃'},{id:'Me7',x:36,y:40,el:'CH₃'},
  {id:'H8', x:58, y:2,  el:'H'},
]
const CAF_BONDS = [
  {a:'N1',b:'C2',d:false},{a:'C2',b:'N3',d:false},{a:'N3',b:'C4',d:true},
  {a:'C4',b:'C5',d:false},{a:'C5',b:'C6',d:false},{a:'C6',b:'N1',d:false},
  {a:'C4',b:'N9',d:false},{a:'N9',b:'C8',d:false},{a:'C8',b:'N7',d:false},{a:'N7',b:'C5',d:true},
  {a:'N1',b:'Me1',d:false},{a:'N3',b:'Me3',d:false},{a:'N7',b:'Me7',d:false},
  {a:'C2',b:'O2',d:true},{a:'C6',b:'O6',d:true},{a:'C8',b:'H8',d:false},
]
const CAF_MAP = {}
CAF_ATOMS.forEach(a => { CAF_MAP[a.id] = a })

function CaffeineBackground({ darkMode }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight }
    resize(); window.addEventListener('resize', resize)

    const makeMol = () => ({
      x: Math.random()*window.innerWidth, y: Math.random()*window.innerHeight,
      vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2,
      angle: Math.random()*Math.PI*2, va: (Math.random()-0.5)*0.003,
      scale: 1.0 + Math.random()*0.5,
      opacity: darkMode ? 0.11+Math.random()*0.07 : 0.06+Math.random()*0.04,
    })
    const mols = Array.from({length:4}, makeMol)
    let animId

    const draw = () => {
      const w=canvas.width, h=canvas.height
      ctx.clearRect(0,0,w,h)
      const bR=darkMode?210:70, bG=darkMode?165:55, bB=darkMode?85:20
      const bgRGB=darkMode?'15,15,18':'244,244,248'

      mols.forEach(mol => {
        mol.x+=mol.vx; mol.y+=mol.vy; mol.angle+=mol.va
        if(mol.x<-160)mol.x=w+160; if(mol.x>w+160)mol.x=-160
        if(mol.y<-160)mol.y=h+160; if(mol.y>h+160)mol.y=-160
        ctx.save()
        ctx.translate(mol.x,mol.y); ctx.rotate(mol.angle); ctx.scale(mol.scale,mol.scale)
        ctx.globalAlpha=mol.opacity
        const bc=`rgb(${bR},${bG},${bB})`

        CAF_BONDS.forEach(({a,b,d})=>{
          const a1=CAF_MAP[a], a2=CAF_MAP[b]; if(!a1||!a2) return
          ctx.strokeStyle=bc; ctx.lineWidth=2.2; ctx.lineCap='round'
          if(d){
            const dx=a2.x-a1.x, dy=a2.y-a1.y, len=Math.sqrt(dx*dx+dy*dy)
            const nx=(-dy/len)*2.5, ny=(dx/len)*2.5
            ctx.beginPath(); ctx.moveTo(a1.x+nx,a1.y+ny); ctx.lineTo(a2.x+nx,a2.y+ny); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(a1.x-nx,a1.y-ny); ctx.lineTo(a2.x-nx,a2.y-ny); ctx.stroke()
          } else {
            ctx.beginPath(); ctx.moveTo(a1.x,a1.y); ctx.lineTo(a2.x,a2.y); ctx.stroke()
          }
        })

        CAF_ATOMS.forEach(atom=>{
          if(atom.el==='C') return
          const fs=atom.el.length>2?9:atom.el==='H'?8:11
          ctx.font=`bold ${fs}px monospace`
          ctx.textAlign='center'; ctx.textBaseline='middle'
          const tw=ctx.measureText(atom.el).width+6, th=fs+4
          ctx.fillStyle=`rgba(${bgRGB},0.88)`
          ctx.fillRect(atom.x-tw/2,atom.y-th/2,tw,th)
          ctx.fillStyle=atom.el==='O'?`rgb(${darkMode?'220,90,90':'180,40,40'})`:
            atom.el==='N'?`rgb(${darkMode?'90,155,220':'30,80,160'})`:
            atom.el==='H'?`rgb(${darkMode?'150,150,170':'100,100,120'})`:bc
          ctx.fillText(atom.el,atom.x,atom.y)
        })

        if(darkMode){
          const grd=ctx.createRadialGradient(0,0,0,0,0,65)
          grd.addColorStop(0,`rgba(${bR},${bG},${bB},0.07)`)
          grd.addColorStop(1,`rgba(${bR},${bG},${bB},0)`)
          ctx.globalAlpha=mol.opacity*1.4; ctx.fillStyle=grd
          ctx.beginPath(); ctx.arc(0,0,65,0,Math.PI*2); ctx.fill()
        }
        ctx.restore()
      })
      animId=requestAnimationFrame(draw)
    }
    draw()
    return ()=>{ cancelAnimationFrame(animId); window.removeEventListener('resize',resize) }
  },[darkMode])
  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}}/>
}

// ─── MODAL GRIND SIZE CHART ───────────────────────────────────────────────────
const CHART_METHODS = [
  {label:'Turc',            min:40,   max:220,  color:'#e05050'},
  {label:'Espresso',        min:180,  max:380,  color:'#d4b06a'},
  {label:'Moka',            min:360,  max:660,  color:'#d4a06a'},
  {label:'AeroPress',       min:320,  max:960,  color:'#7acca0'},
  {label:'Siphon',          min:375,  max:800,  color:'#a88ad4'},
  {label:'V60',             min:400,  max:700,  color:'#6ab4d4'},
  {label:'Filtre machine',  min:300,  max:900,  color:'#6ab4d4'},
  {label:'Pour-over',       min:410,  max:930,  color:'#7acca0'},
  {label:'Chemex',          min:600,  max:1000, color:'#a88ad4'},
  {label:'Steep & Release', min:450,  max:825,  color:'#7aacb4'},
  {label:'Cupping',         min:460,  max:850,  color:'#c0a060'},
  {label:'French Press',    min:690,  max:1300, color:'#8080d0'},
  {label:'Cold Brew',       min:800,  max:1400, color:'#4090b0'},
  {label:'Cold Drip',       min:820,  max:1270, color:'#4090b0'},
]

function GrindChartModal({ onClose, T }) {
  const W=320, PAD=80, MAXUM=1400, BAR_H=18, GAP=6
  const TOTAL_H = CHART_METHODS.length*(BAR_H+GAP)+60
  const xScale = v => PAD + (v/MAXUM)*(W-PAD-10)
  const ticks = [0,200,400,600,800,1000,1200,1400]
  return (
    <div style={{position:'fixed',inset:0,background:'#000000ee',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
      <div style={{background:T.bg2,border:`1px solid ${T.border2}`,borderRadius:12,padding:20,width:'100%',maxWidth:420,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:700,letterSpacing:'0.2em',color:T.gold}}>GRIND SIZE CHART</div>
          <button onClick={onClose} style={{background:'transparent',border:`1px solid ${T.border}`,color:T.textDim,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:18,lineHeight:1,touchAction:'manipulation'}}>×</button>
        </div>
        <div style={{fontFamily:'monospace',fontSize:9,color:T.textMute,marginBottom:12,letterSpacing:'0.1em'}}>SOURCE : HONESTCOFFEEGUIDE.COM · EN MICRONS (µm)</div>

        <svg width="100%" viewBox={`0 0 ${W} ${TOTAL_H}`} style={{overflow:'visible'}}>
          {/* Tick lines */}
          {ticks.map(t=>(
            <g key={t}>
              <line x1={xScale(t)} y1={20} x2={xScale(t)} y2={TOTAL_H-20} stroke={T.border} strokeWidth="0.5" strokeDasharray="2,3"/>
              <text x={xScale(t)} y={14} textAnchor="middle" style={{fontFamily:'monospace',fontSize:7,fill:T.textMute}}>{t}</text>
            </g>
          ))}
          {/* Grind size classification */}
          {[{s:0,e:200,l:'XF'},{s:200,e:400,l:'F'},{s:400,e:600,l:'MF'},{s:600,e:800,l:'M'},{s:800,e:1000,l:'MC'},{s:1000,e:1200,l:'C'},{s:1200,e:1400,l:'XC'}].map(z=>(
            <rect key={z.l} x={xScale(z.s)} y={18} width={xScale(z.e)-xScale(z.s)} height={3} fill={T.border} opacity="0.5"/>
          ))}
          {/* Bars */}
          {CHART_METHODS.map((m,i)=>{
            const y=26+i*(BAR_H+GAP)
            const x1=xScale(m.min), x2=xScale(m.max), bw=x2-x1
            return (
              <g key={m.label}>
                <text x={PAD-4} y={y+BAR_H/2+3} textAnchor="end" style={{fontFamily:'monospace',fontSize:8,fill:T.textDim}}>{m.label}</text>
                <rect x={x1} y={y} width={bw} height={BAR_H} rx="2" fill={m.color} opacity="0.75"/>
                <text x={x1+2} y={y+BAR_H/2+3} style={{fontFamily:'monospace',fontSize:7,fill:'#fff',opacity:0.9}}>{m.min}</text>
                {bw>30&&<text x={x2-2} y={y+BAR_H/2+3} textAnchor="end" style={{fontFamily:'monospace',fontSize:7,fill:'#fff',opacity:0.9}}>{m.max}</text>}
              </g>
            )
          })}
          {/* Legend */}
          {[{l:'XF=Extra fin',x:0},{l:'F=Fin',x:50},{l:'MF=Mi-fin',x:88},{l:'M=Moyen',x:132},{l:'C=Grossier',x:182}].map(({l,x})=>(
            <text key={l} x={x} y={TOTAL_H-4} style={{fontFamily:'monospace',fontSize:6,fill:T.textMute}}>{l}</text>
          ))}
        </svg>
      </div>
    </div>
  )
}

// ─── MODAL GUIDE ─────────────────────────────────────────────────────────────
const GUIDE_MOULIN = `GUIDE D'UTILISATION — ONGLET MOULIN

① CAFÉ UTILISÉ
Renseignez le café que vous utilisez : nom, pays, variété, profil aromatique et process (lavé, naturel, honey…). Ces infos seront sauvegardées dans l'historique.

② MÉTHODE D'EXTRACTION
Choisissez votre méthode (Espresso, Filtre, AeroPress, Chemex, Moka). Chaque méthode a ses propres cibles de ratio et de temps.

③ MOULIN
Sélectionnez votre moulin. L'app affiche la plage de réglages recommandée pour votre méthode dans l'unité native du moulin (clics, numéros, µm…).

④ DOSAGE
• Dose : quantité de café (g) dans le panier
• Rendement : quantité de café (g) dans la tasse
• Ratio = Rendement ÷ Dose (cible 1:2 pour espresso)

⑤ MOUTURE — µm UNIVERSEL
Le cadran indique la mouture en microns (µm). Si un moulin avec des clics est sélectionné, le clic correspondant est affiché à côté.
Utilisez −15/−5/+5/+15µm pour ajuster. Tap sur la valeur pour saisir manuellement.

⑥ TEMPS D'EXTRACTION
Démarrez le timer au début de l'extraction. Visez la plage cible selon votre méthode (ex: 20–35s pour espresso).

⑦ RESSENTI EN TASSE
Après avoir goûté, appuyez sur :
• 🍋 Trop acide → mouture plus fine
• ✨ Parfait → sauvegarde la recette
• ☕ Trop amer → mouture plus grossière
L'app ajuste automatiquement la mouture.

⑧ ANALYSE
Score /100 calculé d'après le ratio et le temps. Un score ≥ 90 = extraction parfaite.

CONSEILS
• Changez UN paramètre à la fois entre chaque shot
• Attendez que le moulin soit chaud (2-3 shots) avant de dial-in
• Notez vos recettes avec ✨ pour les retrouver dans l'historique`

const GUIDE_MACHINE = `GUIDE D'UTILISATION — ONGLET MACHINE
(Breville Dual Boiler)

① CAFÉ UTILISÉ
Renseignez le café : nom, pays, variété, profil aromatique, process.

② DOSAGE
• Dose : café (g) dans le panier filtre (typiquement 18–20g)
• Rendement : café extrait (g) dans la tasse (cible 36–40g pour 1:2)

③ PRÉ-INFUSION
La pré-infusion humidifie le café avant l'extraction pleine pression.
• Pression : 55–99% (typiquement 70–80%)
• Durée : 3–8 secondes recommandés
→ Plus de pré-infusion = extraction plus uniforme, moins d'amertume

④ TEMPS D'EXTRACTION
Démarrez le timer. Cible : 20–35 secondes totales (pré-infusion incluse).

⑤ TEMPÉRATURE
Cible : 91–94°C pour la plupart des cafés.
• Cafés clairs / acides → monter la température
• Cafés foncés / amers → baisser la température

⑥ RESSENTI EN TASSE
• 🍋 Trop acide → hausse temp. + augmente pré-infusion
• ✨ Parfait → sauvegarde la recette
• ☕ Trop amer → baisse temp. + réduit pré-infusion

⑦ ANALYSE
Score sur 100 combinant ratio, temps et température.

RÉGLAGES BREVILLE DUAL BOILER
• Pré-infusion : menu Extraction → Pre-infusion
• Température : menu Steam/Extraction → Temp.
• Pression max réglable sur la machine`

function GuideModal({ mode, onClose, T }) {
  const text = mode === 'moulin' ? GUIDE_MOULIN : GUIDE_MACHINE
  const title = mode === 'moulin' ? '⚙ GUIDE — MOULIN' : '☕ GUIDE — MACHINE'
  return (
    <div style={{position:'fixed',inset:0,background:'#000000ee',zIndex:2000,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:T.bg2,border:`1px solid ${T.border2}`,borderRadius:'16px 16px 0 0',padding:20,width:'100%',maxWidth:520,maxHeight:'88vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,letterSpacing:'0.2em',color:T.gold}}>{title}</div>
          <button onClick={onClose} style={{background:'transparent',border:`1px solid ${T.border}`,color:T.textDim,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:18,lineHeight:1,touchAction:'manipulation'}}>×</button>
        </div>
        <pre style={{fontFamily:'monospace',fontSize:11,color:T.text,lineHeight:1.7,whiteSpace:'pre-wrap',margin:0}}>{text}</pre>
      </div>
    </div>
  )
}

// ─── DIAL SVG ─────────────────────────────────────────────────────────────────
function Dial({ value, range, color, T }) {
  const pct=(value-range[0])/(range[1]-range[0])
  const rot=pct*270-135
  const arc=(cx,cy,r,a1,a2)=>{
    const rad=a=>((a-90)*Math.PI/180)
    const x1=cx+r*Math.cos(rad(a2)),y1=cy+r*Math.sin(rad(a2)),x2=cx+r*Math.cos(rad(a1)),y2=cy+r*Math.sin(rad(a1))
    return `M ${x1} ${y1} A ${r} ${r} 0 ${a2-a1<=180?0:1} 0 ${x2} ${y2}`
  }
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="74" fill="none" stroke={T.border} strokeWidth="2"/>
      <circle cx="80" cy="80" r="68" fill={T.bg2}/>
      <path d={arc(80,80,60,-135,135)} fill="none" stroke={T.bg3} strokeWidth="9" strokeLinecap="round"/>
      <path d={arc(80,80,60,-135,-135+270*pct)} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" style={{filter:`drop-shadow(0 0 7px ${color}bb)`}}/>
      {Array.from({length:37}).map((_,i)=>{
        const a=((-135+270/36*i)*Math.PI/180), maj=i%6===0, r1=maj?48:51, r2=57
        return <line key={i} x1={80+r1*Math.cos(a)} y1={80+r1*Math.sin(a)} x2={80+r2*Math.cos(a)} y2={80+r2*Math.sin(a)} stroke={maj?T.border2:T.border} strokeWidth={maj?2:1}/>
      })}
      <circle cx="80" cy="80" r="24" fill={T.bg2} stroke={T.border2} strokeWidth="1.5"/>
      <g transform={`rotate(${rot},80,80)`}>
        <line x1="80" y1="80" x2="80" y2="46" stroke={color} strokeWidth="2.5" strokeLinecap="round" style={{filter:`drop-shadow(0 0 5px ${color})`}}/>
        <circle cx="80" cy="80" r="4" fill={color}/>
      </g>
    </svg>
  )
}

// ─── TIMER (contrôlé — état géré par le parent) ──────────────────────────────
function Timer({ running, elapsed, onStart, onPause, onReset, T }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
      <div style={{fontFamily:'monospace',fontSize:44,fontWeight:300,color:running?T.gold:T.textDim,letterSpacing:'0.05em',textShadow:running?`0 0 28px ${T.gold}66`:'none'}}>
        {String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}
      </div>
      <div style={{display:'flex',gap:8}}>
        {!running?<button onClick={onStart} style={bs(T.gold,T)}>{elapsed>0?'▶ REPRENDRE':'▶ START'}</button>:<button onClick={onPause} style={bs(T.textDim,T)}>⏸ PAUSE</button>}
        <button onClick={onReset} style={bs(T.textMute,T)}>↺ RESET</button>
      </div>
    </div>
  )
}
const bs=(c,T)=>({fontFamily:'sans-serif',fontSize:12,letterSpacing:'0.15em',padding:'8px 18px',border:`1px solid ${c}`,background:`${c}22`,color:c,cursor:'pointer',borderRadius:4,touchAction:'manipulation'})

// ─── NUMPAD ───────────────────────────────────────────────────────────────────
function NumPad({ label, unit, initial, min, max, onConfirm, onClose, T }) {
  const [val,setVal]=useState(String(initial))
  const push=d=>{
    if(d==='⌫'){setVal(v=>v.length>1?v.slice(0,-1):'0');return}
    if(d==='OK'){const n=parseFloat(val);onConfirm(isNaN(n)?initial:clamp(n,min,max));return}
    setVal(v=>{const next=v==='0'?String(d):v+d;return next.length>5?v:next})
  }
  return (
    <div style={{position:'fixed',inset:0,background:'#000000dd',zIndex:9999,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:T.bg2,borderRadius:'16px 16px 0 0',padding:20,width:'100%',maxWidth:400,border:`1px solid ${T.border2}`,boxShadow:`0 -8px 40px ${T.shadow}`}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:'center',marginBottom:16}}>
          <div style={{fontSize:10,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase',marginBottom:8}}>{label}</div>
          <div style={{fontFamily:'monospace',fontSize:44,color:T.gold}}>{val}<span style={{fontSize:14,color:T.textDim,marginLeft:4}}>{unit}</span></div>
          <div style={{fontSize:10,color:T.textMute,marginTop:4}}>min {min} · max {max}</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
          {['1','2','3','4','5','6','7','8','9','⌫','0','OK'].map(k=>(
            <button key={k} onClick={()=>push(k)} style={{height:60,fontSize:k==='OK'?14:24,fontFamily:k==='OK'?'sans-serif':'monospace',fontWeight:k==='OK'?700:400,letterSpacing:k==='OK'?'0.15em':'0',background:k==='OK'?`${T.gold}22`:T.bg3,border:k==='OK'?`1px solid ${T.gold}88`:`1px solid ${T.border}`,color:k==='OK'?T.gold:k==='⌫'?T.textDim:T.text,borderRadius:8,cursor:'pointer',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>{k}</button>
          ))}
        </div>
        <button onClick={onClose} style={{marginTop:12,width:'100%',padding:'12px 0',background:'transparent',border:`1px solid ${T.border}`,color:T.textMute,borderRadius:8,cursor:'pointer',fontSize:12,letterSpacing:'0.2em',touchAction:'manipulation'}}>ANNULER</button>
      </div>
    </div>
  )
}

function NumIn({ label, val, set, unit, min, max, step=1, color, T }) {
  const [open,setOpen]=useState(false)
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {label&&<div style={{fontSize:10,letterSpacing:'0.2em',color:T.textMute,textTransform:'uppercase'}}>{label}</div>}
      <div style={{display:'flex',alignItems:'center'}}>
        <button onClick={()=>set(v=>r2(clamp(v-step,min,max)))} style={nb(T)}>−</button>
        <div onClick={()=>setOpen(true)} style={{padding:'0 12px',height:38,background:T.inputBg,border:`1px solid ${T.border}`,cursor:'pointer',fontFamily:'monospace',fontSize:17,color,display:'flex',alignItems:'center',gap:3,minWidth:80,justifyContent:'center',userSelect:'none',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>
          {val}<span style={{fontSize:10,color:T.textMute}}>{unit}</span>
        </div>
        <button onClick={()=>set(v=>r2(clamp(v+step,min,max)))} style={nb(T)}>+</button>
      </div>
      <div style={{fontSize:9,color:T.textMute,letterSpacing:'0.1em',textAlign:'center'}}>↑ tap pour saisir</div>
      {open&&<NumPad label={label||unit} unit={unit} initial={val} min={min} max={max} onConfirm={n=>{set(n);setOpen(false)}} onClose={()=>setOpen(false)} T={T}/>}
    </div>
  )
}
const nb=T=>({width:38,height:38,background:T.bg3,border:`1px solid ${T.border}`,color:T.textDim,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'})

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
function Bar({ pct, color, T }) {
  return <div style={{marginTop:6,height:4,background:T.bg3,borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${clamp(pct,0,100)}%`,background:color,borderRadius:2,transition:'width 0.3s',boxShadow:`0 0 8px ${color}88`}}/></div>
}
function Bar2({ label, v, T }) {
  const c=v>=90?T.green:v>=70?T.gold:T.red
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
      <div style={{fontSize:10,letterSpacing:'0.12em',color:T.textMute,width:44,textTransform:'uppercase'}}>{label}</div>
      <div style={{width:80,height:4,background:T.bg3,borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${v}%`,background:c,transition:'width 0.5s',boxShadow:`0 0 4px ${c}88`}}/></div>
      <div style={{fontFamily:'monospace',fontSize:10,color:c,fontWeight:700}}>{v}</div>
    </div>
  )
}
function ScoreRing({ score, T }) {
  const c=score>=90?T.green:score>=75?T.gold:score>=55?T.blue:T.red
  const r=36,circ=2*Math.PI*r,filled=(score/100)*circ
  return (
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke={T.bg3} strokeWidth="7"/>
      <circle cx="45" cy="45" r={r} fill="none" stroke={c} strokeWidth="7" strokeDasharray={`${filled} ${circ}`} strokeDashoffset={circ*0.25} strokeLinecap="round" style={{transition:'stroke-dasharray 0.7s',filter:`drop-shadow(0 0 10px ${c}cc)`}}/>
      <text x="45" y="42" textAnchor="middle" style={{fontFamily:'monospace',fontSize:18,fill:c,fontWeight:700}}>{score}</text>
      <text x="45" y="54" textAnchor="middle" style={{fontSize:9,fill:T.textMute}}>/100</text>
    </svg>
  )
}
const dBtn=(color,T)=>({padding:'8px 11px',border:`1px solid ${color}55`,background:`${color}15`,color:color,borderRadius:4,cursor:'pointer',fontSize:11,fontFamily:'monospace',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'})
const card=T=>({background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:18,display:'flex',flexDirection:'column',marginBottom:16,boxShadow:`0 2px 12px ${T.shadow}`})
const SL=T=>({fontSize:10,letterSpacing:'0.35em',color:T.textMute,textTransform:'uppercase',marginBottom:12})

// ─── TASTE BUTTONS ────────────────────────────────────────────────────────────
function TasteButtons({ flash, onTaste, feedback, T }) {
  const btns=[
    {id:'acid',   emoji:'🍋',text:'Trop acide',sub:'corrige acidité',  color:T.blue},
    {id:'perfect',emoji:'✨',text:'Parfait',    sub:'✓ sauvegarder',   color:T.green},
    {id:'bitter', emoji:'☕',text:'Trop amer',  sub:'corrige amertume', color:T.orange},
  ]
  return (
    <div style={card(T)}>
      <div style={SL(T)}>Ressenti en tasse</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        {btns.map(({id,emoji,text,sub,color})=>(
          <button key={id} onClick={()=>onTaste(id)} style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,padding:'16px 6px',border:`2px solid ${flash===id?color:color+'44'}`,background:flash===id?`${color}28`:T.bg3,color:flash===id?color:`${color}cc`,borderRadius:8,cursor:'pointer',transition:'all 0.15s',boxShadow:flash===id?`0 0 28px ${color}77`:'none',touchAction:'manipulation',WebkitTapHighlightColor:'transparent',minHeight:86}}>
            <span style={{fontSize:26,lineHeight:1}}>{emoji}</span>
            <span style={{fontSize:13,fontWeight:700,textAlign:'center',lineHeight:1.2,color:'inherit'}}>{text}</span>
            <span style={{fontSize:9,opacity:0.8,fontFamily:'monospace',color:'inherit'}}>{sub}</span>
          </button>
        ))}
      </div>
      {feedback&&(
        <div style={{marginTop:12,padding:'12px 14px',background:`${feedback.color}15`,border:`1px solid ${feedback.color}66`,borderRadius:6,display:'flex',flexDirection:'column',gap:6}}>
          <div style={{fontSize:17,fontWeight:700,letterSpacing:'0.08em',color:feedback.color,textShadow:`0 0 14px ${feedback.color}88`}}>{feedback.message}</div>
          {feedback.steps>0&&<div style={{fontFamily:'monospace',fontSize:11,color:T.textDim}}>{feedback.steps} clic{feedback.steps>1?'s':''}</div>}
          {feedback.detail.map((d,i)=><div key={i} style={{fontFamily:'monospace',fontSize:10,color:T.textDim,background:T.bg,border:`1px solid ${T.border}`,padding:'3px 8px',borderRadius:3,display:'inline-block',marginRight:6,marginBottom:4}}>{d}</div>)}
        </div>
      )}
    </div>
  )
}

// ─── CARTE CAFÉ ───────────────────────────────────────────────────────────────
function CoffeeCard({ coffee, setCoffee, T }) {
  const [open,setOpen]=useState(false)
  const [showLib,setShowLib]=useState(false)
  const [lib,setLib]=useState(()=>{try{const s=localStorage.getItem(COFFEE_LIB_KEY);return s?JSON.parse(s):[]}catch{return[]}})

  const fields=[
    {key:'name',   label:'Nom du café',      placeholder:'ex: Yirgacheffe Koke'},
    {key:'country',label:'Pays / Région',    placeholder:'ex: Éthiopie, Guji'},
    {key:'variety',label:'Variété(s)',        placeholder:'ex: Heirloom, Typica'},
    {key:'profile',label:'Profil aromatique',placeholder:'ex: Agrumes, Jasmin, Miel'},
    {key:'process',label:'Process',          placeholder:'ex: Lavé, Naturel, Honey'},
  ]
  const has=Object.values(coffee).some(v=>v.trim()!=='')

  const saveCoffee=()=>{
    if(!coffee.name.trim())return
    const updated=[{...coffee,id:Date.now()},...lib.filter(c=>c.name.trim().toLowerCase()!==coffee.name.trim().toLowerCase())].slice(0,30)
    setLib(updated)
    try{localStorage.setItem(COFFEE_LIB_KEY,JSON.stringify(updated))}catch{}
  }
  const deleteCoffee=(id,e)=>{
    e.stopPropagation()
    const updated=lib.filter(c=>c.id!==id)
    setLib(updated)
    try{localStorage.setItem(COFFEE_LIB_KEY,JSON.stringify(updated))}catch{}
  }
  const selectCoffee=(c)=>{
    setCoffee({name:c.name||'',country:c.country||'',variety:c.variety||'',profile:c.profile||'',process:c.process||''})
    setShowLib(false)
  }

  return (
    <div style={card(T)}>
      {/* Modal bibliothèque */}
      {showLib&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setShowLib(false)}>
          <div style={{width:'100%',maxWidth:480,background:T.bg2,borderRadius:'12px 12px 0 0',padding:'20px 16px 32px',maxHeight:'70vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:12,letterSpacing:'0.2em',color:T.gold,textTransform:'uppercase',fontWeight:700}}>☕ Mes cafés</div>
              <button onClick={()=>setShowLib(false)} style={{background:'none',border:'none',color:T.textMute,fontSize:20,cursor:'pointer',padding:'0 4px'}}>✕</button>
            </div>
            {/* Catalogue Torrea */}
            <div style={{fontSize:10,letterSpacing:'0.2em',color:T.gold,textTransform:'uppercase',marginBottom:8,marginTop:4}}>Catalogue Torrea</div>
            {COFFEE_CATALOG.map((c,i)=>(
              <div key={i} onClick={()=>selectCoffee(c)} style={{padding:'10px 12px',marginBottom:8,background:`${T.gold}10`,border:`1px solid ${T.gold}44`,borderRadius:6,cursor:'pointer'}}>
                <div style={{fontFamily:'monospace',fontSize:13,color:T.gold,fontWeight:700}}>{c.name} <span style={{fontWeight:400,color:T.textDim}}>— {c.country}</span></div>
                <div style={{fontFamily:'monospace',fontSize:10,color:T.textDim,marginTop:3}}>{c.profile}</div>
                {c.notes&&<div style={{fontFamily:'monospace',fontSize:9,color:T.textMute,marginTop:2}}>{c.notes}</div>}
              </div>
            ))}

            {/* Cafés perso sauvegardés */}
            {lib.length>0&&<>
              <div style={{fontSize:10,letterSpacing:'0.2em',color:T.blue,textTransform:'uppercase',marginBottom:8,marginTop:12}}>Mes cafés</div>
              {lib.map(c=>(
                <div key={c.id} onClick={()=>selectCoffee(c)} style={{padding:'10px 12px',marginBottom:8,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:6,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontFamily:'monospace',fontSize:13,color:T.text,fontWeight:700}}>{c.name}</div>
                    <div style={{fontFamily:'monospace',fontSize:10,color:T.textDim,marginTop:2}}>{[c.country,c.process,c.variety].filter(Boolean).join(' · ')}</div>
                  </div>
                  <button onClick={e=>deleteCoffee(c.id,e)} style={{background:'none',border:'none',color:T.textMute,fontSize:16,cursor:'pointer',padding:'0 4px',flexShrink:0}}>🗑</button>
                </div>
              ))}
            </>}
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
        <div style={{...SL(T),marginBottom:0}}>☕ Café utilisé {has&&<span style={{color:T.gold,marginLeft:4}}>●</span>}</div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={e=>{e.stopPropagation();setShowLib(true)}} style={{padding:'4px 10px',background:`${T.gold}18`,border:`1px solid ${T.gold}55`,color:T.gold,borderRadius:4,cursor:'pointer',fontSize:10,letterSpacing:'0.1em',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>
            📋 LISTE ({lib.length})
          </button>
          <div style={{fontSize:18,color:T.textMute,transform:open?'rotate(180deg)':'none',transition:'transform 0.2s',lineHeight:1}}>▾</div>
        </div>
      </div>
      {!open&&has&&<div style={{fontFamily:'monospace',fontSize:11,color:T.gold,marginTop:8}}>{coffee.name||'—'}{coffee.country?` · ${coffee.country}`:''}{coffee.process?` · ${coffee.process}`:''}</div>}
      {open&&(
        <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:14}}>
          {fields.map(({key,label,placeholder})=>(
            <div key={key}>
              <div style={{fontSize:10,letterSpacing:'0.2em',color:T.textMute,textTransform:'uppercase',marginBottom:5}}>{label}</div>
              <input value={coffee[key]} onChange={e=>setCoffee(c=>({...c,[key]:e.target.value}))} placeholder={placeholder}
                style={{width:'100%',padding:'9px 12px',background:T.inputBg,border:`1px solid ${T.border}`,borderRadius:4,color:T.text,fontFamily:'monospace',fontSize:13,outline:'none',WebkitAppearance:'none'}}/>
            </div>
          ))}
          {has&&(
            <button onClick={saveCoffee} style={{padding:'10px 0',background:`${T.gold}18`,border:`1px solid ${T.gold}66`,color:T.gold,borderRadius:4,cursor:'pointer',fontSize:11,letterSpacing:'0.15em',fontWeight:700,touchAction:'manipulation'}}>
              💾 SAUVEGARDER CE CAFÉ
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── SÉLECTEUR MOULIN ─────────────────────────────────────────────────────────
function GrinderSelector({ grinderId, setGrinderId, method, grindValue, setGrindValue, T }) {
  const [open,setOpen]=useState(false)
  const g=GRINDERS[grinderId]
  const range=g&&g[method]?g[method]:null
  const has=grinderId!=='none'
  const brands=['Breville (Sage)','Baratza','Mahlkönig','Eureka','Niche','Comandante','1Zpresso','Timemore','Fellow','Wilfa','Hario','Porlex','Kinu','Rancilio',"De'Longhi",'Weber','Lagom','Turin/DF','Mazzer','Capresso']

  return (
    <div style={card(T)}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
        <div style={{...SL(T),marginBottom:0}}>⚙ Moulin {has&&<span style={{color:T.gold,marginLeft:4}}>●</span>}</div>
        <div style={{fontSize:18,color:T.textMute,transform:open?'rotate(180deg)':'none',transition:'transform 0.2s',lineHeight:1}}>▾</div>
      </div>
      {!open&&has&&(
        <div style={{marginTop:8}}>
          <div style={{fontFamily:'monospace',fontSize:12,color:T.gold}}>{g.label}{g.brand?` — ${g.brand}`:''}</div>
          {range&&<div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:3}}>Plage {method} : {range[0]}–{range[1]} {g.unit||'µm'}</div>}
        </div>
      )}
      {open&&(
        <div style={{marginTop:14}}>
          <div style={{fontSize:10,letterSpacing:'0.2em',color:T.textMute,textTransform:'uppercase',marginBottom:10}}>Sélectionner le moulin</div>
          {/* None option */}
          <button onClick={()=>{setGrinderId('none');setOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 12px',marginBottom:8,background:grinderId==='none'?`${T.gold}18`:T.bg3,border:`1px solid ${grinderId==='none'?T.gold:T.border}`,borderRadius:5,color:grinderId==='none'?T.gold:T.textDim,cursor:'pointer',fontSize:12,touchAction:'manipulation'}}>
            — Sélectionner un moulin —
          </button>
          {brands.map(brand=>{
            const entries=Object.entries(GRINDERS).filter(([,v])=>v.brand===brand)
            if(!entries.length) return null
            return (
              <div key={brand}>
                <div style={{fontSize:9,letterSpacing:'0.3em',color:T.textMute,textTransform:'uppercase',marginTop:10,marginBottom:5,paddingLeft:2,borderLeft:`2px solid ${T.gold}44`,paddingLeft:8}}>{brand}</div>
                {entries.map(([k,v])=>(
                  <button key={k} onClick={()=>{setGrinderId(k);setOpen(false)}} style={{width:'100%',textAlign:'left',padding:'9px 12px',marginBottom:4,background:grinderId===k?`${T.gold}18`:T.bg3,border:`1px solid ${grinderId===k?T.gold:T.border}`,borderRadius:5,color:grinderId===k?T.gold:T.text,cursor:'pointer',fontSize:12,touchAction:'manipulation',display:'flex',flexDirection:'column',gap:2}}>
                    <span style={{fontWeight:grinderId===k?700:400}}>{v.label}</span>
                    {v.description&&<span style={{fontSize:9,color:T.textMute,fontFamily:'monospace'}}>{v.description}</span>}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── GRIND BAR — BARRE HORIZONTALE AVEC ZONES PAR MÉTHODE ────────────────────
// Affiche toute la plage µm, les zones de chaque méthode, la zone idéale mise
// en avant, la valeur actuelle, et permet le tap pour saisir directement.
function GrindBar({ value, method, grinder, onChange, T }) {
  const mColors = { espresso:T.gold, filter:T.blue, aeropress:T.green, chemex:T.purple, moka:T.orange }
  const m = BREW_METHODS[method]
  const mc = mColors[method] || T.gold

  // Plage totale affichée = plage du moulin (si sélectionné) sinon plage universelle
  const totalMin = grinder && grinder.minµm ? grinder.minµm : 0
  const totalMax = grinder && grinder.maxµm ? grinder.maxµm : 1200
  const span = totalMax - totalMin

  // Zone idéale selon la méthode
  const ideal = m.grindRangeµm

  const barRef = useRef(null)
  const x = v => ((v - totalMin) / span) * 100 // %

  // Statut "DANS LA ZONE"
  const inZone = value >= ideal[0] && value <= ideal[1]
  const tooFine = value < ideal[0]
  const tooCoarse = value > ideal[1]
  const statusColor = inZone ? T.green : T.orange
  const statusLabel = inZone ? '✓ DANS LA ZONE' : tooFine ? '← TROP FIN' : '→ TROP GROSSIER'

  // Tap / drag sur la barre pour saisir directement
  const handleBarTap = (clientX) => {
    const rect = barRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1)
    const newVal = Math.round((totalMin + ratio * span) / 5) * 5
    onChange(clamp(newVal, totalMin, totalMax))
  }
  const onPointerDown = e => {
    e.preventDefault()
    const cx = e.clientX ?? e.touches?.[0]?.clientX
    if (cx) handleBarTap(cx)
    const move = ev => {
      const mx = ev.clientX ?? ev.touches?.[0]?.clientX
      if (mx) handleBarTap(mx)
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchmove', move)
      window.removeEventListener('touchend', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchmove', move, { passive: false })
    window.addEventListener('touchend', up)
  }

  // Toutes les méthodes, affichées en bandes empilées sous la barre principale
  const methodsList = Object.entries(BREW_METHODS).map(([k,v])=>({
    key:k, label:v.label, icon:v.icon, range:v.grindRangeµm, color:mColors[k]||T.gold,
  }))

  return (
    <div style={{width:'100%',display:'flex',flexDirection:'column',gap:12}}>

      {/* BARRE PRINCIPALE tappable */}
      <div
        ref={barRef}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        style={{
          position:'relative',
          height:44,
          background:T.bg3,
          border:`1px solid ${T.border2}`,
          borderRadius:8,
          cursor:'pointer',
          touchAction:'none',
          WebkitTapHighlightColor:'transparent',
          userSelect:'none',
          overflow:'hidden',
        }}>

        {/* Zone idéale (méthode active) mise en avant */}
        <div style={{
          position:'absolute',
          left:`${x(ideal[0])}%`,
          width:`${x(ideal[1])-x(ideal[0])}%`,
          top:0, bottom:0,
          background:`linear-gradient(180deg, ${mc}38 0%, ${mc}22 100%)`,
          borderLeft:`2px solid ${mc}`,
          borderRight:`2px solid ${mc}`,
          boxShadow:`0 0 18px ${mc}66 inset`,
        }}/>

        {/* Graduations tous les 200µm */}
        {[200,400,600,800,1000,1200].filter(t=>t>totalMin&&t<totalMax).map(t=>(
          <div key={t} style={{
            position:'absolute', left:`${x(t)}%`, top:0, bottom:0,
            width:1, background:T.border, pointerEvents:'none',
          }}/>
        ))}
        {[200,400,600,800,1000,1200].filter(t=>t>totalMin&&t<totalMax).map(t=>(
          <div key={`${t}-label`} style={{
            position:'absolute', left:`${x(t)}%`, top:3,
            transform:'translateX(-50%)', fontFamily:'monospace', fontSize:8,
            color:T.textMute, pointerEvents:'none',
          }}>{t}</div>
        ))}

        {/* Labels min/max aux extrémités */}
        <div style={{position:'absolute',left:4,bottom:3,fontFamily:'monospace',fontSize:8,color:T.textMute,pointerEvents:'none'}}>{totalMin}</div>
        <div style={{position:'absolute',right:4,bottom:3,fontFamily:'monospace',fontSize:8,color:T.textMute,pointerEvents:'none'}}>{totalMax}</div>

        {/* Curseur de la valeur actuelle */}
        <div style={{
          position:'absolute',
          left:`${x(value)}%`,
          top:-4, bottom:-4,
          width:3,
          background:mc,
          transform:'translateX(-50%)',
          boxShadow:`0 0 14px ${mc}, 0 0 4px ${mc}`,
          pointerEvents:'none',
        }}/>
        {/* Pastille ronde sur le curseur */}
        <div style={{
          position:'absolute',
          left:`${x(value)}%`,
          top:'50%',
          width:18, height:18,
          transform:'translate(-50%,-50%)',
          background:mc,
          border:`2px solid ${T.bg2}`,
          borderRadius:'50%',
          boxShadow:`0 0 12px ${mc}cc`,
          pointerEvents:'none',
        }}/>
      </div>

      {/* BANDE DES 5 MÉTHODES (mini-visualisation contextuelle) */}
      <div style={{position:'relative',height:18,background:T.bg3,border:`1px solid ${T.border}`,borderRadius:4,overflow:'hidden'}}>
        {methodsList.map(({key,range,color})=>{
          // On clip la méthode à la plage affichée
          const lo = Math.max(range[0], totalMin)
          const hi = Math.min(range[1], totalMax)
          if (hi <= lo) return null
          return (
            <div key={key} style={{
              position:'absolute',
              left:`${x(lo)}%`, width:`${x(hi)-x(lo)}%`,
              top:0, bottom:0,
              background:key===method?color:`${color}33`,
              borderRight:`1px solid ${T.bg2}`,
              transition:'background 0.2s',
            }}/>
          )
        })}
        {/* Curseur sur la bande aussi */}
        <div style={{
          position:'absolute',
          left:`${x(value)}%`,
          top:0, bottom:0,
          width:2, background:'#fff',
          transform:'translateX(-50%)',
          pointerEvents:'none',
        }}/>
      </div>

      {/* LÉGENDE MÉTHODES */}
      <div style={{display:'flex',flexWrap:'wrap',gap:6,justifyContent:'center'}}>
        {methodsList.map(({key,label,icon,color})=>(
          <div key={key} style={{
            display:'flex', alignItems:'center', gap:4,
            fontFamily:'monospace', fontSize:10,
            color:key===method?color:T.textMute,
            fontWeight:key===method?700:400,
            padding:'3px 8px',
            background:key===method?`${color}18`:'transparent',
            border:`1px solid ${key===method?color+'44':'transparent'}`,
            borderRadius:3,
          }}>
            <span style={{width:8,height:8,background:color,borderRadius:2,display:'inline-block'}}/>
            <span>{icon} {label}</span>
          </div>
        ))}
      </div>

      {/* STATUS BADGE */}
      <div style={{
        textAlign:'center',
        padding:'8px 12px',
        background:`${statusColor}15`,
        border:`1px solid ${statusColor}55`,
        borderRadius:6,
        fontFamily:'sans-serif',
        fontSize:13, letterSpacing:'0.15em', fontWeight:700,
        color:statusColor,
        textShadow:`0 0 8px ${statusColor}77`,
      }}>
        {statusLabel}
      </div>
    </div>
  )
}

// ─── MINI-TIMELINE : 5 derniers shots du moulin ──────────────────────────────
function GrindHistoryMini({ history, currentGrind, method, T }) {
  // On garde les 5 derniers shots du mode 'moulin' avec la même méthode
  const recent = history.filter(h => h.mode === 'moulin' && h.method === method).slice(0, 5).reverse()
  if (recent.length < 2) return null

  const all = [...recent.map(h => h.grind), currentGrind]
  const min = Math.min(...all) - 20
  const max = Math.max(...all) + 20
  const range = max - min || 1

  const W = 280, H = 50, PAD = 8
  const step = recent.length > 0 ? (W - PAD * 2) / recent.length : 0

  return (
    <div style={{marginTop:14,padding:'10px 12px',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:6}}>
      <div style={{fontSize:9,letterSpacing:'0.25em',color:T.textMute,textTransform:'uppercase',marginBottom:6}}>
        Tendance — {recent.length} derniers shots
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block'}}>
        {/* Ligne zéro (mouture actuelle) */}
        <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke={T.border} strokeWidth="1" strokeDasharray="3,3"/>

        {recent.map((h,i)=>{
          const xp = PAD + step * i + step / 2
          const yp = H - PAD - ((h.grind - min) / range) * (H - PAD * 2)
          const scoreColor = h.score >= 90 ? T.green : h.score >= 70 ? T.gold : T.red
          return (
            <g key={h.id}>
              {/* Ligne vers le suivant */}
              {i < recent.length - 1 && (() => {
                const nx = PAD + step * (i+1) + step / 2
                const ny = H - PAD - ((recent[i+1].grind - min) / range) * (H - PAD * 2)
                return <line x1={xp} y1={yp} x2={nx} y2={ny} stroke={T.gold} strokeWidth="1.5" opacity="0.5"/>
              })()}
              <circle cx={xp} cy={yp} r="3.5" fill={scoreColor}/>
              <text x={xp} y={H-1} textAnchor="middle" style={{fontFamily:'monospace',fontSize:7,fill:T.textMute}}>{h.grind}</text>
            </g>
          )
        })}

        {/* Valeur actuelle (dernier point en avant) */}
        <g>
          <circle cx={W-PAD-step/2 + step} cy={H-PAD-((currentGrind-min)/range)*(H-PAD*2)} r="5" fill={T.gold} opacity="0.9"/>
          <text x={W-PAD} y={H-1} textAnchor="end" style={{fontFamily:'monospace',fontSize:8,fill:T.gold,fontWeight:700}}>{currentGrind} µm</text>
        </g>
      </svg>
    </div>
  )
}

// ─── MODAL CHART PAR MOULIN ──────────────────────────────────────────────────
function GrinderChartModal({ grinder, onClose, T }) {
  if (!grinder) return null
  const methodsList = Object.entries(BREW_METHODS).map(([k,v])=>({
    key:k, label:v.label, icon:v.icon, µmRange:v.grindRangeµm, settingRange:grinder[k],
  }))
  const mColors = { espresso:T.gold, filter:T.blue, aeropress:T.green, chemex:T.purple, moka:T.orange }
  const W = 340, BAR_H = 26, GAP = 8, PAD_L = 90
  const H = methodsList.length * (BAR_H + GAP) + 40
  const totalMin = grinder.minµm, totalMax = grinder.maxµm
  const span = totalMax - totalMin
  const xScale = v => PAD_L + ((v - totalMin) / span) * (W - PAD_L - 10)

  // Ticks
  const niceTicks = (() => {
    const step = span > 800 ? 200 : span > 400 ? 100 : 50
    const out = []
    for (let t = Math.ceil(totalMin / step) * step; t <= totalMax; t += step) out.push(t)
    return out
  })()

  return (
    <div style={{position:'fixed',inset:0,background:'#000000ee',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
      <div style={{background:T.bg2,border:`1px solid ${T.border2}`,borderRadius:12,padding:20,width:'100%',maxWidth:440,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16,gap:12}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.2em',color:T.gold,marginBottom:4}}>{grinder.brand}</div>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>{grinder.label}</div>
            <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:4}}>
              {grinder.minµm}–{grinder.maxµm}µm{grinder.clicks?` · ${grinder.clicks} ${grinder.unit||'réglages'}`:''}
            </div>
          </div>
          <button onClick={onClose} style={{background:'transparent',border:`1px solid ${T.border}`,color:T.textDim,borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:18,lineHeight:1,touchAction:'manipulation'}}>×</button>
        </div>

        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{display:'block'}}>
          {/* Ticks verticaux */}
          {niceTicks.map(t=>(
            <g key={t}>
              <line x1={xScale(t)} y1={20} x2={xScale(t)} y2={H-12} stroke={T.border} strokeWidth="0.5" strokeDasharray="2,3"/>
              <text x={xScale(t)} y={14} textAnchor="middle" style={{fontFamily:'monospace',fontSize:8,fill:T.textMute}}>{t}</text>
            </g>
          ))}

          {/* Barres méthodes */}
          {methodsList.map((m,i)=>{
            if (!m.µmRange) return null
            const y = 24 + i * (BAR_H + GAP)
            const x1 = xScale(m.µmRange[0])
            const x2 = xScale(m.µmRange[1])
            const bw = x2 - x1
            const color = mColors[m.key] || T.gold
            const hasSetting = m.settingRange && grinder.unit
            return (
              <g key={m.key}>
                {/* Label gauche */}
                <text x={PAD_L-6} y={y+BAR_H/2+3} textAnchor="end" style={{fontFamily:'monospace',fontSize:10,fill:color,fontWeight:700}}>
                  {m.icon} {m.label}
                </text>
                {/* Barre plage µm */}
                <rect x={x1} y={y} width={bw} height={BAR_H} rx="3" fill={color} opacity="0.7"/>
                {/* Valeurs µm dans la barre */}
                <text x={x1+4} y={y+BAR_H/2-1} style={{fontFamily:'monospace',fontSize:8,fill:'#fff',opacity:0.95}}>{m.µmRange[0]}</text>
                {bw > 40 && <text x={x2-4} y={y+BAR_H/2-1} textAnchor="end" style={{fontFamily:'monospace',fontSize:8,fill:'#fff',opacity:0.95}}>{m.µmRange[1]}</text>}
                {/* Réglage natif */}
                {hasSetting && (
                  <text x={x1+bw/2} y={y+BAR_H/2+9} textAnchor="middle" style={{fontFamily:'monospace',fontSize:9,fill:'#fff',fontWeight:700}}>
                    {grinder.unit} {m.settingRange[0]}–{m.settingRange[1]}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        <div style={{marginTop:12,fontFamily:'monospace',fontSize:9,color:T.textMute,lineHeight:1.5}}>
          Plages recommandées en µm avec les réglages natifs du moulin.<br/>
          Données : honestcoffeeguide.com
        </div>
      </div>
    </div>
  )
}

// ─── TAB MOULIN ───────────────────────────────────────────────────────────────
function TabMoulin({ coffee, setCoffee, onSave, history, dose, setDose, yld, setYld, time, setTime, timerRunning, timerElapsed, timerStart, timerPause, timerReset, method, setMethod, grind, setGrind, grinderId, setGrinderId, T }) {
  const [feedback,setFeedback]=useState(null),[flash,setFlash]=useState(null)
  const [grindValue,setGrindValue]=useState(0)
  const [showChart,setShowChart]=useState(false),[showGuide,setShowGuide]=useState(false)
  const [showGrinderChart,setShowGrinderChart]=useState(false)
  const [grindMode,setGrindMode]=useState('µm')
  const [clicksManual,setClicksManual]=useState(20)
  const [liveWeight,setLiveWeight]=useState(0),[liveWeightOpen,setLiveWeightOpen]=useState(false)

  const m=BREW_METHODS[method]
  const mColors={espresso:T.gold,filter:T.blue,aeropress:T.green,chemex:T.purple,moka:T.orange}
  const mc=mColors[method]||T.gold
  const g=GRINDERS[grinderId]
  const clickVal=µmToSetting(grind,g)

  const moulinFirstRender=useRef(true)
  useEffect(()=>{
    if(moulinFirstRender.current){moulinFirstRender.current=false;return}
    setGrind(BREW_METHODS[method].grindBaseµm);setFeedback(null);setLiveWeight(0)
  },[method])

  const result=computeDialIn({method,doseG:dose,yieldG:yld,extractionTimeSec:time,currentGrindµm:grind})
  const targetWeight=Math.round(dose*(m.targetRatioMin+m.targetRatioMax)/2)
  const liveW=liveWeight>0?liveWeight:yld
  const ratioProgress=Math.min((liveW/dose)/((m.targetRatioMin+m.targetRatioMax)/2)*100,100)
  const ratioColor=ratioProgress>=95?T.green:ratioProgress>=80?T.orange:T.red

  const doTaste=taste=>{
    const fb=computeTasteGrind({taste,method,doseG:dose,yieldG:yld,currentGrindµm:grind},T)
    if(!fb)return;setFlash(taste);setTimeout(()=>setFlash(null),1000);setFeedback(fb)
    onSave({mode:'moulin',method,dose,yld,time,grind,grinderId,grindValue,taste,score:taste==='perfect'?100:(result?.score??0),coffee:{...coffee}})
    if(taste!=='perfect'){setGrind(fb.newGrind);if(fb.newYield!==yld)setYld(fb.newYield)}
  }
  const applyResult=()=>{
    if(!result)return
    onSave({mode:'moulin',method,dose,yld,time,grind,grinderId,grindValue,score:result.score,coffee:{...coffee}})
    setGrind(result.newGrind)
  }
  const dirColor=result?.dir==='finer'?T.blue:result?.dir==='coarser'?T.orange:T.green

  return (<>
    {showChart&&<GrindChartModal onClose={()=>setShowChart(false)} T={T}/>}
    {showGuide&&<GuideModal mode="moulin" onClose={()=>setShowGuide(false)} T={T}/>}
    {liveWeightOpen&&<NumPad label="Poids en tasse" unit="g" initial={liveWeight>0?liveWeight:yld} min={0} max={500} onConfirm={w=>{setLiveWeight(w);setYld(w);setLiveWeightOpen(false)}} onClose={()=>setLiveWeightOpen(false)} T={T}/>}

    {/* Boutons utilitaires */}
    <div style={{display:'flex',gap:8,marginBottom:16}}>
      <button onClick={()=>setShowGuide(true)} style={{flex:1,padding:'9px 0',background:T.bg3,border:`1px solid ${T.gold}66`,color:T.gold,borderRadius:6,cursor:'pointer',fontSize:11,letterSpacing:'0.15em',touchAction:'manipulation'}}>📖 GUIDE</button>
      <button onClick={()=>setShowChart(true)} style={{flex:1,padding:'9px 0',background:T.bg3,border:`1px solid ${T.blue}66`,color:T.blue,borderRadius:6,cursor:'pointer',fontSize:11,letterSpacing:'0.15em',touchAction:'manipulation'}}>📊 GRIND CHART</button>
    </div>

    {/* 1. CAFÉ UTILISÉ */}
    <CoffeeCard coffee={coffee} setCoffee={setCoffee} T={T}/>

    {/* 2. MÉTHODE D'EXTRACTION */}
    <div style={card(T)}>
      <div style={SL(T)}>Méthode d'extraction</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {Object.entries(BREW_METHODS).map(([k,v])=>{
          const mc2=mColors[k]||T.gold
          return <button key={k} onClick={()=>setMethod(k)} style={{padding:'8px 12px',border:`1px solid ${method===k?mc2:T.border}`,background:method===k?`${mc2}22`:T.bg,color:method===k?mc2:T.textDim,borderRadius:4,cursor:'pointer',fontSize:13,touchAction:'manipulation',display:'flex',alignItems:'center',gap:6,fontWeight:method===k?700:400}}><span>{v.icon}</span>{v.label}</button>
        })}
      </div>
      <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:8}}>{m.description}</div>
    </div>

    {/* 3. MOULIN */}
    <GrinderSelector grinderId={grinderId} setGrinderId={setGrinderId} method={method} grindValue={grindValue} setGrindValue={setGrindValue} T={T}/>

    {/* 5. MOUTURE */}
    <div style={card(T)}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{...SL(T),marginBottom:0}}>
          Mouture{grinderId!=='none'&&g?` — ${g.label}`:grindMode==='clics'?' — Clics (moulin classique)':' — µm universel'}
        </div>
        {grinderId!=='none'&&g&&(
          <button onClick={()=>setShowGrinderChart(true)} style={{
            padding:'5px 10px',background:`${T.gold}18`,border:`1px solid ${T.gold}55`,
            color:T.gold,borderRadius:4,cursor:'pointer',fontSize:10,letterSpacing:'0.1em',
            touchAction:'manipulation',WebkitTapHighlightColor:'transparent',
          }}>📊 CHART</button>
        )}
      </div>

      {/* Toggle µm / Clics (visible seulement sans moulin sélectionné) */}
      {grinderId==='none'&&(
        <div style={{display:'flex',gap:6,marginBottom:14,justifyContent:'center'}}>
          {['µm','clics'].map(mode=>(
            <button key={mode} onClick={()=>setGrindMode(mode)} style={{
              padding:'6px 18px',borderRadius:4,cursor:'pointer',fontSize:12,letterSpacing:'0.1em',fontWeight:700,
              border:`1px solid ${grindMode===mode?mc:T.border}`,
              background:grindMode===mode?`${mc}22`:T.bg,
              color:grindMode===mode?mc:T.textDim,
              touchAction:'manipulation',WebkitTapHighlightColor:'transparent',
            }}>{mode==='µm'?'µm':'Clics'}</button>
          ))}
        </div>
      )}

      {grinderId==='none'&&grindMode==='clics'?(
        <>
          {/* Mode clics manuel — 0 à 100 */}
          <div style={{display:'flex',alignItems:'baseline',gap:12,justifyContent:'center',marginBottom:14}}>
            <div style={{fontFamily:'monospace',fontSize:38,fontWeight:300,color:mc,textShadow:`0 0 24px ${mc}66`}}>
              {clicksManual}<span style={{fontSize:14,color:T.textDim,marginLeft:4}}>clics</span>
            </div>
          </div>
          <div style={{height:8,background:T.bg3,borderRadius:4,overflow:'hidden',marginBottom:14,cursor:'pointer'}}
            onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setClicksManual(clamp(Math.round(((e.clientX-r.left)/r.width)*100),0,100))}}>
            <div style={{height:'100%',width:`${clicksManual}%`,background:mc,borderRadius:4,transition:'width 0.15s',boxShadow:`0 0 10px ${mc}88`}}/>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>setClicksManual(c=>clamp(c-5,0,100))} style={dBtn(mc,T)}>−5</button>
            <button onClick={()=>setClicksManual(c=>clamp(c-1,0,100))} style={dBtn(mc,T)}>−1</button>
            <button onClick={()=>setClicksManual(20)} style={{...dBtn(T.textDim,T),fontSize:10}}>↺ 20</button>
            <button onClick={()=>setClicksManual(c=>clamp(c+1,0,100))} style={dBtn(mc,T)}>+1</button>
            <button onClick={()=>setClicksManual(c=>clamp(c+5,0,100))} style={dBtn(mc,T)}>+5</button>
          </div>
          <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:10,textAlign:'center'}}>
            0–100 clics · plage générique moulin classique
          </div>
        </>
      ):(
        <>
          {/* Mode µm (ou moulin sélectionné) */}
          <div style={{display:'flex',alignItems:'baseline',gap:12,justifyContent:'center',marginBottom:14,flexWrap:'wrap'}}>
            <div style={{fontFamily:'monospace',fontSize:38,fontWeight:300,color:mc,textShadow:`0 0 24px ${mc}66`}}>
              {grind}<span style={{fontSize:14,color:T.textDim,marginLeft:4}}>µm</span>
            </div>
            {clickVal!==null&&g&&g.clicks&&(
              <div style={{fontFamily:'monospace',fontSize:18,color:T.gold,background:`${T.gold}18`,border:`1px solid ${T.gold}55`,borderRadius:5,padding:'4px 12px',fontWeight:700}}>
                {g.unit} {clickVal}
              </div>
            )}
          </div>
          <GrindBar value={grind} method={method} grinder={g} onChange={setGrind} T={T}/>
          <div style={{display:'flex',gap:8,marginTop:14,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>setGrind(g2=>clamp(g2-25,g?g.minµm:100,g?g.maxµm:1400))} style={dBtn(mc,T)}>−25µm</button>
            <button onClick={()=>setGrind(g2=>clamp(g2-5,g?g.minµm:100,g?g.maxµm:1400))} style={dBtn(mc,T)}>−5µm</button>
            <button onClick={()=>setGrind(m.grindBaseµm)} style={{...dBtn(T.textDim,T),fontSize:10}}>↺ {m.grindBaseµm}µm</button>
            <button onClick={()=>setGrind(g2=>clamp(g2+5,g?g.minµm:100,g?g.maxµm:1400))} style={dBtn(mc,T)}>+5µm</button>
            <button onClick={()=>setGrind(g2=>clamp(g2+25,g?g.minµm:100,g?g.maxµm:1400))} style={dBtn(mc,T)}>+25µm</button>
          </div>
          <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:10,textAlign:'center'}}>
            {g?`${g.minµm}–${g.maxµm}µm (plage moulin)`:'100–1400µm (référence universelle)'} · tap la barre pour saisir
          </div>
          <GrindHistoryMini history={history} currentGrind={grind} method={method} T={T}/>
        </>
      )}
    </div>

    {/* Modal chart du moulin sélectionné */}
    {showGrinderChart && g && <GrinderChartModal grinder={g} onClose={()=>setShowGrinderChart(false)} T={T}/>}

    {/* 6. TIMER + RATIO LIVE */}
    <div style={card(T)}>
      <div style={SL(T)}>Temps d'extraction · Ratio live</div>

      {/* Dose */}
      <div style={{marginBottom:14}}>
        <NumIn label="Dose" val={dose} set={setDose} unit="g" min={5} max={40} color={mc} T={T}/>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:14}}>
        <div style={{flex:1}}>
          <Timer running={timerRunning} elapsed={timerElapsed} onStart={timerStart} onPause={timerPause} onReset={timerReset} T={T}/>
        </div>
        <button onClick={()=>setLiveWeightOpen(true)} style={{
          flex:1,padding:'12px 8px',background:liveWeight>0?`${ratioColor}18`:T.bg3,
          border:`2px solid ${liveWeight>0?ratioColor:T.border}`,borderRadius:8,
          color:liveWeight>0?ratioColor:T.textMute,cursor:'pointer',textAlign:'center',
          touchAction:'manipulation',WebkitTapHighlightColor:'transparent',transition:'all 0.2s',
          boxShadow:liveWeight>0?`0 0 16px ${ratioColor}44`:'none',
        }}>
          <div style={{fontSize:9,letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:4,color:liveWeight>0?ratioColor:T.textMute}}>POIDS TASSE</div>
          <div style={{fontFamily:'monospace',fontSize:32,fontWeight:300,lineHeight:1,textShadow:liveWeight>0?`0 0 20px ${ratioColor}66`:'none'}}>
            {liveW}<span style={{fontSize:12,marginLeft:3}}>g</span>
          </div>
          <div style={{fontSize:9,color:T.textMute,marginTop:4}}>tap pour modifier</div>
        </button>
      </div>

      {/* Barre ratio live */}
      <div style={{marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
          <span style={{fontFamily:'monospace',fontSize:14,color:ratioColor,fontWeight:700}}>
            1:{(liveW/dose).toFixed(2)}
          </span>
          <span style={{fontFamily:'monospace',fontSize:10,color:T.textMute}}>
            cible 1:{m.targetRatioMin}–1:{m.targetRatioMax} · {targetWeight}g
          </span>
        </div>
        <div style={{height:7,background:T.bg3,borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${ratioProgress}%`,background:ratioColor,borderRadius:4,transition:'width 0.3s',boxShadow:`0 0 10px ${ratioColor}88`}}/>
        </div>
        <div style={{fontFamily:'monospace',fontSize:10,color:ratioColor,marginTop:5,textAlign:'right'}}>
          {ratioProgress>=95?'✓ Dans la cible':liveW<targetWeight?`→ encore ${targetWeight-liveW}g`:'✓ Cible atteinte'}
        </div>
      </div>

      <div style={{marginTop:4}}><NumIn label="Saisie manuelle (s)" val={time} set={setTime} unit="s" min={5} max={600} color={T.textDim} T={T}/></div>
      <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:8}}>cible {formatTime(m.targetTimeMin)}–{formatTime(m.targetTimeMax)}</div>
      <Bar pct={(time/m.targetTimeMax)*100} color={time>=m.targetTimeMin&&time<=m.targetTimeMax?T.green:T.red} T={T}/>
    </div>

    {/* 7. RESSENTI EN TASSE */}
    <TasteButtons flash={flash} onTaste={doTaste} feedback={feedback} T={T}/>

    {/* 8. ANALYSE */}
    {result&&(
      <div style={card(T)}>
        <div style={SL(T)}>Analyse</div>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:14}}>
          <ScoreRing score={result.score} T={T}/>
          <div>
            <div style={{fontFamily:'monospace',fontSize:11,color:T.textDim,marginBottom:6}}>Ratio 1:{result.ratio.toFixed(1)} · {formatTime(time)}</div>
            <Bar2 label="Ratio" v={result.ratioScore} T={T}/>
            <Bar2 label="Temps" v={result.timeScore} T={T}/>
          </div>
        </div>
        {result.isPerfect
          ?<div style={{fontSize:18,color:T.green,letterSpacing:'0.1em',fontWeight:700}}>✓ EXTRACTION PARFAITE</div>
          :<>
            <div style={{fontSize:22,fontWeight:700,color:dirColor,textShadow:`0 0 14px ${dirColor}88`,marginBottom:8}}>
              {result.dir==='finer'?'← PLUS FIN':'→ PLUS GROSSIER'} · {result.newGrind}µm
              {clickVal!==null&&g?.clicks&&<span style={{fontSize:14,color:T.gold,marginLeft:10}}>(~{g.unit} {µmToSetting(result.newGrind,g)})</span>}
            </div>
            <div style={{fontFamily:'monospace',fontSize:11,color:T.textDim,marginBottom:10}}>
              {grind}µm → {result.newGrind}µm ({result.grindDelta>0?'+':''}{result.grindDelta}µm · {result.steps} clics)
            </div>
            {result.reasons.map((r,i)=><div key={i} style={{fontFamily:'monospace',fontSize:10,color:T.textDim,background:T.bg,border:`1px solid ${T.border}`,padding:'3px 8px',borderRadius:3,display:'inline-block',marginRight:6,marginBottom:4}}>{r}</div>)}
            <button onClick={applyResult} style={{marginTop:12,padding:'13px 20px',border:`1px solid ${mc}`,background:`${mc}22`,color:mc,borderRadius:4,cursor:'pointer',fontSize:13,letterSpacing:'0.1em',fontWeight:700,width:'100%',touchAction:'manipulation'}}>
              ⬤ APPLIQUER → {result.newGrind}µm
            </button>
          </>
        }
      </div>
    )}
  </>)
}

// ─── EASTER EGG : COFFEE INVADERS (∞ progressive) ────────────────────────────
function CoffeeInvaders({ onClose }) {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('playing')
  const [finalScore, setFinalScore] = useState(0)
  const [finalWave, setFinalWave] = useState(1)
  const [gameKey, setGameKey] = useState(0)
  const touchRef = useRef({ left:false, right:false, fire:false })

  useEffect(() => {
    setStatus('playing')
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    const player = { x: W/2 - 18, y: H - 44, w: 36, h: 26, speed: 3.4, shield: 0 }
    let bullets = []
    let enemyBullets = []
    let enemies = []
    let particles = []
    let powerups = []
    let floatingTexts = []

    let wave = 0
    let score = 0
    let combo = 0
    let comboTimer = 0
    let dirX = 1
    let frame = 0
    let lastShot = -100
    let lastEnemyShot = 0
    let alive = true
    let waveTransitionTimer = 0
    let waveAnnounceText = ''
    let waveAnnounceTimer = 0
    const pu = { double:0, triple:0, rapid:0, x2:0 }

    const rand = (a,b) => a + Math.random()*(b-a)

    const pickType = (w, row) => {
      const r = Math.random()
      if(w >= 10 && row === 0 && r < 0.35) return 'tank'
      if(w >= 7 && r < 0.30) return 'zigzag'
      if(w >= 4 && r < 0.25) return 'fast'
      return 'basic'
    }

    const startNextWave = () => {
      wave++
      enemies = []
      enemyBullets = []
      bullets = []
      dirX = 1
      const isBoss = wave % 5 === 0
      if(isBoss) {
        const hp = 12 + wave*3
        enemies.push({
          x: W/2 - 55, y: 50, w: 110, h: 50, alive: true,
          type: 'boss', hp, maxHp: hp,
          vx: 1.4 + wave*0.06, lastShot: 0, pattern: 0,
        })
        waveAnnounceText = `☕ BOSS — VAGUE ${wave}`
      } else {
        const cols = Math.min(8, 4 + Math.floor((wave-1)/2))
        const rows = Math.min(5, 2 + Math.floor((wave-1)/3))
        const eW = 26, eH = 20, gap = 6
        const fieldW = cols*(eW+gap) - gap
        const startX = Math.floor((W - fieldW)/2)
        for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
          const type = pickType(wave, r)
          enemies.push({
            x: startX+c*(eW+gap), y: 38+r*(eH+gap),
            w:eW, h:eH, alive:true, row:r, col:c,
            type, hp: type==='tank'?2:1,
            wobble: c*0.3, zigPhase: rand(0, Math.PI*2),
          })
        }
        waveAnnounceText = `VAGUE ${wave}`
      }
      waveAnnounceTimer = 75
    }

    const spawnPowerup = (x, y) => {
      const types = ['double','triple','rapid','x2','shield']
      const t = types[Math.floor(Math.random()*types.length)]
      powerups.push({ x: x-7, y, w:14, h:14, vy:1.5, type: t, age:0 })
    }

    const spawnParticles = (x, y, color, count=8) => {
      for(let i=0;i<count;i++) particles.push({
        x, y, vx: rand(-2.5,2.5), vy: rand(-2.5,2.5), life: 24, color
      })
    }

    const floatText = (x, y, text, color) => {
      floatingTexts.push({ x, y, text, color, life: 50 })
    }

    const applyPowerup = (t) => {
      if(t === 'double') { pu.double = 540; floatText(player.x+player.w/2, player.y-10, 'DOUBLE', '#6ab4d4') }
      else if(t === 'triple') { pu.triple = 540; floatText(player.x+player.w/2, player.y-10, 'TRIPLE', '#a88ad4') }
      else if(t === 'rapid') { pu.rapid = 540; floatText(player.x+player.w/2, player.y-10, 'RAPID', '#d4b06a') }
      else if(t === 'x2') { pu.x2 = 540; floatText(player.x+player.w/2, player.y-10, 'SCORE ×2', '#7acca0') }
      else if(t === 'shield') { player.shield = 1; floatText(player.x+player.w/2, player.y-10, 'SHIELD', '#6ab4d4') }
    }

    const fireBullet = () => {
      const cx = player.x + player.w/2 - 3
      const y = player.y - 4
      if(pu.triple > 0) {
        bullets.push({ x:cx, y, w:6, h:8, vx:0, vy:-7 })
        bullets.push({ x:cx-2, y, w:6, h:8, vx:-1.4, vy:-6.6 })
        bullets.push({ x:cx+2, y, w:6, h:8, vx:1.4, vy:-6.6 })
      } else if(pu.double > 0) {
        bullets.push({ x:cx-7, y, w:6, h:8, vx:0, vy:-7 })
        bullets.push({ x:cx+7, y, w:6, h:8, vx:0, vy:-7 })
      } else {
        bullets.push({ x:cx, y, w:6, h:8, vx:0, vy:-7 })
      }
    }

    const comboMult = () => 1 + Math.min(combo, 20)*0.05
    const gainScore = (pts) => {
      const m = (pu.x2 > 0 ? 2 : 1) * comboMult()
      score += Math.round(pts * m)
    }
    const bumpCombo = () => { combo++; comboTimer = 150 }

    const die = () => { alive = false; setFinalScore(score); setFinalWave(wave); setStatus('lost'); draw() }

    const keys = {}
    const onKeyDown = e => {
      if(e.key === 'Escape') { onClose(); return }
      if(['ArrowLeft','ArrowRight','a','d',' '].includes(e.key)) e.preventDefault()
      keys[e.key.toLowerCase()] = true
    }
    const onKeyUp = e => { keys[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    const drawCup = (x, y, w, h, body, liquid) => {
      ctx.fillStyle = body
      ctx.fillRect(x+2, y+4, w-4, h-8)
      ctx.fillStyle = liquid
      ctx.fillRect(x+4, y+6, w-8, 3)
      ctx.fillStyle = body
      ctx.fillRect(x+w-2, y+9, 3, 6)
      ctx.fillRect(x, y+h-3, w, 2)
    }

    const enemyColors = {
      basic:  ['#7acca0','#3a8a60'],
      fast:   ['#a8d4f0','#3a6090'],
      zigzag: ['#e0a878','#8a4030'],
      tank:   ['#a888d4','#5a3088'],
    }

    const draw = () => {
      ctx.fillStyle = '#0a0a0e'
      ctx.fillRect(0,0,W,H)
      // Bean dust background
      ctx.fillStyle = 'rgba(212,176,106,0.22)'
      for(let i=0;i<25;i++){
        const x = (i*73 + frame*0.4) % W
        const y = (i*131 + frame*0.6) % H
        ctx.fillRect(x, y, 1, 1)
      }
      // Enemies
      for(const e of enemies) {
        if(!e.alive) continue
        if(e.type === 'boss') {
          // Boss: large teapot (red)
          ctx.fillStyle = '#d47a7a'
          ctx.fillRect(e.x+10, e.y+15, e.w-20, e.h-25)
          ctx.fillRect(e.x+25, e.y+5, e.w-50, 12)
          ctx.fillRect(e.x+e.w/2-3, e.y, 6, 8)
          ctx.fillRect(e.x, e.y+25, 14, 8)
          ctx.fillRect(e.x+e.w-6, e.y+22, 6, 14)
          ctx.fillStyle = '#3a0a0a'
          ctx.fillRect(e.x+14, e.y+18, e.w-28, 2)
          // HP bar above
          ctx.fillStyle = '#1a1a24'
          ctx.fillRect(e.x, e.y-8, e.w, 4)
          ctx.fillStyle = e.hp/e.maxHp > 0.5 ? '#7acca0' : (e.hp/e.maxHp > 0.25 ? '#d4b06a' : '#d47a7a')
          ctx.fillRect(e.x, e.y-8, e.w*(e.hp/e.maxHp), 4)
        } else {
          const [body, liquid] = enemyColors[e.type] || enemyColors.basic
          const wob = Math.sin((frame+e.x)*0.05+e.wobble) * 1.5
          drawCup(e.x+wob, e.y, e.w, e.h, body, liquid)
          if(frame % 24 < 12) {
            ctx.fillStyle = 'rgba(255,255,255,0.4)'
            ctx.fillRect(e.x+wob+10, e.y-3, 2, 3)
          }
          if(e.type === 'tank') {
            ctx.strokeStyle = '#d4b06a'
            ctx.lineWidth = 1
            ctx.strokeRect(e.x+wob+1, e.y+3, e.w-2, e.h-6)
          }
        }
      }
      // Player (espresso cup)
      drawCup(player.x, player.y, player.w, player.h, '#d4b06a', '#3a1a08')
      ctx.fillStyle = '#c8a060'
      ctx.fillRect(player.x+5, player.y+8, player.w-10, 1)
      // Shield
      if(player.shield > 0) {
        ctx.strokeStyle = '#6ab4d4'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(player.x+player.w/2, player.y+player.h/2, player.w/2+5, 0, Math.PI*2)
        ctx.stroke()
      }
      // Coffee bean bullets
      for(const b of bullets) {
        ctx.fillStyle = '#5c3a1a'
        ctx.beginPath()
        ctx.ellipse(b.x+b.w/2, b.y+b.h/2, b.w/2, b.h/2, 0, 0, Math.PI*2)
        ctx.fill()
        ctx.strokeStyle = '#3a1a08'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(b.x+b.w/2, b.y); ctx.lineTo(b.x+b.w/2, b.y+b.h)
        ctx.stroke()
      }
      // Enemy bullets
      ctx.fillStyle = '#7acca0'
      for(const b of enemyBullets) ctx.fillRect(b.x, b.y, b.w, b.h)
      // Power-ups
      const puColors = { double:'#6ab4d4', triple:'#a88ad4', rapid:'#d4b06a', x2:'#7acca0', shield:'#6ab4d4' }
      const puLabels = { double:'2', triple:'3', rapid:'R', x2:'×2', shield:'S' }
      for(const p of powerups) {
        const blink = Math.sin(p.age*0.15)*0.3+0.7
        ctx.globalAlpha = blink
        ctx.fillStyle = puColors[p.type] || '#fff'
        ctx.fillRect(p.x, p.y, p.w, p.h)
        ctx.globalAlpha = 1
        ctx.fillStyle = '#000'
        ctx.font = 'bold 9px monospace'
        const lbl = puLabels[p.type] || '?'
        const tw = ctx.measureText(lbl).width
        ctx.fillText(lbl, p.x+(p.w-tw)/2, p.y+10)
      }
      // Particles
      for(const p of particles) {
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life/24
        ctx.fillRect(p.x, p.y, 2, 2)
      }
      ctx.globalAlpha = 1
      // Floating texts
      for(const ft of floatingTexts) {
        ctx.globalAlpha = Math.min(1, ft.life/20)
        ctx.fillStyle = ft.color
        ctx.font = 'bold 10px monospace'
        const tw = ctx.measureText(ft.text).width
        ctx.fillText(ft.text, ft.x - tw/2, ft.y)
      }
      ctx.globalAlpha = 1
      // HUD
      ctx.fillStyle = '#d4b06a'
      ctx.font = 'bold 11px monospace'
      ctx.fillText(`SCORE ${score}`, 8, 16)
      const wt = `VAGUE ${wave}`
      ctx.fillText(wt, W - ctx.measureText(wt).width - 8, 16)
      // Combo
      if(combo > 1) {
        ctx.fillStyle = '#7acca0'
        ctx.font = 'bold 10px monospace'
        ctx.fillText(`COMBO ×${comboMult().toFixed(2)} (${combo})`, 8, 30)
      }
      // Active power-ups
      ctx.font = 'bold 8px monospace'
      const puArr = []
      if(pu.double > 0) puArr.push(['DOUBLE', pu.double, '#6ab4d4'])
      if(pu.triple > 0) puArr.push(['TRIPLE', pu.triple, '#a88ad4'])
      if(pu.rapid > 0) puArr.push(['RAPID', pu.rapid, '#d4b06a'])
      if(pu.x2 > 0) puArr.push(['×2', pu.x2, '#7acca0'])
      puArr.forEach(([label, t, color], i) => {
        const x = 8 + i*68
        ctx.fillStyle = color
        ctx.fillText(`${label} ${Math.ceil(t/60)}s`, x, H-6)
      })
      // Wave announce
      if(waveAnnounceTimer > 0) {
        const a = Math.min(1, waveAnnounceTimer/25)
        ctx.fillStyle = `rgba(212,176,106,${a})`
        ctx.font = 'bold 20px monospace'
        const tw = ctx.measureText(waveAnnounceText).width
        ctx.fillText(waveAnnounceText, (W-tw)/2, H/2)
      }
    }

    const update = () => {
      frame++
      // Decay
      if(pu.double > 0) pu.double--
      if(pu.triple > 0) pu.triple--
      if(pu.rapid > 0) pu.rapid--
      if(pu.x2 > 0) pu.x2--
      if(comboTimer > 0) { comboTimer--; if(comboTimer === 0) combo = 0 }
      if(waveAnnounceTimer > 0) waveAnnounceTimer--

      // Player movement
      const t = touchRef.current
      if(keys['arrowleft'] || keys['a'] || t.left) player.x -= player.speed
      if(keys['arrowright'] || keys['d'] || t.right) player.x += player.speed
      player.x = Math.max(0, Math.min(W - player.w, player.x))

      // Shoot
      const shootDelay = pu.rapid > 0 ? 7 : 16
      if((keys[' '] || t.fire) && frame - lastShot > shootDelay) {
        fireBullet()
        lastShot = frame
      }

      // Player bullets
      for(const b of bullets) { b.y += b.vy; b.x += b.vx||0 }
      bullets = bullets.filter(b => b.y > -10 && b.x > -10 && b.x < W+10)

      // Wave management
      if(waveTransitionTimer > 0) {
        waveTransitionTimer--
        if(waveTransitionTimer === 0) startNextWave()
      } else {
        const aliveEnemies = enemies.filter(e => e.alive)
        if(aliveEnemies.length === 0) {
          waveTransitionTimer = 50
        } else {
          const isBoss = aliveEnemies[0].type === 'boss'
          if(isBoss) {
            const boss = aliveEnemies[0]
            boss.x += boss.vx
            if(boss.x + boss.w >= W || boss.x <= 0) boss.vx *= -1
            const bossShootDelay = Math.max(18, 50 - wave*2)
            if(frame - boss.lastShot > bossShootDelay) {
              boss.pattern = (boss.pattern + 1) % 3
              const cx = boss.x + boss.w/2 - 2
              const cy = boss.y + boss.h
              const bspd = 2.8 + wave*0.1
              if(boss.pattern === 0) {
                for(let dx=-1; dx<=1; dx++) enemyBullets.push({ x:cx+dx*10, y:cy, w:4, h:8, vy:bspd, vx:dx*0.6 })
              } else if(boss.pattern === 1) {
                enemyBullets.push({ x:cx, y:cy, w:5, h:10, vy:bspd+1.5, vx:0 })
              } else {
                for(let dx=-2; dx<=2; dx++) enemyBullets.push({ x:cx, y:cy, w:4, h:8, vy:bspd, vx:dx*0.85 })
              }
              boss.lastShot = frame
            }
          } else {
            // Formation movement
            const baseSpeed = 0.35 + wave*0.07 + (1 - aliveEnemies.length / Math.max(1, enemies.length))*1.0
            let minX = Infinity, maxX = -Infinity, maxY = -Infinity
            for(const e of aliveEnemies){
              if(e.x < minX) minX = e.x
              if(e.x + e.w > maxX) maxX = e.x + e.w
              if(e.y + e.h > maxY) maxY = e.y + e.h
            }
            let drop = false
            if(maxX + baseSpeed*dirX >= W || minX + baseSpeed*dirX <= 0) { dirX *= -1; drop = true }
            for(const e of aliveEnemies) {
              let s = baseSpeed
              if(e.type === 'fast') s *= 1.7
              e.x += s * dirX
              if(drop) e.y += 12
              if(e.type === 'zigzag') e.x += Math.sin((frame*0.05)+e.zigPhase) * 0.7
            }
            // Enemy shooting
            const shootInt = Math.max(22, 95 - wave*5)
            if(frame - lastEnemyShot > shootInt) {
              const shooter = aliveEnemies[Math.floor(Math.random()*aliveEnemies.length)]
              const bspd = 2.4 + wave*0.12
              enemyBullets.push({ x: shooter.x+shooter.w/2-2, y: shooter.y+shooter.h, w:4, h:8, vy:bspd, vx:0 })
              lastEnemyShot = frame
            }
            // Enemies reach player → game over
            if(maxY >= player.y) { die(); return }
          }
        }
      }

      // Enemy bullets
      for(const b of enemyBullets) { b.y += b.vy; b.x += b.vx||0 }
      enemyBullets = enemyBullets.filter(b => b.y < H+10 && b.x > -10 && b.x < W+10)

      // Power-ups
      for(const p of powerups) { p.y += p.vy; p.age++ }
      powerups = powerups.filter(p => p.y < H+10)

      // Bullets vs enemies
      for(const b of bullets) {
        if(b.y < -10) continue
        for(const e of enemies) {
          if(!e.alive) continue
          if(b.x < e.x+e.w && b.x+b.w > e.x && b.y < e.y+e.h && b.y+b.h > e.y) {
            e.hp--
            b.y = -100
            if(e.hp <= 0) {
              e.alive = false
              const basePts = e.type==='boss' ? (150+wave*15) : (e.type==='tank' ? 25 : (e.type==='zigzag' ? 20 : (e.type==='fast' ? 30 : 10)))
              const before = score
              gainScore(basePts)
              bumpCombo()
              const gained = score - before
              floatText(e.x+e.w/2, e.y, `+${gained}`, '#d4b06a')
              const col = (enemyColors[e.type] && enemyColors[e.type][0]) || '#d47a7a'
              spawnParticles(e.x+e.w/2, e.y+e.h/2, col, e.type==='boss' ? 30 : 8)
              const dropChance = e.type==='boss' ? 1 : (e.type==='tank' ? 0.25 : 0.07)
              if(Math.random() < dropChance) spawnPowerup(e.x+e.w/2, e.y+e.h/2)
              if(e.type==='boss') {
                spawnPowerup(e.x+20, e.y+e.h/2)
                spawnPowerup(e.x+e.w-20, e.y+e.h/2)
              }
            }
            break
          }
        }
      }
      bullets = bullets.filter(b => b.y > -10)

      // Enemy bullets vs player
      for(const b of enemyBullets) {
        if(b.y < -50) continue
        if(b.x < player.x+player.w && b.x+b.w > player.x && b.y < player.y+player.h && b.y+b.h > player.y) {
          if(player.shield > 0) {
            player.shield = 0
            b.y = H+100
            spawnParticles(player.x+player.w/2, player.y+player.h/2, '#6ab4d4', 14)
            floatText(player.x+player.w/2, player.y-10, 'SHIELD!', '#6ab4d4')
          } else {
            die(); return
          }
        }
      }
      enemyBullets = enemyBullets.filter(b => b.y < H+10)

      // Power-up pickup
      for(const p of powerups) {
        if(p.x < player.x+player.w && p.x+p.w > player.x && p.y < player.y+player.h && p.y+p.h > player.y) {
          applyPowerup(p.type)
          p.y = H+100
        }
      }
      powerups = powerups.filter(p => p.y < H+10)

      // Particles
      for(const p of particles) { p.x += p.vx; p.y += p.vy; p.life-- }
      particles = particles.filter(p => p.life > 0)

      // Floating texts
      for(const ft of floatingTexts) { ft.y -= 0.6; ft.life-- }
      floatingTexts = floatingTexts.filter(ft => ft.life > 0)
    }

    const loop = () => {
      if(!alive) return
      update()
      if(!alive) return
      draw()
      requestAnimationFrame(loop)
    }
    startNextWave()
    requestAnimationFrame(loop)

    return () => {
      alive = false
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [gameKey])

  const restart = () => { setStatus('playing'); setGameKey(k => k+1) }
  const tDown = which => () => { touchRef.current[which] = true }
  const tUp = which => () => { touchRef.current[which] = false }

  const W=320, H=480
  const btn = {padding:'14px 22px',background:'#1a1a24',border:`1px solid #d4b06a55`,color:'#d4b06a',borderRadius:6,fontSize:20,touchAction:'manipulation',userSelect:'none',cursor:'pointer',WebkitTapHighlightColor:'transparent'}
  const fireBtn = {...btn,padding:'14px 28px',background:'#d4b06a22',border:`1px solid #d4b06a`,fontSize:14,letterSpacing:'0.1em',fontWeight:700}

  return (
    <div style={{position:'fixed',inset:0,background:'#000000f5',zIndex:9999,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:14,gap:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%',maxWidth:380}}>
        <div style={{fontFamily:'monospace',fontSize:13,fontWeight:700,letterSpacing:'0.2em',color:'#d4b06a'}}>☕ COFFEE INVADERS</div>
        <button onClick={onClose} style={{background:'transparent',border:`1px solid #444`,color:'#aaa',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:18,lineHeight:1,touchAction:'manipulation'}}>×</button>
      </div>
      <div style={{position:'relative'}}>
        <canvas ref={canvasRef} width={W} height={H} style={{display:'block',background:'#0a0a0e',border:`2px solid #d4b06a44`,borderRadius:6,maxWidth:'100%',height:'auto',imageRendering:'pixelated'}}/>
        {status === 'lost' && (
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.82)',borderRadius:6,gap:10}}>
            <div style={{fontFamily:'monospace',fontSize:22,fontWeight:700,letterSpacing:'0.2em',color:'#d47a7a'}}>💥 GAME OVER</div>
            <div style={{fontFamily:'monospace',fontSize:11,color:'#d4b06a',letterSpacing:'0.15em'}}>VAGUE ATTEINTE</div>
            <div style={{fontFamily:'monospace',fontSize:28,fontWeight:700,color:'#d4b06a',marginTop:-4}}>{finalWave}</div>
            <div style={{fontFamily:'monospace',fontSize:11,color:'#d4b06a',letterSpacing:'0.15em',marginTop:6}}>SCORE</div>
            <div style={{fontFamily:'monospace',fontSize:22,fontWeight:700,color:'#d4b06a',marginTop:-4}}>{finalScore}</div>
            <button onClick={restart} style={{marginTop:8,padding:'10px 24px',background:'#d4b06a22',border:`1px solid #d4b06a`,color:'#d4b06a',borderRadius:6,cursor:'pointer',fontSize:12,letterSpacing:'0.15em',fontWeight:700,touchAction:'manipulation'}}>
              ⟲ REJOUER
            </button>
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:10,width:'100%',maxWidth:380,justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:6}}>
          <button onTouchStart={tDown('left')} onTouchEnd={tUp('left')} onMouseDown={tDown('left')} onMouseUp={tUp('left')} onMouseLeave={tUp('left')} style={btn}>◀</button>
          <button onTouchStart={tDown('right')} onTouchEnd={tUp('right')} onMouseDown={tDown('right')} onMouseUp={tUp('right')} onMouseLeave={tUp('right')} style={btn}>▶</button>
        </div>
        <button onTouchStart={tDown('fire')} onTouchEnd={tUp('fire')} onMouseDown={tDown('fire')} onMouseUp={tUp('fire')} onMouseLeave={tUp('fire')} style={fireBtn}>🫘 FIRE</button>
      </div>
      <div style={{fontFamily:'monospace',fontSize:9,color:'#666',textAlign:'center',letterSpacing:'0.1em'}}>
        ← → / A D · ESPACE = tirer · ÉCHAP = quitter
      </div>
    </div>
  )
}

// ─── TAB MACHINE ──────────────────────────────────────────────────────────────
function TabMachine({ coffee, setCoffee, onSave, dose, setDose, yld, setYld, time, setTime, timerRunning, timerElapsed, timerStart, timerPause, timerReset, temp, setTemp, preInfPct, setPreInfPct, preInfSec, setPreInfSec, machineType, setMachineType, T }) {
  const [feedback,setFeedback]=useState(null),[flash,setFlash]=useState(null)
  const [showGuide,setShowGuide]=useState(false)
  const [liveWeight,setLiveWeight]=useState(0),[liveWeightOpen,setLiveWeightOpen]=useState(false)
  const [showInvaders,setShowInvaders]=useState(false)
  const titleClickRef=useRef({count:0,lastTime:0})
  const onTitleClick=()=>{
    if(machineType!=='breville')return
    const now=Date.now(),ref=titleClickRef.current
    if(now-ref.lastTime>1500)ref.count=0
    ref.count++;ref.lastTime=now
    if(ref.count>=7){ref.count=0;setShowInvaders(true)}
  }
  const result=computeMachineDialIn({doseG:dose,yieldG:yld,timeSec:time,tempC:temp,preInfPct,preInfSec,classic:machineType==='classic'})
  const targetWeight=Math.round(dose*2.0)
  const liveW=liveWeight>0?liveWeight:yld
  const ratioProgress=Math.min((liveW/dose)/2.0*100,100)
  const ratioColor=ratioProgress>=95?T.green:ratioProgress>=80?T.orange:T.red

  const doTaste=taste=>{
    const fb=computeTasteMachine({taste,tempC:temp,preInfPct,preInfSec,yieldG:yld,classic:machineType==='classic'},T)
    if(!fb)return;setFlash(taste);setTimeout(()=>setFlash(null),1000);setFeedback(fb)
    onSave({mode:'machine',dose,yld,time,temp,preInfPct,preInfSec,taste,score:taste==='perfect'?100:(result?.score??0),coffee:{...coffee}})
    if(taste!=='perfect'){setTemp(fb.newTemp);setPreInfPct(fb.newPreInfPct);setPreInfSec(fb.newPreInfSec)}
  }
  const applyResult=()=>{
    if(!result)return
    onSave({mode:'machine',dose,yld,time,temp,preInfPct,preInfSec,score:result.score,coffee:{...coffee}})
    setTemp(result.newTemp);setPreInfSec(result.newPreInfSec);setPreInfPct(result.newPreInfPct)
  }

  return (<>
    {showGuide&&<GuideModal mode="machine" onClose={()=>setShowGuide(false)} T={T}/>}
    {liveWeightOpen&&<NumPad label="Poids en tasse" unit="g" initial={liveWeight>0?liveWeight:yld} min={0} max={500} onConfirm={w=>{setLiveWeight(w);setYld(w);setLiveWeightOpen(false)}} onClose={()=>setLiveWeightOpen(false)} T={T}/>}
    {showInvaders&&<CoffeeInvaders onClose={()=>setShowInvaders(false)}/>}

    {/* Bouton guide */}
    <div style={{marginBottom:16}}>
      <button onClick={()=>setShowGuide(true)} style={{width:'100%',padding:'9px 0',background:T.bg3,border:`1px solid ${T.gold}66`,color:T.gold,borderRadius:6,cursor:'pointer',fontSize:11,letterSpacing:'0.15em',touchAction:'manipulation'}}>📖 GUIDE — MACHINE</button>
    </div>

    <div style={{...card(T),border:`1px solid ${MC}44`,background:`${MC}08`}}>
      <div onClick={onTitleClick} style={{...SL(T),color:MC,cursor:'pointer',userSelect:'none',WebkitTapHighlightColor:'transparent',touchAction:'manipulation'}}>⚙ {machineType==='classic'?'Machine classique':'Breville Dual Boiler'}</div>
      <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute}}>Espresso · ratio 1:2 · 20–35s · 90–96°C</div>
    </div>

    <CoffeeCard coffee={coffee} setCoffee={setCoffee} T={T}/>
    <TasteButtons flash={flash} onTaste={doTaste} feedback={feedback} T={T}/>

    {/* PRÉ-INFUSION */}
    <div style={card(T)}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{...SL(T),marginBottom:0}}>Pré-infusion</div>
        <div style={{display:'flex',gap:6}}>
          {[['breville','Breville'],['classic','Classique']].map(([k,label])=>(
            <button key={k} onClick={()=>setMachineType(k)} style={{
              padding:'5px 12px',borderRadius:4,cursor:'pointer',fontSize:11,letterSpacing:'0.08em',fontWeight:700,
              border:`1px solid ${machineType===k?MC:T.border}`,
              background:machineType===k?`${MC}22`:T.bg,
              color:machineType===k?MC:T.textDim,
              touchAction:'manipulation',WebkitTapHighlightColor:'transparent',
            }}>{label}</button>
          ))}
        </div>
      </div>
      {machineType==='classic'?(
        <div style={{padding:'16px 0',textAlign:'center',color:T.textMute,fontFamily:'monospace',fontSize:13,letterSpacing:'0.1em',opacity:0.6}}>
          — Sans pré-infusion —
        </div>
      ):(
        <>
          <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
            <NumIn label="Durée" val={preInfSec} set={setPreInfSec} unit="s" min={1} max={30} color={MC} T={T}/>
            <NumIn label="Pression" val={preInfPct} set={setPreInfPct} unit="%" min={55} max={99} step={1} color={MC} T={T}/>
          </div>
          <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:8}}>Pression 55–99% · durée recommandée 3–8s</div>
          <Bar pct={(preInfSec/10)*100} color={preInfSec>=3&&preInfSec<=10?T.green:T.orange} T={T}/>
        </>
      )}
    </div>

    {/* TIMER */}
    <div style={card(T)}>
      <div style={SL(T)}>Temps d'extraction · Ratio live</div>

      <div style={{marginBottom:14}}>
        <NumIn label="Dose" val={dose} set={setDose} unit="g" min={5} max={40} color={MC} T={T}/>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:14}}>
        <div style={{flex:1}}>
          <Timer running={timerRunning} elapsed={timerElapsed} onStart={timerStart} onPause={timerPause} onReset={timerReset} T={T}/>
        </div>
        <button onClick={()=>setLiveWeightOpen(true)} style={{
          flex:1,padding:'12px 8px',background:liveWeight>0?`${ratioColor}18`:T.bg3,
          border:`2px solid ${liveWeight>0?ratioColor:T.border}`,borderRadius:8,
          color:liveWeight>0?ratioColor:T.textMute,cursor:'pointer',textAlign:'center',
          touchAction:'manipulation',WebkitTapHighlightColor:'transparent',transition:'all 0.2s',
          boxShadow:liveWeight>0?`0 0 16px ${ratioColor}44`:'none',
        }}>
          <div style={{fontSize:9,letterSpacing:'0.25em',textTransform:'uppercase',marginBottom:4,color:liveWeight>0?ratioColor:T.textMute}}>POIDS TASSE</div>
          <div style={{fontFamily:'monospace',fontSize:32,fontWeight:300,lineHeight:1,textShadow:liveWeight>0?`0 0 20px ${ratioColor}66`:'none'}}>
            {liveW}<span style={{fontSize:12,marginLeft:3}}>g</span>
          </div>
          <div style={{fontSize:9,color:T.textMute,marginTop:4}}>tap pour modifier</div>
        </button>
      </div>

      <div style={{marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:6}}>
          <span style={{fontFamily:'monospace',fontSize:14,color:ratioColor,fontWeight:700}}>
            1:{(liveW/dose).toFixed(2)}
          </span>
          <span style={{fontFamily:'monospace',fontSize:10,color:T.textMute}}>
            cible 1:1.5–1:2.5 · {targetWeight}g
          </span>
        </div>
        <div style={{height:7,background:T.bg3,borderRadius:4,overflow:'hidden'}}>
          <div style={{height:'100%',width:`${ratioProgress}%`,background:ratioColor,borderRadius:4,transition:'width 0.3s',boxShadow:`0 0 10px ${ratioColor}88`}}/>
        </div>
        <div style={{fontFamily:'monospace',fontSize:10,color:ratioColor,marginTop:5,textAlign:'right'}}>
          {ratioProgress>=95?'✓ Dans la cible':liveW<targetWeight?`→ encore ${targetWeight-liveW}g`:'✓ Cible atteinte'}
        </div>
      </div>

      <div style={{marginTop:4}}><NumIn label="Saisie manuelle (s)" val={time} set={setTime} unit="s" min={5} max={90} color={T.textDim} T={T}/></div>
      <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:8}}>cible 20–35s</div>
      <Bar pct={(time/35)*100} color={time>=20&&time<=35?T.green:T.red} T={T}/>
    </div>

    {/* TEMPÉRATURE */}
    <div style={{...card(T),alignItems:'center'}}>
      <div style={SL(T)}>Température d'extraction</div>
      <Dial value={temp} range={[85,96]} color={MC} T={T}/>
      <div style={{fontFamily:'monospace',fontSize:32,fontWeight:300,color:MC,textShadow:`0 0 22px ${MC}66`,marginTop:4,marginBottom:12}}>
        {temp}<span style={{fontSize:13,color:T.textDim,marginLeft:4}}>°C</span>
      </div>
      <div style={{display:'flex',gap:8}}>
        <button onClick={()=>setTemp(t=>clamp(t-1,85,96))} style={dBtn(MC,T)}>−1°C</button>
        <button onClick={()=>setTemp(t=>clamp(t+1,85,96))} style={dBtn(MC,T)}>+1°C</button>
      </div>
      <div style={{fontFamily:'monospace',fontSize:10,color:T.textMute,marginTop:8}}>plage 85–96°C · optimal 91–94°C</div>
    </div>

    {/* ANALYSE */}
    {result&&(
      <div style={card(T)}>
        <div style={SL(T)}>Analyse</div>
        <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',marginBottom:14}}>
          <ScoreRing score={result.score} T={T}/>
          <div>
            <div style={{fontFamily:'monospace',fontSize:11,color:T.textDim,marginBottom:6}}>Ratio 1:{result.ratio.toFixed(1)} · {formatTime(time)} · {temp}°C</div>
            <Bar2 label="Ratio" v={result.ratioScore} T={T}/>
            <Bar2 label="Temps" v={result.timeScore} T={T}/>
            <Bar2 label="Temp." v={result.tempScore} T={T}/>
          </div>
        </div>
        {result.isPerfect
          ?<div style={{fontSize:18,color:T.green,letterSpacing:'0.1em',fontWeight:700}}>✓ EXTRACTION PARFAITE</div>
          :<>
            {result.suggestions.map((s,i)=><div key={i} style={{fontFamily:'monospace',fontSize:11,color:T.textDim,background:T.bg,border:`1px solid ${T.border}`,padding:'7px 10px',borderRadius:4,marginBottom:6}}>{s}</div>)}
            {(result.newTemp!==temp||result.newPreInfSec!==preInfSec)&&(
              <div style={{fontFamily:'monospace',fontSize:11,color:MC,marginTop:4,display:'flex',gap:12,flexWrap:'wrap'}}>
                {result.newTemp!==temp&&<span>Temp → {result.newTemp}°C</span>}
                {result.newPreInfSec!==preInfSec&&<span>Pré-inf → {result.newPreInfSec}s</span>}
              </div>
            )}
            <button onClick={applyResult} style={{marginTop:12,padding:'13px 20px',border:`1px solid ${MC}`,background:`${MC}22`,color:MC,borderRadius:4,cursor:'pointer',fontSize:13,letterSpacing:'0.1em',fontWeight:700,width:'100%',touchAction:'manipulation'}}>
              ⬤ APPLIQUER LES AJUSTEMENTS
            </button>
          </>
        }
      </div>
    )}
  </>)
}

// ─── HISTORIQUE ───────────────────────────────────────────────────────────────
function StarRating({ rating=0, onRate, T }) {
  const [hover,setHover]=useState(0)
  return (
    <div onClick={e=>e.stopPropagation()} style={{display:'flex',gap:2,alignItems:'center'}}>
      {[1,2,3,4,5].map(n=>(
        <button key={n}
          onClick={e=>{e.stopPropagation();onRate(rating===n?0:n)}}
          onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
          style={{background:'none',border:'none',padding:'2px 1px',cursor:'pointer',fontSize:16,lineHeight:1,color:(hover||rating)>=n?T.gold:T.border2,touchAction:'manipulation',WebkitTapHighlightColor:'transparent',transition:'color 0.1s'}}>
          ★
        </button>
      ))}
    </div>
  )
}

function TabHistory({ history, onDelete, onRate, onApply, T }) {
  const [selected,setSelected]=useState(new Set())
  const toggle=id=>setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n})
  const deleteSelected=()=>{onDelete([...selected]);setSelected(new Set())}
  const mColors={espresso:T.gold,filter:T.blue,aeropress:T.green,chemex:T.purple,moka:T.orange}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {selected.size>0&&(
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:`${T.red}15`,border:`1px solid ${T.red}55`,borderRadius:6,marginBottom:4}}>
          <span style={{fontSize:13,color:T.text,fontWeight:600}}>{selected.size} sélectionné{selected.size>1?'s':''}</span>
          <button onClick={deleteSelected} style={{padding:'7px 18px',background:T.red,border:'none',color:'#fff',borderRadius:4,cursor:'pointer',fontSize:12,fontWeight:700,letterSpacing:'0.1em',touchAction:'manipulation'}}>🗑 Supprimer</button>
        </div>
      )}
      {history.length===0
        ?<div style={{textAlign:'center',color:T.textMute,padding:48,fontSize:13}}>Aucun shot enregistré</div>
        :history.map((h,i)=>{
          const isMoulin=h.mode==='moulin'
          const hm=isMoulin&&h.method?BREW_METHODS[h.method]:null
          const ac=isMoulin?(hm?mColors[h.method]||T.gold:T.gold):MC
          const tasteIcon=h.taste==='acid'?'🍋':h.taste==='bitter'?'☕':h.taste==='perfect'?'✨':''
          const isSel=selected.has(h.id)
          const gLabel=h.grinderId&&h.grinderId!=='none'&&GRINDERS[h.grinderId]?GRINDERS[h.grinderId].label:null
          return (
            <div key={h.id} onClick={()=>toggle(h.id)} style={{display:'flex',flexDirection:'column',gap:7,padding:'12px 14px',background:isSel?`${T.red}12`:i===0?T.bg3:T.bg2,border:`2px solid ${isSel?T.red:i===0?T.border2:T.border}`,borderRadius:8,cursor:'pointer',transition:'all 0.15s',WebkitTapHighlightColor:'transparent',boxShadow:`0 2px 8px ${T.shadow}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                <span style={{fontSize:11,fontWeight:700,letterSpacing:'0.12em',color:ac,background:`${ac}18`,border:`1px solid ${ac}44`,padding:'3px 9px',borderRadius:4}}>{isMoulin?'⚙ MOULIN':'☕ MACHINE'}</span>
                <span style={{fontSize:10,color:T.textMute}}>{h.ts}</span>
                {tasteIcon&&<span style={{fontSize:13}}>{tasteIcon}</span>}
                <span style={{fontFamily:'monospace',fontSize:12,marginLeft:'auto',color:h.score>=90?T.green:h.score>=70?T.gold:T.red,fontWeight:700}}>{h.score}/100</span>
              </div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap',fontFamily:'monospace',fontSize:11,color:T.textDim}}>
                {hm&&<span style={{color:ac,fontWeight:600}}>{hm.icon} {hm.label}</span>}
                <span>{h.dose}g→{h.yld}g</span>
                <span>{formatTime(h.time)}</span>
                {isMoulin&&h.grind&&<span style={{color:ac}}>{h.grind}µm</span>}
                {!isMoulin&&h.temp&&<span style={{color:MC}}>{h.temp}°C · PI {h.preInfSec}s@{h.preInfPct}%</span>}
              </div>
              {gLabel&&<div style={{fontFamily:'monospace',fontSize:10,color:T.textMute}}>⚙ {gLabel}{h.grindValue?` · ${h.grindValue} ${GRINDERS[h.grinderId]?.unit}`:''}</div>}
              {h.coffee?.name&&<div style={{fontFamily:'monospace',fontSize:10,color:T.gold}}>☕ {h.coffee.name}{h.coffee.country?` · ${h.coffee.country}`:''}{h.coffee.process?` · ${h.coffee.process}`:''}</div>}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <StarRating rating={h.rating||0} onRate={r=>onRate(h.id,r)} T={T}/>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <button onClick={e=>{e.stopPropagation();onApply(h)}} style={{padding:'4px 10px',background:`${T.blue}18`,border:`1px solid ${T.blue}55`,color:T.blue,borderRadius:4,cursor:'pointer',fontSize:10,letterSpacing:'0.1em',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>↺ CHARGER</button>
                  {isSel&&<div style={{fontSize:10,color:T.red,letterSpacing:'0.1em',fontWeight:600}}>✓ SÉLECTIONNÉ</div>}
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

// ─── RECETTES ────────────────────────────────────────────────────────────────

function RecipeCard({recipe,T,grinder}){
  const bc=BADGE_COLORS[recipe.badge.type]||BADGE_COLORS.standard
  const paramLabels={coffee:'☕',water:'💧',ratio:'⚖',temperature:'🌡',grind:'⚙',totalTime:'⏱',equipment:'🔧'}

  let convertedGrind=null
  if(grinder && recipe.grindµm){
    const µm=recipe.grindµm
    if(µm>=grinder.minµm&&µm<=grinder.maxµm){
      if(grinder.clicks){
        const clics=Math.round((µm-grinder.minµm)/(grinder.maxµm-grinder.minµm)*grinder.clicks)
        convertedGrind=`${µm} µm · ${clics} ${grinder.unit}`
      } else {
        convertedGrind=`${µm} µm`
      }
    } else {
      convertedGrind=`${µm} µm (hors plage)`
    }
  }

  return(
    <div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:10,padding:16,marginBottom:14,boxShadow:`0 2px 8px ${T.shadow}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:10,marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:T.text,lineHeight:1.3}}>{recipe.title}</div>
          <div style={{fontSize:11,color:T.textDim,marginTop:3}}>{recipe.author}</div>
        </div>
        <span style={{flexShrink:0,background:bc.bg,color:bc.text,fontSize:10,fontWeight:700,padding:'3px 8px',borderRadius:20,letterSpacing:'0.05em',whiteSpace:'nowrap'}}>{recipe.badge.label}</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:convertedGrind||(grinder&&!recipe.grindµm)?6:14}}>
        {Object.entries(recipe.params).map(([k,v])=>(
          <span key={k} style={{background:T.bg3,border:`1px solid ${T.border}`,color:T.textDim,fontSize:11,padding:'3px 9px',borderRadius:20}}>
            {paramLabels[k]||''} {v}
          </span>
        ))}
      </div>
      {convertedGrind&&(
        <div style={{marginBottom:14,padding:'7px 12px',background:`${T.green}15`,border:`1px solid ${T.green}44`,borderRadius:8,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <span style={{fontSize:10,color:T.green,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>⚙ {grinder.label}</span>
          <span style={{fontSize:13,color:T.green,fontFamily:'monospace',fontWeight:700}}>{convertedGrind}</span>
        </div>
      )}
      {grinder&&!recipe.grindµm&&(
        <div style={{marginBottom:14,padding:'5px 12px',background:T.bg3,border:`1px solid ${T.border}`,borderRadius:8}}>
          <span style={{fontSize:10,color:T.textMute}}>⚙ Réglage µm non disponible pour cette recette</span>
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:12}}>
        {recipe.steps.map((s,i)=>(
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{minWidth:52,flexShrink:0,color:T.gold,fontSize:10,fontWeight:700,fontFamily:'monospace',paddingTop:1}}>{s.time}</div>
            <div style={{fontSize:12,color:T.text,lineHeight:1.5}}>{s.instruction}</div>
          </div>
        ))}
      </div>
      <div style={{borderLeft:`3px solid ${T.gold}`,paddingLeft:10,paddingTop:6,paddingBottom:6,background:`${T.gold}12`,borderRadius:'0 6px 6px 0'}}>
        <div style={{fontSize:11,color:T.textDim,lineHeight:1.5,fontStyle:'italic'}}>{recipe.tip}</div>
      </div>
    </div>
  )
}

function TabRecettes({T}){
  const [active,setActive]=useState('v60')
  const [grinderId,setGrinderId]=useState('none')
  const recipes=RECIPES.filter(r=>r.method===active)
  const activeM=METHODS.find(m=>m.id===active)
  const grinder=grinderId!=='none'?GRINDERS[grinderId]:null

  const brands={}
  Object.entries(GRINDERS).forEach(([id,g])=>{
    if(id==='none'||!g.brand)return
    if(!brands[g.brand])brands[g.brand]=[]
    brands[g.brand].push([id,g])
  })

  return(
    <div>
      {/* Sélecteur de moulin */}
      <div style={{marginBottom:16,padding:'12px 14px',background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,boxShadow:`0 2px 8px ${T.shadow}`}}>
        <div style={{fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:T.textMute,marginBottom:8}}>⚙ Convertir les réglages pour mon moulin</div>
        <div style={{position:'relative'}}>
          <select value={grinderId} onChange={e=>setGrinderId(e.target.value)} style={{width:'100%',padding:'9px 12px',background:T.bg3,color:grinderId!=='none'?T.gold:T.textMute,border:`1px solid ${grinderId!=='none'?T.gold:T.border}`,borderRadius:6,fontSize:13,fontFamily:'monospace',cursor:'pointer',outline:'none',WebkitAppearance:'none',appearance:'none',fontWeight:grinderId!=='none'?700:400}}>
            <option value="none">— Aucun (afficher réglage original) —</option>
            {Object.entries(brands).map(([brand,grinders])=>(
              <optgroup key={brand} label={brand}>
                {grinders.map(([id,g])=>(
                  <option key={id} value={id}>{g.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:T.textMute,pointerEvents:'none'}}>▾</span>
        </div>
        {grinder&&<div style={{marginTop:6,fontSize:10,color:T.textMute,fontFamily:'monospace'}}>{grinder.description}</div>}
      </div>

      <div style={{overflowX:'auto',scrollbarWidth:'none',WebkitOverflowScrolling:'touch',marginBottom:16,paddingBottom:4}}>
        <div style={{display:'flex',gap:6,minWidth:'max-content'}}>
          {METHODS.map(m=>(
            <button key={m.id} onClick={()=>setActive(m.id)} style={{flexShrink:0,padding:'7px 13px',fontFamily:'sans-serif',fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',background:active===m.id?`${T.gold}20`:T.bg2,color:active===m.id?T.gold:T.textMute,border:`1px solid ${active===m.id?T.gold:T.border}`,borderRadius:20,cursor:'pointer',touchAction:'manipulation',WebkitTapHighlightColor:'transparent',transition:'all 0.18s',fontWeight:active===m.id?700:400,whiteSpace:'nowrap'}}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      {activeM&&(
        <div style={{marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${T.border}`}}>
          <div style={{fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:T.textMute}}>{activeM.desc}</div>
          <div style={{fontSize:10,color:T.textMute,marginTop:2}}>{recipes.length} recette{recipes.length>1?'s':''}</div>
        </div>
      )}
      {recipes.map(r=><RecipeCard key={r.id} recipe={r} T={T} grinder={grinder}/>)}
    </div>
  )
}

// ─── COMPARATEUR DE MOULIN ───────────────────────────────────────────────────
function TabComparateur({ T }) {
  const [fromId, setFromId] = useState('none')
  const [toId,   setToId]   = useState('none')
  const [fromVal, setFromVal] = useState(1)

  const fromG = fromId !== 'none' ? GRINDERS[fromId] : null
  const toG   = toId   !== 'none' ? GRINDERS[toId]   : null

  const sourceµm = fromG
    ? fromG.clicks
      ? Math.round(fromG.minµm + (fromVal / fromG.clicks) * (fromG.maxµm - fromG.minµm))
      : fromVal
    : null

  const targetVal = toG && sourceµm !== null
    ? toG.clicks
      ? Math.round((sourceµm - toG.minµm) / (toG.maxµm - toG.minµm) * toG.clicks)
      : sourceµm
    : null

  const inRange = toG && sourceµm !== null && sourceµm >= toG.minµm && sourceµm <= toG.maxµm
  const µmPerFrom = fromG?.clicks ? Math.round((fromG.maxµm - fromG.minµm) / fromG.clicks * 10) / 10 : null
  const µmPerTo   = toG?.clicks   ? Math.round((toG.maxµm   - toG.minµm)   / toG.clicks   * 10) / 10 : null

  const brands = {}
  Object.entries(GRINDERS).forEach(([id, g]) => {
    if (id === 'none') return
    if (!brands[g.brand]) brands[g.brand] = []
    brands[g.brand].push([id, g])
  })

  const sel = {
    width:'100%', padding:'10px 12px', background:T.bg3, color:T.text,
    border:`1px solid ${T.border}`, borderRadius:6, fontSize:13,
    fontFamily:'monospace', cursor:'pointer', outline:'none',
    WebkitAppearance:'none', appearance:'none'
  }
  const lbl = {
    fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase',
    color:T.textMute, marginBottom:6, display:'block'
  }
  const card = {
    background:T.bg2, border:`1px solid ${T.border}`, borderRadius:10,
    padding:16, boxShadow:`0 2px 8px ${T.shadow}`
  }
  const btn = {
    width:38, height:38, background:T.bg3, border:`1px solid ${T.border}`,
    borderRadius:6, cursor:'pointer', fontSize:18, color:T.text, touchAction:'manipulation',
    WebkitTapHighlightColor:'transparent'
  }

  const GrinderSelect = ({ value, onChange }) => (
    <div style={{position:'relative'}}>
      <select value={value} onChange={e => onChange(e.target.value)} style={sel}>
        <option value="none">— Sélectionner un moulin —</option>
        {Object.entries(brands).map(([brand, grinders]) => (
          <optgroup key={brand} label={brand}>
            {grinders.map(([id, g]) => (
              <option key={id} value={id}>{g.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:T.textMute,pointerEvents:'none'}}>▾</span>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <div style={{padding:'12px 16px',background:`${T.gold}12`,border:`1px solid ${T.gold}44`,borderRadius:8}}>
        <div style={{fontSize:12,fontWeight:700,color:T.gold,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:4}}>⇄ Comparateur de Moulin</div>
        <div style={{fontSize:11,color:T.textDim,lineHeight:1.5}}>Convertit un réglage d'un moulin vers un autre selon la résolution µm/{`clic`} de chaque appareil.</div>
      </div>

      {/* SOURCE */}
      <div style={card}>
        <span style={lbl}>Moulin source</span>
        <GrinderSelect value={fromId} onChange={v => { setFromId(v); setFromVal(1) }} />
        {fromG && (
          <div style={{marginTop:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <span style={lbl}>{fromG.clicks ? `Réglage (${fromG.unit})` : 'Valeur (µm)'}</span>
              {µmPerFrom && <span style={{fontSize:10,color:T.textMute,fontFamily:'monospace'}}>{µmPerFrom} µm/{fromG.unit}</span>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button onClick={() => setFromVal(v => Math.max(1, v-1))} style={btn}>−</button>
              <input
                type="number" value={fromVal} min={1} max={fromG.clicks||fromG.maxµm}
                onChange={e => setFromVal(Math.max(1, Math.min(fromG.clicks||fromG.maxµm, parseInt(e.target.value)||1)))}
                style={{flex:1,textAlign:'center',padding:'8px 0',background:T.bg3,border:`1px solid ${T.border2}`,borderRadius:6,fontSize:20,fontWeight:700,fontFamily:'monospace',color:T.gold,outline:'none'}}
              />
              <button onClick={() => setFromVal(v => Math.min(fromG.clicks||fromG.maxµm, v+1))} style={btn}>+</button>
            </div>
            {fromG.clicks && (
              <div style={{marginTop:10,display:'flex',justifyContent:'center'}}>
                <div style={{fontFamily:'monospace',fontSize:13,color:T.textDim,background:T.bg3,padding:'6px 16px',borderRadius:20,border:`1px solid ${T.border}`}}>
                  ≈ <span style={{color:T.text,fontWeight:700}}>{sourceµm}</span> µm
                </div>
              </div>
            )}
            <div style={{marginTop:6,fontSize:10,color:T.textMute,textAlign:'center'}}>{fromG.description}</div>
          </div>
        )}
      </div>

      {fromG && sourceµm !== null && (
        <div style={{textAlign:'center',fontSize:22,color:T.gold}}>↕</div>
      )}

      {/* CIBLE */}
      <div style={card}>
        <span style={lbl}>Moulin cible</span>
        <GrinderSelect value={toId} onChange={setToId} />
        {toG && sourceµm !== null && (
          <div style={{marginTop:14}}>
            {µmPerTo && (
              <div style={{fontSize:10,color:T.textMute,fontFamily:'monospace',marginBottom:10,textAlign:'right'}}>{µmPerTo} µm/{toG.unit}</div>
            )}
            {inRange ? (
              <div style={{background:`${T.green}15`,border:`1px solid ${T.green}44`,borderRadius:8,padding:'14px 16px',textAlign:'center'}}>
                <div style={{fontSize:11,letterSpacing:'0.2em',textTransform:'uppercase',color:T.green,marginBottom:6}}>Réglage équivalent</div>
                <div style={{fontFamily:'monospace',fontSize:42,fontWeight:900,color:T.green,lineHeight:1}}>{targetVal}</div>
                <div style={{fontSize:12,color:T.textDim,marginTop:4}}>{toG.unit}</div>
                {toG.clicks && (
                  <div style={{fontSize:11,color:T.textMute,marginTop:8,fontFamily:'monospace'}}>≈ {sourceµm} µm · sur {toG.clicks} {toG.unit}s max</div>
                )}
              </div>
            ) : (
              <div style={{background:`${T.red}15`,border:`1px solid ${T.red}44`,borderRadius:8,padding:'14px 16px',textAlign:'center'}}>
                <div style={{fontSize:12,color:T.red,fontWeight:600}}>⚠ Hors plage</div>
                <div style={{fontSize:11,color:T.textMute,marginTop:4}}>Ce moulin couvre {toG.minµm}–{toG.maxµm} µm · valeur calculée : {sourceµm} µm</div>
              </div>
            )}
            <div style={{marginTop:6,fontSize:10,color:T.textMute,textAlign:'center'}}>{toG.description}</div>
          </div>
        )}
      </div>

      {/* RÉSUMÉ RÉSOLUTION */}
      {fromG && toG && µmPerFrom && µmPerTo && (
        <div style={{...card,background:T.bg3}}>
          <div style={{fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:T.textMute,marginBottom:10}}>Résolution comparée</div>
          <div style={{display:'flex',gap:8}}>
            <div style={{flex:1,textAlign:'center',padding:'10px 8px',background:T.bg2,borderRadius:6,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:10,color:T.textMute,marginBottom:4}}>{fromG.label}</div>
              <div style={{fontFamily:'monospace',fontSize:15,fontWeight:700,color:T.gold}}>{µmPerFrom} µm</div>
              <div style={{fontSize:9,color:T.textMute}}>par {fromG.unit}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',color:T.textMute,fontSize:16}}>⇄</div>
            <div style={{flex:1,textAlign:'center',padding:'10px 8px',background:T.bg2,borderRadius:6,border:`1px solid ${T.border}`}}>
              <div style={{fontSize:10,color:T.textMute,marginBottom:4}}>{toG.label}</div>
              <div style={{fontFamily:'monospace',fontSize:15,fontWeight:700,color:MC}}>{µmPerTo} µm</div>
              <div style={{fontSize:9,color:T.textMute}}>par {toG.unit}</div>
            </div>
          </div>
          {µmPerFrom !== µmPerTo && (
            <div style={{marginTop:8,fontSize:11,color:T.textMute,textAlign:'center'}}>
              1 {fromG.unit} {fromG.label} ≈ <span style={{color:T.text,fontWeight:600}}>{Math.round(µmPerFrom / µmPerTo * 10) / 10}</span> {toG.unit} {toG.label}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [darkMode,setDarkMode]=useState(true)
  const T=darkMode?DARK:LIGHT
  const [mainTab,setMainTab]=useState('calibration')
  const [subTab,setSubTab]=useState('moulin')
  const [coffee,setCoffee]=useState({name:'',country:'',variety:'',profile:'',process:''})
  const [_sp]=useState(loadSavedParams)
  const [dose,setDose]=useState(_sp.dose||18),[yld,setYld]=useState(_sp.yld||36)
  const [moulinMethod,setMoulinMethod]=useState(_sp.moulinMethod||'espresso')
  const [moulinGrind,setMoulinGrind]=useState(_sp.moulinGrind||200)
  const [moulinGrinderId,setMoulinGrinderId]=useState(_sp.moulinGrinderId||'none')
  const [machineTemp,setMachineTemp]=useState(_sp.machineTemp||93)
  const [machinePreInfPct,setMachinePreInfPct]=useState(_sp.machinePreInfPct||70)
  const [machinePreInfSec,setMachinePreInfSec]=useState(_sp.machinePreInfSec||5)
  const [machineMachineType,setMachineMachineType]=useState(_sp.machineMachineType||'breville')
  const [history,setHistory]=useState(()=>{
    try{const s=localStorage.getItem(STORAGE_KEY);return s?JSON.parse(s):[]}catch{return[]}
  })
  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(history))}catch{}},[history])
  useEffect(()=>{try{localStorage.setItem(PARAMS_KEY,JSON.stringify({moulinMethod,moulinGrind,moulinGrinderId,machineTemp,machinePreInfPct,machinePreInfSec,machineMachineType,dose,yld}))}catch{}},[moulinMethod,moulinGrind,moulinGrinderId,machineTemp,machinePreInfPct,machinePreInfSec,machineMachineType,dose,yld])
  const saveEntry=entry=>setHistory(h=>[{...entry,id:Date.now(),ts:new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})},...h].slice(0,50))
  const deleteEntries=ids=>setHistory(h=>h.filter(e=>!ids.includes(e.id)))
  const applyRecipe=h=>{
    if(h.mode==='moulin'){
      setSubTab('moulin')
      if(h.method)setMoulinMethod(h.method)
      if(h.grind)setMoulinGrind(h.grind)
      if(h.grinderId)setMoulinGrinderId(h.grinderId)
    }else{
      setSubTab('machine')
      if(h.temp)setMachineTemp(h.temp)
      if(h.preInfPct)setMachinePreInfPct(h.preInfPct)
      if(h.preInfSec)setMachinePreInfSec(h.preInfSec)
    }
    if(h.dose)setDose(h.dose)
    if(h.yld)setYld(h.yld)
    if(h.coffee)setCoffee({name:h.coffee.name||'',country:h.coffee.country||'',variety:h.coffee.variety||'',profile:h.coffee.profile||'',process:h.coffee.process||''})
    setMainTab('calibration')
  }
  const rateEntry=(id,rating)=>setHistory(h=>h.map(e=>e.id===id?{...e,rating}:e))

  // ── Timer partagé Moulin ↔ Machine ──
  const [time,setTime]=useState(27)
  const [timerRunning,setTimerRunning]=useState(false)
  const [timerElapsed,setTimerElapsed]=useState(0)
  const timerRef=useRef(null),t0Ref=useRef(0)
  const timerStart=()=>{
    if(timerRunning)return
    setTimerRunning(true)
    t0Ref.current=Date.now()-timerElapsed*1000
    timerRef.current=setInterval(()=>{const s=Math.floor((Date.now()-t0Ref.current)/1000);setTimerElapsed(s);setTime(s)},100)
  }
  const timerPause=()=>{setTimerRunning(false);clearInterval(timerRef.current)}
  const timerReset=()=>{setTimerRunning(false);clearInterval(timerRef.current);setTimerElapsed(0);setTime(0)}
  useEffect(()=>()=>clearInterval(timerRef.current),[])

  return (
    <div style={{minHeight:'100vh',backgroundColor:T.bg,color:T.text,fontFamily:'sans-serif',transition:'background-color 0.3s,color 0.3s',
      backgroundImage:darkMode?`linear-gradient(${T.bg3} 1px,transparent 1px),linear-gradient(90deg,${T.bg3} 1px,transparent 1px)`:`linear-gradient(${T.bg4} 1px,transparent 1px),linear-gradient(90deg,${T.bg4} 1px,transparent 1px)`,
      backgroundSize:'44px 44px',position:'relative'}}>

      <CaffeineBackground darkMode={darkMode}/>

      <div style={{maxWidth:520,margin:'0 auto',padding:'0 16px 80px',position:'relative',zIndex:1}}>

        {/* HEADER */}
        <div style={{padding:'20px 0 14px',borderBottom:`1px solid ${T.border}`,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:28,fontWeight:900,color:darkMode?'#ffffff':T.text,letterSpacing:'-0.02em',fontFamily:'Georgia,serif',lineHeight:1}}>TORREA</div>
            <div style={{fontSize:9,letterSpacing:'0.55em',color:T.textMute,marginTop:2}}>DIAL-IN SYSTEM</div>
          </div>
          <button onClick={()=>setDarkMode(d=>!d)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:darkMode?T.bg3:`${T.gold}18`,border:`1px solid ${darkMode?T.border:T.gold+'66'}`,borderRadius:20,cursor:'pointer',color:darkMode?T.textDim:T.gold,fontSize:12,letterSpacing:'0.1em',touchAction:'manipulation',WebkitTapHighlightColor:'transparent',transition:'all 0.2s'}}>
            <span style={{fontSize:16}}>{darkMode?'🌙':'☀️'}</span>
            <span style={{fontWeight:600}}>{darkMode?'Light Mode':'Dark Mode'}</span>
          </button>
        </div>

        {/* NAV PRINCIPALE */}
        <div style={{display:'flex',marginBottom:14,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,overflow:'hidden',boxShadow:`0 2px 8px ${T.shadow}`}}>
          {[['calibration','⬤ Calibration'],['history',`☰ Historique (${history.length})`],['recettes','☕ Recettes'],['comparateur','⇄ Comparer']].map(([t,label])=>(
            <button key={t} onClick={()=>setMainTab(t)} style={{flex:1,padding:'12px 0',fontFamily:'sans-serif',fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',background:mainTab===t?T.bg3:'transparent',color:mainTab===t?T.text:T.textMute,border:'none',cursor:'pointer',touchAction:'manipulation',transition:'all 0.2s',fontWeight:mainTab===t?700:400,borderBottom:mainTab===t?`2px solid ${T.gold}`:'2px solid transparent'}}>
              {label}
            </button>
          ))}
        </div>

        {/* SOUS-ONGLETS */}
        <div style={{display:mainTab==='calibration'?'flex':'none',gap:8,marginBottom:18}}>
          {[['moulin','⚙ Moulin',T.gold],['machine','☕ Machine',MC]].map(([t,label,color])=>(
            <button key={t} onClick={()=>setSubTab(t)} style={{flex:1,padding:'10px 0',fontFamily:'sans-serif',fontSize:12,letterSpacing:'0.15em',textTransform:'uppercase',background:subTab===t?`${color}20`:T.bg2,color:subTab===t?color:T.textMute,border:`1px solid ${subTab===t?color:T.border}`,borderRadius:6,cursor:'pointer',touchAction:'manipulation',transition:'all 0.2s',fontWeight:subTab===t?700:400,boxShadow:subTab===t?`0 0 12px ${color}44`:'none'}}>
              {label}
            </button>
          ))}
        </div>

        <div style={{display:mainTab==='calibration'?'block':'none'}}>
          <div style={{display:subTab==='moulin'?'block':'none'}}>
            <TabMoulin coffee={coffee} setCoffee={setCoffee} onSave={saveEntry} history={history} dose={dose} setDose={setDose} yld={yld} setYld={setYld} time={time} setTime={setTime} timerRunning={timerRunning} timerElapsed={timerElapsed} timerStart={timerStart} timerPause={timerPause} timerReset={timerReset} method={moulinMethod} setMethod={setMoulinMethod} grind={moulinGrind} setGrind={setMoulinGrind} grinderId={moulinGrinderId} setGrinderId={setMoulinGrinderId} T={T}/>
          </div>
          <div style={{display:subTab==='machine'?'block':'none'}}>
            <TabMachine coffee={coffee} setCoffee={setCoffee} onSave={saveEntry} dose={dose} setDose={setDose} yld={yld} setYld={setYld} time={time} setTime={setTime} timerRunning={timerRunning} timerElapsed={timerElapsed} timerStart={timerStart} timerPause={timerPause} timerReset={timerReset} temp={machineTemp} setTemp={setMachineTemp} preInfPct={machinePreInfPct} setPreInfPct={setMachinePreInfPct} preInfSec={machinePreInfSec} setPreInfSec={setMachinePreInfSec} machineType={machineMachineType} setMachineType={setMachineMachineType} T={T}/>
          </div>
        </div>
        {mainTab==='history'&&<TabHistory history={history} onDelete={deleteEntries} onRate={rateEntry} onApply={applyRecipe} T={T}/>}
        {mainTab==='recettes'&&<TabRecettes T={T}/>}
        {mainTab==='comparateur'&&<TabComparateur T={T}/>}
      </div>
    </div>
  )
}
