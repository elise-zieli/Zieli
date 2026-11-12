// Zieli : fabrique un PowerPoint par entreprise pour le mois qui vient de se terminer.
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const lire = (n) => $(n).all().map((i) => i.json);

const decaler = (cle, d) => { const [a, m] = cle.split('-').map(Number); return new Date(Date.UTC(a, m - 1 + d, 1)).toISOString().slice(0, 7); };
const moisSeul = (cle) => MOIS[Number(cle.slice(5, 7)) - 1];
const nomMois = (cle) => moisSeul(cle) + ' ' + cle.slice(0, 4);
const milliers = (n) => String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const eur = (n) => (Math.round(n) < 0 ? '−' : '') + milliers(n) + ' €';
const deMois = (cle) => (/^[aeiouy]/.test(moisSeul(cle)) ? "d'" : 'de ') + moisSeul(cle);
const xml = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
const moisCourant = parts.find((p) => p.type === 'year').value + '-' + parts.find((p) => p.type === 'month').value;
const M = decaler(moisCourant, -1);

function joursOuverture(cle) {
  const [a, m] = cle.split('-').map(Number);
  const nb = new Date(Date.UTC(a, m, 0)).getUTCDate();
  if (m === 12) return nb;
  let j = 0;
  for (let d = 1; d <= nb; d++) if (new Date(Date.UTC(a, m - 1, d)).getUTCDay() !== 0) j++;
  return j;
}

// ---------- Dessin des slides (1920 x 1080 convertis en unites PowerPoint) ----------
const E = 6350;
const PETROLE = '0E4A5C', DORE = 'F2B84B', FOND = 'FAF8F4', TEXTE = '1D2433', DOUX = '6B665E', FILET = 'E7E2D9', ROUGE = 'C0392B', ROUGE_T = 'A93226', ROUGE_F = 'FBEAEA', VERT = '1E8E5A', VERT_T = '14663F', VERT_F = 'E6F4EC', ORANGE = 'C46A00', ORANGE_T = '9A5300', ORANGE_F = 'FDF1E2', BLANC = 'FFFFFF', CLAIR = 'CFE2E8', PREVU = '3F8FA3';
const SERIF = 'Calibri', SANS = 'Calibri'; // police présente sur presque tous les ordinateurs (choix du 12/11)
// Logo Zieli (cube + « zieli » au z doré), image PNG encodée en texte (base64), proportions 188 x 64.
const LOGO_PNG = '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';
const LOGO_OCTETS = Array.from(Buffer.from(LOGO_PNG, 'base64'));
const LOGO_RATIO = 188 / 64;

function Page(fond) {
  let id = 2; const formes = [];
  const couleur = (c) => '<a:solidFill><a:srgbClr val="' + c + '"/></a:solidFill>';
  const run = (r) => '<a:r><a:rPr lang="fr-FR" sz="' + Math.round((r.sz || 24) * 50) + '" b="' + (r.b ? 1 : 0) + '" i="' + (r.i ? 1 : 0) + '" dirty="0">' + couleur(r.c || TEXTE) + '<a:latin typeface="' + (r.f || SANS) + '" pitchFamily="34" charset="0"/><a:cs typeface="' + (r.f || SANS) + '"/></a:rPr><a:t>' + xml(r.t) + '</a:t></a:r>';
  const para = (p) => '<a:p><a:pPr algn="' + (p.a || 'l') + '"/>' + p.r.map(run).join('') + '</a:p>';
  return {
    forme(x, y, w, h, o) {
      const n = id++;
      const contour = o.line ? '<a:ln w="' + Math.round((o.lw || 2) * E) + '">' + couleur(o.line) + '</a:ln>' : '<a:ln><a:noFill/></a:ln>';
      const geo = o.geo || (o.rad ? 'roundRect' : 'rect');
      const av = o.rad ? '<a:avLst><a:gd name="adj" fmla="val ' + Math.round(o.rad / Math.min(w, h) * 100000) + '"/></a:avLst>' : '<a:avLst/>';
      const m = o.m === undefined ? 0 : o.m;
      const corps = (o.p || [{ r: [{ t: '' }] }]).map(para).join('');
      // o.ombre : relief (ombre douce teintée de pétrole sous le bloc).
      const ombre = o.ombre ? '<a:effectLst><a:outerShdw blurRad="' + 22 * E + '" dist="' + 6 * E + '" dir="5400000" algn="t" rotWithShape="0"><a:srgbClr val="10282F"><a:alpha val="20000"/></a:srgbClr></a:outerShdw></a:effectLst>' : '';
      formes.push('<p:sp><p:nvSpPr><p:cNvPr id="' + n + '" name="Forme ' + n + '"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="' + Math.round(x * E) + '" y="' + Math.round(y * E) + '"/><a:ext cx="' + Math.round(w * E) + '" cy="' + Math.round(h * E) + '"/></a:xfrm><a:prstGeom prst="' + geo + '">' + av + '</a:prstGeom>' + (o.fill ? couleur(o.fill) : '<a:noFill/>') + contour + ombre + '</p:spPr><p:txBody><a:bodyPr wrap="square" lIns="' + m * E + '" tIns="' + m * E + '" rIns="' + m * E + '" bIns="' + m * E + '" anchor="' + (o.anchor || 't') + '"><a:noAutofit/></a:bodyPr><a:lstStyle/>' + corps + '</p:txBody></p:sp>');
    },
    texte(x, y, w, h, r, o) { this.forme(x, y, w, h, Object.assign({ p: [{ r: Array.isArray(r) ? r : [r], a: (o || {}).a }] }, o || {})); },
    // Image de la diapositive : rId2 = logo Zieli, rId3 = logo du client.
    image(x, y, w, h, rId, nom) {
      const n = id++;
      formes.push('<p:pic><p:nvPicPr><p:cNvPr id="' + n + '" name="' + nom + '" descr="' + nom + '"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="' + rId + '"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="' + Math.round(x * E) + '" y="' + Math.round(y * E) + '"/><a:ext cx="' + Math.round(w * E) + '" cy="' + Math.round(h * E) + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>');
    },
    // Logo Zieli, en bas à droite.
    logo() { const h = 56, w = h * LOGO_RATIO; this.image(1792 - w, 1006, w, h, 'rId2', 'Logo Zieli'); },
    ligne(x1, y1, x2, y2, c, l, tirets, opacite) {
      const n = id++;
      const inv = (x2 - x1) * (y2 - y1) < 0 ? ' flipV="1"' : '';
      const a = opacite ? '<a:alpha val="' + opacite + '"/>' : '';
      formes.push('<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="' + n + '" name="Ligne ' + n + '"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr><p:spPr><a:xfrm' + inv + '><a:off x="' + Math.round(Math.min(x1, x2) * E) + '" y="' + Math.round(Math.min(y1, y2) * E) + '"/><a:ext cx="' + Math.round(Math.abs(x2 - x1) * E) + '" cy="' + Math.round(Math.abs(y2 - y1) * E) + '"/></a:xfrm><a:prstGeom prst="line"><a:avLst/></a:prstGeom><a:ln w="' + Math.round(l * E) + '" cap="rnd"><a:solidFill><a:srgbClr val="' + c + '">' + a + '</a:srgbClr></a:solidFill>' + (tirets ? '<a:prstDash val="dash"/>' : '') + '</a:ln></p:spPr></p:cxnSp>');
    },
    xml() {
      return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="' + fond + '"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>' + formes.join('') + '</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>';
    },
  };
}

function pasArrondi(ecart) {
  const brut = ecart / 4, p = Math.pow(10, Math.floor(Math.log10(brut || 1)));
  const k = brut / p;
  return (k <= 1 ? 1 : k <= 2 ? 2 : k <= 5 ? 5 : 10) * p;
}

// En-tête commun : logo du client (s'il existe), nom de l'entreprise, titre de la diapositive,
// et le mois concerné bien visible dans une pastille pétrole, en haut à droite.
function entete(s, d, titre) {
  let xT = 128;
  if (d.logoClient) {
    const cote = 96, r = d.logoClient.ratio;
    const w = r >= 1 ? cote : cote * r, h = r >= 1 ? cote / r : cote;
    s.image(128 + (cote - w) / 2, 36 + (cote - h) / 2, w, h, 'rId3', 'Logo ' + d.nom);
    xT = 128 + cote + 28;
  }
  const largeur = 1792 - 340 - xT;
  s.texte(xT, 32, largeur, 40, { t: d.nom + ' · Point de trésorerie', sz: 28, c: DOUX });
  s.texte(xT, 70, largeur, 70, { t: titre, sz: 48, b: 1, c: PETROLE, f: SERIF });
  const mois = nomMois(M);
  s.forme(1792 - 310, 50, 310, 76, { fill: PETROLE, rad: 38, anchor: 'ctr', ombre: 1, p: [{ a: 'ctr', r: [{ t: mois.charAt(0).toUpperCase() + mois.slice(1), sz: 36, b: 1, c: BLANC }] }] });
}

function slideGraphique(d) {
  const s = Page(FOND);
  entete(s, d, d.titre);
  s.forme(128, 188, 8, 92, { fill: d.alerte ? ROUGE : PETROLE });
  s.forme(136, 188, 1656, 92, { fill: d.alerte ? ROUGE_F : 'E8EEF6', m: 20, anchor: 'ctr', p: [{ r: d.message }] });

  const pts = d.fenetre, vals = pts.map((p) => p.solde).concat([d.seuil, 0]);
  const pas = pasArrondi(Math.max.apply(null, vals) - Math.min.apply(null, vals));
  const bas = Math.floor(Math.min.apply(null, vals) / pas) * pas, haut = Math.ceil(Math.max.apply(null, vals) / pas) * pas;
  const xG = 250, xD = 1768, yH = 340, yB = 960;
  const X = (i) => xG + (pts.length > 1 ? i * (xD - xG) / (pts.length - 1) : 0);
  const Y = (v) => yB - (v - bas) * (yB - yH) / ((haut - bas) || 1);

  for (let v = bas; v <= haut + 0.5; v += pas) {
    s.ligne(xG, Y(v), xD, Y(v), v === 0 ? 'A8A299' : FILET, 2);
    s.texte(100, Y(v) - 16, 136, 32, { t: eur(v), sz: 24, c: DOUX }, { a: 'r', anchor: 'ctr' });
  }
  s.ligne(xG, Y(d.seuil), xD, Y(d.seuil), ROUGE, 2.5, false, 55000);
  s.texte(xD - 400, Y(d.seuil) - 40, 400, 34, { t: "Seuil d'alerte " + eur(d.seuil), sz: 24, c: ROUGE_T }, { a: 'r', anchor: 'b' });
  pts.forEach((p, i) => {
    s.texte(X(i) - 60, 972, 120, 34, { t: MOIS_COURTS[Number(p.mois.slice(5, 7)) - 1], sz: 24, c: p.mois === M || p.mois === d.pointBas.mois ? TEXTE : DOUX, b: p.mois === M || p.mois === d.pointBas.mois }, { a: 'ctr' });
    if (i === 0) return;
    const reel = p.mois <= M;
    s.ligne(X(i - 1), Y(pts[i - 1].solde), X(i), Y(p.solde), reel ? PETROLE : PREVU, reel ? 5 : 4, !reel);
  });
  pts.forEach((p, i) => {
    const special = p.mois === M || p.mois === d.pointBas.mois;
    const r = special ? 11 : 8;
    if (p.mois <= M || p.mois === d.pointBas.mois) s.forme(X(i) - r, Y(p.solde) - r, 2 * r, 2 * r, { geo: 'ellipse', fill: p.mois === d.pointBas.mois && d.pointBas.solde < d.seuil ? ROUGE : PETROLE, line: FOND, lw: 2 });
    if (special) s.texte(X(i) - 110, p.mois === d.pointBas.mois ? Y(p.solde) + 14 : Y(p.solde) - 50, 220, 36, { t: eur(p.solde), sz: 28, b: 1 }, { a: 'ctr' });
  });
  s.ligne(1400, 312, 1450, 312, PETROLE, 5); s.texte(1460, 294, 90, 36, { t: 'Réel', sz: 24 }, { anchor: 'ctr' });
  s.ligne(1560, 312, 1620, 312, PREVU, 4, true); s.texte(1630, 294, 110, 36, { t: 'Prévu', sz: 24 }, { anchor: 'ctr' });
  s.texte(128, 1020, 1400, 34, { t: 'Vos chiffres décodés, vos tâches allégées.', sz: 24, c: DOUX });
  s.logo();
  return s;
}

// ---------- Diapositive 2 : détail du mois, comme le tableau du site ----------
// Colonnes : Réel | % (part du réel dans le total du bloc) | Prévu | Écart, avec les commentaires à côté.
const PREVU_TAB = '1D4F91', FOND_DEC = 'FDE9D3';
const COLS = [[152, 330, 'l'], [486, 150, 'r'], [648, 110, 'r'], [770, 150, 'r'], [928, 236, 'r']];

function blocDetail(s, y, rang, bloc, sens, cT, cFondTitre, cFondExpl, texteExpl) {
  const hTitre = rang + 10, h = hTitre + rang * bloc.lignes.length + 12;
  s.forme(128, y, 1052, h, { fill: BLANC, rad: 16, ombre: 1 });
  // Ligne de titre du bloc (fond coloré, comme sur le site) avec les totaux.
  s.forme(128, y, 1052, hTitre, { fill: cFondTitre, rad: 16 });
  s.forme(128, y + hTitre - 16, 1052, 16, { fill: cFondTitre });
  const cellule = (i, ligneY, hL, t, o) => s.texte(COLS[i][0], ligneY, COLS[i][1], hL, Object.assign({ t: t, sz: 28 }, o), { a: COLS[i][2], anchor: 'ctr' });
  const couleurEcart = (e) => (e === 0 ? DOUX : sens * e > 0 ? VERT_T : ROUGE_T);
  const tot = bloc.total;
  cellule(0, y, hTitre, bloc.titre, { b: 1, c: cT, sz: 30 });
  cellule(1, y, hTitre, eur(tot.r), { b: 1 });
  cellule(3, y, hTitre, eur(tot.p), { b: 1, i: 1, c: PREVU_TAB });
  cellule(4, y, hTitre, tot.ecart, { b: 1, c: couleurEcart(tot.e) });
  bloc.lignes.forEach((l, i) => {
    const yL = y + hTitre + 6 + i * rang;
    if (i > 0) s.ligne(152, yL, 1156, yL, FILET, 1.5);
    cellule(0, yL, rang, l.nom, { b: l.notable });
    cellule(1, yL, rang, eur(l.r), { b: l.notable });
    cellule(2, yL, rang, l.pct, { i: 1, c: PETROLE, sz: 24 });
    cellule(3, yL, rang, eur(l.p), { i: 1, c: PREVU_TAB });
    cellule(4, yL, rang, l.ecart, { b: l.notable, c: couleurEcart(l.e), sz: 25 });
  });
  // Bloc commentaires, à côté, même hauteur.
  const tailleP = 26;
  const maxLignes = Math.max(1, Math.floor((h - 80) / (tailleP * 1.25)));
  const maxCar = maxLignes * Math.floor(540 / (tailleP * 0.5));
  const t = texteExpl.length > maxCar ? texteExpl.slice(0, maxCar - 1) + '…' : texteExpl;
  s.forme(1204, y, 588, h, { fill: cFondExpl, rad: 16, m: 20, ombre: 1, p: [{ r: [{ t: 'Explications des écarts / commentaires', sz: tailleP, b: 1, c: cT }] }, { r: [{ t: t || 'Aucun commentaire pour ce mois.', sz: tailleP, i: !t, c: t ? TEXTE : DOUX }] }] });
  return h;
}

function slideDetail(d) {
  const s = Page(FOND);
  const n = d.blocEnc.lignes.concat(d.blocDec.lignes).filter((l) => l.notable).length;
  entete(s, d, n === 0 ? "Aucun écart d'au moins 5 % ce mois-ci" : n + (n > 1 ? " écarts d'au moins 5 % ce mois-ci" : " écart d'au moins 5 % ce mois-ci"));
  // En-têtes de colonnes (une seule fois, au-dessus des deux blocs).
  const yC = 156;
  [['Réel', TEXTE, 0], ['% du réel', PETROLE, 1], ['Prévu', PREVU_TAB, 1], ['Écart', TEXTE, 0]].forEach(([t, c, it], k) => s.texte(COLS[k + 1][0], yC, COLS[k + 1][1], 34, { t: t, sz: 22, b: 1, c: c, i: it }, { a: 'r', anchor: 'ctr' }));
  const nbLignes = d.blocEnc.lignes.length + d.blocDec.lignes.length;
  const rang = Math.max(36, Math.min(60, Math.floor((990 - 200 - 28 - 2 * 22) / (nbLignes + 2))));
  const h1 = blocDetail(s, 200, rang, d.blocEnc, 1, VERT_T, VERT_F, VERT_F, d.explEnc);
  blocDetail(s, 200 + h1 + 28, rang, d.blocDec, -1, ORANGE_T, FOND_DEC, ORANGE_F, d.explDep);
  s.texte(128, 1020, 1400, 34, { t: d.nom + ' · ' + nomMois(M), sz: 24, c: DOUX });
  s.logo();
  return s;
}

function carte(s, x, y, w, h, fill, line, titre, cT, gros, tailleG, cG, phrase, cP, tailleT) {
  s.forme(x, y, w, h, { fill: fill, line: line === ROUGE ? ROUGE : null, lw: 2, rad: 16, ombre: 1 });
  s.texte(x + 40, y + 28, w - 80, 44, { t: titre, sz: tailleT || 32, b: 1, c: cT });
  s.texte(x + 40, y + 78, w - 80, tailleG * 1.3, { t: gros, sz: tailleG, b: 1, c: cG, f: SERIF });
  s.texte(x + 40, y + 88 + tailleG * 1.3, w - 80, h - 110 - tailleG * 1.3, { t: phrase, sz: 28, c: cP });
}

function slideReperes(d) {
  const s = Page(FOND);
  entete(s, d, 'Vos repères du mois');
  const y1 = 168, h1 = 396, y2 = 592, h2 = 396;
  s.forme(128, y1, 1090, h1, { fill: PETROLE, rad: 16, ombre: 1 });
  s.texte(172, y1 + 28, 1000, 44, [{ t: 'Point mort quotidien ', sz: 32, b: 1, c: FOND }, { t: '(estimation)', sz: 32, b: 1, c: CLAIR }]);
  s.texte(172, y1 + 84, 1000, 120, [{ t: eur(d.pointMort), sz: 96, b: 1, c: FOND, f: SERIF }, { t: "  par jour d'ouverture", sz: 32, c: FOND }]);
  s.texte(172, y1 + 212, 1000, 40, { t: eur(d.depenses) + ' de décaissements en ' + moisSeul(M) + ' / ' + d.jours + " jours d'ouverture", sz: 28, c: FOND });
  const ok = d.encaissJour >= d.pointMort;
  s.forme(172, y1 + 270, 1002, 104, { fill: ok ? VERT_F : ORANGE_F, rad: 12, m: 18, anchor: 'ctr', p: [{ r: [{ t: (ok ? 'Objectif dépassé : ' : 'Objectif non atteint : ') + eur(d.encaissJour) + ' encaissés par jour, soit ' + eur(Math.abs(d.resultat)) + (ok ? ' de plus' : ' de moins') + ' sur le mois', sz: 32, b: 1, c: ok ? VERT_T : ORANGE_T }] }] });
  carte(s, 1242, y1, 550, h1, BLANC, FILET, 'Autonomie', PETROLE, d.autonomie === null ? '—' : d.autonomie + ' jours', 96, TEXTE, 'de décaissements couverts par votre trésorerie disponible.', TEXTE);
  s.forme(128, y2, 640, h2, { fill: BLANC, rad: 16, ombre: 1 });
  s.texte(168, y2 + 28, 570, 88, { t: 'Grosses échéances ' + deMois(decaler(M, 1)), sz: 32, b: 1, c: PETROLE });
  d.echeances.forEach((e, i) => {
    const yE = y2 + 136 + i * 72;
    s.texte(168, yE, 390, 44, { t: e.nom, sz: 26 }, { anchor: 'ctr' });
    s.texte(558, yE, 180, 44, { t: eur(e.v), sz: 26, b: 1 }, { a: 'r', anchor: 'ctr' });
  });
  const manque = d.pointBas.solde < d.seuil;
  carte(s, 792, y2, 490, h2, manque ? ROUGE_F : BLANC, manque ? ROUGE : FILET, 'Montant à trouver', manque ? ROUGE_T : PETROLE, manque ? eur(d.seuil - d.pointBas.solde) : '0 €', 72, TEXTE, manque ? 'manquants fin ' + moisSeul(d.pointBas.mois) + " pour repasser au-dessus de votre seuil d'alerte." : "Votre compte courant reste au-dessus de votre seuil d'alerte.", TEXTE);
  const delta = d.cumulR - d.cumulP;
  carte(s, 1306, y2, 486, h2, BLANC, FILET, 'Encaissements depuis ' + moisSeul(d.cumulDebut), PETROLE, eur(d.cumulR), 60, TEXTE, 'pour ' + eur(d.cumulP) + ' prévus, soit ' + (delta >= 0 ? '+' : '') + eur(delta) + '.', TEXTE, 28);
  s.texte(128, 1020, 1400, 34, { t: d.nom + ' · Point mort estimé TVA comprise', sz: 24, c: DOUX });
  s.logo();
  return s;
}

// ---------- Assemblage du fichier .pptx (une archive ZIP, sans bibliotheque externe) ----------
function octets(texte) {
  const bin = unescape(encodeURIComponent(texte)), a = new Array(bin.length);
  for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
const TABLE_CRC = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(a) { let c = 0xFFFFFFFF; for (let i = 0; i < a.length; i++) c = TABLE_CRC[(c ^ a[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
const u16 = (n) => [n & 255, (n >>> 8) & 255];
const u32 = (n) => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
function zip(fichiers) {
  const sortie = [], central = [];
  const ajouter = (dest, a) => { for (let i = 0; i < a.length; i++) dest.push(a[i]); };
  fichiers.forEach(([nom, contenu]) => {
    // contenu : du texte (XML) ou directement des octets (image du logo).
    const n = octets(nom), c = Array.isArray(contenu) ? contenu : octets(contenu), crc = crc32(c), debut = sortie.length;
    const commun = [].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x5A21), u32(crc), u32(c.length), u32(c.length), u16(n.length), u16(0));
    ajouter(sortie, [0x50, 0x4B, 3, 4]); ajouter(sortie, commun); ajouter(sortie, n); ajouter(sortie, c);
    ajouter(central, [0x50, 0x4B, 1, 2]); ajouter(central, u16(20)); ajouter(central, commun); ajouter(central, u16(0)); ajouter(central, u16(0)); ajouter(central, u16(0)); ajouter(central, u32(0)); ajouter(central, u32(debut)); ajouter(central, n);
  });
  const pos = sortie.length;
  ajouter(sortie, central);
  ajouter(sortie, [0x50, 0x4B, 5, 6]); ajouter(sortie, u16(0)); ajouter(sortie, u16(0)); ajouter(sortie, u16(fichiers.length)); ajouter(sortie, u16(fichiers.length)); ajouter(sortie, u32(central.length)); ajouter(sortie, u32(pos)); ajouter(sortie, u16(0));
  return sortie;
}

const ENTETE = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const NS = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const relations = (l) => ENTETE + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + l.map(([id, type, cible]) => '<Relationship Id="' + id + '" Type="' + REL + '/' + type + '" Target="' + cible + '"/>').join('') + '</Relationships>';
const ARBRE_VIDE = '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree>';
const lignesFmt = '<a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>';
const THEME = ENTETE + '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Zieli"><a:themeElements><a:clrScheme name="Zieli"><a:dk1><a:srgbClr val="1D2433"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="0E4A5C"/></a:dk2><a:lt2><a:srgbClr val="FAF8F4"/></a:lt2><a:accent1><a:srgbClr val="0E4A5C"/></a:accent1><a:accent2><a:srgbClr val="1E8E5A"/></a:accent2><a:accent3><a:srgbClr val="C46A00"/></a:accent3><a:accent4><a:srgbClr val="C0392B"/></a:accent4><a:accent5><a:srgbClr val="3F8FA3"/></a:accent5><a:accent6><a:srgbClr val="6B665E"/></a:accent6><a:hlink><a:srgbClr val="0E4A5C"/></a:hlink><a:folHlink><a:srgbClr val="6B665E"/></a:folHlink></a:clrScheme><a:fontScheme name="Zieli"><a:majorFont><a:latin typeface="Calibri" pitchFamily="34" charset="0"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Calibri" pitchFamily="34" charset="0"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Zieli"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst>' + lignesFmt + lignesFmt + lignesFmt + '</a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>';

function pptx(slides, logoClient) {
  const n = slides.length;
  const f = [];
  f.push(['[Content_Types].xml', ENTETE + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>' + slides.map((_, i) => '<Override PartName="/ppt/slides/slide' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>').join('') + '</Types>']);
  f.push(['_rels/.rels', relations([['rId1', 'officeDocument', 'ppt/presentation.xml']])]);
  f.push(['ppt/presentation.xml', ENTETE + '<p:presentation ' + NS + '><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>' + slides.map((_, i) => '<p:sldId id="' + (256 + i) + '" r:id="rId' + (i + 2) + '"/>').join('') + '</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>']);
  f.push(['ppt/_rels/presentation.xml.rels', relations([['rId1', 'slideMaster', 'slideMasters/slideMaster1.xml']].concat(slides.map((_, i) => ['rId' + (i + 2), 'slide', 'slides/slide' + (i + 1) + '.xml']), [['rId' + (n + 2), 'theme', 'theme/theme1.xml']]))]);
  f.push(['ppt/slideMasters/slideMaster1.xml', ENTETE + '<p:sldMaster ' + NS + '><p:cSld>' + ARBRE_VIDE + '</p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>']);
  f.push(['ppt/slideMasters/_rels/slideMaster1.xml.rels', relations([['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml'], ['rId2', 'theme', '../theme/theme1.xml']])]);
  f.push(['ppt/slideLayouts/slideLayout1.xml', ENTETE + '<p:sldLayout ' + NS + ' type="blank" preserve="1"><p:cSld name="Vide">' + ARBRE_VIDE + '</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>']);
  f.push(['ppt/slideLayouts/_rels/slideLayout1.xml.rels', relations([['rId1', 'slideMaster', '../slideMasters/slideMaster1.xml']])]);
  f.push(['ppt/theme/theme1.xml', THEME]);
  f.push(['ppt/media/logo-zieli.png', LOGO_OCTETS]);
  const images = [['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml'], ['rId2', 'image', '../media/logo-zieli.png']];
  if (logoClient) {
    f.push(['ppt/media/logo-client.' + logoClient.ext, logoClient.octets]);
    images.push(['rId3', 'image', '../media/logo-client.' + logoClient.ext]);
  }
  slides.forEach((s, i) => {
    f.push(['ppt/slides/slide' + (i + 1) + '.xml', s.xml()]);
    f.push(['ppt/slides/_rels/slide' + (i + 1) + '.xml.rels', relations(images)]);
  });
  return zip(f);
}

// ---------- Logo du client (champ « Logo » de la table Entreprises) ----------
// Téléchargé depuis Airtable. PowerPoint accepte le PNG et le JPG : pour un autre format (SVG…),
// on prend la vignette PNG fournie par Airtable si elle existe. Sans logo : en-tête sans logo.
const HTTP = this.helpers;
async function lireLogoClient(pieces) {
  const p = Array.isArray(pieces) ? pieces[0] : null;
  if (!p) return null;
  const url = /^image\/(png|jpeg)$/.test(p.type || '') ? p.url : (p.thumbnails && p.thumbnails.large ? p.thumbnails.large.url : null);
  if (!url) return null;
  try {
    const o = Array.from(Buffer.from(await HTTP.httpRequest({ method: 'GET', url: url, encoding: 'arraybuffer', json: false })));
    if (o[0] === 0x89 && o[1] === 0x50) {
      const l = (k) => o[k] * 16777216 + o[k + 1] * 65536 + o[k + 2] * 256 + o[k + 3];
      return { octets: o, ext: 'png', ratio: l(16) / l(20) };
    }
    if (o[0] === 0xFF && o[1] === 0xD8) {
      for (let k = 2; k + 9 < o.length;) {
        if (o[k] !== 0xFF) { k++; continue; }
        const m = o[k + 1];
        if (m >= 0xC0 && m <= 0xC3) return { octets: o, ext: 'jpeg', ratio: (o[k + 7] * 256 + o[k + 8]) / (o[k + 5] * 256 + o[k + 6]) };
        k += 2 + o[k + 2] * 256 + o[k + 3];
      }
      return { octets: o, ext: 'jpeg', ratio: 1 };
    }
  } catch (err) { /* logo indisponible : on continue sans */ }
  return null;
}

// ---------- Calculs par entreprise ----------
const categories = lire('Lire categories').slice().sort((a, b) => (a.Ordre || 0) - (b.Ordre || 0));
const totalR = {}, totalP = {}, activite = {};
function cumuler(table, lignes, champ) {
  for (const l of lignes) {
    const e = l.Entreprise || [], c = l['Catégories'] || [];
    if (e.length !== 1 || c.length !== 1 || !l.Mois || typeof l[champ] !== 'number') continue;
    const k = e[0] + '|' + c[0] + '|' + l.Mois;
    table[k] = (table[k] || 0) + l[champ];
    if (table === totalR) activite[e[0] + '|' + l.Mois] = true;
  }
}
cumuler(totalR, lire('Lire transactions'), 'Montant');
cumuler(totalP, lire('Lire previsionnel'), 'Montants prévus');
const commentaires = lire('Lire commentaires');
const resultats = [];

for (const e of lire('Lire entreprises')) {
  const email = String(e['email resp légal'] || '').trim();
  const dateSolde = e['Date du solde initial'];
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || /\.example$/i.test(email) || !dateSolde || !activite[e.id + '|' + M]) continue;

  const debut = decaler(dateSolde.slice(0, 7), 1), fin = decaler(M, 7);
  const seuil = typeof e["Seuil d'alerte"] === 'number' ? e["Seuil d'alerte"] : 5000;
  const nom = e.Name || 'Entreprise';
  const R = (c, m) => totalR[e.id + '|' + c + '|' + m] || 0;
  const P = (c, m) => totalP[e.id + '|' + c + '|' + m] || 0;
  const montant = (c, m) => (m <= M ? R(c, m) : P(c, m));
  const estEnc = (c) => c.Partie === 'Activité', estEp = (c) => c.Partie === 'Épargne', estDep = (c) => !estEnc(c) && !estEp(c);
  const somme = (filtre, f) => categories.filter(filtre).reduce((t, c) => t + f(c), 0);

  let courant = Number(e['Solde initial courant']) || 0, epargne = Number(e['Solde initial épargne']) || 0;
  const historique = [];
  for (let m = debut; m <= fin; m = decaler(m, 1)) {
    const flux = categories.reduce((t, c) => t + montant(c.id, m), 0);
    const mvt = somme(estEp, (c) => montant(c.id, m));
    courant += flux; epargne -= mvt;
    historique.push({ mois: m, solde: courant, epargne: epargne });
  }
  const actuel = historique.find((h) => h.mois === M);
  if (!actuel) continue;
  const fenetre = historique.filter((h) => h.mois >= decaler(M, -4));
  const avenir = historique.filter((h) => h.mois > M);
  const pointBas = avenir.reduce((b, h) => (h.solde < b.solde ? h : b), avenir[0]);
  const manque = seuil - pointBas.solde;

  let titre, message, alerte;
  const fort = (t) => ({ t: t, sz: 28, b: 1 }), norm = (t) => ({ t: t, sz: 28 });
  if (actuel.solde < seuil) {
    alerte = true; titre = 'Votre compte courant est sous votre seuil';
    message = [{ t: 'Attention : ', sz: 28, b: 1, c: ROUGE_T }, norm('fin ' + nomMois(M) + ', votre compte courant était à '), fort(eur(actuel.solde)), norm(', soit '), fort(eur(seuil - actuel.solde)), norm(' sous votre seuil de sécurité.')];
  } else if (pointBas.solde < seuil) {
    alerte = true; titre = 'Un creux sous votre seuil est prévu fin ' + moisSeul(pointBas.mois);
    message = [{ t: 'Attention : ', sz: 28, b: 1, c: ROUGE_T }, norm('fin ' + nomMois(pointBas.mois) + ', votre compte courant descendrait à '), fort(eur(pointBas.solde)), norm(', soit '), fort(eur(manque)), norm(' sous votre seuil de sécurité.')];
  } else {
    alerte = false; titre = 'Votre trésorerie reste au-dessus de votre seuil';
    message = [norm('Point bas à venir : '), fort(eur(pointBas.solde)), norm(' fin ' + nomMois(pointBas.mois) + ', pour un seuil de sécurité de ' + eur(seuil) + '.')];
  }

  // Une ligne du tableau : réel, prévu (en valeur absolue), écart et part du réel dans le total du bloc.
  const ecartTexte = (r, p) => {
    const e = r - p, sg = e > 0 ? '+' : e < 0 ? '−' : '';
    return e === 0 ? '0 €' : sg + eur(Math.abs(e)) + (p ? ' (' + sg + (Math.abs(e) / p * 100).toFixed(1).replace('.', ',') + ' %)' : ' (non prévu)');
  };
  // Nom court : sans la précision entre parenthèses, et 32 caractères au plus.
  const nomCourt = (t) => { const n = String(t || '').replace(/\s*\(.*\)\s*$/, '').trim(); return n.length > 32 ? n.slice(0, 31) + '…' : n; };
  const ligneDe = (nom, r, p, totalR) => ({
    nom: nomCourt(nom), r, p, e: r - p, ecart: ecartTexte(r, p),
    pct: totalR ? Math.round(r / totalR * 100) + ' %' : '',
    notable: p ? Math.abs(r - p) * 100 >= 5 * p : r !== 0,
  });
  const visible = (c) => R(c.id, M) !== 0 || P(c.id, M) !== 0;
  // Encaissements : une ligne par catégorie. Décaissements : une ligne par partie (comme sur le site).
  const catsEnc = categories.filter((c) => estEnc(c) && visible(c));
  const totEncR = Math.abs(catsEnc.reduce((t, c) => t + R(c.id, M), 0)), totEncP = Math.abs(catsEnc.reduce((t, c) => t + P(c.id, M), 0));
  const lignesEnc = catsEnc.map((c) => ligneDe(c.Ligne, Math.abs(R(c.id, M)), Math.abs(P(c.id, M)), totEncR));
  const parties = [];
  categories.filter((c) => estDep(c) && visible(c)).forEach((c) => { if (parties.indexOf(c.Partie) < 0) parties.push(c.Partie); });
  const sommePartie = (pa, f) => Math.abs(categories.filter((c) => estDep(c) && c.Partie === pa).reduce((t, c) => t + f(c.id, M), 0));
  const totDecR = parties.reduce((t, pa) => t + sommePartie(pa, R), 0), totDecP = parties.reduce((t, pa) => t + sommePartie(pa, P), 0);
  const lignesDep = parties.map((pa) => ligneDe(pa, sommePartie(pa, R), sommePartie(pa, P), totDecR));
  const blocEnc = { titre: 'Encaissements', lignes: lignesEnc, total: { r: totEncR, p: totEncP, e: totEncR - totEncP, ecart: ecartTexte(totEncR, totEncP) } };
  const blocDec = { titre: 'Décaissements', lignes: lignesDep, total: { r: totDecR, p: totDecP, e: totDecR - totDecP, ecart: ecartTexte(totDecR, totDecP) } };
  const logoClient = await lireLogoClient(e.Logo);

  const expl = commentaires.filter((c) => (c.Entreprise || []).indexOf(e.id) >= 0 && c['Type de commentaire'] === 'Explication des écarts' && c['Mois concerné'] === M && c['Texte libre']);
  const textes = (b) => expl.filter((c) => !c['Bloc concerné'] || c['Bloc concerné'] === b).map((c) => String(c['Texte libre']).trim()).join(' / ');

  const encaiss = somme(estEnc, (c) => R(c.id, M));
  const depenses = -somme(estDep, (c) => R(c.id, M));
  const jours = joursOuverture(M);
  const derniers = historique.filter((h) => h.mois <= M).slice(-5).map((h) => -somme(estDep, (c) => R(c.id, h.mois)));
  const moyenne = derniers.reduce((a, b) => a + b, 0) / derniers.length;
  const debutCumul = M.slice(0, 4) + '-01' < debut ? debut : M.slice(0, 4) + '-01';
  let cumulR = 0, cumulP = 0;
  for (let m = debutCumul; m <= M; m = decaler(m, 1)) { cumulR += somme(estEnc, (c) => R(c.id, m)); cumulP += somme(estEnc, (c) => P(c.id, m)); }
  const echeances = categories.filter(estDep).map((c) => ({ nom: String(c.Ligne || '').trim(), v: -P(c.id, decaler(M, 1)) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v).slice(0, 3);

  const d = {
    nom, seuil, titre, message, alerte, fenetre, pointBas, blocEnc, blocDec, logoClient, explEnc: textes('Encaissements'), explDep: textes('Dépenses'),
    pointMort: depenses / jours, depenses, jours, encaissJour: encaiss / jours, resultat: encaiss - depenses,
    autonomie: moyenne > 0 ? Math.floor((actuel.solde + actuel.epargne) / moyenne * 30) : null, echeances, cumulR, cumulP, cumulDebut: debutCumul,
  };
  const octetsPptx = pptx([slideGraphique(d), slideDetail(d), slideReperes(d)], logoClient);
  const nomFichier = 'Zieli_Point_tresorerie_' + M + '.pptx';
  resultats.push({
    json: {
      email, entreprise: nom, mois: M, sujet: 'Votre point de trésorerie ' + deMois(M) + ' ' + M.slice(0, 4),
      html: '<div style="max-width:560px;margin:0 auto;padding:24px;font-family:Arial,sans-serif;font-size:15px;line-height:23px;color:#1d2433;"><p>Bonjour,</p><p>Vous trouverez ci-joint le point de trésorerie de ' + xml(nom) + ' pour ' + nomMois(M) + '.</p><p>Elise</p></div>',
      controle: { titre, solde: Math.round(actuel.solde), pointBas: Math.round(pointBas.solde), pointBasMois: pointBas.mois, pointMort: Math.round(d.pointMort), encaissJour: Math.round(d.encaissJour), jours, autonomie: d.autonomie, echeances, cumulR, cumulP, cumulDebut: debutCumul, nbNotables: lignesEnc.concat(lignesDep).filter((l) => l.notable).length },
    },
    binary: { pptx: { data: Buffer.from(octetsPptx).toString('base64'), mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', fileName: nomFichier } },
  });
}

return resultats;
