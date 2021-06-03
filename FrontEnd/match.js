if (sessionId === null || userId === null) {
  document.location.href = './index.html';
  javascriptAbort();
}


function addCard(movieId, imgUrl, title, description, release) {
  const div = document.createElement('div');
  div.id = movieId;
  div.innerHTML = `<div class="card text-white bg-dark h-100 text-center">
  <img src="${imgUrl}" class="card-img-top" style="max-height:50vh; object-fit: contain; margin-top:30px;" alt="...">
  <div class="card-body">
    <h5 class="card-title"><b>${title}</b></h5>
    <p class="card-text">${description}</p>
  </div>
  <div class="card-footer">
    <small class="text-muted">Released on ${release}</small>
  </div>
</div>`;
  div.className = 'col';
  document.getElementById('cardHolder').appendChild(div);
}

function loadMatchData() {
  const xhr = new XMLHttpRequest();
  const params = `sessionId=${sessionId}&userId=${userId}`;
  xhr.open(
      'POST',
      `${baseUrl}/matchPolling`,
      true,
  );
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // showLoader();
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const allData = JSON.parse(xhr.responseText);
        const data = allData.movies;
        if (allData.isCreator) {
          document.getElementById('leaveSessionBtn').innerHTML = 'End Session';
        }
        console.log(data);
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            addCard(key,
                data[key]['poster'],
                data[key]['title'],
                data[key]['description'],
                data[key]['release_date'],
            );
          }
        }
        // hideLoader();
        // poll();
      } else {
        // alert('Cannot load the session');
        storage.removeItem('Shwiper_sessionId');
        document.location.href = './index.html';
      }
    }
  };
  xhr.send(params);
}

loadMatchData();
