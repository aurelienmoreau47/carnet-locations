# Carnet des locations

Application de gestion des réservations des trois appartements : saisie des réservations, calendrier, liste, récap financier. Elle marche sur téléphone et sur ordinateur, et s'installe comme une application.

- **Code** : HTML, CSS et JavaScript, sans outil de compilation. Les fichiers se servent tels quels.
- **Hébergement** : GitHub Pages (gratuit).
- **Données** : Supabase (gratuit), avec connexion par e-mail et mot de passe.
- **Mode démo** : tant que `config.js` est vide, l'appli fonctionne avec des données fictives stockées dans le navigateur.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Page de l'application |
| `app.js` | Toute la logique (écrans, calculs, accès aux données) |
| `styles.css` | Apparence |
| `config.js` | Adresse et clé publique Supabase |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installation sur l'écran d'accueil |
| `supabase/1-schema.sql` | Création de la base (tables, règles de sécurité) |
| `supabase/2-acces.sql` | Qui a accès, et avec quel rôle |
| `.github/workflows/garder-actif.yml` | Empêche la mise en pause de la base gratuite |

## Règles de calcul

- **Nuits** : date de départ moins date d'arrivée. Le jour du départ est libre pour une nouvelle arrivée.
- **Tarif théorique** : moins de 7 nuits → prix à la nuit ; de 7 à 27 nuits → prix « dès 7 nuits » par nuit ; 28 nuits et plus → prix au mois (un mois = 28 à 31 nuits), les nuits en plus au prix « dès 7 nuits ». Il est enregistré au moment de la saisie : changer la grille plus tard ne modifie pas les anciennes réservations.
- **Tarif réel** : saisi à la main. Pour Airbnb, c'est le montant net reçu.
- **Récap** : un séjour à cheval sur deux mois est réparti selon le nombre de nuits passées dans chaque mois.
- **Occupation** : nuits louées ÷ (jours de la période × 3 appartements).

## Mise en ligne (à faire une fois)

### 1. Supabase (la base de données)

1. Créer un compte sur https://supabase.com puis un projet (région : Europe, par exemple Paris). Noter le mot de passe de la base dans un endroit sûr.
2. **SQL Editor > New query** : coller tout `supabase/1-schema.sql`, puis **Run**.
3. **Authentication > Users > Add user > Create new user** : créer le compte de maman, puis celui de papa (e-mail + mot de passe, cocher « Auto Confirm User »).
4. **SQL Editor** : coller `supabase/2-acces.sql`, remplacer les deux adresses par les vraies, puis **Run**.
5. **Authentication > Sign In / Providers** : désactiver « Allow new users to sign up », pour que personne d'autre ne puisse créer de compte.
6. **Project Settings > API** : copier la **Project URL** et la clé publique (**Publishable key**, ou **anon key** dans « Legacy API keys ») dans `config.js`. Ces deux valeurs peuvent être publiques. Ne jamais y mettre la clé `service_role` ni la clé secrète.

### 2. GitHub Pages (l'hébergement)

1. Créer un compte sur https://github.com et un dépôt **public** nommé `carnet-locations` (GitHub Pages gratuit exige un dépôt public ; les données, elles, restent dans Supabase et ne sont pas dans le dépôt).
2. Envoyer le code dans le dépôt.
3. **Settings > Pages** : Source « Deploy from a branch », branche `main`, dossier `/ (root)`.
4. L'adresse de l'appli sera `https://<compte>.github.io/carnet-locations/`.

### 3. Installer l'appli

- **iPhone** : ouvrir l'adresse dans Safari > bouton Partager > « Sur l'écran d'accueil ».
- **Android** : ouvrir l'adresse dans Chrome > menu ⋮ > « Installer l'application ».
- **Ordinateur** : dans Chrome ou Edge, icône « Installer » à droite de la barre d'adresse.

La connexion est demandée une seule fois par appareil.

## Entretien

- **Pause Supabase** : l'offre gratuite suspend un projet resté 7 jours sans activité. La tâche `garder-actif.yml` l'interroge tous les 3 jours. GitHub désactive les tâches planifiées d'un dépôt sans modification depuis 60 jours : il suffit alors de la réactiver dans l'onglet **Actions**. Si le projet est quand même suspendu, le relancer depuis le tableau de bord Supabase (« Restore project »).
- **Sauvegarde** : Réglages > « Exporter toutes les réservations » produit un fichier Excel (CSV). À faire de temps en temps.
- **Ajouter ou retirer un accès** : voir les exemples en bas de `supabase/2-acces.sql`.
- **Mettre à jour l'appli** : modifier les fichiers et les envoyer sur GitHub. Si le code change beaucoup, augmenter le numéro de `CACHE` dans `sw.js` (`carnet-v2`, etc.).
