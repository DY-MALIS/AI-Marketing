import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${protocol}://${host}/api/tiktok/callback`;

  if (!code) {
    return new NextResponse("No code provided", { status: 400 });
  }

  try {
    const response = await axios.post(
      "https://open.tiktokapis.com/v2/oauth/token/",
      new URLSearchParams({
        client_key: clientKey!,
        client_secret: clientSecret!,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = response.data;

    const res = new NextResponse(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'TIKTOK_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    });

    res.cookies.set('tiktok_token', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60,
    });

    return res;
  } catch (error: any) {
    console.error("TikTok Auth Error:", error.response?.data || error.message);
    return new NextResponse("Failed to exchange code for token", { status: 500 });
  }
}
