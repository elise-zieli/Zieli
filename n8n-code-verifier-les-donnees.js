// Controle mensuel : pour chaque entreprise, le reel du mois termine est-il saisi,
// et le previsionnel couvre-t-il les 6 prochains mois ?
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

const parties = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit' }).formatToParts(new Date());
const annee = Number(parties.find((p) => p.type === 'year').value);
const mois = Number(parties.find((p) => p.type === 'month').value);

const cleMois = (decalage) => new Date(Date.UTC(annee, mois - 1 + decalage, 1)).toISOString().slice(0, 7);
const nomMois = (cle) => MOIS[Number(cle.slice(5, 7)) - 1] + ' ' + cle.slice(0, 4);
const deMois = (cle) => (/^[aeiouy]/.test(nomMois(cle)) ? "d'" : 'de ') + nomMois(cle); // « d'octobre », « de novembre »
const dateFr = (d) => d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4);
const echapper = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function plusRecentParEntreprise(noeud, champ) {
  const resultat = {};
  for (const ligne of $(noeud).all()) {
    const date = ligne.json[champ];
    for (const id of ligne.json.Entreprise || []) {
      if (date && (!resultat[id] || date > resultat[id])) resultat[id] = date;
    }
  }
  return resultat;
}

const moisTermine = cleMois(-1);
const horizon = cleMois(6);
const derniereTransaction = plusRecentParEntreprise('Lire transactions', 'Date comptable');
const dernierPrevu = plusRecentParEntreprise('Lire previsionnel', 'Date');

let nbActions = 0;
let blocs = '';

for (const entreprise of $('Lire entreprises').all()) {
  const id = entreprise.json.id;
  const nom = entreprise.json.Name || 'Entreprise sans nom';
  const actions = [];

  const transaction = derniereTransaction[id];
  if (!transaction) {
    actions.push('Réel ' + deMois(moisTermine) + ' à saisir (aucune transaction enregistrée)');
  } else if (transaction.slice(0, 7) < moisTermine) {
    actions.push('Réel ' + deMois(moisTermine) + ' à saisir (dernière transaction : ' + dateFr(transaction) + ')');
  }

  const prevu = dernierPrevu[id];
  if (!prevu) {
    actions.push('Prévisionnel à créer jusqu\'à ' + nomMois(horizon));
  } else if (prevu.slice(0, 7) < horizon) {
    actions.push('Prévisionnel à compléter jusqu\'à ' + nomMois(horizon) + ' (actuellement jusqu\'à ' + nomMois(prevu.slice(0, 7)) + ')');
  }

  if (actions.length > 0) {
    nbActions += actions.length;
    blocs += '<h2 style="margin:24px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:18px;color:#0e4a5c;">' + echapper(nom) + '</h2>'
      + '<ul style="margin:0;padding-left:20px;font-family:Arial,sans-serif;font-size:15px;line-height:23px;color:#1d2433;">'
      + actions.map((a) => '<li>' + echapper(a) + '</li>').join('')
      + '</ul>';
  }
}

// Charte Zieli (12/11) : bandeau « zieli » bleu pétrole, police sans empattement.
const texte = 'font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#1d2433;';
const sujet = nbActions === 0
  ? 'Zieli : tout est à jour ce mois-ci'
  : 'Zieli : ' + nbActions + (nbActions > 1 ? ' actions' : ' action') + ' à faire ce mois-ci';
const contenu = nbActions === 0
  ? '<p style="margin:16px 0 0;' + texte + '">Toutes les données sont à jour : le réel ' + deMois(moisTermine) + ' est saisi et le prévisionnel couvre les 6 prochains mois pour chaque entreprise.</p>'
  : blocs;
const html = '<div style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #e7e2d9;border-radius:14px;">'
  + '<div style="background-color:#0e4a5c;padding:16px 24px;border-radius:13px 13px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">zieli</div>'
  + '<div style="padding:24px;">'
  + '<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:#0e4a5c;">Contrôle mensuel des données</p>'
  + '<p style="margin:12px 0 0;' + texte + '">Le récapitulatif mensuel partira à vos clients <strong>aujourd\'hui à 12 h</strong>' + (nbActions === 0 ? '.' : ' : pensez à faire ces mises à jour avant.') + '</p>'
  + contenu
  + '</div></div>'
  + '<p style="max-width:560px;margin:16px auto 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b665e;">Zieli - Suivi de trésorerie</p>';

return [{ json: { nbActions, sujet, html } }];
