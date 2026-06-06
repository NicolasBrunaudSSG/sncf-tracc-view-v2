# Backlog MVP — SNCF TRACC View

## 1. Objectif du MVP

Le MVP doit permettre à un utilisateur de :

1. Ouvrir une carte centrée sur la France.
2. Visualiser le réseau ferroviaire national.
3. Sélectionner une catégorie d’infrastructure.
4. Choisir un scénario climatique.
5. Choisir un indice climatique.
6. Activer le croisement des données.
7. Saisir un seuil de risque.
8. Afficher les infrastructures à risque.
9. Nettoyer la carte.
10. Être guidé en cas de paramètres manquants ou incohérents.

---

## 2. Périmètre fonctionnel du MVP

### Inclus dans le MVP

- Carte interactive.
- Zoom et déplacement.
- Affichage du réseau ferroviaire national.
- Activation / désactivation du réseau.
- Sélection d’une catégorie d’infrastructure.
- Affichage des infrastructures sélectionnées.
- Sélection d’un scénario climatique.
- Sélection d’un indice climatique.
- Choix du croisement des données.
- Saisie d’un seuil numérique.
- Détection des infrastructures dépassant le seuil.
- Mise en évidence des infrastructures à risque.
- Nettoyage de la carte.
- Messages d’erreur fonctionnels.

### Hors MVP

- Authentification utilisateur.
- Gestion de profils.
- Export PDF ou CSV.
- Comparaison multi-scénarios.
- Historique des analyses.
- Tableau détaillé des résultats.
- Administration des référentiels.
- Mode édition des données.
- Calculs complexes côté utilisateur.
- Application mobile dédiée.
- Sauvegarde d’une analyse.

---

## 3. Hypothèses MVP

- Les données réseau sont disponibles dans un format exploitable par la carte.
- Les infrastructures disposent d’une géométrie exploitable.
- Les données climatiques sont disponibles pour les scénarios retenus.
- Chaque indice climatique possède une unité ou une règle d’interprétation.
- Le croisement infrastructure / climat peut être effectué via une jointure spatiale ou une valeur pré-calculée.
- Les scénarios affichés sont :
  - Référence.
  - Horizon 2030.
  - Horizon 2050.
  - Horizon 2100.

---

## 4. Découpage recommandé en sprints

---

# Sprint 0 — Cadrage technique et préparation

## Objectif
Préparer l’environnement projet, valider les choix techniques et cadrer les données nécessaires.

## User Stories couvertes
- Pré-requis techniques associés à toutes les stories.

## Tâches
- Choisir la librairie cartographique : Leaflet, Mapbox GL ou OpenLayers.
- Choisir le framework frontend : React, Vue ou autre.
- Définir le format des couches : GeoJSON, vector tiles, raster, API.
- Définir l’ordre d’affichage des couches.
- Identifier les données nécessaires :
  - réseau ferroviaire ;
  - infrastructures ;
  - indices climatiques ;
  - scénarios.
- Définir la structure des objets géographiques.
- Définir les conventions de style cartographique.
- Définir la stratégie de chargement.

## Critères de sortie
- Choix techniques documentés.
- Structure de données validée.
- Première architecture frontend définie.
- Liste des endpoints ou fichiers nécessaires identifiée.

---

# Sprint 1 — Socle cartographique

## Objectif
Mettre en place la carte interactive et les contrôles de base.

## User Stories couvertes
- US-002 — Naviguer dans la carte.

## Fonctionnalités
- Affichage d’une carte plein écran.
- Centrage initial sur la France métropolitaine.
- Contrôles de zoom `+` et `-`.
- Déplacement de la carte.
- Fond cartographique visible.

## Tâches
- Initialiser le composant carte.
- Configurer le centre et le zoom initial.
- Ajouter les contrôles de zoom.
- Gérer les dimensions plein écran.
- Vérifier la compatibilité avec les panneaux flottants.
- Préparer la gestion des couches.

## Critères d’acceptation sprint
- L’utilisateur voit une carte au chargement.
- L’utilisateur peut zoomer.
- L’utilisateur peut dézoomer.
- L’utilisateur peut déplacer la carte.
- La carte reste stable lors du redimensionnement de la fenêtre.

## Dépendances
- Accès au fond de carte.
- Choix de la librairie cartographique validé.

---

# Sprint 2 — Affichage du réseau ferroviaire

## Objectif
Afficher et masquer la couche du réseau national.

## User Stories couvertes
- US-001 — Afficher ou masquer les lignes du réseau national.

## Fonctionnalités
- Panneau gauche.
- Titre "Réseau".
- Checkbox "Lignes du réseau national".
- Couche réseau affichée par défaut.
- Masquage / affichage dynamique du réseau.

## Tâches
- Créer le panneau gauche.
- Ajouter la checkbox réseau.
- Charger la donnée réseau.
- Appliquer le style réseau.
- Brancher l’état de la checkbox sur la visibilité de la couche.
- Gérer les erreurs de chargement.

## Critères d’acceptation sprint
- Le panneau "Réseau" est visible.
- Le réseau national est affiché par défaut.
- La checkbox est cochée par défaut.
- Décocher la checkbox masque le réseau.
- Cocher la checkbox réaffiche le réseau.
- La carte ne se recharge pas complètement lors du changement.

## Dépendances
- Donnée réseau disponible.
- Socle cartographique opérationnel.

---

# Sprint 3 — Sélection et affichage des infrastructures

## Objectif
Permettre à l’utilisateur de choisir une catégorie d’infrastructure et de l’afficher sur la carte.

## User Stories couvertes
- US-004 — Sélectionner une catégorie d’infrastructure.
- US-005 — Visualiser les infrastructures sélectionnées.

## Fonctionnalités
- Menu déroulant "Infrastructures à afficher".
- Options de catégories d’infrastructures.
- Affichage des infrastructures sélectionnées.
- Suppression des infrastructures lorsque la valeur revient à "Sélectionner".

## Tâches
- Ajouter le dropdown infrastructures.
- Définir les options disponibles.
- Charger les données selon la catégorie.
- Définir les styles par type d’infrastructure.
- Afficher les infrastructures sur la carte.
- Gérer le changement de catégorie.
- Gérer le cas "aucune donnée disponible".
- Prévoir un indicateur de chargement.

## Critères d’acceptation sprint
- Le dropdown est visible.
- La valeur par défaut est "Sélectionner".
- La sélection d’une catégorie affiche les objets correspondants.
- Le changement de catégorie remplace les objets affichés.
- Le retour à "Sélectionner" retire les infrastructures.
- Les infrastructures sont distinctes du réseau.

## Dépendances
- Données infrastructures disponibles.
- Sprint 2 terminé.

---

# Sprint 4 — Panneau scénarios climatiques

## Objectif
Mettre en place le panneau droit et la sélection des scénarios climatiques.

## User Stories couvertes
- US-006 — Sélectionner le scénario de référence.
- US-007 — Sélectionner un horizon climatique futur.

## Fonctionnalités
- Panneau droit "Scénarios climatiques".
- Radio bouton "Référence".
- Radio bouton "Horizon 2030".
- Radio bouton "Horizon 2050".
- Radio bouton "Horizon 2100".
- Affichage des sous-textes de réchauffement.

## Tâches
- Créer le panneau droit.
- Ajouter les boutons radio.
- Gérer l’état du scénario actif.
- Afficher les sous-libellés.
- S’assurer qu’un seul scénario est sélectionné.
- Prévoir la réaction au changement de scénario.

## Critères d’acceptation sprint
- Le panneau droit est visible.
- Les quatre scénarios sont visibles.
- L’utilisateur peut sélectionner un seul scénario.
- Le scénario actif est stocké dans l’état applicatif.
- Les sous-textes sont affichés correctement.

## Dépendances
- Design du panneau validé.
- Choix de la valeur par défaut validé.

---

# Sprint 5 — Sélection d’un indice climatique et option de croisement

## Objectif
Permettre à l’utilisateur de sélectionner l’indice climatique et d’activer ou non le croisement.

## User Stories couvertes
- US-008 — Sélectionner un indice climatique.
- US-010 — Activer ou désactiver le croisement des données.

## Fonctionnalités
- Dropdown "Indice à afficher".
- Dropdown "Croiser les données ?".
- Gestion de l’indice actif.
- Gestion du mode de croisement.

## Tâches
- Ajouter le dropdown indice.
- Définir les indices disponibles.
- Ajouter le dropdown de croisement.
- Définir les options "Oui" et "Non".
- Stocker les valeurs dans l’état applicatif.
- Préparer les contrôles de cohérence.
- Prévoir les messages si les paramètres sont incomplets.

## Critères d’acceptation sprint
- Le dropdown indice est visible.
- La valeur par défaut est "Sélectionner".
- Une sélection d’indice est mémorisée.
- Le dropdown croisement est visible.
- L’utilisateur peut choisir "Oui" ou "Non".
- Les valeurs sélectionnées sont disponibles pour l’analyse.

## Dépendances
- Sprint 4 terminé.
- Liste des indices validée.

---

# Sprint 6 — Seuil de risque et lancement de l’analyse

## Objectif
Permettre la saisie d’un seuil et déclencher l’analyse d’exposition.

## User Stories couvertes
- US-012 — Saisir une valeur de seuil.
- US-013 — Afficher les infrastructures dépassant le seuil.
- US-015 — Afficher des messages d’erreur.

## Fonctionnalités
- Champ numérique de seuil.
- Bouton "Afficher".
- Validation des paramètres.
- Messages d’erreur.
- Déclenchement de l’analyse.

## Tâches
- Ajouter le champ seuil.
- Ajouter le bouton "Afficher".
- Valider le format numérique.
- Vérifier la présence d’une infrastructure sélectionnée.
- Vérifier la présence d’un scénario.
- Vérifier la présence d’un indice.
- Vérifier le choix de croisement.
- Lancer l’analyse si tous les paramètres sont valides.
- Afficher les messages d’erreur contextualisés.

## Critères d’acceptation sprint
- Le champ seuil est visible.
- Le bouton "Afficher" est visible.
- Une valeur numérique valide peut être saisie.
- Une valeur invalide déclenche un message.
- Une analyse incomplète déclenche des messages adaptés.
- Le bouton ne provoque pas d’erreur technique en cas de paramètres manquants.

## Dépendances
- Sprint 5 terminé.
- Règles de validation seuil validées.

---

# Sprint 7 — Croisement des données et mise en évidence des risques

## Objectif
Calculer les infrastructures exposées et les afficher clairement sur la carte.

## User Stories couvertes
- US-011 — Identifier les infrastructures exposées.
- US-013 — Afficher les infrastructures dépassant le seuil.
- US-017 — Maintenir la lisibilité des couches superposées.

## Fonctionnalités
- Calcul d’exposition.
- Comparaison avec le seuil.
- Mise en évidence des infrastructures à risque.
- Atténuation ou masquage des infrastructures non exposées.
- Affichage d’un message si aucun résultat.

## Tâches
- Récupérer les infrastructures sélectionnées.
- Récupérer les valeurs climatiques associées.
- Appliquer la règle de seuil.
- Créer une couche résultat.
- Définir le style des objets à risque.
- Définir le style des objets non à risque.
- Mettre à jour la carte.
- Gérer le cas zéro résultat.
- S’assurer de la cohérence avec les paramètres actifs.

## Critères d’acceptation sprint
- Les infrastructures dépassant le seuil sont visibles.
- Les infrastructures à risque sont différenciées visuellement.
- Les résultats changent lorsque le seuil change.
- Les résultats changent lorsque le scénario change.
- Les résultats changent lorsque l’indice change.
- Le cas zéro résultat est correctement géré.

## Dépendances
- Données climatiques disponibles.
- Règle de croisement définie.
- Sprint 6 terminé.

---

# Sprint 8 — Nettoyage de la carte et stabilisation MVP

## Objectif
Finaliser le MVP en permettant à l’utilisateur de réinitialiser la carte et en stabilisant les principaux parcours.

## User Stories couvertes
- US-003 — Nettoyer la carte.
- US-015 — Afficher des messages d’erreur.
- US-016 — Charger progressivement les données cartographiques.

## Fonctionnalités
- Bouton "Nettoyer la carte".
- Réinitialisation des résultats.
- Suppression des messages.
- Nettoyage des couches temporaires.
- Stabilisation des chargements.

## Tâches
- Ajouter le bouton "Nettoyer la carte".
- Définir précisément les éléments réinitialisés.
- Supprimer les couches d’analyse.
- Supprimer les messages d’erreur.
- Conserver ou réinitialiser les filtres selon décision produit.
- Tester les parcours utilisateur principaux.
- Corriger les incohérences d’état.
- Vérifier les performances minimales.

## Critères d’acceptation sprint
- Le bouton est visible.
- Le clic nettoie les résultats d’analyse.
- Le réseau reste affiché si la checkbox est active.
- Les messages disparaissent.
- L’application ne recharge pas toute la page.
- Les principaux parcours MVP sont fonctionnels de bout en bout.

## Dépendances
- Sprints précédents terminés.

---

## 5. Parcours utilisateur MVP de référence

### Parcours nominal

1. L’utilisateur ouvre l’application.
2. La carte s’affiche centrée sur la France.
3. Le réseau ferroviaire national est visible.
4. L’utilisateur sélectionne une catégorie d’infrastructure.
5. Les infrastructures apparaissent sur la carte.
6. L’utilisateur sélectionne un scénario climatique.
7. L’utilisateur sélectionne un indice climatique.
8. L’utilisateur choisit de croiser les données.
9. L’utilisateur saisit un seuil.
10. L’utilisateur clique sur "Afficher".
11. Les infrastructures dépassant le seuil sont mises en évidence.
12. L’utilisateur clique sur "Nettoyer la carte".
13. Les résultats sont supprimés.

### Parcours erreur — indice manquant

1. L’utilisateur sélectionne une infrastructure.
2. L’utilisateur active le croisement.
3. L’utilisateur saisit un seuil.
4. L’utilisateur clique sur "Afficher".
5. Le système affiche : "Veuillez sélectionner un indice climatique."

### Parcours erreur — infrastructure manquante

1. L’utilisateur sélectionne un scénario.
2. L’utilisateur sélectionne un indice.
3. L’utilisateur active le croisement.
4. L’utilisateur saisit un seuil.
5. L’utilisateur clique sur "Afficher".
6. Le système affiche : "Veuillez sélectionner une infrastructure à analyser."

### Parcours erreur — seuil invalide

1. L’utilisateur remplit les paramètres nécessaires.
2. L’utilisateur saisit une valeur non numérique dans le champ seuil.
3. L’utilisateur clique sur "Afficher".
4. Le système affiche : "Le seuil doit être une valeur numérique."

---

## 6. Definition of Done MVP

Une fonctionnalité est considérée comme terminée si :

- Le comportement attendu est implémenté.
- Les critères d’acceptation sont validés.
- Les erreurs fonctionnelles sont gérées.
- L’interface reste utilisable après l’action.
- Le style est cohérent avec le reste de l’application.
- Les composants sont testés sur au moins un navigateur cible.
- Le code est relu.
- Les données affichées sont cohérentes avec les paramètres sélectionnés.
- Aucun rechargement complet non souhaité de la page n’est nécessaire.
- Les messages utilisateur sont compréhensibles.

---

## 7. Risques projet MVP

### Risque 1 — Disponibilité des données climatiques
Les indices climatiques peuvent ne pas être disponibles pour tous les horizons.

### Mitigation
Prévoir des messages d’indisponibilité et désactiver les options non compatibles.

### Risque 2 — Performance cartographique
Le volume d’infrastructures et de lignes peut ralentir l’affichage.

### Mitigation
Prévoir du chargement progressif, du clustering ou des tuiles vectorielles.

### Risque 3 — Complexité du croisement spatial
Le croisement entre infrastructures et données climatiques peut être complexe selon le format des données.

### Mitigation
Définir dès le départ si le croisement est pré-calculé côté backend ou calculé à la volée.

### Risque 4 — Lisibilité des couches
La superposition réseau, climat et infrastructures peut rendre la carte difficile à lire.

### Mitigation
Définir un ordre de couches, des niveaux de transparence et une charte de couleurs.

---

## 8. Priorisation MoSCoW

### Must Have
- Carte interactive.
- Réseau national.
- Sélection infrastructures.
- Scénarios climatiques.
- Indices climatiques.
- Croisement.
- Seuil.
- Résultat à risque.
- Nettoyage.
- Messages d’erreur.

### Should Have
- Couche climatique visuelle.
- Aide utilisateur.
- Chargement progressif.
- Lisibilité avancée des couches.
- Accessibilité clavier.

### Could Have
- Résumé des résultats.
- Pop-up détail infrastructure.
- Export.
- Comparaison multi-scénarios.
- Sauvegarde d’analyse.

### Won’t Have pour le MVP
- Administration complète.
- Authentification.
- Historique utilisateur.
- Application mobile native.
- Workflows de validation.
