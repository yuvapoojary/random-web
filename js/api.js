const base_url = 'https://random-api1.herokuapp.com/dic_2021/api';

let token = null;

async function callApi(method = 'get', path, data) {
  if (!token) token = localStorage.getItem('token');
  const response = await fetch(`${base_url}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'Authorization': token
    },
    ...(method != 'get' && ({
      body: JSON.stringify(data)
    }))
  });
  if (response.status > 500) return alert('Internal Server Error');
  const json = await response.json();
  if (response.ok) return json;

  json.status = response.status;
  return Promise.reject(json);

};

const request = {
  get: (...args) => callApi('get', ...args),
  post: (...args) => callApi('post', ...args),
  patch: (...args) => callApi('patch', ...args)
};

async function staffLogin(e) {
  e.preventDefault();
  const username = e.target.elements.username.value;
  const password = e.target.elements.password.value;
  request.post('/users/staff/signin', {
      username,
      password
    })
    .then((data) => {
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user_type', 'staff');
      token = data.accessToken;
      window.location.href = 'Staff_Dashboard.html';
    })
    .catch((err) => {
      if (err.status === 400) {
        alert(err.errors[0].message.en);
      };
    });
}

function adminLogin(e) {
  e.preventDefault();
  const username = e.target.elements.username.value;
  const password = e.target.elements.password.value;
  request.post('/users/admin/signin', {
      username,
      password
    })
    .then((data) => {
      localStorage.setItem('user_type', 'admin');
      localStorage.setItem('token', data.accessToken);
      window.location.href = 'Admin_Dashboard.html';
    })
    .catch((err) => {
      if (err.status === 400) {
        alert(err.errors[0].message.en);
      }
    });
};

const appendTeams = (teams) => {
  const table = document.getElementById('Team_table');
  for (const team of teams) {
    const row = table.insertRow();
    row.insertCell(0).innerHTML = team.team_id;
    row.insertCell(1).innerHTML = team.name;
    row.insertCell(2).innerHTML = team.location;
    row.insertCell(3).innerHTML = team.contact;
    row.insertCell(4).innerHTML = '<select><input type="Month" name="" value="2021-11"></select>';
    row.insertCell(5).innerHTML = '<a href="">SELECT</a>'
  }
};

function getTeams() {
  request.get('/users/get_teams')
    .then((data) => {
      appendTeams(data.teams);
    });
}

function addTeam(e) {
  e.preventDefault();
  const body = {};
  for (let i = 0; i < e.target.elements.length; i++) {
    body[e.target.elements[i].getAttribute("name")] = e.target.elements[i].value;
  };
  request.post('/users/add_new_team', body)
    .then((data) => {
      appendTeams([data]);
      Hide();
      alert('Team added successfully')
    });
};