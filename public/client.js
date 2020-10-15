let JWT_Token;

function formHandleRegister(e) {
  e.preventDefault();
  let username = document.querySelector('#username-field').value;
  let password = document.querySelector('#password-field').value;

  fetch('http://localhost:3000/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => console.log(data));
}

function formHandleLogin(e) {
  e.preventDefault();
  let username = document.querySelector('#username-field-l').value;
  let password = document.querySelector('#password-field-l').value;

  fetch('http://localhost:3000/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      JWT_Token = data.accessToken;
    });
}

async function protectedRequest() {
  try {
    let protectedCall = await axios({
      url: 'http://localhost:3000/protected',
      headers: {
        Authorization: JWT_Token,
      },
    });
    console.log(protectedCall.data);
  } catch (err) {
    // If access token is expired
    if (err.response.status === 401) {
      // Unauthorized
      // Refresh the token
      (async () => {
        let refreshAccessToken = await fetch('http://localhost:3000/refresh_token', {
          credentials: 'include',
        });
        let newAccessToken = await refreshAccessToken.json();
        console.log(newAccessToken);
        console.log('new access token', newAccessToken.accessToken.token);
        JWT_Token = newAccessToken.accessToken.token;

        protectedRequest(); // Re-attempt request using new access token this time
      })();
    } else console.error('Server error!', err); // If another server error happens
  }
}
