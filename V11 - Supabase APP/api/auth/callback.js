import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(req, res) {
  const { code, error: oauthError } = req.query

  // Derive appUrl from the request itself so it always matches the registered redirect_uri
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host  = req.headers['x-forwarded-host'] || req.headers.host
  const appUrl = `${proto}://${host}`

  console.log('[callback] invoked — code:', !!code, '| appUrl:', appUrl)

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
        redirect_uri:  `${appUrl}/auth/callback`,
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

    if (createError && !createError.message.includes('already been registered')) {
      console.error('Supabase createUser error:', createError)
      return res.redirect(`${appUrl}?auth_error=supabase_user_failed`)
    }

    // ── 4. Générer un magic link Supabase pour ouvrir la session ──
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: appUrl },
    })

    if (linkError) {
      console.error('Supabase generateLink error:', linkError)
      return res.redirect(`${appUrl}?auth_error=session_failed`)
    }

    // ── 5. Rediriger vers le lien Supabase → session ouverte dans l'app ──
    return res.redirect(linkData.properties.action_link)

  } catch (err) {
    console.error('OAuth callback unhandled error:', err)
    return res.redirect(`${appUrl}?auth_error=connection_failed`)
  }
}
