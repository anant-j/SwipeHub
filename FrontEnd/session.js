const tinderContainer = document.querySelector('.tinder');
const allCards = document.querySelectorAll('.tinder--card');
const nope = document.getElementById('nope');
const love = document.getElementById('love');
const globalHammerTime = {};
let globalLikeBuffer = new Set();
let totalSwipes = 0;
let numMatches = 0;
let lastSwipe = 0;
let pauseMessage = false;

if (sessionId === null || userId === null) {
  document.location.href = './index.html';
  javascriptAbort();
}

document.getElementById('userIdPlaceholder').innerHTML = `User ID: <b>${userId}</b>`;
document.getElementById('sessionIdPlaceholder').innerHTML = `Session ID: <b>${sessionId}</b>`;

function initCards() {
  const newCards = document.querySelectorAll('.tinder--card:not(.removed)');

  newCards.forEach(function(card, index) {
    card.style.zIndex = allCards.length - index;
    card.style.transform =
      'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
    card.style.opacity = (10 - index) / 10;
  });

  tinderContainer.classList.add('loaded');
}

initCards();

function hammertimeEach(el) {
  const hammertime = new Hammer(el);

  hammertime.on('pan', function(event) {
    el.classList.add('moving');
  });

  hammertime.on('pan', function(event) {
    if (event.deltaX === 0) return;
    if (event.center.x === 0 && event.center.y === 0) return;

    tinderContainer.classList.toggle('tinder_love', event.deltaX > 0);
    tinderContainer.classList.toggle('tinder_nope', event.deltaX < 0);

    const xMulti = event.deltaX * 0.03;
    const yMulti = event.deltaY / 80;
    const rotate = xMulti * yMulti;

    event.target.style.transform =
      'translate(' +
      event.deltaX +
      'px, ' +
      event.deltaY +
      'px) rotate(' +
      rotate +
      'deg)';
  });

  hammertime.on('panend', function(event) {
    el.classList.remove('moving');
    tinderContainer.classList.remove('tinder_love');
    tinderContainer.classList.remove('tinder_nope');

    const moveOutWidth = document.body.clientWidth;
    const keep = Math.abs(event.deltaX) < 50 || Math.abs(event.velocityX) < 0.4;

    event.target.classList.toggle('removed', !keep);

    if (keep) {
      event.target.style.transform = '';
    } else {
      const endX = Math.max(
          Math.abs(event.velocityX) * moveOutWidth,
          moveOutWidth,
      );
      const toX = event.deltaX > 0 ? endX : -endX;
      const endY = Math.abs(event.velocityY) * moveOutWidth;
      const toY = event.deltaY > 0 ? endY : -endY;
      const xMulti = event.deltaX * 0.03;
      const yMulti = event.deltaY / 80;
      const rotate = xMulti * yMulti;

      if (event.deltaX > 0) {
        rightSwipe();
      }
      if (event.deltaX < 0) {
        leftSwipe();
      }
      event.target.style.transform =
        'translate(' +
        toX +
        'px, ' +
        (toY + event.deltaY) +
        'px) rotate(' +
        rotate +
        'deg)';
      initCards();
    }
  });
}

function createButtonListener(love) {
  return function(event) {
    const cards = document.querySelectorAll('.tinder--card:not(.removed)');
    const moveOutWidth = document.body.clientWidth * 1.5;

    if (!cards.length) return false;

    const card = cards[0];

    card.classList.add('removed');
    if (love) {
      card.style.transform =
        'translate(' + moveOutWidth + 'px, -100px) rotate(-30deg)';
      tinderContainer.classList.toggle('tinder_love');
      rightSwipe();
      setTimeout(function() {
        tinderContainer.classList.remove('tinder_love');
      }, 1000);
    } else {
      card.style.transform =
        'translate(-' + moveOutWidth + 'px, -100px) rotate(30deg)';
      tinderContainer.classList.toggle('tinder_nope');
      leftSwipe();
      setTimeout(function() {
        tinderContainer.classList.remove('tinder_nope');
      }, 1000);
    }

    initCards();

    event.preventDefault();
  };
}

const nopeListener = createButtonListener(false);
const loveListener = createButtonListener(true);

nope.addEventListener('click', nopeListener);
love.addEventListener('click', loveListener);

function rightSwipe() {
  const now = new Date();
  const cards = document.querySelectorAll('.tinder--card.removed');
  const card = cards[cards.length - 1];
  document.getElementById(`${card.id}`).className = '.tinder--card removed';
  hammertimeFirstOnly();
  globalLikeBuffer.add(card.id);
  totalSwipes += 1;
  lastSwipe = now;
}
function leftSwipe() {
  const now = new Date();
  const cards = document.querySelectorAll('.tinder--card.removed');
  const card = cards[cards.length - 1];
  document.getElementById(`${card.id}`).className = '.tinder--card removed';
  hammertimeFirstOnly();
  totalSwipes += 1;
  lastSwipe = now;
}

function addMovieCard(imgurl, title, text, mediaId, release, adult) {
  const div = document.createElement('div');
  div.id = mediaId;
  let adultResult='';
  if (adult) {
    adultResult = '🔞';
  }
  div.innerHTML = `<img id="img${mediaId}" src="${imgurl}"><p id="rightCard${mediaId}" class="rightCard">Released on:<br><b>${release}</b><br><br><span style="font-size:30px">${adultResult}</span></p>
    <h3 id="text${mediaId}"><u>${title}</u></h3>
    <p>${text}</p>`;
  div.className = 'tinder--card';
  div.onclick = function() {
    if (document.getElementById(`img${mediaId}`).style.display != 'none') {
      document.getElementById(`img${mediaId}`).style.display = 'none';
      document.getElementById(`text${mediaId}`).style.paddingTop = '20px';
      document.getElementById(`rightCard${mediaId}`).style.float = 'none';
      document.getElementById(`rightCard${mediaId}`).style.marginRight = '0px';
    } else {
      document.getElementById(`img${mediaId}`).style.display = 'inline';
      document.getElementById(`rightCard${mediaId}`).style.float = 'right';
      document.getElementById(`text${mediaId}`).style.paddingTop = '10px';
      document.getElementById(`rightCard${mediaId}`).style.marginRight = '30px';
    }
  };
  document.getElementById('outerCardBody').appendChild(div);
  initCards();
  hammertimeFirstOnly();
  // hammertimeEach(document.getElementById(mediaId));
}

function addLastCard() {
  const div = document.createElement('div');
  div.id = '-1';
  div.innerHTML = `<h3 id="text-1"><u>Uh Oh</u></h3>
    <p>Looks like we've run out of choices to show you for this session. <br>Swipe right to see more options or swipe left to quit the session. <br> If you are the session creator, the session will end.</p>`;
  div.className = 'tinder--card';
  document.getElementById('outerCardBody').appendChild(div);
  initCards();
  hammertimeFirstOnly();
}

function hammertimeFirstOnly() {
  const newCards = document.querySelectorAll('.tinder--card:not(.removed)');
  const removedCards = document.getElementsByClassName('.tinder--card removed');
  if (!(newCards.length==0) && globalHammerTime[newCards[0].id] === undefined) {
    hammertimeEach(newCards[0]);
    globalHammerTime[newCards[0].id] = true;
  }
  if (newCards.length==0 && (removedCards[removedCards.length-1].id != -1)) {
    addLastCard();
  }
}

function joinSession() {
  showLoader();
  const xhr = new XMLHttpRequest();
  xhr.open(
      'GET',
      `${baseUrl}/joinSession?id=${sessionId}&user=${userId}`,
      true,
  );
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const allData = JSON.parse(xhr.responseText);
        const data = allData.movies;
        if (allData.isCreator) {
          document.getElementById('leaveSessionBtn').innerHTML = 'End Session';
        }
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            addMovieCard(
                data[key]['poster'],
                data[key]['title'],
                data[key]['description'],
                key,
                data[key]['release_date'],
                data[key]['adult'],
            );
          }
        }
        hideLoader();
        poll();
      } else {
        // alert('Cannot load the session');
        storage.removeItem('Shwiper_sessionId');
        document.location.href = './index.html';
      }
    }
  };
  xhr.ontimeout = function(e) {
    // alert('Cannot load the session');
    storage.removeItem('Shwiper_sessionId');
    document.location.href = './index.html';
  };

  xhr.send(null);
}

joinSession();


function leaveSession() {
  showLoader();
  const xhr = new XMLHttpRequest();
  xhr.open(
      'GET',
      `${baseUrl}/leaveSession?id=${sessionId}&user=${userId}`,
      true,
  );
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
      }
    }
  };
  hideLoader();
  storage.removeItem('Shwiper_sessionId');
  document.location.href = './index.html';

  xhr.send(null);
}

function poll() {
  const now = new Date();
  const seconds = (now - lastSwipe) / 1000;
  if (seconds>45) {
    if (lastSwipe==0) {
      setTimeout(poll, 5000);
      return;
    }
    if (!pauseMessage) {
      createAlert('Session is paused. Swipe again to receive session updates', 'warning', 7);
      pauseMessage = true;
    }
    setTimeout(poll, 5000);
    return;
  }
  if (pauseMessage) {
    createAlert('Session resumed', 'success', 3.5);
  }
  pauseMessage = false;
  const xhr = new XMLHttpRequest();
  const sendBuffer = [];
  globalLikeBuffer.forEach((v) => sendBuffer.push(v));
  const params = `totalSwipes=${totalSwipes}&likedList=${sendBuffer}&sessionId=${sessionId}&userId=${userId}`;
  xhr.open(
      'POST',
      `${baseUrl}/polling`,
      true,
  );
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const allData = JSON.parse(xhr.responseText);
        const matchData = allData.match.length;
        if (matchData>=1 && matchData!=numMatches) {
          createAlert(`You've got: ${matchData} matches. <a href="./matches.html">Click Here to view them</a>`, 'success', 3.5);
          numMatches = matchData;
          document.getElementById('matchTab').innerHTML=`Matches (${numMatches})`;
        }
        console.log(globalLikeBuffer);
        globalLikeBuffer = removeFromSet(globalLikeBuffer, sendBuffer);
      } else {
        console.log('Polling failed');
      }
    }
  };

  xhr.send(params);
  setTimeout(poll, 5000);
}
