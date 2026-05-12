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
            href="https://torrea.fr/espace-membre/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: T.blue, textDecoration: 'none' }}
          >
            Créer votre compte sur Torrea.fr
          </a>
        </div>
      </div>
    </div>
  )
}
