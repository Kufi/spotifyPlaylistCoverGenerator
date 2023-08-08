import React from 'react'
import Login from './Login'
import Dashboard from './Dashboard'


function App() {

  const [authUrl, setAuthUrl] = React.useState('');
  const [token, setToken] = React.useState('');
  
  function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);``
  
    return base64encode(digest);
  }

  const clientId = '406f9bbd333842768f0d5ede66288e10';
  const redirectUri = 'https://zesty-frangollo-8682db.netlify.app/';

  let codeVerifier = generateRandomString(128);
  React.useEffect( () => {
    generateCodeChallenge(codeVerifier).then(codeChallenge => {
      let state = generateRandomString(16);
      let scope = 'user-read-private user-read-email playlist-read-private ugc-image-upload playlist-modify-public playlist-modify-private';
  
      localStorage.setItem('code_verifier', codeVerifier);
  
      let args = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge
      });
      setAuthUrl('https://accounts.spotify.com/authorize?' + args);
    });
  }, [])
  





  const code = new URLSearchParams(window.location.search).get('code')

  if(code) {
    React.useEffect( () => {

      let codeVerifier = localStorage.getItem('code_verifier');
      let body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      });

      fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('HTTP status ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          setToken(data.access_token);
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }, [] )
  }
  
  return(
    <div className='flex flex-col items-center  min-h-screen bg-slate-50 px-10 py-3 '>
      <h1 className='text-5xl font-light self-start'>Spotify Playlist Cover Generator</h1>
      {token ? <Dashboard token={token}/> : <Login authUrl={authUrl} /> }
    </div>
  )
  
}

export default App