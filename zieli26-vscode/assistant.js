// =====================================================================
// ZIELI – assistant.js
// L'ASSISTANT « Une question ? » (bouton rond en bas à droite du tableau de bord).
//
// Le chemin d'une question :
//   navigateur → serveur (serveur.ps1, ou fonction Netlify « assistant »)
//             → workflow n8n « Zieli - assistant »
//             → n8n cherche les passages les plus proches dans Airtable
//               (table « Assistant - Connaissances ») et demande la réponse à OpenAI
//             → la réponse revient ici, avec ses sources.
// Les clés (n8n, OpenAI) ne passent jamais par le navigateur.
// L'assistant ne voit PAS les chiffres de l'entreprise (choix du 13/11).
// =====================================================================
(function () {
// Personne de connecté : pas d'assistant.
if (typeof UTILISATEUR === "undefined" || !UTILISATEUR) return;

const bouton = document.getElementById("assistant-bouton");
const fenetre = document.getElementById("assistant-fenetre");
const zoneMessages = document.getElementById("assistant-messages");
const formulaire = document.getElementById("assistant-saisie");
const champ = document.getElementById("assistant-question");
const boutonEnvoyer = document.getElementById("assistant-envoyer");

// Les échanges de la conversation (role « user » = le dirigeant, « assistant » = la réponse).
// Les derniers sont renvoyés à chaque question, pour comprendre « et pour l'épargne ? ».
const historique = [];

// Le serveur (local ou Netlify) n'est là que si le bouton « Synchronisation » est visible
// (même règle que pour le formulaire de remarques).
const serveurDisponible = () => !document.getElementById("bouton-synchro").hidden;

// Ajoute une bulle de message. textContent (et non innerHTML) : le texte reçu est affiché
// tel quel, il ne peut pas ajouter de code dans la page.
function ajouterMessage(texte, qui, sources = []) {
  const bulle = document.createElement("div");
  bulle.className = "assistant-message " + qui;
  bulle.textContent = texte;
  if (sources.length) {
    const liste = document.createElement("div");
    liste.className = "assistant-sources";
    liste.append("Sources : ");
    sources.forEach((s, i) => {
      if (i > 0) liste.append(" · ");
      // Lien seulement s'il pointe vers une adresse https (guides publics) ; sinon, le titre seul.
      if (typeof s.lien === "string" && s.lien.startsWith("https://")) {
        const a = document.createElement("a");
        a.href = s.lien;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = s.titre;
        liste.append(a);
      } else {
        liste.append(String(s.titre ?? ""));
      }
    });
    bulle.append(liste);
  }
  zoneMessages.append(bulle);
  zoneMessages.scrollTop = zoneMessages.scrollHeight;   // fait défiler jusqu'au dernier message
  return bulle;
}

// Ouvrir / fermer la fenêtre.
function ouvrir(ouverte) {
  fenetre.hidden = !ouverte;
  bouton.setAttribute("aria-expanded", String(ouverte));
  bouton.classList.toggle("ouvert", ouverte);
  if (ouverte) {
    if (!zoneMessages.children.length) {
      ajouterMessage("Bonjour ! Je peux vous expliquer votre tableau de bord et les mots de la trésorerie. "
        + "Par exemple : « C'est quoi le point bas ? » ou « Pourquoi le bandeau est rouge ? »", "assistant");
    }
    champ.focus();
  }
}
bouton.addEventListener("click", () => ouvrir(fenetre.hidden));
document.getElementById("assistant-fermer").addEventListener("click", () => { ouvrir(false); bouton.focus(); });
// Touche Échap : ferme la fenêtre.
fenetre.addEventListener("keydown", (e) => { if (e.key === "Escape") { ouvrir(false); bouton.focus(); } });

// Entrée = envoyer ; Maj + Entrée = aller à la ligne.
champ.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); formulaire.requestSubmit(); }
});

// Envoi d'une question.
formulaire.addEventListener("submit", async (evenement) => {
  evenement.preventDefault();
  const question = champ.value.trim();
  if (!question) return;

  ajouterMessage(question, "dirigeant");
  champ.value = "";

  if (!serveurDisponible()) {
    ajouterMessage("L'assistant fonctionne seulement sur le site en ligne (ou avec le serveur local).", "assistant erreur");
    return;
  }

  const attente = ajouterMessage("Je cherche…", "assistant attente");
  boutonEnvoyer.disabled = true;
  try {
    const reponse = await fetch("api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Zieli-Synchro": "1" },
      body: JSON.stringify({ question, entreprise: ENTREPRISE_ID, historique: historique.slice(-6) }),
    });
    if (!reponse.ok) throw new Error("échec");
    const resultat = await reponse.json();
    attente.remove();
    ajouterMessage(resultat.reponse, "assistant", resultat.sources || []);
    historique.push({ role: "user", content: question }, { role: "assistant", content: resultat.reponse });
  } catch (e) {
    attente.remove();
    ajouterMessage("Désolé, je n'arrive pas à répondre pour le moment. Réessayez dans un instant, "
      + "ou écrivez à Elise avec le bloc « Une remarque / une question ? ».", "assistant erreur");
  } finally {
    boutonEnvoyer.disabled = false;
    champ.focus();
  }
});
})();
