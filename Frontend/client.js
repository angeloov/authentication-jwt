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
