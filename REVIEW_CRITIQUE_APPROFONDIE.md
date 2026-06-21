# ANALYSE CRITIQUE APPROFONDIE
## Rapport PFE : "Optimisation de la conception des faisceaux electriques 3D/2D a l'aide de l'intelligence artificielle"
### Auteur : HAJAR HAROUNE | ENSA Oujda | Capgemini Engineering - MG2

---

## I. PROBLEME FONDAMENTAL : LE TITRE EST TROMPEUR

### Le rapport promet de l'IA, il delivre de l'optimisation classique

Le titre contient "a l'aide de l'intelligence artificielle" mais l'algorithme utilise est le **Golden Section Search** (1953, Jack Kiefer). C'est un algorithme de recherche 1D deterministe. Ce n'est PAS :
- Du Machine Learning
- Du Deep Learning
- De l'optimisation metaheuristique
- De l'apprentissage par renforcement
- Ni meme un algorithme genetique

**Verdict :** Le Golden Section Search est une technique de recherche numerique classique. L'appeler "IA" est une erreur scientifique qui peut etre sanctionnee par un jury.

### Pourquoi c'est grave :
1. Le jury ENSA connait la difference entre optimisation numerique et IA
2. Les encadrants Capgemini ont un devoir de rigueur terminologique
3. Cela remet en question la credibilite du reste du rapport

### Comment corriger :
- **Option A :** Changer le titre en "Optimisation de la conception des faisceaux electriques 3D/2D par automatisation et algorithmes d'optimisation"
- **Option B :** Ajouter un VRAI composant IA (cf. Section VIII ci-dessous)

---

## II. ANALYSE MATHEMATIQUE DE L'OPTIMISATION : ERREURS ET LACUNES

### 2.1. La fonction de cout est mal definie

Dans le code (Annexe IV), la fonction de cout est :
```python
def cost(d):
    pos = interp(pts, np.clip(d, 0, total))
    return sum(np.hypot(pos[0]-ex, pos[1]-ey) for ex,ey in endpoints)
```

**Probleme :** Elle calcule la somme des distances EUCLIDIENNES (ligne droite) entre l'epissure et les connecteurs. Or, dans un faisceau reel, les fils ne vont PAS en ligne droite : ils suivent le chemin du bundle (parcours curviligne).

**Impact :** La fonction de cout ne represente pas la realite physique. Le "gain de 39.4 cm" est potentiellement INCORRECT car il confond distance euclidienne et distance le long du faisceau.

**Correction necessaire :** La fonction de cout devrait calculer la distance LE LONG DU BUNDLE (somme des segments entre l'epissure et chaque connecteur, en suivant la topologie du graphe).

### 2.2. L'hypothese d'unimodalite n'est pas verifiee

Le Golden Section Search ne fonctionne que pour les **fonctions unimodales** (un seul minimum). Le rapport affirme que la fonction est unimodale sans aucune demonstration. Or :
- Avec 5 fils connectes a une epissure sur un bundle a geometrie non-lineaire, la somme des longueurs peut avoir PLUSIEURS minima locaux
- Aucun test de convexite n'est effectue

**Correction necessaire :** 
- Soit prouver mathematiquement l'unimodalite (pour des bundles rectilignes c'est trivial, pour des bundles courbes ca ne l'est pas)
- Soit utiliser un algorithme global (simulated annealing, differential evolution)

### 2.3. Les deux epissures convergent vers la MEME position (5.0 cm)

Les resultats (Tableau 22) montrent :
- ECF8 : position initiale 38.2 cm -> position optimale **5.0 cm**
- EM751 : position initiale 27.5 cm -> position optimale **5.0 cm**

Les deux epissures sont "optimisees" vers le meme point ! Cela signifie que la contrainte MIN_SPLICE_GAP = 30 mm n'a probablement PAS ete appliquee correctement, ou que les deux epissures se retrouvent collees l'une a l'autre.

**Questions :**
- Comment deux epissures peuvent-elles etre a la meme position (5.0 cm) si l'ecart minimal est 30 mm ?
- Est-ce que 5.0 cm = le MARGIN_SPLICE = 50 mm ? Si oui, les epissures sont poussees contre la butee, ce qui suggere que le minimum reel est HORS de l'intervalle admissible. L'algorithme ne trouve pas un optimum interieur mais un minimum de frontiere.

### 2.4. Pas d'analyse de sensibilite

Questions sans reponse :
- Que se passe-t-il si la tolerance est a 10^-4 au lieu de 10^-7 ?
- Quelle est la sensibilite du gain par rapport a la geometrie initiale ?
- Le gain est-il robuste face a des incertitudes de +/- 5mm sur les coordonnees ?

---

## III. ANALYSE DES RESULTATS : LE GAIN DE 39.4 CM EST-IL REELLEMENT UN GAIN ?

### 3.1. Certains fils AUGMENTENT considerablement

Tableau 23 montre :
- CM08C : +32.2 cm (augmentation!)
- CM08B : +33.2 cm (augmentation!)

Oui, la somme TOTALE diminue, mais des fils individuels augmentent de plus de 30 cm. Dans l'industrie automobile, chaque fil a un cout individuel. Si un fil de section 2.5 mm^2 augmente alors qu'un fil de section 0.35 mm^2 diminue, le cout peut AUGMENTER meme si la longueur totale diminue.

**Correction necessaire :** La fonction de cout devrait etre PONDEREE par la section (CSA) et/ou le cout au metre de chaque fil :
```
cout_reel = somme(longueur_fil_i * cout_par_metre_fil_i)
```

### 3.2. Absence de verification de faisabilite physique

Deplacer une epissure de 33.2 cm n'est pas anodin dans un vehicule :
- Est-ce que la nouvelle position est accessible pour l'assemblage en usine ?
- Est-ce que l'epissure ne se retrouve pas dans une zone severe (thermique, vibrations) ?
- Est-ce que le rayon de courbure des fils est toujours respecte ?
- Est-ce que la position 5.0 cm depuis le debut du bundle ne tombe pas sur un clip de fixation ?

**Aucune de ces verifications n'est faite.**

### 3.3. Pas de comparaison avec d'autres methodes

| Methode | Avantage | Complexite |
|---------|----------|------------|
| Golden Section Search (utilisee) | Simple, rapide | O(log(1/epsilon)) |
| Force brute (1000 points) | Reference globale | O(n) |
| Algorithme genetique | Multi-objectif, global | O(generations * population) |
| Gradient descent | Rapide si differentiable | O(iterations) |
| Exhaustive + contraintes | Optimal garanti | O(n * contraintes) |

Pourquoi ne pas avoir compare au minimum avec une **recherche exhaustive** sur 1000 points pour verifier que le Golden Section donne le meme resultat ?

---

## IV. ARCHITECTURE LOGICIELLE : CRITIQUE DU CODE

### 4.1. Scripts isoles sans pipeline unifie

Le projet comprend 6 scripts independants :
1. `Extradata.py` - Extraction XML
2. `Visualize2D.py` - Visualisation topologique
3. `Visualize2D_colored.py` - Visualisation colorimetrique
4. `Optimization.py` - Optimisation
5. `extract_3dxml_to_csv.py` - Extraction 3DXML
6. `Visualize3D.py` - Visualisation 3D

**Problemes :**
- Pas de fichier `main.py` ou CLI unifiee
- Pas de fichier `requirements.txt`
- Pas de structure de projet (src/, tests/, data/, output/)
- Chaque script re-parse le XML independamment (duplication)
- Pas de logging (seulement des `print()`)
- Pas de gestion d'erreurs robuste (`try/except` minimal)

### 4.2. Bug potentiel dans le code d'optimisation

```python
for sid, sp in splices.items():
    def cost(d):
        pos = interp(pts, np.clip(d, 0, total))
        return sum(np.hypot(pos[0]-ex, pos[1]-ey) for ex,ey in endpoints)
```

**Probleme de closure en Python :** La variable `endpoints` est capturee par reference dans la boucle. Si `endpoints` change entre les iterations, toutes les fonctions `cost` pointeront vers les memes `endpoints`. C'est un bug classique Python.

### 4.3. Pas de tests

- Zero test unitaire
- Zero test d'integration
- Zero cas de regression
- Comment valider que le parsing XML est correct ?
- Comment valider que l'optimisation donne le bon resultat sur un cas simple ?

---

## V. METHODOLOGIE DMAIC : BIEN APPLIQUEE MAIS INCOMPLTE

### 5.1. Phase "Define" (Chapitre 3) - BONNE

- QQOQCP bien utilise
- AMDEC pertinente avec cotation adaptee au contexte
- Planification coherente

### 5.2. Phase "Measure" - FAIBLE

Les indicateurs (Tableau 13) sont vagues :
- "Temps de conception : 6 a 8 heures" -> Sur quel type de faisceau ? Quelle complexite ?
- "Taux d'erreurs : 10 a 20%" -> Mesurees comment ? Sur quel echantillon ?
- "Nombre moyen d'epissures : 30 a 0" -> Que signifie "0" ici ?

**Pas de donnees statistiques reelles.** Un bon "Measure" aurait necessites :
- Un echantillon de 20+ faisceaux analyses
- Des histogrammes de distribution des erreurs
- Des indicateurs de capabilite processus (Cp, Cpk)

### 5.3. Phase "Analyze" - CORRECTE

Le diagramme Ishikawa est pertinent. Les 5 Pourquoi auraient pu etre plus profonds.

### 5.4. Phase "Improve" - PARTIELLE

L'outil est developpe mais :
- Teste sur UN SEUL faisceau (ARRharness)
- 2 epissures sur potentiellement des dizaines
- Pas de validation croisee sur un second faisceau

### 5.5. Phase "Control" - TRES FAIBLE

La "Phase Controler" ne controle RIEN au sens DMAIC :
- Pas de carte de controle (SPC)
- Pas de plan de surveillance
- Pas de mesure de capabilite du nouveau processus
- La visualisation 3D est presentee comme "controle" mais c'est juste de l'affichage

Un vrai "Control" aurait :
- Compare les longueurs 2D optimisees vs 3D reelles (ecart < 5% ?)
- Mis en place un processus de validation automatique recurent
- Defini des seuils d'alerte si l'ecart depasse une tolerance

---

## VI. STRUCTURE DU RAPPORT : DESEQUILIBRE

### Repartition des pages :

| Chapitre | Pages | Contenu |
|----------|-------|---------|
| Ch.1 : Presentation entreprise | 13 pages | Descriptif (copy-paste plaquette ?) |
| Ch.2 : Etat de l'art | 20 pages | Trop de generalites |
| Ch.3 : Diagnostic DMAIC | 10 pages | Correct |
| Ch.4 : Solutions techniques | 17 pages | COEUR du PFE |

**Probleme :** Le coeur technique (Ch.4) ne represente que 17/85 pages = 20% du rapport. Les chapitres 1 et 2 sont trop longs et contiennent des informations facilement trouvables en ligne (histoire de Capgemini, secteur automobile mondial, definition de Python...).

**Correction :** Ch.1 devrait etre 5 pages max. Ch.2 devrait se concentrer sur l'etat de l'art SPECIFIQUE (articles de recherche sur l'optimisation des faisceaux, pas la definition de Python).

---

## VII. REFERENCES BIBLIOGRAPHIQUES : CRITIQUEMENT INSUFFISANTES

### 7.1. Seulement 14 references

Pour un PFE d'ingenieur, c'est TRES PEU. Un bon rapport devrait avoir 30-50 references, incluant :
- Des articles de recherche recents (IEEE, SAE, ASME)
- Des brevets sur l'optimisation de faisceaux
- Des theses/PFE precedents sur le sujet
- Des normes (ISO, VDA, LV)

### 7.2. References absentes critiques

Aucune reference a :
- **Algorithmes d'optimisation de faisceaux dans la litterature** (il en existe!)
- **Graph theory applied to wire harness routing** (sujet de recherche actif)
- **VDA 4964** (norme KBL mentionnee mais pas citee)
- **ISO 11452** (EMC pour faisceaux)
- **Travaux sur l'optimisation des splices** (IBM Research a publie sur ce sujet)

### 7.3. La reference [14] est suspecte

> Smith, J. et al., "Artificial Intelligence in Automotive Wiring Harness Design," Journal of Automotive Engineering, vol. 45, no. 3, 2024.

Cette reference semble **inventee**. "Smith, J." est generique, et le "Journal of Automotive Engineering" n'existe pas sous ce nom exact (c'est "Proceedings of the Institution of Mechanical Engineers, Part D: Journal of Automobile Engineering"). A verifier.

---

## VIII. COMMENT RENDRE CE PROJET VRAIMENT "IA"

Si l'objectif est de justifier le terme "IA" dans le titre, voici ce qui aurait pu etre fait :

### Option 1 : Optimisation par algorithme genetique (NSGA-II)
```
- Multi-objectif : minimiser longueur + minimiser cout + maximiser accessibilite
- Population de solutions, croisement, mutation
- Front de Pareto des solutions optimales
- C'est deja plus "IA" qu'un Golden Section Search
```

### Option 2 : Apprentissage supervise pour la prediction
```
- Entrainer un modele sur des faisceaux existants (historique MG2)
- Features : nombre de fils, topologie, contraintes
- Target : position optimale des epissures
- Algorithme : Random Forest ou XGBoost
- Prediction instantanee pour un nouveau faisceau
```

### Option 3 : Reinforcement Learning pour le routage
```
- Agent : positionneur d'epissures
- Environnement : le faisceau avec ses contraintes
- Reward : -longueur_totale + bonus_accessibilite
- Avantage : apprend a generaliser sur differents faisceaux
```

### Option 4 : Clustering pour la detection d'anomalies
```
- K-means ou DBSCAN sur les longueurs de fils
- Detection automatique des outliers (fils surdimensionnes)
- Classification des faisceaux par complexite
- Ca justifierait le mot "IA" dans le titre
```

---

## IX. QUESTIONS PIEGES QUE LE JURY POSERA

### Questions techniques :
1. "Votre fonction de cout utilise des distances euclidiennes. Pourquoi pas des distances le long du bundle ?"
2. "Comment justifiez-vous l'hypothese d'unimodalite de votre fonction de cout ?"
3. "Les deux epissures optimisees convergent vers 5.0 cm. N'est-ce pas simplement la butee MARGIN_SPLICE ?"
4. "Si certains fils augmentent de 33 cm, le cout REEL augmente-t-il ou diminue-t-il en tenant compte du prix au metre par section ?"
5. "Pourquoi appelez-vous cela de l'intelligence artificielle ?"
6. "Avez-vous valide que la position optimisee ne tombe pas dans une zone severe du vehicule ?"
7. "Comment generalisez-vous a un faisceau PPL de 500+ fils ?"

### Questions methodologiques :
8. "Votre Phase 'Controler' ne contient aucune carte de controle. Ou est le controle statistique ?"
9. "Vous avez teste sur UN faisceau. Comment validez-vous la reproductibilite ?"
10. "Ou sont vos tests unitaires ? Comment savez-vous que le parsing XML est correct ?"

### Questions de contexte :
11. "Quel est le ROI de cette solution ? 39.4 cm * prix_cuivre * nb_vehicules_par_an = combien ?"
12. "Comment cette solution s'integre-t-elle dans le workflow existant Capital XC -> CATIA ? Est-ce que les ingenieurss doivent changer leur processus ?"
13. "Avez-vous presente cette solution aux equipes de production ? Quel feedback ?"

---

## X. SYNTHESE : NOTE ESTIMEE ET RECOMMANDATIONS

### Grille d'evaluation (estimation jury ENSA) :

| Critere | Poids | Note estimee /20 | Commentaire |
|---------|-------|-------------------|-------------|
| Maitrise du sujet | 20% | 14/20 | Bonne comprehension des faisceaux, faible en maths |
| Qualite technique | 30% | 12/20 | Pipeline fonctionnel mais optimisation naive |
| Rigueur scientifique | 20% | 10/20 | "IA" mal employee, pas de validation statistique |
| Redaction | 15% | 15/20 | Claire, bien structuree, quelques fautes |
| Originalite/Innovation | 15% | 13/20 | Bonne idee d'automatisation, execution partielle |
| **TOTAL** | 100% | **12.6/20** | **Correct mais pas excellent** |

### Pour passer a 16+/20 :

1. **Corriger le titre** (retirer "IA" ou ajouter un vrai composant ML)
2. **Corriger la fonction de cout** (distance le long du bundle, pas euclidienne)
3. **Ajouter une comparaison** avec au moins une autre methode d'optimisation
4. **Tester sur 3+ faisceaux** pour montrer la generalisabilite
5. **Ajouter un vrai "Control"** avec SPC et cartes de controle
6. **Ponderer par le cout reel** (section * prix/metre)
7. **Calculer le ROI industriel** (gain annuel en euros)
8. **Enrichir la bibliographie** (25+ references minimum, avec articles de recherche)

---

## XI. POINTS POSITIFS A VALORISER LORS DE LA SOUTENANCE

Malgre les critiques, ce projet a des qualites reelles :

1. **Pipeline end-to-end fonctionnel** : De l'XML brut a la visualisation 3D, ca marche
2. **Problematique industrielle reelle** : Ce n'est pas un exercice academique
3. **Double competence** : Electrique + informatique (rare en GE)
4. **Maitrise de Python** : Le code est lisible et fonctionnel
5. **Bonne utilisation de DMAIC** : Le cadre methodologique est pertinent
6. **Visualisations de qualite** : Les rendus 2D et 3D sont professionnels
7. **Gestion des formats industriels** : KBL, XML, 3DXML, STP - c'est concret
8. **Automatisation reelle** : Le gain de temps sur l'extraction est indeniable

---

*Analyse realisee le 21 Juin 2026*
*Document a usage interne - preparation de la soutenance*
