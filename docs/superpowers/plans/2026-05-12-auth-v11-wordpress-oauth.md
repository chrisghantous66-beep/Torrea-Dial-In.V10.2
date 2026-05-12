# Auth V11 — WordPress OAuth + Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un écran de connexion à Torrea Dial-In V11 — les clients se connectent avec leur compte torrea.com (WordPress/WooCommerce) via OAuth 2.0, la session est gérée par Supabase.

**Architecture:** WordPress OAuth Server (plugin WP) sert de fournisseur OAuth. Une Vercel serverless function (`/api/auth/callback`) reçoit le code OAuth, l'échange contre un token WordPress, récupère l'email utilisateur, crée/retrouve l'utilisateur dans Supabase via l'Admin API, puis génère une magic link Supabase pour ouvrir la session. Le client React gère la session via `@supabase/supabase-js`.

**Tech Stack:** React 18, Vite, Supabase JS v2, Vercel Serverless Functions (Node ESM), WP OAuth Server (plugin WordPress)

---

## Prérequis manuels — À faire AVANT de coder

Ces étapes ne sont pas automatisables. Elles doivent être complétées avant de commencer la Task 5.

**A. WordPress — Installer WP OAuth Server**
1. Dans le dashboard WordPress → Extensions → Ajouter → chercher "WP OAuth Server"
2. Installer et activer le plugin (by Justin Greer)
3. Aller dans WordPress admin → OAuth Server → Apps → Add New
4. Remplir :
   - App Name : `Torrea Dial-In`
   - Callback URL : `http://localhost:3000/api/auth/callback` (dev) ET `https://<app-url>.vercel.app/api/auth/callback` (prod)
5. Sauvegarder → copier **Client ID** et **Client Secret**

**B. Supabase — Créer un projet**
1. Aller sur supabase.com → New Project
2. Région : EU (West) de préférence
3. Une fois créé, aller dans Project Settings → API → copier :
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public key**
   - **service_role key** (⚠️ secret — ne jamais exposer dans le code client)
4. Dans Authentication → URL Configuration :
   - Site URL : `https://<app-url>.vercel.app`
   - Additional Redirect URLs : `http://localhost:3000`

---

## Structure des fichiers

```
V11 - Supabase APP/
├── api/
│   └── auth/
│       └── callback.js        ← CRÉER — Vercel function OAuth
├── src/
│   ├── App.jsx                ← COPIER depuis racine, puis MODIFIER
│   ├── main.jsx               ← COPIER depuis racine, puis MODIFIER
│   ├── recipes.js             ← COPIER depuis racine (inchangé)
│   ├── supabase.js            ← CRÉER — client Supabase
│   ├── AuthContext.jsx        ← CRÉER — context session React
│   └── AuthScreen.jsx         ← CRÉER — écran de connexion
├── public/                    ← COPIER depuis racine (inchangé)
├── .env.local                 ← CRÉER — variables locales (gitignored)
├── .gitignore                 ← CRÉER
├── index.html                 ← COPIER depuis racine (inchangé)
├── package.json               ← COPIER depuis racine, puis MODIFIER
├── vercel.json                ← CRÉER — routing SPA + API
└── vite.config.js             ← COPIER depuis racine (inchangé)
```

---

## Task 0 : Initialiser le projet V11

**Files:**
- Create: `V11 - Supabase APP/src/` (tous les fichiers copiés)
- Create: `V11 - Supabase APP/package.json` (modifié)
- Create: `V11 - Supabase APP/.gitignore`

- [ ] **Step 1 : Copier les fichiers source depuis la racine**

```bash
# Depuis C:/Users/chris/torrea-dialin/
cp src/App.jsx "V11 - Supabase APP/src/App.jsx"
cp src/main.jsx "V11 - Supabase APP/src/main.jsx"
cp src/recipes.js "V11 - Supabase APP/src/recipes.js"
cp index.html "V11 - Supabase APP/index.html"
cp vite.config.js "V11 - Supabase APP/vite.config.js"
cp package.json "V11 - Supabase APP/package.json"
cp -r public/ "V11 - Supabase APP/public/"
```

- [ ] **Step 2 : Mettre à jour `package.json` pour ajouter Supabase**

Ouvrir `V11 - Supabase APP/package.json` et remplacer le contenu par :

```json
{
  "name": "torrea-dialin-v11",
  "private": true,
  "version": "11.0.0",
  "type": "module",
  "scripts": {
    "dev": "vercel dev",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.1",
    "vite-plugin-pwa": "^1.2.0"
  }
}
```

> Note : `"dev"` utilise `vercel dev` au lieu de `vite` — cela lance à la fois Vite et les Vercel functions sur le même port (3000).

- [ ] **Step 3 : Créer `.gitignore`**

Créer `V11 - Supabase APP/.gitignore` :

```
node_modules/
dist/
.env.local
.env.*.local
.vercel
```

- [ ] **Step 4 : Installer les dépendances**

```bash
cd "V11 - Supabase APP"
npm install
```

Résultat attendu : `node_modules/@supabase/supabase-js` présent.

- [ ] **Step 5 : Vérifier que l'app de base fonctionne**

```bash
cd "V11 - Supabase APP"
npx vite --port 5174
```

Ouvrir `http://localhost:5174` — l'app Torrea doit s'afficher normalement (sans auth pour l'instant).
Stopper avec Ctrl+C.

- [ ] **Step 6 : Commit**

```bash
cd "C:/Users/chris/torrea-dialin"
git add "V11 - Supabase APP/src/" "V11 - Supabase APP/public/" "V11 - Supabase APP/index.html" "V11 - Supabase APP/package.json" "V11 - Supabase APP/vite.config.js" "V11 - Supabase APP/.gitignore"
git commit -m "feat(V11): init projet avec source V10.2 copiée"
```

---

## Task 1 : Client Supabase

**Files:**
- Create: `V11 - Supabase APP/src/supabase.js`

- [ ] **Step 1 : Créer `src/supabase.js`**

```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 2 : Commit**

```bash
git add "V11 - Supabase APP/src/supabase.js"
git commit -m "feat(V11): client Supabase"
```

---

## Task 2 : AuthContext — gestion de session React

**Files:**
- Create: `V11 - Supabase APP/src/AuthContext.jsx`

- [ ] **Step 1 : Créer `src/AuthContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = chargement en cours, null = non connecté, object = session active
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Récupère la session existante (y compris depuis le hash fragment après OAuth)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
    })

    // Écoute les changements d'état (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  function logout() {
    supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2 : Commit**

```bash
git add "V11 - Supabase APP/src/AuthContext.jsx"
git commit -m "feat(V11): AuthContext — gestion session Supabase"
```

---

## Task 3 : AuthScreen — écran de connexion

**Files:**
- Create: `V11 - Supabase APP/src/AuthScreen.jsx`

- [ ] **Step 1 : Créer `src/AuthScreen.jsx`**

```jsx
import { useState } from 'react'

const T = {
  bg:       '#0f0f12',
  bg2:      '#16161c',
  border:   '#2e2e3e',
  text:     '#e0e0f0',
  textDim:  '#9090b8',
  textMute: '#52526e',
  gold:     '#d4b06a',
  blue:     '#6ab4d4',
  red:      '#d47a7a',
}

function randomState() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function AuthScreen({ errorFromUrl }) {
  const [loading, setLoading] = useState(false)

  function handleLogin() {
    const state = randomState()
    sessionStorage.setItem('oauth_state', state)

    const params = new URLSearchParams({
      client_id:     import.meta.env.VITE_WP_CLIENT_ID,
      redirect_uri:  `${window.location.origin}/api/auth/callback`,
      response_type: 'code',
      scope:         'basic',
      state,
    })

    setLoading(true)
    window.location.href = `${import.meta.env.VITE_WP_SITE_URL}/oauth/authorize?${params}`
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: T.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: T.gold, letterSpacing: '-0.02em', fontFamily: 'Georgia,serif', lineHeight: 1 }}>
          TORREA
        </div>
        <div style={{ fontSize: 9, letterSpacing: '0.55em', color: T.textMute, marginTop: 4 }}>
          DIAL-IN SYSTEM
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: T.bg2,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: 32,
        width: '100%',
        maxWidth: 360,
        textAlign: 'center',
      }}>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Accès réservé
        </div>
        <div style={{ color: T.textDim, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Connecte-toi avec ton compte Torrea pour accéder à l'outil de calibration.
        </div>

        {errorFromUrl && (
          <div style={{
            background: `${T.red}22`,
            border: `1px solid ${T.red}`,
            borderRadius: 8,
            padding: '10px 14px',
            color: T.red,
            fontSize: 13,
            marginBottom: 20,
            lineHeight: 1.4,
          }}>
            {errorFromUrl === 'connection_failed'
              ? 'Connexion échouée. Réessaie ou contacte le support.'
              : 'Une erreur est survenue. Réessaie.'}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px 16px',
            background: loading ? T.textMute : T.gold,
            color: '#0f0f12',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.03em',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Redirection…' : 'Se connecter avec votre compte Torrea'}
        </button>

        <div style={{ color: T.textMute, fontSize: 12, marginTop: 20, lineHeight: 1.5 }}>
          Pas encore client ?{' '}
          <a
            href={import.meta.env.VITE_WP_SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: T.blue, textDecoration: 'none' }}
          >
            Commander sur torrea.com
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Commit**

```bash
git add "V11 - Supabase APP/src/AuthScreen.jsx"
git commit -m "feat(V11): AuthScreen — écran connexion WordPress OAuth"
```

---

## Task 4 : Câbler l'auth dans main.jsx et App.jsx

**Files:**
- Modify: `V11 - Supabase APP/src/main.jsx`
- Modify: `V11 - Supabase APP/src/App.jsx` (lignes 4930–5052)

- [ ] **Step 1 : Modifier `src/main.jsx`**

Remplacer l'intégralité du fichier par :

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './AuthContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

- [ ] **Step 2 : Ajouter les imports auth en haut de `src/App.jsx`**

Trouver la ligne 1 de `src/App.jsx` :
```jsx
import { useState, useEffect, useRef } from 'react'
```

La remplacer par :
```jsx
import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import AuthScreen from './AuthScreen'
```

- [ ] **Step 3 : Ajouter `useAuth()` au début de `App()` — AVANT tous les useState**

Trouver la ligne 4930 de `src/App.jsx` :
```jsx
export default function App() {
  const [darkMode,setDarkMode]=useState(true)
```

La remplacer par :
```jsx
export default function App() {
  const { session, logout } = useAuth()  // ← DOIT être avant tous les useState
  const [darkMode,setDarkMode]=useState(true)
```

> ⚠️ `useAuth()` doit être appelé avant tout `useState` pour respecter les règles React des hooks. Les retours conditionnels (guards) viennent plus bas, APRÈS tous les hooks.

- [ ] **Step 3b : Ajouter les gardes d'auth APRÈS tous les hooks, juste avant le `return` principal**

L'App.jsx a tous ses hooks entre la ligne 4931 et ~5031. Le `return (` principal est à la ligne 5032.

Trouver cette ligne dans `src/App.jsx` :
```jsx
  return (
    <div style={{minHeight:'100vh',backgroundColor:T.bg,color:T.text,fontFamily:'sans-serif',transition:'background-color 0.3s,color 0.3s',
```

Ajouter juste AVANT ce `return (` :
```jsx
  // ── Garde d'authentification (après tous les hooks) ──
  const urlError = new URLSearchParams(window.location.search).get('auth_error')
  if (session === undefined) return null
  if (!session) return <AuthScreen errorFromUrl={urlError} />

  return (
    <div style={{minHeight:'100vh',backgroundColor:T.bg,color:T.text,fontFamily:'sans-serif',transition:'background-color 0.3s,color 0.3s',
```

- [ ] **Step 4 : Ajouter le bouton Déconnexion dans le header**

Trouver le bouton Dark Mode dans `src/App.jsx` (autour de la ligne 5048) :
```jsx
          <button onClick={()=>setDarkMode(d=>!d)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:darkMode?T.bg3:`${T.gold}18`,border:`1px solid ${darkMode?T.border:T.gold+'66'}`,borderRadius:20,cursor:'pointer',color:darkMode?T.textDim:T.gold,fontSize:12,letterSpacing:'0.1em',touchAction:'manipulation',WebkitTapHighlightColor:'transparent',transition:'all 0.2s'}}>
            <span style={{fontSize:16}}>{darkMode?'🌙':'☀️'}</span>
            <span style={{fontWeight:600}}>{darkMode?'Light Mode':'Dark Mode'}</span>
          </button>
```

Remplacer par (on enveloppe dans une colonne pour ajouter le bouton Déconnexion dessous) :
```jsx
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
            <button onClick={()=>setDarkMode(d=>!d)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:darkMode?T.bg3:`${T.gold}18`,border:`1px solid ${darkMode?T.border:T.gold+'66'}`,borderRadius:20,cursor:'pointer',color:darkMode?T.textDim:T.gold,fontSize:12,letterSpacing:'0.1em',touchAction:'manipulation',WebkitTapHighlightColor:'transparent',transition:'all 0.2s'}}>
              <span style={{fontSize:16}}>{darkMode?'🌙':'☀️'}</span>
              <span style={{fontWeight:600}}>{darkMode?'Light Mode':'Dark Mode'}</span>
            </button>
            <button onClick={logout} style={{background:'none',border:'none',cursor:'pointer',color:T.textMute,fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',padding:'2px 4px',touchAction:'manipulation'}}>
              Déconnexion
            </button>
          </div>
```

- [ ] **Step 5 : Commit**

```bash
git add "V11 - Supabase APP/src/main.jsx" "V11 - Supabase APP/src/App.jsx"
git commit -m "feat(V11): intégration AuthContext + AuthScreen dans App"
```

---

## Task 5 : Vercel OAuth callback function

**Files:**
- Create: `V11 - Supabase APP/api/auth/callback.js`

- [ ] **Step 1 : Créer le dossier `api/auth/`**

```bash
mkdir -p "V11 - Supabase APP/api/auth"
```

- [ ] **Step 2 : Créer `api/auth/callback.js`**

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query
  const appUrl = process.env.APP_URL

  // Erreur retournée par WordPress
  if (oauthError) {
    return res.redirect(`${appUrl}?auth_error=${encodeURIComponent(oauthError)}`)
  }

  if (!code) {
    return res.redirect(`${appUrl}?auth_error=missing_code`)
  }

  try {
    // ── 1. Échanger le code contre un access token WordPress ──
    const tokenRes = await fetch(`${process.env.WP_SITE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        client_id:     process.env.WP_CLIENT_ID,
        client_secret: process.env.WP_CLIENT_SECRET,
        redirect_uri:  `${appUrl}/api/auth/callback`,
      }),
    })

    if (!tokenRes.ok) {
      const body = await tokenRes.text()
      console.error('Token exchange error:', tokenRes.status, body)
      return res.redirect(`${appUrl}?auth_error=token_exchange_failed`)
    }

    const { access_token } = await tokenRes.json()

    // ── 2. Récupérer les infos utilisateur WordPress ──
    const meRes = await fetch(`${process.env.WP_SITE_URL}/?oauth=me`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!meRes.ok) {
      console.error('WP user info error:', meRes.status)
      return res.redirect(`${appUrl}?auth_error=user_info_failed`)
    }

    const wpUser = await meRes.json()
    const email = wpUser.user_email
    const wpId  = String(wpUser.ID)
    const name  = wpUser.display_name || wpUser.user_login

    if (!email) {
      console.error('WP user has no email:', wpUser)
      return res.redirect(`${appUrl}?auth_error=no_email`)
    }

    // ── 3. Créer l'utilisateur Supabase si inexistant ──
    const { error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { wp_user_id: wpId, display_name: name },
    })

    // "already been registered" n'est pas une erreur bloquante
    if (createError && !createError.message.includes('already been registered')) {
      console.error('Supabase createUser error:', createError)
      return res.redirect(`${appUrl}?auth_error=supabase_user_failed`)
    }

    // ── 4. Générer un lien de connexion instantané (magic link) ──
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: appUrl },
    })

    if (linkError) {
      console.error('Supabase generateLink error:', linkError)
      return res.redirect(`${appUrl}?auth_error=session_failed`)
    }

    // ── 5. Rediriger vers le lien Supabase → ouvre la session dans l'app ──
    return res.redirect(linkData.properties.action_link)

  } catch (err) {
    console.error('OAuth callback unhandled error:', err)
    return res.redirect(`${appUrl}?auth_error=connection_failed`)
  }
}
```

- [ ] **Step 3 : Commit**

```bash
git add "V11 - Supabase APP/api/"
git commit -m "feat(V11): Vercel function — callback OAuth WordPress → Supabase"
```

---

## Task 6 : Configuration Vercel et variables d'environnement

**Files:**
- Create: `V11 - Supabase APP/vercel.json`
- Create: `V11 - Supabase APP/.env.local`

- [ ] **Step 1 : Créer `vercel.json`**

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

> Cela assure que toutes les routes sauf `/api/*` renvoient `index.html` (comportement SPA).

- [ ] **Step 2 : Créer `.env.local`**

Créer `V11 - Supabase APP/.env.local` avec les vraies valeurs (obtenues aux étapes prérequis) :

```
# Supabase (côté client — préfixe VITE_ obligatoire)
VITE_SUPABASE_URL=https://XXXXXXXXXXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# WordPress OAuth (côté client — le client_id est public, le secret NON)
VITE_WP_SITE_URL=https://torrea.com
VITE_WP_CLIENT_ID=votre-client-id

# Vercel functions — côté serveur uniquement (SANS préfixe VITE_)
SUPABASE_URL=https://XXXXXXXXXXXXXXXX.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
WP_SITE_URL=https://torrea.com
WP_CLIENT_ID=votre-client-id
WP_CLIENT_SECRET=votre-client-secret-confidentiel
APP_URL=http://localhost:3000
```

> ⚠️ `.env.local` est dans `.gitignore` — ces valeurs ne seront jamais commitées.

- [ ] **Step 3 : Commit `vercel.json` uniquement (pas `.env.local`)**

```bash
git add "V11 - Supabase APP/vercel.json"
git commit -m "feat(V11): vercel.json — routing SPA + API"
```

---

## Task 7 : Test local avec `vercel dev`

- [ ] **Step 1 : Installer Vercel CLI (si pas déjà fait)**

```bash
npm install -g vercel
```

Vérifier : `vercel --version` → doit afficher `39.x` ou supérieur.

- [ ] **Step 2 : Se connecter à Vercel**

```bash
vercel login
```

Suivre les instructions dans le terminal.

- [ ] **Step 3 : Lancer `vercel dev`**

```bash
cd "V11 - Supabase APP"
vercel dev
```

Résultat attendu :
```
> Ready! Available at http://localhost:3000
```

Les variables de `.env.local` sont automatiquement chargées. Les Vercel functions (`api/auth/callback.js`) sont accessibles sur le même port.

- [ ] **Step 4 : Vérifier l'écran de connexion**

Ouvrir `http://localhost:3000` dans le navigateur.
→ Doit afficher l'écran "Accès réservé" avec le bouton doré "Se connecter avec votre compte Torrea".
→ L'app principale ne doit PAS être visible (non connecté).

- [ ] **Step 5 : Tester le flux OAuth complet**

Cliquer sur le bouton → doit rediriger vers `https://torrea.com/oauth/authorize?...`.

> Note : Si le WP OAuth Server n'est pas encore configuré avec `http://localhost:3000/api/auth/callback` comme redirect URI, cette étape échouera. Compléter le prérequis A avant cette étape.

Après login sur WordPress → redirection vers `http://localhost:3000/api/auth/callback?code=...`.
→ La function s'exécute → redirige vers le lien Supabase → puis vers `http://localhost:3000`.
→ L'app doit s'afficher, connectée.
→ Le bouton "Déconnexion" doit être visible dans le header.

- [ ] **Step 6 : Tester la déconnexion**

Cliquer sur "Déconnexion" → l'écran de connexion doit réapparaître.
Rafraîchir la page → toujours sur l'écran de connexion (session supprimée).

- [ ] **Step 7 : Tester la persistence de session**

Se reconnecter → fermer et rouvrir l'onglet → l'app doit s'afficher directement (session conservée dans localStorage par Supabase SDK).

---

## Task 8 : Déploiement Vercel

- [ ] **Step 1 : Lier le projet V11 à Vercel**

```bash
cd "V11 - Supabase APP"
vercel link
```

Quand demandé :
- "Set up and deploy?" → Y
- "Which scope?" → ton compte
- "Link to existing project?" → N (créer nouveau)
- "Project name?" → `torrea-dialin-v11`
- "In which directory is your code located?" → `./`
- Framework detected: Vite → confirmer

- [ ] **Step 2 : Configurer les variables d'environnement dans Vercel**

Pour chaque variable, exécuter :

```bash
vercel env add VITE_SUPABASE_URL production
# → entrer la valeur quand demandé

vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_WP_SITE_URL production
vercel env add VITE_WP_CLIENT_ID production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add WP_CLIENT_ID production
vercel env add WP_CLIENT_SECRET production
vercel env add WP_SITE_URL production
vercel env add APP_URL production
# APP_URL = l'URL Vercel finale, ex: https://torrea-dialin-v11.vercel.app
```

> Répéter pour les environnements `preview` et `development` si nécessaire.

- [ ] **Step 3 : Mettre à jour le redirect URI dans WP OAuth Server**

Dans WordPress admin → OAuth Server → l'app "Torrea Dial-In" → ajouter le callback URI de production :
```
https://torrea-dialin-v11.vercel.app/api/auth/callback
```

- [ ] **Step 4 : Mettre à jour Supabase URL Configuration**

Dans Supabase → Authentication → URL Configuration :
- Site URL : `https://torrea-dialin-v11.vercel.app`
- Additional Redirect URLs : ajouter `https://torrea-dialin-v11.vercel.app`

- [ ] **Step 5 : Déployer**

```bash
cd "V11 - Supabase APP"
vercel --prod
```

Résultat attendu :
```
✅ Production: https://torrea-dialin-v11.vercel.app
```

- [ ] **Step 6 : Tester le flux complet en production**

Ouvrir `https://torrea-dialin-v11.vercel.app` → écran de connexion.
Cliquer "Se connecter avec votre compte Torrea" → login WP → app affichée.
Tester déconnexion et persistence de session.

- [ ] **Step 7 : Commit final**

```bash
cd "C:/Users/chris/torrea-dialin"
git add "V11 - Supabase APP/"
git commit -m "feat(V11): authentification WordPress OAuth + Supabase — Phase 1 complète"
```

---

## Résumé des variables d'environnement

| Variable | Où | Valeur exemple |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel + `.env.local` | `https://abcd.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Vercel + `.env.local` | `eyJ...` |
| `VITE_WP_SITE_URL` | Vercel + `.env.local` | `https://torrea.com` |
| `VITE_WP_CLIENT_ID` | Vercel + `.env.local` | `abc123` |
| `SUPABASE_URL` | Vercel uniquement | `https://abcd.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel uniquement | `eyJ...` (⚠️ secret) |
| `WP_CLIENT_ID` | Vercel uniquement | `abc123` |
| `WP_CLIENT_SECRET` | Vercel uniquement | `xyz789` (⚠️ secret) |
| `WP_SITE_URL` | Vercel uniquement | `https://torrea.com` |
| `APP_URL` | Vercel uniquement | `https://torrea-dialin-v11.vercel.app` |
