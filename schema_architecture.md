# Zieli – schéma d'architecture

*13/11/2026. Aperçu dans VS Code : Ctrl + Maj + V (extension « Markdown Preview Mermaid Support »). Pour zoomer et exporter en image : coller le bloc sur https://mermaid.live.*

## Qui parle à qui, et pourquoi

*Même contenu et mêmes couleurs que la diapositive 11 : bleu pétrole = ce qui part du site ; doré = ce que fait n8n ; bleu clair = la mise en ligne.*

```mermaid
flowchart LR
    SITE("Site Zieli")
    SRV("Serveur")
    AT("Airtable")
    N8N("n8n")
    OAI("OpenAI")
    GM("Gmail")
    GH("GitHub")
    NET("Netlify")

    SITE -- "garder les clés cachées" --> SRV
    SRV -- "afficher les chiffres à jour" --> AT
    SRV -- "transmettre remarques et questions" --> N8N
    N8N -- "noter les remarques, lire chiffres et passages" --> AT
    N8N -- "répondre aux questions" --> OAI
    N8N -- "envoyer alertes, copies et récapitulatif" --> GM
    GH -- "mettre en ligne" --> NET
    NET -. "héberge" .-> SRV

    classDef site fill:#0e4a5c,stroke:#0e4a5c,color:#f2b84b,font-weight:bold
    classDef outil fill:#ffffff,stroke:#0e4a5c,stroke-width:3px,color:#0e4a5c,font-weight:bold
    classDef automate fill:#ffffff,stroke:#f2b84b,stroke-width:3px,color:#0e4a5c,font-weight:bold
    classDef enligne fill:#ffffff,stroke:#3f8fa3,stroke-width:3px,color:#0e4a5c,font-weight:bold
    class SITE site
    class SRV,AT,OAI,GM outil
    class N8N automate
    class GH,NET enligne

    linkStyle 0,1,2 stroke:#0e4a5c,stroke-width:3px
    linkStyle 3,4,5 stroke:#f2b84b,stroke-width:3px
    linkStyle 6,7 stroke:#3f8fa3,stroke-width:3px
```

**Lecture :** une case = un outil · flèche pleine = un échange, avec son « pourquoi » · flèche en pointillés = Netlify héberge le serveur.

## Vue d'ensemble en 3 rôles

*Même contenu que la diapositive « Le projet en un schéma ».*

```mermaid
flowchart LR
    subgraph CONSTRUIRE["Je construis"]
        CC["Claude Code<br/>m'aide à coder"]
        VS["VS Code<br/>éditeur de code"]
        LOC["Serveur local<br/>serveur.ps1 · localhost:8000"]
        GH["GitHub<br/>versions du code"]
        CC -- "+" --- VS
        VS -- "je teste" --> LOC
        LOC -- "j'envoie le code" --> GH
    end

    subgraph CONSULTER["Le dirigeant consulte"]
        DIR(["Dirigeant<br/>ordinateur ou téléphone"])
        SITE["Site Zieli<br/>HTML · CSS · JS"]
        SRV["Serveur<br/>fonctions Netlify"]
        NET["Netlify<br/>hébergement"]
        DIR --> SITE
        SITE -- "garder les clés cachées" --> SRV
        NET -. "héberge" .-> SRV
    end

    subgraph AUTOMATISER["J'automatise"]
        N8N["n8n<br/>5 automatisations"]
        OAI["OpenAI<br/>assistant"]
        GM["Gmail<br/>e-mails"]
    end

    AT[("Airtable<br/>chiffres, remarques,<br/>passages de l'assistant")]

    GH -- "mettre en ligne" --> NET
    SRV -- "afficher les chiffres à jour" --> AT
    SRV -- "transmettre remarques et questions" --> N8N
    N8N -- "noter, lire chiffres et passages" --> AT
    N8N -- "répondre aux questions" --> OAI
    N8N -- "alertes, copies, récapitulatif" --> GM
    GM -. "e-mails et PowerPoint" .-> DIR

    classDef petrole fill:#0e4a5c,color:#faf8f4,stroke:#0e4a5c
    classDef dore fill:#ffffff,stroke:#f2b84b,stroke-width:3px,color:#0e4a5c
    classDef clair fill:#ffffff,stroke:#0e4a5c,color:#0e4a5c
    class DIR,SITE petrole
    class N8N dore
    class CC,VS,LOC,GH,SRV,NET,OAI,GM,AT clair
```

**Lecture :** rectangle = un outil · cylindre = la base de données (Airtable) · forme arrondie = le dirigeant · flèche pleine = un échange, avec son « pourquoi » · flèche en pointillés = un lien indirect.
