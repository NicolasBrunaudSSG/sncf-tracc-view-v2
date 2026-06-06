# Tests d’acceptance — SNCF TRACC View

## 1. Objectif du document

Ce document complète les User Stories, le wireframe et le backlog MVP avec des tests d’acceptance fonctionnels.

Les tests sont formulés au format **Given / When / Then** afin d’être exploitables par :
- une équipe QA ;
- une équipe produit ;
- une équipe de développement ;
- un outil de suivi type Jira, Azure DevOps ou Xray.

---

## 2. Périmètre des tests d’acceptance

Les tests couvrent le périmètre MVP suivant :

- Chargement de la carte.
- Navigation cartographique.
- Affichage et masquage du réseau ferroviaire national.
- Sélection et affichage des infrastructures.
- Sélection des scénarios climatiques.
- Sélection des indices climatiques.
- Activation du croisement de données.
- Saisie et validation du seuil de risque.
- Affichage des infrastructures à risque.
- Nettoyage de la carte.
- Gestion des erreurs et messages d’accompagnement.
- Lisibilité minimale des couches.
- Accessibilité de base.

---

# EPIC 1 — Visualisation du réseau ferroviaire national

## US-001 — Afficher ou masquer les lignes du réseau national

### TA-001-01 — Affichage par défaut du réseau national

**Étant donné** que l’utilisateur ouvre l’application,  
**Quand** la carte est chargée,  
**Alors** la case "Lignes du réseau national" est cochée,  
**Et** les lignes du réseau ferroviaire national sont visibles sur la carte.

### TA-001-02 — Masquage du réseau national

**Étant donné** que le réseau national est affiché,  
**Quand** l’utilisateur décoche la case "Lignes du réseau national",  
**Alors** les lignes du réseau ferroviaire national disparaissent de la carte,  
**Et** le fond de carte reste visible,  
**Et** la page ne se recharge pas complètement.

### TA-001-03 — Réaffichage du réseau national

**Étant donné** que le réseau national est masqué,  
**Quand** l’utilisateur coche la case "Lignes du réseau national",  
**Alors** les lignes du réseau ferroviaire national réapparaissent sur la carte.

### TA-001-04 — Conservation des autres couches

**Étant donné** qu’une infrastructure est affichée sur la carte,  
**Quand** l’utilisateur masque le réseau national,  
**Alors** la couche infrastructure reste affichée,  
**Et** seule la couche réseau national est masquée.

---

## US-002 — Naviguer dans la carte

### TA-002-01 — Zoom avant avec le bouton plus

**Étant donné** que la carte est affichée,  
**Quand** l’utilisateur clique sur le bouton `+`,  
**Alors** le niveau de zoom augmente,  
**Et** les couches visibles restent synchronisées avec la carte.

### TA-002-02 — Zoom arrière avec le bouton moins

**Étant donné** que la carte est affichée,  
**Quand** l’utilisateur clique sur le bouton `-`,  
**Alors** le niveau de zoom diminue,  
**Et** le fond de carte reste visible.

### TA-002-03 — Déplacement de la carte

**Étant donné** que la carte est affichée,  
**Quand** l’utilisateur déplace la carte par glisser-déposer,  
**Alors** la zone géographique visible change,  
**Et** les panneaux latéraux restent fixes à l’écran.

### TA-002-04 — Conservation des filtres pendant la navigation

**Étant donné** qu’un scénario, un indice et une infrastructure sont sélectionnés,  
**Quand** l’utilisateur zoome ou déplace la carte,  
**Alors** les sélections utilisateur restent inchangées.

---

## US-003 — Nettoyer la carte

### TA-003-01 — Nettoyage des résultats d’analyse

**Étant donné** qu’une analyse de risque a été exécutée,  
**Quand** l’utilisateur clique sur "Nettoyer la carte",  
**Alors** les infrastructures mises en évidence comme à risque sont supprimées ou réinitialisées,  
**Et** les couches temporaires d’analyse sont masquées.

### TA-003-02 — Conservation du fond de carte

**Étant donné** que l’utilisateur clique sur "Nettoyer la carte",  
**Quand** l’action est terminée,  
**Alors** le fond de carte reste visible.

### TA-003-03 — Conservation du réseau si la case est cochée

**Étant donné** que la case "Lignes du réseau national" est cochée,  
**Quand** l’utilisateur clique sur "Nettoyer la carte",  
**Alors** le réseau ferroviaire national reste visible.

### TA-003-04 — Suppression des messages d’erreur

**Étant donné** qu’un message d’erreur est affiché,  
**Quand** l’utilisateur clique sur "Nettoyer la carte",  
**Alors** le message d’erreur disparaît.

---

# EPIC 2 — Sélection et affichage des infrastructures

## US-004 — Sélectionner une catégorie d’infrastructure

### TA-004-01 — Affichage de la liste des infrastructures

**Étant donné** que le panneau "Réseau" est visible,  
**Quand** l’utilisateur ouvre le menu "Infrastructures à afficher",  
**Alors** la liste des catégories d’infrastructures disponibles est affichée.

### TA-004-02 — Sélection d’une catégorie d’infrastructure

**Étant donné** que le menu "Infrastructures à afficher" est disponible,  
**Quand** l’utilisateur sélectionne une catégorie,  
**Alors** la catégorie sélectionnée est affichée dans le menu,  
**Et** les infrastructures correspondantes sont chargées sur la carte.

### TA-004-03 — Retour à la valeur par défaut

**Étant donné** qu’une catégorie d’infrastructure est sélectionnée,  
**Quand** l’utilisateur sélectionne à nouveau "Sélectionner",  
**Alors** les infrastructures spécifiques disparaissent de la carte.

### TA-004-04 — Changement de catégorie

**Étant donné** qu’une première catégorie d’infrastructure est affichée,  
**Quand** l’utilisateur sélectionne une autre catégorie,  
**Alors** les objets de la première catégorie sont retirés,  
**Et** les objets de la nouvelle catégorie sont affichés.

### TA-004-05 — Absence de données pour une catégorie

**Étant donné** qu’une catégorie ne contient aucune donnée disponible,  
**Quand** l’utilisateur sélectionne cette catégorie,  
**Alors** un message indique "Aucune infrastructure disponible pour cette sélection.",  
**Et** l’application reste utilisable.

---

## US-005 — Visualiser les infrastructures sélectionnées sur la carte

### TA-005-01 — Affichage visuel distinct des infrastructures

**Étant donné** qu’une catégorie d’infrastructure est sélectionnée,  
**Quand** les objets sont affichés sur la carte,  
**Alors** les infrastructures sont visuellement distinctes du réseau ferroviaire.

### TA-005-02 — Maintien des infrastructures lors du zoom

**Étant donné** que des infrastructures sont affichées,  
**Quand** l’utilisateur zoome sur la carte,  
**Alors** les infrastructures restent visibles si elles se trouvent dans l’emprise visible de la carte.

### TA-005-03 — Affichage au-dessus du fond de carte

**Étant donné** que des infrastructures sont affichées,  
**Quand** l’utilisateur observe la carte,  
**Alors** les infrastructures sont affichées au-dessus du fond cartographique.

---

# EPIC 3 — Sélection des scénarios climatiques

## US-006 — Sélectionner le scénario climatique de référence

### TA-006-01 — Présence du scénario de référence

**Étant donné** que le panneau "Scénarios climatiques" est visible,  
**Quand** l’utilisateur consulte la liste des scénarios,  
**Alors** l’option "Référence" est visible,  
**Et** la période "1976–2005" est affichée.

### TA-006-02 — Sélection du scénario de référence

**Étant donné** qu’un autre scénario est sélectionné,  
**Quand** l’utilisateur sélectionne "Référence",  
**Alors** le scénario de référence devient le scénario actif,  
**Et** les autres scénarios sont désélectionnés.

---

## US-007 — Sélectionner un horizon climatique futur

### TA-007-01 — Présence des horizons climatiques futurs

**Étant donné** que le panneau "Scénarios climatiques" est visible,  
**Quand** l’utilisateur consulte les scénarios,  
**Alors** les options "Horizon 2030", "Horizon 2050" et "Horizon 2100" sont visibles.

### TA-007-02 — Sélection exclusive d’un horizon

**Étant donné** que le scénario "Référence" est sélectionné,  
**Quand** l’utilisateur sélectionne "Horizon 2050",  
**Alors** "Horizon 2050" devient le seul scénario sélectionné.

### TA-007-03 — Affichage des valeurs de réchauffement

**Étant donné** que les scénarios climatiques sont visibles,  
**Quand** l’utilisateur consulte les horizons,  
**Alors** les valeurs de réchauffement Monde et France sont affichées pour chaque horizon.

### TA-007-04 — Invalidation des résultats au changement de scénario

**Étant donné** qu’une analyse a déjà été exécutée,  
**Quand** l’utilisateur change de scénario climatique,  
**Alors** les résultats précédents sont recalculés, supprimés ou indiqués comme obsolètes selon la règle produit retenue.

---

# EPIC 4 — Sélection et affichage des indices climatiques

## US-008 — Sélectionner un indice climatique

### TA-008-01 — Affichage du menu indice

**Étant donné** que le panneau droit est visible,  
**Quand** l’utilisateur consulte la section "Indice à afficher",  
**Alors** un menu déroulant est disponible,  
**Et** la valeur par défaut est "Sélectionner".

### TA-008-02 — Sélection d’un indice

**Étant donné** que le menu "Indice à afficher" est disponible,  
**Quand** l’utilisateur sélectionne un indice climatique,  
**Alors** l’indice sélectionné devient l’indice actif,  
**Et** la valeur sélectionnée reste visible dans le menu.

### TA-008-03 — Modification de l’indice

**Étant donné** qu’un indice climatique est sélectionné,  
**Quand** l’utilisateur sélectionne un autre indice,  
**Alors** le nouvel indice remplace l’ancien indice actif,  
**Et** les résultats existants sont recalculés, supprimés ou invalidés selon la règle produit retenue.

### TA-008-04 — Indice indisponible pour le scénario

**Étant donné** qu’un indice n’est pas disponible pour le scénario sélectionné,  
**Quand** l’utilisateur tente de sélectionner ou d’utiliser cet indice,  
**Alors** un message explicite indique que l’indice n’est pas disponible pour le scénario choisi.

---

## US-009 — Afficher la couche climatique associée à un indice

### TA-009-01 — Affichage d’une couche climatique

**Étant donné** qu’un scénario et un indice climatique sont sélectionnés,  
**Quand** la couche climatique est activée ou prévue par le comportement produit,  
**Alors** la couche climatique correspondant au scénario et à l’indice est affichée sur la carte.

### TA-009-02 — Lisibilité du réseau avec une couche climatique

**Étant donné** qu’une couche climatique est affichée,  
**Quand** le réseau ferroviaire national est également affiché,  
**Alors** le réseau reste lisible au-dessus ou à travers la couche climatique.

### TA-009-03 — Affichage d’une légende

**Étant donné** qu’une couche climatique colorée est affichée,  
**Quand** l’utilisateur consulte la carte,  
**Alors** une légende permet de comprendre la signification des couleurs si cette couche est incluse dans la version testée.

---

# EPIC 5 — Croisement des données infrastructure / climat

## US-010 — Activer ou désactiver le croisement des données

### TA-010-01 — Affichage du champ de croisement

**Étant donné** que le panneau droit est visible,  
**Quand** l’utilisateur consulte la zone d’analyse,  
**Alors** le champ "Croiser les données ?" est visible.

### TA-010-02 — Sélection de l’option Oui

**Étant donné** que le champ "Croiser les données ?" est visible,  
**Quand** l’utilisateur sélectionne "Oui",  
**Alors** le mode croisement est activé.

### TA-010-03 — Sélection de l’option Non

**Étant donné** que le mode croisement est activé,  
**Quand** l’utilisateur sélectionne "Non",  
**Alors** aucune analyse croisée n’est lancée,  
**Et** les couches simples restent consultables.

### TA-010-04 — Croisement sans infrastructure

**Étant donné** que le mode croisement est activé,  
**Et** qu’aucune infrastructure n’est sélectionnée,  
**Quand** l’utilisateur lance l’analyse,  
**Alors** le message "Veuillez sélectionner une infrastructure à analyser." est affiché.

### TA-010-05 — Croisement sans indice

**Étant donné** que le mode croisement est activé,  
**Et** qu’aucun indice climatique n’est sélectionné,  
**Quand** l’utilisateur lance l’analyse,  
**Alors** le message "Veuillez sélectionner un indice climatique." est affiché.

---

## US-011 — Identifier les infrastructures exposées

### TA-011-01 — Identification des infrastructures exposées

**Étant donné** qu’une infrastructure, un scénario, un indice et un seuil valide sont sélectionnés,  
**Et** que le croisement est activé,  
**Quand** l’utilisateur clique sur "Afficher",  
**Alors** les infrastructures exposées sont identifiées,  
**Et** elles sont visuellement différenciées des infrastructures non exposées.

### TA-011-02 — Résultat dépendant du seuil

**Étant donné** qu’une analyse a été exécutée avec un seuil donné,  
**Quand** l’utilisateur modifie le seuil et relance l’analyse,  
**Alors** la liste ou l’affichage des infrastructures exposées est mis à jour.

### TA-011-03 — Aucun résultat exposé

**Étant donné** qu’aucune infrastructure ne dépasse le seuil défini,  
**Quand** l’utilisateur lance l’analyse,  
**Alors** un message indique qu’aucune infrastructure ne dépasse le seuil,  
**Et** l’application reste utilisable.

### TA-011-04 — Échec du calcul d’exposition

**Étant donné** qu’un problème technique empêche le calcul d’exposition,  
**Quand** l’utilisateur lance l’analyse,  
**Alors** le message "L’analyse d’exposition n’a pas pu être réalisée." est affiché,  
**Et** les paramètres saisis par l’utilisateur sont conservés.

---

# EPIC 6 — Seuil de risque

## US-012 — Saisir une valeur de seuil

### TA-012-01 — Affichage du champ seuil

**Étant donné** que le panneau droit est visible,  
**Quand** l’utilisateur consulte la section "Seuil de risque",  
**Alors** un champ numérique est visible,  
**Et** un bouton "Afficher" est visible.

### TA-012-02 — Valeur numérique valide

**Étant donné** que le champ seuil est visible,  
**Quand** l’utilisateur saisit une valeur numérique valide,  
**Alors** la valeur est acceptée par le champ.

### TA-012-03 — Valeur non numérique

**Étant donné** que le champ seuil est visible,  
**Quand** l’utilisateur saisit une valeur non numérique et lance l’analyse,  
**Alors** le message "Le seuil doit être une valeur numérique." est affiché.

### TA-012-04 — Champ seuil vide

**Étant donné** que le champ seuil est vide,  
**Quand** l’utilisateur clique sur "Afficher",  
**Alors** le message "Veuillez saisir une valeur de seuil." est affiché.

### TA-012-05 — Valeur hors bornes connues

**Étant donné** qu’un indice possède des bornes fonctionnelles connues,  
**Quand** l’utilisateur saisit une valeur hors bornes,  
**Alors** un message indique que la valeur saisie est hors des limites autorisées pour l’indice sélectionné.

---

## US-013 — Afficher les infrastructures dépassant le seuil

### TA-013-01 — Lancement de l’analyse avec paramètres complets

**Étant donné** qu’une infrastructure, un scénario, un indice, un mode croisement et un seuil valide sont sélectionnés,  
**Quand** l’utilisateur clique sur "Afficher",  
**Alors** l’analyse est lancée,  
**Et** la carte est mise à jour sans rechargement complet de la page.

### TA-013-02 — Mise en évidence des infrastructures à risque

**Étant donné** qu’une ou plusieurs infrastructures dépassent le seuil,  
**Quand** l’analyse est terminée,  
**Alors** ces infrastructures sont mises en évidence avec un style de risque.

### TA-013-03 — Atténuation ou masquage des infrastructures non exposées

**Étant donné** qu’une analyse est exécutée,  
**Quand** des infrastructures ne dépassent pas le seuil,  
**Alors** ces infrastructures sont masquées ou affichées avec un style atténué selon la décision UX retenue.

---

# EPIC 7 — Aide, guidage et compréhension

## US-014 — Afficher une aide via l’icône information

### TA-014-01 — Ouverture de l’aide

**Étant donné** que l’icône d’information est visible près du titre,  
**Quand** l’utilisateur clique sur cette icône,  
**Alors** une infobulle ou une modale d’aide s’affiche.

### TA-014-02 — Contenu de l’aide

**Étant donné** que l’aide est ouverte,  
**Quand** l’utilisateur lit le contenu,  
**Alors** l’aide présente l’objectif de l’application, les scénarios climatiques, le croisement de données et le seuil de risque.

### TA-014-03 — Fermeture de l’aide

**Étant donné** que l’aide est ouverte,  
**Quand** l’utilisateur ferme l’aide,  
**Alors** l’aide disparaît,  
**Et** les filtres et couches affichées restent inchangés.

---

## US-015 — Afficher des messages d’erreur et d’accompagnement

### TA-015-01 — Message pour scénario manquant

**Étant donné** qu’aucun scénario n’est sélectionné,  
**Quand** l’utilisateur lance une analyse nécessitant un scénario,  
**Alors** le message "Veuillez sélectionner un scénario climatique." est affiché.

### TA-015-02 — Message pour infrastructure manquante

**Étant donné** qu’aucune infrastructure n’est sélectionnée,  
**Quand** l’utilisateur lance un croisement,  
**Alors** le message "Veuillez sélectionner une infrastructure à analyser." est affiché.

### TA-015-03 — Message pour indice manquant

**Étant donné** qu’aucun indice n’est sélectionné,  
**Quand** l’utilisateur lance l’analyse,  
**Alors** le message "Veuillez sélectionner un indice climatique." est affiché.

### TA-015-04 — Disparition du message après correction

**Étant donné** qu’un message d’erreur est affiché,  
**Quand** l’utilisateur corrige le paramètre concerné,  
**Alors** le message disparaît ou n’est plus affiché au prochain lancement valide.

---

# EPIC 8 — Lisibilité, performance et expérience utilisateur

## US-016 — Charger progressivement les données cartographiques

### TA-016-01 — Chargement initial de l’interface

**Étant donné** que l’utilisateur ouvre l’application,  
**Quand** l’application démarre,  
**Alors** le fond de carte et les panneaux de contrôle sont affichés avant ou indépendamment des couches lourdes.

### TA-016-02 — Indicateur de chargement

**Étant donné** qu’une couche ou une analyse prend du temps à charger,  
**Quand** le chargement est en cours,  
**Alors** un indicateur de chargement est affiché à l’utilisateur.

### TA-016-03 — Non-écrasement par une requête obsolète

**Étant donné** que l’utilisateur modifie rapidement plusieurs paramètres,  
**Quand** une ancienne requête se termine après une nouvelle requête,  
**Alors** les résultats affichés correspondent aux paramètres les plus récents.

---

## US-017 — Maintenir la lisibilité des couches superposées

### TA-017-01 — Ordre des couches

**Étant donné** que plusieurs couches sont affichées,  
**Quand** l’utilisateur observe la carte,  
**Alors** l’ordre d’affichage respecte la logique suivante : fond de carte, couche climatique, réseau ferroviaire, infrastructures standard, infrastructures à risque.

### TA-017-02 — Visibilité des infrastructures à risque

**Étant donné** qu’une analyse identifie des infrastructures à risque,  
**Quand** ces infrastructures sont affichées,  
**Alors** elles sont plus visibles que les infrastructures non exposées.

### TA-017-03 — Couleurs compréhensibles

**Étant donné** que des styles de risque sont utilisés,  
**Quand** l’utilisateur consulte la carte,  
**Alors** les couleurs permettent de distinguer les niveaux ou statuts affichés,  
**Et** les informations importantes ne reposent pas uniquement sur la couleur si une alternative textuelle est prévue.

---

# EPIC 9 — Résultats d’analyse

## US-018 — Afficher un résumé des résultats

### TA-018-01 — Affichage du résumé après analyse

**Étant donné** qu’une analyse a été exécutée,  
**Quand** les résultats sont disponibles,  
**Alors** un résumé peut afficher le nombre total d’infrastructures analysées, le nombre d’infrastructures à risque, le scénario, l’indice et le seuil utilisés.

### TA-018-02 — Mise à jour du résumé

**Étant donné** qu’un résumé est affiché,  
**Quand** l’utilisateur modifie un paramètre et relance l’analyse,  
**Alors** le résumé est mis à jour avec les nouveaux résultats.

---

## US-019 — Consulter le détail d’une infrastructure

### TA-019-01 — Ouverture du détail d’une infrastructure

**Étant donné** qu’une infrastructure est visible sur la carte,  
**Quand** l’utilisateur clique sur cette infrastructure,  
**Alors** une pop-up ou un panneau de détail s’ouvre si cette fonctionnalité est incluse dans la version testée.

### TA-019-02 — Contenu du détail d’une infrastructure

**Étant donné** que le détail d’une infrastructure est ouvert,  
**Quand** l’utilisateur consulte le contenu,  
**Alors** le détail affiche les informations disponibles : identifiant, type, localisation, scénario actif, indice actif, valeur climatique, seuil appliqué et statut à risque ou non à risque.

### TA-019-03 — Fermeture du détail

**Étant donné** qu’un détail d’infrastructure est ouvert,  
**Quand** l’utilisateur ferme le détail,  
**Alors** le détail disparaît,  
**Et** les couches cartographiques restent inchangées.

---

# EPIC 10 — Accessibilité

## US-020 — Utiliser les principaux contrôles au clavier

### TA-020-01 — Accès clavier aux champs principaux

**Étant donné** que l’utilisateur navigue au clavier,  
**Quand** l’utilisateur utilise la touche Tab,  
**Alors** les principaux champs et boutons deviennent accessibles dans un ordre logique.

### TA-020-02 — Activation clavier des boutons

**Étant donné** qu’un bouton a le focus clavier,  
**Quand** l’utilisateur appuie sur Entrée ou Espace,  
**Alors** l’action associée au bouton est déclenchée.

### TA-020-03 — Focus visible

**Étant donné** que l’utilisateur navigue au clavier,  
**Quand** un champ ou bouton reçoit le focus,  
**Alors** le focus est visuellement identifiable.

### TA-020-04 — Libellés accessibles

**Étant donné** que l’utilisateur utilise une technologie d’assistance,  
**Quand** l’utilisateur parcourt les champs de formulaire,  
**Alors** chaque champ possède un libellé compréhensible.

---

# 3. Scénarios d’acceptance transverses MVP

## TA-MVP-001 — Parcours nominal complet

**Étant donné** que l’utilisateur ouvre l’application,  
**Quand** l’utilisateur sélectionne une catégorie d’infrastructure, sélectionne un scénario climatique, sélectionne un indice, active le croisement, saisit un seuil valide et clique sur "Afficher",  
**Alors** les infrastructures dépassant le seuil sont mises en évidence sur la carte,  
**Et** aucun message d’erreur bloquant n’est affiché.

## TA-MVP-002 — Parcours avec paramètres incomplets

**Étant donné** que l’utilisateur n’a pas renseigné tous les paramètres nécessaires,  
**Quand** l’utilisateur clique sur "Afficher",  
**Alors** l’analyse ne démarre pas,  
**Et** un ou plusieurs messages indiquent les paramètres à compléter.

## TA-MVP-003 — Nettoyage après analyse

**Étant donné** qu’un résultat d’analyse est affiché,  
**Quand** l’utilisateur clique sur "Nettoyer la carte",  
**Alors** la carte revient à un état neutre,  
**Et** les résultats temporaires sont supprimés.

## TA-MVP-004 — Changement de scénario après analyse

**Étant donné** qu’une analyse est affichée pour un scénario donné,  
**Quand** l’utilisateur sélectionne un autre scénario,  
**Alors** le système recalcule, supprime ou invalide explicitement les résultats précédents.

## TA-MVP-005 — Cohérence entre carte et paramètres actifs

**Étant donné** que des résultats sont affichés,  
**Quand** l’utilisateur consulte les paramètres actifs,  
**Alors** les résultats visibles correspondent au scénario, à l’indice, à l’infrastructure et au seuil actuellement sélectionnés.

---

# 4. Données de test recommandées

## Jeux de données minimum

Pour exécuter les tests d’acceptance, prévoir au minimum :

- Une couche réseau ferroviaire avec plusieurs lignes visibles.
- Au moins deux catégories d’infrastructures disponibles.
- Au moins une catégorie d’infrastructures avec plusieurs objets.
- Au moins un scénario de référence.
- Au moins un horizon futur.
- Au moins deux indices climatiques.
- Des valeurs climatiques permettant :
  - un cas avec infrastructures dépassant le seuil ;
  - un cas sans infrastructure dépassant le seuil ;
  - un cas d’indice indisponible ;
  - un cas de chargement impossible ou simulé.

## Exemples de valeurs utiles

- Seuil valide bas : permet d’obtenir plusieurs infrastructures à risque.
- Seuil valide haut : permet d’obtenir zéro infrastructure à risque.
- Valeur vide : permet de tester la validation du champ seuil.
- Valeur non numérique : permet de tester la validation de type.
- Valeur hors bornes : permet de tester les contrôles métier si les bornes sont connues.

---

# 5. Definition of Ready pour exécuter les tests

Les tests d’acceptance peuvent être exécutés lorsque :

- l’environnement de test est disponible ;
- la carte se charge ;
- les données minimum sont intégrées ;
- les scénarios climatiques sont configurés ;
- les indices climatiques sont configurés ;
- les messages d’erreur attendus sont définis ;
- les règles de seuil sont documentées ;
- les critères de style des couches sont connus.

---

# 6. Definition of Done acceptance

Une User Story est acceptée lorsque :

- tous les tests d’acceptance associés à la User Story sont passés ;
- les tests de non-régression principaux du MVP sont passés ;
- les messages utilisateur sont compréhensibles ;
- aucun comportement bloquant n’est observé sur le parcours nominal ;
- les résultats affichés sont cohérents avec les paramètres sélectionnés ;
- les anomalies critiques ou majeures sont corrigées ou arbitrées.
