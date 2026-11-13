# =====================================================================
# ZIELI - serveur.ps1
# Petit serveur local (accessible uniquement depuis cet ordinateur).
# - distribue les fichiers du site ;
# - lit la base Airtable "zieli26" et fournit les chiffres a la page
#   via l'adresse /api/donnees-airtable.js.
#
# La cle Airtable est lue dans le fichier airtable-token.txt, place a cote
# du dossier du site (donc jamais distribue au navigateur).
# =====================================================================
param(
  [int]$Port = 8000,
  [string]$Racine = $PSScriptRoot,
  [string]$FichierJeton = (Join-Path (Split-Path $PSScriptRoot -Parent) 'airtable-token.txt'),
  [string]$UrlAirtable = 'https://api.airtable.com/v0',
  [string]$FichierCleN8n = (Join-Path (Split-Path $PSScriptRoot -Parent) 'n8n-cle.txt'),
  [string]$UrlN8n = 'https://n8n.jedha.co/webhook/zieli-remarques',
  [string]$UrlAssistant = 'https://n8n.jedha.co/webhook/zieli-assistant'
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$Racine = [System.IO.Path]::GetFullPath($Racine).TrimEnd('\')
$inv = [System.Globalization.CultureInfo]::InvariantCulture

$BASE = 'app3K4PQkkZFAxipC'
$T_ENTREPRISES = 'tblna9EWuSbSHsXT8'
$T_CATEGORIES = 'tblOpdvbRhk7UMNj6'
$T_TRANSACTIONS = 'tblZDrxbfp6fR50I4'
$T_PREVISIONNEL = 'tblnrDOjAypfP1ma8'

# Champs Categories
$C_LIGNE = 'fld63As75Eht1RAue'; $C_PARTIE = 'fldUkquQNcPpiHKuo'; $C_ORDRE = 'flduaR7gdMkXmz6Ka'
# Champs Transactions
$TR_DATE = 'fldKwSmDpVraHm3WM'; $TR_MOIS = 'fldlxWUnL18EYTXW5'; $TR_MONTANT = 'fldYjH1uay2cjd1RB'
$TR_ENT = 'fldqbmdk7kY1OOfy2'; $TR_CAT = 'fld2g5i8mTQRXE0Ow'
# Champs Previsionnel
$PR_MOIS = 'fldk5cU02LEVGmX3D'; $PR_MONTANT = 'fldhIbKEWXfZHsffP'
$PR_ENT = 'fldfr4IRb9Qso1ZOw'; $PR_CAT = 'fldwSzh6mDwB3y1OF'
# Champs Entreprises (lus par leur nom ; le "e accent" est ecrit par son code pour garder ce fichier en ASCII)
$E_NOM = 'Name'; $E_COURANT = 'Solde initial courant'; $E_DATE = 'Date du solde initial'
$E_EPARGNE = "Solde initial $([char]0xE9)pargne"; $E_SEUIL = "Seuil d'alerte"; $E_LOGO = 'Logo'

# Identifiants utilises par les comptes de demonstration de donnees.js.
# Une entreprise absente de cette liste garde son identifiant Airtable (visible par l'Admin).
$CLES_ENTREPRISES = @{
  'rec53om2huapFZgGN' = 'ent-librairie'
  'recSL1ALPdEGzbmKI' = 'ent-boulangerie'
}

# Les chiffres sont lus une fois au premier affichage, puis gardes en memoire.
# Ils ne sont relus dans Airtable qu'avec le bouton "Synchronisation".
$script:cacheJs = $null

function Lire-Table([string]$Jeton, [string]$Table, [string[]]$Champs) {
  $lignes = New-Object System.Collections.ArrayList
  $offset = $null
  do {
    $params = @('pageSize=100')
    if ($Champs) {
      $params += 'returnFieldsByFieldId=true'
      foreach ($c in $Champs) { $params += "fields%5B%5D=$c" }
    }
    if ($offset) { $params += 'offset=' + [Uri]::EscapeDataString($offset) }
    $url = "$UrlAirtable/$BASE/$Table" + '?' + ($params -join '&')

    $client = New-Object System.Net.WebClient
    $client.Encoding = [System.Text.Encoding]::UTF8
    $client.Headers['Authorization'] = "Bearer $Jeton"
    try { $texte = $client.DownloadString($url) } finally { $client.Dispose() }

    $page = $texte | ConvertFrom-Json
    foreach ($r in $page.records) { [void]$lignes.Add($r) }
    $offset = $page.offset
    # Airtable accepte au plus 5 appels par seconde.
    if ($offset) { Start-Sleep -Milliseconds 250 }
  } while ($offset)
  return $lignes.ToArray()
}

function Mois-Decale([string]$Cle, [int]$Decalage) {
  return [datetime]::ParseExact("$Cle-01", 'yyyy-MM-dd', $inv).AddMonths($Decalage).ToString('yyyy-MM', $inv)
}

# Logo de l'entreprise (champ "Logo" d'Airtable) : l'image est telechargee puis recopiee
# dans la page ("data:..."), car les liens d'images Airtable expirent au bout de quelques heures.
# Renvoie $null s'il n'y a pas de logo ou s'il est trop lourd (plus de 1 Mo).
function Lire-Logo($Pieces) {
  $piece = @($Pieces) | Select-Object -First 1
  if (-not $piece -or -not $piece.url) { return $null }
  if ($piece.size -and $piece.size -gt 1048576) { return $null }
  $client = New-Object System.Net.WebClient
  try { $octets = $client.DownloadData([string]$piece.url) } catch { return $null } finally { $client.Dispose() }
  $type = [string]$piece.type
  if (-not $type) { $type = 'image/png' }
  return "data:$type;base64," + [Convert]::ToBase64String($octets)
}

function Est-Nombre($Valeur) {
  return ($Valeur -is [ValueType]) -and ($Valeur -isnot [bool])
}

# Ajoute une ligne (transaction ou previsionnel) dans les totaux par entreprise/categorie/mois.
# Renvoie $false si la ligne est incomplete.
function Ajouter-Ligne($Totaux, $Presence, [string]$Type, $Ent, $Cat, $Mois, $Montant) {
  if (@($Ent).Count -ne 1 -or $null -eq $Ent) { return $false }
  if (@($Cat).Count -ne 1 -or $null -eq $Cat) { return $false }
  if (-not (Est-Nombre $Montant) -or [string]::IsNullOrEmpty($Mois)) { return $false }
  $idEnt = @($Ent)[0]; $idCat = @($Cat)[0]
  $cle = "$Type|$idEnt|$idCat|$Mois"
  if ($Totaux.ContainsKey($cle)) { $Totaux[$cle] += [double]$Montant } else { $Totaux[$cle] = [double]$Montant }
  $Presence["$idEnt|$idCat|$Mois"] = $true
  return $true
}

function Construire-Js {
  if (-not [System.IO.File]::Exists($FichierJeton)) {
    throw "Cle Airtable introuvable (fichier attendu : $FichierJeton)."
  }
  $jeton = (Get-Content -LiteralPath $FichierJeton -Raw).Trim()
  if (-not $jeton) { throw "Le fichier de cle Airtable est vide ($FichierJeton)." }

  $entreprises = Lire-Table $jeton $T_ENTREPRISES
  $categories = Lire-Table $jeton $T_CATEGORIES @($C_LIGNE, $C_PARTIE, $C_ORDRE)
  $transactions = Lire-Table $jeton $T_TRANSACTIONS @($TR_DATE, $TR_MOIS, $TR_MONTANT, $TR_ENT, $TR_CAT)
  $previsionnel = Lire-Table $jeton $T_PREVISIONNEL @($PR_MOIS, $PR_MONTANT, $PR_ENT, $PR_CAT)

  $totaux = @{}
  $presence = @{}
  $derniereDate = @{}
  $ignorees = 0

  foreach ($t in $transactions) {
    $f = $t.fields
    if (Ajouter-Ligne $totaux $presence 'R' $f.$TR_ENT $f.$TR_CAT $f.$TR_MOIS $f.$TR_MONTANT) {
      $id = @($f.$TR_ENT)[0]
      $d = [string]$f.$TR_DATE
      if (-not $derniereDate.ContainsKey($id) -or [string]::CompareOrdinal($d, $derniereDate[$id]) -gt 0) { $derniereDate[$id] = $d }
    } else { $ignorees++ }
  }
  foreach ($p in $previsionnel) {
    $f = $p.fields
    if (-not (Ajouter-Ligne $totaux $presence 'P' $f.$PR_ENT $f.$PR_CAT $f.$PR_MOIS $f.$PR_MONTANT)) { $ignorees++ }
  }

  $categoriesTriees = $categories | Sort-Object { [double]$_.fields.$C_ORDRE }
  $moisCourant = (Get-Date).ToString('yyyy-MM', $inv)
  $dernierMoisReel = Mois-Decale $moisCourant -1
  $moisFin = Mois-Decale $moisCourant 6

  $resultat = [ordered]@{}
  foreach ($e in $entreprises) {
    $f = $e.fields
    $nom = [string]$f.$E_NOM
    $dateSolde = [string]$f.$E_DATE
    if (-not $dateSolde) { throw "Date du solde initial manquante pour : $nom." }

    # Liste des mois : du mois qui suit le solde initial jusqu'au mois en cours + 6.
    $debut = Mois-Decale $dateSolde.Substring(0, 7) 1
    if ([string]::CompareOrdinal($debut, $dernierMoisReel) -gt 0) {
      throw "Solde initial trop recent pour : $nom (il faut au moins un mois termine apres cette date)."
    }
    $listeMois = New-Object System.Collections.ArrayList
    $m = $debut
    while ([string]::CompareOrdinal($m, $moisFin) -le 0) { [void]$listeMois.Add($m); $m = Mois-Decale $m 1 }

    $lignes = New-Object System.Collections.ArrayList
    foreach ($c in $categoriesTriees) {
      $utilisee = $false
      foreach ($mo in $listeMois) { if ($presence.ContainsKey("$($e.id)|$($c.id)|$mo")) { $utilisee = $true; break } }
      if (-not $utilisee) { continue }

      $prevu = New-Object System.Collections.ArrayList
      $reel = New-Object System.Collections.ArrayList
      foreach ($mo in $listeMois) {
        $cleP = "P|$($e.id)|$($c.id)|$mo"; $cleR = "R|$($e.id)|$($c.id)|$mo"
        if ($totaux.ContainsKey($cleP)) { [void]$prevu.Add([math]::Round($totaux[$cleP], 2)) } else { [void]$prevu.Add(0) }
        if ([string]::CompareOrdinal($mo, $moisCourant) -gt 0) { [void]$reel.Add($null) }
        elseif ($totaux.ContainsKey($cleR)) { [void]$reel.Add([math]::Round($totaux[$cleR], 2)) }
        else { [void]$reel.Add(0) }
      }
      [void]$lignes.Add([ordered]@{
        nom = ([string]$c.fields.$C_LIGNE).Trim()
        partie = [string]$c.fields.$C_PARTIE
        prevu = $prevu.ToArray()
        reel = $reel.ToArray()
      })
    }

    $dateMaj = $dateSolde
    if ($derniereDate.ContainsKey($e.id)) { $dateMaj = $derniereDate[$e.id] }

    $objet = [ordered]@{
      entreprise = $nom
      dateMiseAJour = $dateMaj
      soldeInitial = [ordered]@{ date = $dateSolde; courant = [double]$f.$E_COURANT; epargne = [double]$f.$E_EPARGNE }
      mois = $listeMois.ToArray()
      dernierMoisReel = $dernierMoisReel
      categories = $lignes.ToArray()
    }
    # Sans champ "Seuil d'alerte" dans Airtable, app.js applique 5 000 EUR.
    if (Est-Nombre $f.$E_SEUIL) { $objet['seuilAlerte'] = [double]$f.$E_SEUIL }
    $logo = Lire-Logo $f.$E_LOGO
    if ($logo) { $objet['logo'] = $logo }

    $cle = $e.id
    if ($CLES_ENTREPRISES.ContainsKey($e.id)) { $cle = $CLES_ENTREPRISES[$e.id] }
    $resultat[$cle] = $objet
  }

  $json = $resultat | ConvertTo-Json -Depth 8 -Compress
  # Accents ecrits par leur code : ce fichier doit rester en ASCII pour PowerShell 5.1.
  $tiret = [string][char]0x2013; $e1 = [string][char]0xE9; $e2 = [string][char]0xE8
  $pied = "Zieli $tiret donn${e1}es Airtable (base zieli26)"
  if ($ignorees -gt 0) { $pied += " $tiret $ignorees ligne(s) Airtable incompl${e2}te(s) non compt${e1}e(s)" }

  return "document.getElementById('bouton-synchro').hidden=false;`n" +
         "Object.keys(ENTREPRISES).forEach(function(c){delete ENTREPRISES[c];});`n" +
         "Object.assign(ENTREPRISES,$json);`n" +
         "document.querySelector('footer').textContent=`"$pied`";`n"
}

function Script-Erreur([string]$Message) {
  $e = [string][char]0xE9
  $texte = "Donn${e}es Airtable indisponibles : $Message Les chiffres affich${e}s sont FICTIFS."
  $json = $texte | ConvertTo-Json -Compress
  return "document.getElementById('bouton-synchro').hidden=false;`n" +
         "(function(){var b=document.createElement('div');" +
         "b.style.cssText='background:#c0392b;color:#fff;padding:12px 16px;font:600 15px sans-serif;position:relative;z-index:1000';" +
         "b.textContent=$json;document.body.insertBefore(b,document.body.firstChild);})();`n"
}

# Bouton "Synchronisation" : relit Airtable tout de suite.
# En cas d'echec, la derniere copie valable reste en memoire.
function Synchroniser {
  $js = Construire-Js
  $script:cacheJs = $js
  Write-Host "Airtable : donnees synchronisees"
}

function Obtenir-Js {
  if ($script:cacheJs) { return $script:cacheJs }
  try {
    $js = Construire-Js
    $script:cacheJs = $js
    Write-Host "Airtable : donnees lues"
    return $js
  }
  catch {
    Write-Host "Airtable : ECHEC - $($_.Exception.Message)"
    return Script-Erreur $_.Exception.Message
  }
}

# Formulaire "Une remarque ?" : transmet la remarque au workflow n8n.
# La cle du webhook reste ici, sur le serveur : le navigateur ne la voit jamais.
function Transmettre-Remarque([string]$Json) {
  if (-not [System.IO.File]::Exists($FichierCleN8n)) {
    throw "Cle n8n introuvable (fichier attendu : $FichierCleN8n)."
  }
  $cleN8n = (Get-Content -LiteralPath $FichierCleN8n -Raw).Trim()
  if (-not $cleN8n) { throw "Le fichier de cle n8n est vide ($FichierCleN8n)." }

  $remarque = $Json | ConvertFrom-Json
  $entreprise = [string]$remarque.entreprise
  $idAirtable = $null
  foreach ($id in $CLES_ENTREPRISES.Keys) { if ($CLES_ENTREPRISES[$id] -eq $entreprise) { $idAirtable = $id } }
  if (-not $idAirtable -and $entreprise -cmatch '^rec[A-Za-z0-9]{14}$') { $idAirtable = $entreprise }
  if (-not $idAirtable) { throw 'Entreprise inconnue.' }

  $type = [string]$remarque.type
  if (@('', 'previsionnel', 'ecarts', 'echange') -cnotcontains $type) { throw 'Type de remarque inconnu.' }
  $mois = [string]$remarque.mois
  if ($mois -cnotmatch '^(\d{4}-\d{2}|plusieurs)?$') { throw 'Mois invalide.' }

  $corps = [ordered]@{
    entrepriseId = $idAirtable
    type = $type
    texte = [string]$remarque.texte
    urgent = ($remarque.urgent -eq $true)
    mois = $mois
  } | ConvertTo-Json -Compress

  $appel = Invoke-WebRequest -Uri $UrlN8n -Method Post -UseBasicParsing -TimeoutSec 30 `
    -Headers @{ 'X-Zieli-Cle' = $cleN8n } -ContentType 'application/json; charset=utf-8' `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($corps))
  $contenu = $appel.Content
  if ($contenu -is [byte[]]) { $contenu = [System.Text.Encoding]::UTF8.GetString($contenu) }
  if (($contenu | ConvertFrom-Json).ok -ne $true) { throw 'Reponse inattendue de n8n.' }
}

# Assistant (bouton "Une question ?") : transmet la question au workflow n8n "Zieli - assistant"
# et renvoie sa reponse au navigateur. Meme cle que pour les remarques : elle reste ici.
function Poser-Question([string]$Json) {
  if (-not [System.IO.File]::Exists($FichierCleN8n)) {
    throw "Cle n8n introuvable (fichier attendu : $FichierCleN8n)."
  }
  $cleN8n = (Get-Content -LiteralPath $FichierCleN8n -Raw).Trim()
  if (-not $cleN8n) { throw "Le fichier de cle n8n est vide ($FichierCleN8n)." }

  $demande = $Json | ConvertFrom-Json
  $question = ([string]$demande.question).Trim()
  if (-not $question -or $question.Length -gt 500) { throw 'Question vide ou trop longue.' }

  $entreprise = [string]$demande.entreprise
  $idAirtable = ''
  foreach ($id in $CLES_ENTREPRISES.Keys) { if ($CLES_ENTREPRISES[$id] -eq $entreprise) { $idAirtable = $id } }
  if (-not $idAirtable -and $entreprise -cmatch '^rec[A-Za-z0-9]{14}$') { $idAirtable = $entreprise }

  # Les derniers echanges (6 au plus) servent aux questions de suite ("et pour l'epargne ?").
  $historique = @()
  foreach ($m in @($demande.historique)) {
    if ($m -and ($m.role -eq 'user' -or $m.role -eq 'assistant') -and $m.content -is [string]) {
      $historique += [ordered]@{ role = [string]$m.role; content = $m.content.Substring(0, [Math]::Min(1500, $m.content.Length)) }
    }
  }
  if ($historique.Count -gt 6) { $historique = $historique[($historique.Count - 6)..($historique.Count - 1)] }

  $corps = [ordered]@{ question = $question; entrepriseId = $idAirtable; historique = @($historique) } | ConvertTo-Json -Depth 5 -Compress

  $appel = Invoke-WebRequest -Uri $UrlAssistant -Method Post -UseBasicParsing -TimeoutSec 60 `
    -Headers @{ 'X-Zieli-Cle' = $cleN8n } -ContentType 'application/json; charset=utf-8' `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($corps))
  # Lecture en UTF-8 (accents) a partir des octets recus.
  $contenu = [System.Text.Encoding]::UTF8.GetString($appel.RawContentStream.ToArray())
  $reponse = $contenu | ConvertFrom-Json
  if ($reponse.ok -ne $true) { throw 'Reponse inattendue de n8n.' }
  return ([ordered]@{ reponse = [string]$reponse.reponse; sources = @($reponse.sources) } | ConvertTo-Json -Depth 5 -Compress)
}

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.ico'  = 'image/x-icon'
  '.pdf'  = 'application/pdf'
}

function Envoyer($Contexte, [byte[]]$Octets, [string]$Type) {
  $reponse = $Contexte.Response
  $reponse.ContentType = $Type
  # Pas de cache navigateur : une modification enregistree apparait au rechargement.
  $reponse.Headers.Add('Cache-Control', 'no-store')
  $reponse.ContentLength64 = $Octets.Length
  if ($Contexte.Request.HttpMethod -ne 'HEAD') {
    $reponse.OutputStream.Write($Octets, 0, $Octets.Length)
  }
}

$ecoute = New-Object System.Net.HttpListener
$ecoute.Prefixes.Add("http://localhost:$Port/")
$ecoute.Start()
Write-Output "Serveur actif : http://localhost:$Port/ (laisser cette fenetre ouverte)"

try {
  while ($ecoute.IsListening) {
    $contexte = $ecoute.GetContext()
    $reponse = $contexte.Response
    try {
      $cheminUrl = $contexte.Request.Url.AbsolutePath
      if ($cheminUrl -eq '/api/synchroniser') {
        # L'en-tete personnalise empeche un autre site web de declencher cet appel.
        if ($contexte.Request.HttpMethod -ne 'POST' -or $contexte.Request.Headers['X-Zieli-Synchro'] -ne '1') {
          $reponse.StatusCode = 403
        }
        else {
          try {
            Synchroniser
            Envoyer $contexte ([System.Text.Encoding]::UTF8.GetBytes('ok')) 'text/plain; charset=utf-8'
          }
          catch {
            Write-Host "Airtable : ECHEC - $($_.Exception.Message)"
            $reponse.StatusCode = 502
            Envoyer $contexte ([System.Text.Encoding]::UTF8.GetBytes('erreur')) 'text/plain; charset=utf-8'
          }
        }
      }
      elseif ($cheminUrl -eq '/api/remarque') {
        if ($contexte.Request.HttpMethod -ne 'POST' -or $contexte.Request.Headers['X-Zieli-Synchro'] -ne '1') {
          $reponse.StatusCode = 403
        }
        else {
          try {
            $lecteur = New-Object System.IO.StreamReader($contexte.Request.InputStream, [System.Text.Encoding]::UTF8)
            try { $recu = $lecteur.ReadToEnd() } finally { $lecteur.Dispose() }
            Transmettre-Remarque $recu
            Write-Host "n8n : remarque transmise"
            Envoyer $contexte ([System.Text.Encoding]::UTF8.GetBytes('ok')) 'text/plain; charset=utf-8'
          }
          catch {
            Write-Host "n8n : ECHEC - $($_.Exception.Message)"
            $reponse.StatusCode = 502
            Envoyer $contexte ([System.Text.Encoding]::UTF8.GetBytes('erreur')) 'text/plain; charset=utf-8'
          }
        }
      }
      elseif ($cheminUrl -eq '/api/assistant') {
        if ($contexte.Request.HttpMethod -ne 'POST' -or $contexte.Request.Headers['X-Zieli-Synchro'] -ne '1') {
          $reponse.StatusCode = 403
        }
        else {
          try {
            $lecteur = New-Object System.IO.StreamReader($contexte.Request.InputStream, [System.Text.Encoding]::UTF8)
            try { $recu = $lecteur.ReadToEnd() } finally { $lecteur.Dispose() }
            $resultat = Poser-Question $recu
            Write-Host "n8n : question a l'assistant traitee"
            Envoyer $contexte ([System.Text.Encoding]::UTF8.GetBytes($resultat)) $types['.json']
          }
          catch {
            Write-Host "n8n : ECHEC assistant - $($_.Exception.Message)"
            $reponse.StatusCode = 502
            Envoyer $contexte ([System.Text.Encoding]::UTF8.GetBytes('{"erreur":true}')) $types['.json']
          }
        }
      }
      elseif ($cheminUrl -eq '/api/donnees-airtable.js') {
        $octets = [System.Text.Encoding]::UTF8.GetBytes((Obtenir-Js))
        Envoyer $contexte $octets $types['.js']
      }
      else {
        $relatif = [System.Uri]::UnescapeDataString($cheminUrl).TrimStart('/').Replace('/', '\')
        if ($relatif -eq '') { $relatif = 'index.html' }
        $chemin = [System.IO.Path]::GetFullPath((Join-Path $Racine $relatif))

        # Refuse tout ce qui sort du dossier du site.
        if (-not $chemin.StartsWith($Racine + '\', [System.StringComparison]::OrdinalIgnoreCase)) {
          $reponse.StatusCode = 403
        }
        elseif (-not [System.IO.File]::Exists($chemin)) {
          $reponse.StatusCode = 404
        }
        else {
          $extension = [System.IO.Path]::GetExtension($chemin).ToLowerInvariant()
          $type = 'application/octet-stream'
          if ($types.ContainsKey($extension)) { $type = $types[$extension] }
          Envoyer $contexte ([System.IO.File]::ReadAllBytes($chemin)) $type
        }
      }
      Write-Output "$($reponse.StatusCode) $($contexte.Request.HttpMethod) $cheminUrl"
    }
    catch {
      Write-Output "Erreur : $($_.Exception.Message)"
      try { $reponse.StatusCode = 500 } catch {}
    }
    finally {
      try { $reponse.Close() } catch {}
    }
  }
}
finally {
  $ecoute.Stop()
}
