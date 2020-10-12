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

  axios({
    method: 'post',
    url: 'http://localhost:3000/login',
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    data: { username: username, password: password },
  }).then(res => {
    console.log(res.data);
    JWT_Token = res.data.token;
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
    .catch(err => {
      err.response.status === 401
        ? console.log("You're not authorized to do this")
        : console.error("Server error!", err);
    });
}
