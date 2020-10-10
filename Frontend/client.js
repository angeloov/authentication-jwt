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
  });
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
    .then(d => d.json())
    .then(res => {
      console.log(res);
      JWT_Token = res.token;
    });
}

function protectedRequest() {
  fetch('http://localhost:3000/protected', {
    headers: {
      Authorization: JWT_Token,
    },
  })
    .then(d => d.json())
    .then(res => console.log(res));
}
