# Spec — Système d'authentification Torrea Dial-In (V11)

**Date :** 2026-05-12  
**Version cible :** V11 - Supabase APP  
**Phase :** 1 (WordPress OAuth uniquement)

---

## Contexte

Torrea Dial-In est une PWA React/Vite déployée sur Vercel. Actuellement sans authentification : l'app est accessible à tous, les données sont stockées en `localStorage`. La V11 ajoute un système de contrôle d'accès.

## Objectif

Restreindre l'accès à l'app aux clients ayant un compte sur le site Torrea (WordPress/WooCommerce). L'écran de connexion apparaît au démarrage ; le client se connecte avec ses identifiants Torrea existants.

---

## Architecture

```
Client ouvre l'app
        │
        ▼
  Session Supabase valide ?
    /               \
  non               oui
   │                 │
   ▼                 ▼
AuthScreen        App.jsx (inchangée)
  │
  ▼
[Se connecter avec votre compte Torrea]
  │
  ▼
Redirect → torrea.com/oauth/authorize
  │
  ▼
Client s'identifie sur WordPress
  │
  ▼
WordPress redirect → /api/auth/callback (Vercel function)
  │
  ▼
Vercel function : échange code → token WP → user info
  │
  ▼
Vercel function : crée/récupère l'utilisateur via Supabase Admin API
  │
  ▼
Supabase session retournée au client → App débloquée
```

---

## Composants

### Nouveaux fichiers dans `V11 - Supabase APP/`

| Fichier | Rôle |
|---|---|
| `src/supabase.js` | Client Supabase (URL + anon key) |
| `src/AuthContext.jsx` | Context React : session, logout, état de chargement |
| `src/AuthScreen.jsx` | Écran de connexion — dark theme, bouton WP OAuth |
| `api/auth/callback.js` | Vercel serverless function : échange OAuth + création session Supabase |

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `src/main.jsx` | Envelopper `<App>` avec `<AuthProvider>` |
| `src/App.jsx` | Conditionner l'affichage à la session, ajouter bouton Déconnexion |
| `package.json` | Ajouter `@supabase/supabase-js` |
| `vite.config.js` | Copié tel quel depuis la racine du projet |

---

## Flux OAuth détaillé

1. L'utilisateur clique "Se connecter avec votre compte Torrea"
2. L'app génère un `state` aléatoire (anti-CSRF), le stocke en sessionStorage, redirige vers :
   `https://torrea.com/oauth/authorize?client_id=...&redirect_uri=.../api/auth/callback&response_type=code&state=...`
3. L'utilisateur entre ses identifiants WooCommerce sur torrea.com
4. WordPress redirige vers `/api/auth/callback?code=...&state=...`
5. La Vercel function :
   - Vérifie le `state`
   - Échange le `code` contre un access token (POST vers `/oauth/token` avec client_secret)
   - Appelle l'API WordPress pour obtenir email + identifiant utilisateur
   - Appelle Supabase Admin API : `createUser` (si nouveau) ou récupère l'utilisateur existant
   - Génère un lien de connexion Supabase (`generateLink`) et retourne le token
6. Le client reçoit la session Supabase, `AuthContext` la stocke, l'app s'affiche

---

## Variables d'environnement

| Variable | Où | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel + `.env.local` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Clé publique Supabase |
| `WP_CLIENT_ID` | Vercel uniquement | Client ID de l'app OAuth WordPress |
| `WP_CLIENT_SECRET` | Vercel uniquement | Client Secret (ne JAMAIS exposer côté client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel uniquement | Clé admin Supabase (pour créer des users côté serveur) |
| `APP_URL` | Vercel uniquement | URL publique de l'app (ex: https://dialin.torrea.com) |

> Les variables sans préfixe `VITE_` ne sont accessibles que dans la Vercel function, jamais dans le bundle React.

---

## Prérequis WordPress (actions manuelles)

Avant l'implémentation, l'utilisateur doit :

1. Installer le plugin **WP OAuth Server** sur WordPress (wordpress.org/plugins/oauth2-provider)
2. Dans WordPress admin → OAuth Server → Add New Client :
   - Name : `Torrea Dial-In`
   - Redirect URI : `https://<app-vercel-url>/api/auth/callback`
   - Copier le **Client ID** et **Client Secret** générés
3. Créer un projet Supabase sur supabase.com → récupérer URL + Anon Key + Service Role Key
4. Renseigner toutes les variables d'environnement dans Vercel

---

## Ce qui ne change pas

- Le contenu de `App.jsx` (logique métier, UI, calibration) est inchangé
- Les données `localStorage` (réglages, calibrations) sont préservées
- Les données restent locales à l'appareil (non synchronisées entre devices)

---

## Phase 2 — Email/password (future V12)

Pour ajouter un second mode de connexion (email + mot de passe) :
- Activer l'auth email dans Supabase dashboard
- Ajouter formulaire inscription/connexion dans `AuthScreen.jsx`
- Aucune modification de l'infrastructure OAuth existante

Le temps estimé pour Phase 2 : ~2-3h de développement.

---

## Sécurité

- Le `client_secret` WordPress n'est jamais exposé dans le bundle React (Vercel function uniquement)
- Anti-CSRF via paramètre `state` vérifié côté serveur
- `SUPABASE_SERVICE_ROLE_KEY` accessible uniquement dans la Vercel function
- Sessions Supabase auto-rafraîchies (JWT rotation)
