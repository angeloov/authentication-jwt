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

function protectedRequest() {
  axios({
    url: 'http://localhost:3000/protected',
    headers: {
      Authorization: JWT_Token,
    },
  })
    .then(res => {
      console.log(res.data);
    })
    .catch(err => { // If the access token is expired
      err.response.status === 401
        ? console.log("You're not authorized to do this")
        : console.error('Server error!', err);

      // Refresh the token
      fetch('http://localhost:3000/refresh_token', { 
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => { // Take the new access token
          JWT_Token = data.accessToken.token;
          protectedRequest();
        });
    });
}
