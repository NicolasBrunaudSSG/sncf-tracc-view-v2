# Wireframe fonctionnel — SNCF TRACC View

## 1. Objectif du wireframe

Ce document décrit l’organisation visuelle et fonctionnelle de l’interface SNCF TRACC View à partir de la capture fournie.  
L’objectif est de fournir une base de conception exploitable par une équipe UX/UI ou une équipe de développement frontend.

---

## 2. Structure générale de l’écran

L’interface est organisée autour d’une carte plein écran avec trois zones principales :

1. Une zone centrale cartographique.
2. Un panneau latéral gauche dédié au réseau et aux infrastructures.
3. Un panneau latéral droit dédié aux scénarios climatiques, indices, croisements et seuils de risque.

Une barre de titre flottante est positionnée en haut au centre de la carte.

---

## 3. Représentation globale

```text
+--------------------------------------------------------------------------------------+
| [+]                                                                                  |
| [-]                         +-------------------------+     +---------------------+   |
|                             |     SNCF TRACC View     |     |  Nettoyer la carte  |   |
|                             +-------------------------+     +---------------------+   |
|                                                                                      |
| +----------------------+                                           +--------------+  |
| |       Réseau         |                                           | Scénarios    |  |
| |                      |                                           | climatiques  |  |
| | [x] Lignes réseau    |                                           |              |  |
| |                      |                                           | ( ) Référence |  |
| | Infrastructures :    |                                           | ( ) 2030     |  |
| | [ Sélectionner  v ]  |                                           | ( ) 2050     |  |
| |                      |                                           | ( ) 2100     |  |
| +----------------------+                                           |              |  |
|                                                                    | Indice       |  |
|                                                                    | [Select v]   |  |
|                                                                    |              |  |
|                                                                    | Croisement   |  |
|                                                                    | [Select v]   |  |
|                                                                    |              |  |
|                                                                    | Seuil risque |  |
|                                                                    | [ 0 ] [OK]   |  |
|                                                                    +--------------+  |
|                                                                                      |
|                         Carte OpenStreetMap + réseau ferroviaire                     |
|                                                                                      |
+--------------------------------------------------------------------------------------+
```

---

## 4. Zone carte

### 4.1 Description

La carte occupe toute la surface de l’écran.  
Elle affiche :
- un fond de carte géographique ;
- les pays et villes visibles ;
- le réseau ferroviaire français ;
- les infrastructures sélectionnées ;
- les couches climatiques éventuelles ;
- les infrastructures exposées à un risque.

### 4.2 Composants visibles

- Contrôle de zoom en haut à gauche :
  - bouton `+`
  - bouton `-`
- Fond cartographique type OpenStreetMap.
- Couche réseau ferroviaire.
- Éventuelles couches d’analyse.
- Panneaux flottants superposés.

### 4.3 Comportements attendus

- L’utilisateur peut déplacer la carte.
- L’utilisateur peut zoomer/dézoomer.
- La carte reste interactive même lorsque les panneaux sont visibles.
- Les panneaux ne doivent pas empêcher la lecture des zones importantes de la carte.
- Les couches doivent s’empiler dans un ordre logique.

### 4.4 Ordre des couches recommandé

1. Fond cartographique.
2. Couche climatique.
3. Réseau ferroviaire.
4. Infrastructures.
5. Infrastructures exposées / à risque.
6. Pop-ups et infobulles.

---

## 5. Header flottant

### 5.1 Position

Le header est centré en haut de la carte.

### 5.2 Contenu

- Titre : `SNCF TRACC View`
- Icône information : `i`

### 5.3 Style

- Fond bleu foncé.
- Texte blanc.
- Coins arrondis.
- Légère ombre portée.
- Hauteur réduite pour ne pas masquer la carte.

### 5.4 Comportement

Au clic sur l’icône information :
- afficher une infobulle ou une modale ;
- expliquer l’objectif de l’outil ;
- expliquer les scénarios climatiques ;
- expliquer les étapes d’analyse ;
- permettre la fermeture de l’aide.

---

## 6. Bouton "Nettoyer la carte"

### 6.1 Position

Le bouton est situé en haut de l’écran, à droite du header central.

### 6.2 Contenu

Libellé : `Nettoyer la carte`

### 6.3 Comportement

Au clic :
- supprimer les résultats d’analyse ;
- masquer les couches temporaires ;
- retirer les infrastructures mises en évidence ;
- réinitialiser les messages ;
- conserver le fond de carte ;
- conserver le réseau si la checkbox réseau est active.

### 6.4 États du bouton

- État normal.
- État hover.
- État actif au clic.
- État désactivé optionnel si aucune donnée temporaire n’est affichée.

---

## 7. Panneau gauche — Réseau

### 7.1 Position

Le panneau gauche est flottant, positionné en haut à gauche, sous les boutons de zoom.

### 7.2 Dimensions indicatives

- Largeur : environ 220 à 260 px.
- Hauteur : ajustée au contenu.
- Marge gauche : environ 15 px.
- Marge haute : environ 60 px.

### 7.3 Style

- Fond blanc.
- Coins arrondis.
- Ombre portée.
- Espacement interne.
- Titre centré.

### 7.4 Contenu

```text
+----------------------------+
|           Réseau           |
|                            |
| [x] Lignes du réseau       |
|     national               |
|                            |
| Infrastructures à afficher |
| [ Sélectionner        v ]  |
|                            |
+----------------------------+
```

### 7.5 Éléments fonctionnels

#### Checkbox "Lignes du réseau national"
- Active ou désactive l’affichage de la couche réseau.
- Cochée par défaut.

#### Dropdown "Infrastructures à afficher"
- Valeur par défaut : `Sélectionner`.
- Options possibles :
  - Gares
  - Ponts
  - Tunnels
  - Postes électriques
  - Dépôts
  - Ouvrages d’art
  - Sections sensibles
  - Sous-stations
  - Zones de maintenance

### 7.6 Comportements

- Une sélection d’infrastructure déclenche le chargement de la couche correspondante.
- Un changement de sélection remplace l’ancienne couche par la nouvelle.
- Le retour à "Sélectionner" masque les infrastructures.
- Si les données ne sont pas disponibles, un message doit être affiché.

---

## 8. Panneau droit — Scénarios climatiques

### 8.1 Position

Le panneau droit est flottant, positionné en haut à droite.

### 8.2 Dimensions indicatives

- Largeur : environ 260 à 320 px.
- Hauteur : ajustée au contenu.
- Scroll interne possible si le contenu dépasse la hauteur disponible.

### 8.3 Style

- Fond blanc.
- Coins arrondis.
- Ombre portée.
- Espacement interne.
- Titres hiérarchisés.

### 8.4 Structure

```text
+--------------------------------+
|      Scénarios climatiques     |
|                                |
| ( ) Référence                  |
|     Période : 1976–2005        |
|                                |
| ( ) Horizon 2030               |
|     Monde +1,5°C / France +2°C |
|                                |
| ( ) Horizon 2050               |
|     Monde +2°C / France +2,7°C |
|                                |
| ( ) Horizon 2100               |
|     Monde +3°C / France +4°C   |
|                                |
|        Indice à afficher       |
| [ Sélectionner            v ]  |
|                                |
| [ Croiser les données ?   v ]  |
|                                |
|          Seuil de risque       |
| Texte explicatif               |
| [ 0 ]              [Afficher]  |
+--------------------------------+
```

---

## 9. Section scénarios climatiques

### 9.1 Options radio

#### Référence
- Libellé : `Référence`
- Sous-texte : `Période de référence : 1976–2005`

#### Horizon 2030
- Libellé : `Horizon 2030`
- Sous-texte : `Monde +1,5°C / France +2°C`

#### Horizon 2050
- Libellé : `Horizon 2050`
- Sous-texte : `Monde +2°C / France +2,7°C`

#### Horizon 2100
- Libellé : `Horizon 2100`
- Sous-texte : `Monde +3°C / France +4°C`

### 9.2 Comportement

- Une seule option radio peut être sélectionnée.
- Une sélection met à jour le scénario actif.
- Le changement de scénario invalide ou met à jour les résultats existants.
- L’utilisateur doit toujours voir clairement le scénario actif.

---

## 10. Section indice climatique

### 10.1 Élément

Menu déroulant :
- label : `Indice à afficher`
- placeholder : `Sélectionner`

### 10.2 Options envisagées

- Température maximale.
- Nombre de jours de forte chaleur.
- Précipitations extrêmes.
- Risque d’inondation.
- Sécheresse.
- Retrait-gonflement des argiles.
- Vent violent.
- Gel.
- Canicule.

### 10.3 Comportement

- L’indice sélectionné devient l’indice actif.
- La couche climatique peut s’afficher sur la carte.
- Le seuil de risque utilise l’unité de l’indice sélectionné.
- Si l’indice n’est pas disponible pour le scénario choisi, afficher un message.

---

## 11. Section croisement des données

### 11.1 Élément

Menu déroulant :
- label implicite ou visible : `Croiser les données ?`
- options :
  - Non
  - Oui

### 11.2 Comportement

Si `Non` :
- l’utilisateur peut visualiser les couches sans analyse croisée.

Si `Oui` :
- le système attend :
  - une infrastructure sélectionnée ;
  - un scénario sélectionné ;
  - un indice sélectionné ;
  - un seuil valide si l’analyse par seuil est demandée.

### 11.3 Messages d’accompagnement

- "Veuillez sélectionner une infrastructure à analyser."
- "Veuillez sélectionner un indice climatique."
- "Veuillez saisir un seuil valide."

---

## 12. Section seuil de risque

### 12.1 Contenu

Titre :
- `Seuil de risque`

Texte explicatif :
- `Indiquez une valeur de seuil concernant l’indice sélectionné pour afficher les infrastructures que vous définissez à risque.`

Champ :
- type numérique ;
- valeur par défaut : `0`.

Bouton :
- libellé : `Afficher`.

### 12.2 Comportement

Au clic sur `Afficher` :
- valider les paramètres ;
- appliquer le seuil ;
- identifier les infrastructures concernées ;
- mettre à jour la carte ;
- afficher éventuellement un résumé des résultats.

### 12.3 États attendus

- Champ vide.
- Champ valide.
- Champ invalide.
- Bouton actif.
- Bouton désactivé optionnel si les paramètres sont incomplets.
- Message d’erreur si nécessaire.

---

## 13. États de l’interface

### État initial

- Carte centrée sur la France.
- Réseau national affiché.
- Aucune infrastructure spécifique sélectionnée.
- Scénario de référence sélectionné ou aucun scénario sélectionné selon décision produit.
- Aucun indice sélectionné.
- Aucun croisement actif.
- Seuil à `0`.
- Aucun résultat d’analyse.

### État infrastructure sélectionnée

- La carte affiche les infrastructures correspondant à la catégorie choisie.
- Le réseau reste visible si activé.
- Aucun résultat de risque n’est affiché tant qu’une analyse n’est pas lancée.

### État analyse prête

Paramètres requis :
- infrastructure sélectionnée ;
- scénario sélectionné ;
- indice sélectionné ;
- croisement activé ;
- seuil valide.

### État analyse exécutée

- Les infrastructures à risque sont mises en évidence.
- Les infrastructures non concernées sont masquées ou atténuées.
- Un message ou résumé indique le nombre de résultats.

### État erreur

Exemples :
- indice manquant ;
- infrastructure manquante ;
- seuil invalide ;
- données indisponibles ;
- erreur de chargement.

---

## 14. Recommandations UI

### Couleurs
- Réseau ferroviaire : bleu foncé.
- Infrastructures standard : bleu, gris ou violet.
- Infrastructures à risque : rouge, orange ou couleur d’alerte.
- Couche climatique : palette progressive avec transparence.

### Lisibilité
- Les panneaux doivent avoir une opacité suffisante.
- La carte doit rester visible.
- Les textes des panneaux doivent être suffisamment contrastés.
- Les messages d’erreur doivent être visibles près des champs concernés.

### Responsive
- Sur écran large : panneaux gauche et droit visibles simultanément.
- Sur écran moyen : conserver les panneaux mais réduire leur largeur.
- Sur mobile ou petit écran : prévoir des panneaux repliables.

---

## 15. Accessibilité

- Tous les champs doivent avoir un libellé.
- Les contrôles doivent être accessibles au clavier.
- Le focus doit être visible.
- Les couleurs ne doivent pas être le seul moyen de comprendre le risque.
- Les messages d’erreur doivent être textuels.
