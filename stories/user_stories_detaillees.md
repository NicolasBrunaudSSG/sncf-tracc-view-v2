# User Stories détaillées — SNCF TRACC View

## 1. Vision produit

SNCF TRACC View est une application cartographique permettant de visualiser le réseau ferroviaire national, d’afficher des infrastructures ferroviaires, de sélectionner des scénarios climatiques, de croiser les données climatiques avec les objets du réseau, puis d’identifier les infrastructures exposées à un risque selon un seuil défini par l’utilisateur.

L’objectif principal est d’aider les utilisateurs métier à analyser l’exposition du réseau ferroviaire aux impacts climatiques selon différents horizons temporels.

---

## 2. Utilisateurs cibles

### Utilisateur métier
Utilisateur ayant besoin de consulter la carte, visualiser le réseau, choisir des scénarios climatiques et identifier des zones ou infrastructures potentiellement exposées.

### Analyste infrastructure
Utilisateur chargé d’analyser les infrastructures ferroviaires : gares, ponts, tunnels, postes électriques, sections de ligne, ouvrages d’art ou autres objets réseau.

### Analyste climat / résilience
Utilisateur chargé d’interpréter les scénarios climatiques, les indices d’exposition et les niveaux de risque associés.

### Administrateur fonctionnel
Utilisateur responsable de la configuration des couches, des listes de valeurs, des seuils par défaut et potentiellement des sources de données.

---

# EPIC 1 — Visualisation du réseau ferroviaire national

## US-001 — Afficher ou masquer les lignes du réseau national

### User Story
En tant qu’utilisateur métier,  
je veux pouvoir afficher ou masquer les lignes du réseau ferroviaire national,  
afin de visualiser rapidement l’emprise du réseau sur le territoire.

### Priorité
Must Have

### Description fonctionnelle
L’interface doit proposer une case à cocher dans le panneau de gauche permettant d’activer ou de désactiver la couche représentant les lignes du réseau ferroviaire national.

### Critères d’acceptation
- La case à cocher "Lignes du réseau national" est visible dans le panneau "Réseau".
- La case est cochée par défaut au chargement initial de l’application.
- Lorsque la case est cochée, les lignes ferroviaires apparaissent sur la carte.
- Lorsque la case est décochée, les lignes ferroviaires disparaissent de la carte.
- Le changement d’état de la case ne recharge pas toute la page.
- Le fond de carte reste visible quelle que soit la valeur de la case.
- Les autres couches actives ne sont pas supprimées lorsque l’utilisateur masque le réseau national.

### Règles métier
- La couche réseau national est considérée comme la couche de référence.
- Le réseau doit être affiché au-dessus du fond de carte.
- Le réseau doit rester lisible lorsque des couches climatiques sont ajoutées.

### Données nécessaires
- Géométrie des lignes ferroviaires.
- Identifiants techniques des lignes.
- Type éventuel de ligne ou statut de ligne si disponible.

### Cas d’erreur
- Si la couche ne peut pas être chargée, afficher un message clair : "Le réseau ferroviaire n’a pas pu être chargé."
- L’utilisateur doit pouvoir continuer à utiliser le fond de carte même en cas d’erreur de chargement du réseau.

---

## US-002 — Naviguer dans la carte

### User Story
En tant qu’utilisateur,  
je veux pouvoir zoomer, dézoomer et déplacer la carte,  
afin de consulter les données à différentes échelles géographiques.

### Priorité
Must Have

### Description fonctionnelle
La carte doit permettre les interactions standards d’une carte web : zoom, dézoom, déplacement, recentrage implicite par navigation.

### Critères d’acceptation
- Les boutons "+" et "-" sont visibles en haut à gauche de la carte.
- Le bouton "+" augmente le niveau de zoom.
- Le bouton "-" diminue le niveau de zoom.
- L’utilisateur peut déplacer la carte par glisser-déposer.
- Le zoom à la molette fonctionne si ce comportement est activé dans la librairie cartographique.
- Les panneaux latéraux restent fixes pendant la navigation.
- Les couches visibles restent synchronisées avec la position de la carte.

### Règles métier
- La carte est centrée par défaut sur la France métropolitaine.
- Le niveau de zoom initial permet de voir l’ensemble du territoire français.
- La navigation sur la carte ne doit jamais modifier les filtres sélectionnés.

### Cas d’erreur
- Si le fond cartographique ne se charge pas, afficher un message non bloquant.
- Si des tuiles sont indisponibles, la carte doit continuer à fonctionner partiellement.

---

## US-003 — Nettoyer la carte

### User Story
En tant qu’utilisateur métier,  
je veux pouvoir nettoyer la carte,  
afin de revenir rapidement à un état de lecture clair après plusieurs analyses.

### Priorité
Must Have

### Description fonctionnelle
Un bouton "Nettoyer la carte" doit permettre de supprimer les couches analytiques, les résultats de croisement, les mises en évidence de risque et les sélections temporaires.

### Critères d’acceptation
- Le bouton "Nettoyer la carte" est visible en haut de l’écran.
- Au clic, les résultats d’analyse sont supprimés.
- Les infrastructures mises en évidence comme à risque sont réinitialisées.
- Les couches climatiques temporaires sont masquées.
- Le champ de seuil revient à sa valeur par défaut si ce comportement est retenu.
- Les messages d’erreur ou d’information liés à l’analyse précédente sont supprimés.
- Le fond de carte reste affiché.
- La couche du réseau national reste affichée si elle est cochée dans le panneau gauche.

### Règles métier
- Le nettoyage ne doit pas déclencher de rechargement complet de la page.
- Le bouton remet l’espace d’analyse dans un état neutre.
- Le nettoyage ne supprime pas les données source, uniquement l’affichage courant.

### Cas d’erreur
- Si une analyse est en cours, le nettoyage doit annuler ou ignorer proprement les résultats en attente.
- L’utilisateur ne doit pas voir d’état incohérent après le nettoyage.

---

# EPIC 2 — Sélection et affichage des infrastructures

## US-004 — Sélectionner une catégorie d’infrastructure

### User Story
En tant qu’analyste infrastructure,  
je veux sélectionner une catégorie d’infrastructure ferroviaire,  
afin d’afficher uniquement les objets utiles à mon analyse.

### Priorité
Must Have

### Description fonctionnelle
Le panneau gauche contient un menu déroulant intitulé "Infrastructures à afficher". L’utilisateur peut choisir une catégorie d’infrastructures à afficher sur la carte.

### Critères d’acceptation
- Le menu "Infrastructures à afficher" est visible dans le panneau "Réseau".
- La valeur par défaut est "Sélectionner".
- Lorsque l’utilisateur sélectionne une catégorie, les objets correspondants sont affichés sur la carte.
- La catégorie sélectionnée reste visible dans le menu.
- Si l’utilisateur revient à "Sélectionner", les infrastructures spécifiques sont retirées de la carte.
- Le chargement des infrastructures ne bloque pas la navigation carte.
- Un indicateur de chargement peut apparaître si les données prennent du temps à s’afficher.

### Options envisagées
- Gares
- Ponts
- Tunnels
- Postes électriques
- Dépôts
- Ouvrages d’art
- Sections sensibles
- Sous-stations
- Points de bifurcation
- Zones de maintenance

### Règles métier
- En MVP, une seule catégorie d’infrastructure peut être sélectionnée à la fois.
- Une évolution pourra permettre la sélection multiple.
- Chaque catégorie peut avoir un style cartographique dédié.

### Cas d’erreur
- Si aucune donnée n’est disponible pour la catégorie, afficher : "Aucune infrastructure disponible pour cette sélection."
- Si le chargement échoue, afficher : "Les infrastructures sélectionnées n’ont pas pu être chargées."

---

## US-005 — Visualiser les infrastructures sélectionnées sur la carte

### User Story
En tant qu’utilisateur métier,  
je veux voir clairement les infrastructures sélectionnées,  
afin de comprendre leur répartition géographique et leur proximité avec le réseau ferroviaire.

### Priorité
Must Have

### Description fonctionnelle
Les infrastructures sélectionnées sont représentées sur la carte sous forme de points, pictogrammes, lignes ou polygones selon le type d’objet.

### Critères d’acceptation
- Les infrastructures sont visibles au-dessus du fond de carte.
- Les infrastructures sont visuellement distinctes des lignes du réseau.
- Les infrastructures restent visibles lorsque l’utilisateur zoome ou déplace la carte.
- Le style permet de distinguer les infrastructures standards des infrastructures à risque.
- Si beaucoup d’infrastructures sont affichées, le rendu reste exploitable.

### Règles métier
- Les infrastructures ponctuelles peuvent être affichées avec des marqueurs.
- Les infrastructures linéaires peuvent être affichées sous forme de segments.
- Les infrastructures surfaciques peuvent être affichées sous forme de polygones.
- Les infrastructures à risque doivent être affichées au premier plan.

### Cas d’erreur
- Si une géométrie est invalide, l’objet concerné peut être ignoré avec journalisation technique.
- L’utilisateur ne doit pas être bloqué par une erreur isolée sur un objet.

---

# EPIC 3 — Sélection des scénarios climatiques

## US-006 — Sélectionner le scénario climatique de référence

### User Story
En tant qu’analyste climat,  
je veux sélectionner le scénario de référence,  
afin de comparer les données futures avec une période climatique historique.

### Priorité
Must Have

### Description fonctionnelle
Le panneau droit propose un bouton radio "Référence" associé à la période 1976–2005.

### Critères d’acceptation
- L’option "Référence" est visible dans la section "Scénarios climatiques".
- La période "1976–2005" est affichée sous l’option.
- Une seule option de scénario climatique peut être sélectionnée à la fois.
- Lorsque l’option est sélectionnée, les données climatiques de référence sont utilisées pour les analyses.
- Si un indice est déjà sélectionné, le changement de scénario met à jour l’analyse ou demande une relance selon le fonctionnement choisi.

### Règles métier
- Le scénario de référence peut être sélectionné par défaut.
- Le scénario actif doit toujours être identifiable par l’utilisateur.
- Les résultats doivent être rattachés au scénario utilisé.

### Cas d’erreur
- Si les données de référence ne sont pas disponibles, afficher un message clair.
- L’utilisateur doit pouvoir choisir un autre scénario si celui-ci est indisponible.

---

## US-007 — Sélectionner un horizon climatique futur

### User Story
En tant qu’utilisateur métier,  
je veux sélectionner un horizon climatique futur,  
afin d’évaluer l’exposition du réseau selon différentes trajectoires climatiques.

### Priorité
Must Have

### Description fonctionnelle
Le panneau droit propose trois horizons futurs : 2030, 2050 et 2100. Chaque horizon affiche les hypothèses de réchauffement monde et France.

### Critères d’acceptation
- L’option "Horizon 2030" est visible.
- L’option "Horizon 2050" est visible.
- L’option "Horizon 2100" est visible.
- Chaque option affiche les valeurs de réchauffement associées.
- L’utilisateur peut sélectionner un seul horizon à la fois.
- Le changement d’horizon met à jour les paramètres climatiques actifs.
- Les résultats précédents sont recalculés, supprimés ou signalés comme obsolètes.

### Valeurs affichées
- Horizon 2030 : Monde +1,5°C / France +2°C.
- Horizon 2050 : Monde +2°C / France +2,7°C.
- Horizon 2100 : Monde +3°C / France +4°C.

### Règles métier
- Le scénario sélectionné conditionne les indices disponibles.
- Les résultats d’exposition doivent toujours indiquer l’horizon utilisé.
- Le changement de scénario ne modifie pas la catégorie d’infrastructure sélectionnée.

### Cas d’erreur
- Si un horizon ne dispose pas de données pour l’indice sélectionné, afficher un message d’indisponibilité.
- Le champ indice peut être réinitialisé si nécessaire.

---

# EPIC 4 — Sélection et affichage des indices climatiques

## US-008 — Sélectionner un indice climatique

### User Story
En tant qu’analyste climat ou résilience,  
je veux sélectionner un indice climatique,  
afin d’analyser un type spécifique d’aléa ou de contrainte climatique.

### Priorité
Must Have

### Description fonctionnelle
Le panneau droit contient un menu "Indice à afficher" permettant de choisir la donnée climatique à analyser.

### Critères d’acceptation
- Le menu "Indice à afficher" est visible.
- La valeur par défaut est "Sélectionner".
- Lorsque l’utilisateur sélectionne un indice, l’indice devient actif.
- L’indice actif est utilisé pour l’affichage cartographique et les analyses de seuil.
- L’utilisateur peut modifier l’indice à tout moment.
- Si un seuil était renseigné, le système peut conserver ou réinitialiser le seuil selon les règles définies.

### Exemples d’indices
- Température maximale.
- Nombre de jours de forte chaleur.
- Précipitations extrêmes.
- Risque d’inondation.
- Sécheresse.
- Retrait-gonflement des argiles.
- Vent violent.
- Gel.
- Canicule.
- Submersion marine si applicable.

### Règles métier
- Certains indices peuvent ne pas être disponibles pour tous les horizons.
- Chaque indice doit avoir une unité connue.
- Le seuil saisi par l’utilisateur doit être interprété selon cette unité.
- L’indice sélectionné est obligatoire pour lancer une analyse de risque.

### Cas d’erreur
- Si aucun indice n’est sélectionné au moment de l’analyse, afficher : "Veuillez sélectionner un indice climatique."
- Si l’indice n’est pas disponible pour le scénario choisi, afficher un message explicite.

---

## US-009 — Afficher la couche climatique associée à un indice

### User Story
En tant qu’utilisateur métier,  
je veux visualiser la couche climatique correspondant à l’indice sélectionné,  
afin d’identifier les zones géographiques les plus exposées.

### Priorité
Should Have

### Description fonctionnelle
Une fois un indice sélectionné, l’application peut afficher une couche climatique sous forme de heatmap, raster, maillage ou aplats colorés.

### Critères d’acceptation
- La couche climatique est affichée sur la carte lorsqu’un indice est sélectionné.
- La couche dépend du scénario climatique actif.
- La couche ne masque pas complètement le fond de carte.
- Le réseau ferroviaire reste lisible.
- Une légende indique la signification des couleurs.
- L’utilisateur peut comprendre si une couleur correspond à un niveau faible, moyen ou élevé.

### Règles métier
- La couche climatique est affichée sous le réseau ferroviaire.
- La transparence doit permettre la lecture des autres couches.
- Les couleurs doivent être cohérentes avec une logique de risque ou d’intensité.

### Cas d’erreur
- Si la couche ne peut pas être chargée, afficher : "La couche climatique n’a pas pu être chargée."
- L’utilisateur peut poursuivre l’analyse si les données attributaires nécessaires sont disponibles.

---

# EPIC 5 — Croisement des données infrastructure / climat

## US-010 — Activer ou désactiver le croisement des données

### User Story
En tant qu’analyste risque,  
je veux choisir si je souhaite croiser les infrastructures avec les données climatiques,  
afin de passer d’une simple visualisation à une analyse d’exposition.

### Priorité
Must Have

### Description fonctionnelle
Le panneau droit contient un champ "Croiser les données ?" permettant d’indiquer si l’utilisateur souhaite effectuer une analyse croisée.

### Critères d’acceptation
- Le champ "Croiser les données ?" est visible.
- Les options disponibles sont "Oui" et "Non".
- La valeur par défaut peut être "Non" ou "Sélectionner" selon le choix UX.
- Lorsque "Non" est sélectionné, aucune analyse croisée n’est lancée.
- Lorsque "Oui" est sélectionné, le système attend les paramètres nécessaires pour lancer l’analyse.
- Si les paramètres nécessaires sont absents, un message d’aide est affiché.

### Paramètres requis pour le croisement
- Une catégorie d’infrastructure.
- Un scénario climatique.
- Un indice climatique.
- Une valeur de seuil si l’analyse par seuil est demandée.

### Règles métier
- Le croisement des données ne doit pas modifier la sélection d’infrastructure.
- Le croisement doit produire un résultat reproductible.
- Le croisement doit être relancé ou invalidé si le scénario, l’indice ou le seuil change.

### Cas d’erreur
- Si l’utilisateur tente un croisement sans infrastructure, afficher : "Veuillez sélectionner une infrastructure à analyser."
- Si aucun indice n’est sélectionné, afficher : "Veuillez sélectionner un indice climatique."

---

## US-011 — Identifier les infrastructures exposées

### User Story
En tant qu’analyste infrastructure,  
je veux identifier les infrastructures exposées à un aléa climatique,  
afin de prioriser les analyses ou actions à mener.

### Priorité
Must Have

### Description fonctionnelle
L’application doit déterminer quelles infrastructures sélectionnées sont exposées à l’indice climatique choisi selon le scénario actif.

### Critères d’acceptation
- Les infrastructures exposées sont identifiées sur la carte.
- Les infrastructures exposées sont visuellement différenciées des autres.
- L’utilisateur peut comprendre quels objets sont concernés.
- Le résultat dépend de la catégorie d’infrastructure, du scénario, de l’indice et du seuil.
- Le nombre d’infrastructures exposées peut être affiché.
- Si aucune infrastructure n’est exposée, un message clair est affiché.

### Règles métier
- Une infrastructure est considérée exposée si la valeur de l’indice dépasse ou atteint le seuil défini, selon la règle retenue.
- Le mode de comparaison doit être documenté : supérieur à, supérieur ou égal, inférieur à, etc.
- Les résultats doivent être mis à jour lorsque les paramètres changent.
- Le style des infrastructures exposées doit être plus visible que celui des infrastructures non exposées.

### Cas d’erreur
- Si le calcul échoue, afficher : "L’analyse d’exposition n’a pas pu être réalisée."
- Les paramètres saisis par l’utilisateur doivent être conservés pour permettre une nouvelle tentative.

---

# EPIC 6 — Seuil de risque

## US-012 — Saisir une valeur de seuil

### User Story
En tant qu’utilisateur métier,  
je veux saisir une valeur de seuil pour l’indice climatique sélectionné,  
afin de définir le niveau à partir duquel une infrastructure est considérée à risque.

### Priorité
Must Have

### Description fonctionnelle
La section "Seuil de risque" contient un champ numérique et un bouton "Afficher".

### Critères d’acceptation
- Le champ de seuil est visible dans le panneau droit.
- Le champ contient une valeur par défaut, par exemple 0.
- L’utilisateur peut modifier la valeur.
- Le champ accepte uniquement des valeurs numériques.
- Le bouton "Afficher" lance l’application du seuil.
- Si la valeur est invalide, le système affiche un message d’erreur.
- La valeur du seuil reste visible après exécution de l’analyse.

### Règles métier
- Le seuil est interprété selon l’unité de l’indice sélectionné.
- Les bornes acceptées peuvent dépendre de l’indice.
- Une valeur négative peut être autorisée ou non selon l’indice.
- Le système doit empêcher les valeurs non numériques.

### Cas d’erreur
- Si le champ est vide, afficher : "Veuillez saisir une valeur de seuil."
- Si la valeur n’est pas numérique, afficher : "Le seuil doit être une valeur numérique."
- Si la valeur est hors bornes connues, afficher un message adapté.

---

## US-013 — Afficher les infrastructures dépassant le seuil

### User Story
En tant qu’analyste risque,  
je veux afficher les infrastructures dépassant le seuil défini,  
afin de concentrer mon attention sur les objets les plus critiques.

### Priorité
Must Have

### Description fonctionnelle
Au clic sur "Afficher", l’application filtre ou met en évidence les infrastructures dont la valeur climatique dépasse le seuil.

### Critères d’acceptation
- Le bouton "Afficher" lance l’analyse.
- Les infrastructures dépassant le seuil sont mises en évidence.
- Les infrastructures ne dépassant pas le seuil sont masquées ou atténuées selon le choix UX.
- Un message indique si aucune infrastructure ne dépasse le seuil.
- Les résultats correspondent au scénario et à l’indice sélectionnés.
- Le rendu cartographique est mis à jour sans rechargement complet de la page.

### Règles métier
- Le seuil s’applique uniquement à l’indice sélectionné.
- Le résultat doit être recalculé si le seuil change.
- Le résultat doit être recalculé ou invalidé si le scénario change.
- Le résultat doit être recalculé ou invalidé si l’indice change.

### Cas d’erreur
- Si les paramètres sont incomplets, l’analyse ne démarre pas.
- Les messages d’erreur doivent indiquer précisément l’action attendue.

---

# EPIC 7 — Aide, guidage et compréhension

## US-014 — Afficher une aide via l’icône information

### User Story
En tant que nouvel utilisateur,  
je veux accéder à une aide depuis l’icône d’information,  
afin de comprendre l’objectif de l’application et les étapes d’utilisation.

### Priorité
Should Have

### Description fonctionnelle
Une icône d’information apparaît à côté du titre "SNCF TRACC View". Au clic, une modale ou une infobulle présente l’usage de l’application.

### Critères d’acceptation
- L’icône information est visible près du titre.
- Au clic, une aide s’affiche.
- L’aide présente le rôle de la carte.
- L’aide explique les scénarios climatiques.
- L’aide explique le croisement de données.
- L’aide explique le seuil de risque.
- L’utilisateur peut fermer l’aide.

### Règles métier
- L’aide ne modifie pas les filtres.
- L’aide ne modifie pas les couches visibles.
- Le contenu doit être compréhensible par un utilisateur non technique.

---

## US-015 — Afficher des messages d’erreur et d’accompagnement

### User Story
En tant qu’utilisateur,  
je veux être guidé lorsque mes paramètres sont incomplets ou incohérents,  
afin de comprendre comment corriger ma saisie.

### Priorité
Must Have

### Description fonctionnelle
L’application doit afficher des messages contextualisés lorsque l’utilisateur tente une action impossible ou incomplète.

### Critères d’acceptation
- Si aucun indice n’est sélectionné, un message demande de sélectionner un indice.
- Si aucune infrastructure n’est sélectionnée pour un croisement, un message demande de sélectionner une infrastructure.
- Si aucun scénario n’est sélectionné, un message demande de sélectionner un scénario.
- Si le seuil est invalide, un message indique le format attendu.
- Les messages apparaissent près de la zone concernée.
- Les messages disparaissent lorsque l’utilisateur corrige la saisie.

### Règles métier
- Les messages doivent être compréhensibles.
- Les messages ne doivent pas être uniquement techniques.
- Les erreurs bloquantes empêchent uniquement l’action concernée, pas toute l’application.

---

# EPIC 8 — Lisibilité, performance et expérience utilisateur

## US-016 — Charger progressivement les données cartographiques

### User Story
En tant qu’utilisateur,  
je veux que la carte et les couches principales se chargent rapidement,  
afin de commencer mon analyse sans attendre le chargement complet de toutes les données.

### Priorité
Should Have

### Description fonctionnelle
L’application doit charger en priorité le fond de carte et l’interface, puis charger les couches métier à la demande.

### Critères d’acceptation
- Le fond de carte apparaît rapidement.
- Les panneaux de contrôle sont disponibles rapidement.
- Les couches lourdes sont chargées à la demande.
- Un indicateur de chargement est affiché pour les traitements longs.
- L’utilisateur peut continuer à naviguer pendant les chargements non bloquants.

### Règles métier
- Les données inutiles ne doivent pas être chargées au démarrage.
- Les résultats d’analyse doivent être associés aux paramètres actifs au moment du lancement.
- Une requête obsolète ne doit pas écraser un résultat plus récent.

---

## US-017 — Maintenir la lisibilité des couches superposées

### User Story
En tant qu’utilisateur métier,  
je veux que les couches affichées restent lisibles lorsqu’elles sont superposées,  
afin de comprendre facilement la carte et les résultats.

### Priorité
Should Have

### Description fonctionnelle
Le système doit appliquer un ordre d’affichage cohérent et des styles adaptés pour éviter que certaines données masquent les autres.

### Critères d’acceptation
- Le fond de carte reste lisible.
- La couche climatique ne masque pas totalement le réseau.
- Les lignes du réseau restent visibles.
- Les infrastructures à risque ressortent clairement.
- Les couleurs utilisées sont cohérentes.
- Une légende peut être affichée pour les couches climatiques ou les risques.

### Ordre d’affichage recommandé
1. Fond de carte.
2. Couche climatique.
3. Réseau ferroviaire.
4. Infrastructures standard.
5. Infrastructures à risque.
6. Pop-ups, infobulles et panneaux de détail.

---

# EPIC 9 — Résultats d’analyse

## US-018 — Afficher un résumé des résultats

### User Story
En tant qu’analyste risque,  
je veux consulter un résumé des résultats,  
afin de comprendre rapidement l’ampleur de l’exposition détectée.

### Priorité
Could Have

### Description fonctionnelle
Après une analyse, l’application affiche un résumé synthétique des résultats obtenus.

### Critères d’acceptation
- Le résumé indique le nombre total d’infrastructures analysées.
- Le résumé indique le nombre d’infrastructures à risque.
- Le résumé indique le pourcentage d’infrastructures concernées.
- Le résumé rappelle le scénario utilisé.
- Le résumé rappelle l’indice utilisé.
- Le résumé rappelle le seuil appliqué.
- Le résumé est mis à jour à chaque nouvelle analyse.

### Règles métier
- Le résumé doit être cohérent avec la carte.
- Si aucune infrastructure n’est à risque, le résumé doit l’indiquer clairement.
- Le résumé ne doit pas masquer les contrôles essentiels.

---

## US-019 — Consulter le détail d’une infrastructure

### User Story
En tant qu’utilisateur métier,  
je veux cliquer sur une infrastructure affichée,  
afin de consulter ses informations détaillées et son niveau d’exposition.

### Priorité
Could Have

### Description fonctionnelle
Un clic sur une infrastructure ouvre une pop-up ou un panneau affichant les informations disponibles.

### Critères d’acceptation
- Le clic sur une infrastructure ouvre un détail.
- Le détail affiche l’identifiant de l’objet si disponible.
- Le détail affiche le type d’infrastructure.
- Le détail affiche la valeur de l’indice climatique.
- Le détail affiche le statut par rapport au seuil.
- Le détail peut être fermé par l’utilisateur.

### Données affichables
- Identifiant infrastructure.
- Nom ou libellé.
- Type.
- Localisation.
- Scénario actif.
- Indice actif.
- Valeur climatique.
- Seuil appliqué.
- Statut : à risque / non à risque.

---

# EPIC 10 — Accessibilité

## US-020 — Utiliser les principaux contrôles au clavier

### User Story
En tant qu’utilisateur ayant besoin d’une navigation clavier,  
je veux accéder aux principaux contrôles sans souris,  
afin d’utiliser l’application de manière accessible.

### Priorité
Should Have

### Description fonctionnelle
Les champs, boutons et contrôles principaux doivent être accessibles via le clavier.

### Critères d’acceptation
- Les menus déroulants sont accessibles au clavier.
- Les boutons peuvent être atteints avec la touche Tab.
- Les boutons peuvent être activés avec Entrée ou Espace.
- Le focus clavier est visible.
- L’ordre de tabulation est logique.
- Les champs ont des libellés accessibles.

### Ordre de tabulation recommandé
1. Panneau gauche.
2. Contrôles de carte.
3. Bouton "Nettoyer la carte".
4. Panneau droit.
5. Résultats ou messages.

---

# Synthèse des priorités

## Must Have — MVP
- US-001 — Afficher ou masquer les lignes du réseau national.
- US-002 — Naviguer dans la carte.
- US-003 — Nettoyer la carte.
- US-004 — Sélectionner une catégorie d’infrastructure.
- US-005 — Visualiser les infrastructures sélectionnées.
- US-006 — Sélectionner le scénario de référence.
- US-007 — Sélectionner un horizon climatique futur.
- US-008 — Sélectionner un indice climatique.
- US-010 — Activer ou désactiver le croisement.
- US-011 — Identifier les infrastructures exposées.
- US-012 — Saisir une valeur de seuil.
- US-013 — Afficher les infrastructures dépassant le seuil.
- US-015 — Afficher des messages d’erreur.

## Should Have — Version enrichie
- US-009 — Afficher la couche climatique associée à un indice.
- US-014 — Afficher une aide via l’icône information.
- US-016 — Charger progressivement les données cartographiques.
- US-017 — Maintenir la lisibilité des couches superposées.
- US-020 — Utiliser les principaux contrôles au clavier.

## Could Have — Version avancée
- US-018 — Afficher un résumé des résultats.
- US-019 — Consulter le détail d’une infrastructure.
