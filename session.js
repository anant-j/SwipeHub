const tinderContainer = document.querySelector('.tinder');
const allCards = document.querySelectorAll('.tinder--card');
const nope = document.getElementById('nope');
const love = document.getElementById('love');
const globalHammerTime = {};
let globalLikeBuffer = new Set();
let globalSwipesBuffer = new Set();
let totalSwipes = 0;
let numMatches = 0;
let lastSwipe = 0;
let pauseMessage = false;

if (sessionId === null || userId === null) {
  document.location.href = './index.html';
  javascriptAbort();
}

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
  globalLikeBuffer.add(card.id);
  globalSwipesBuffer.add(card.id);
  totalSwipes += 1;
  lastSwipe = now;
  document.getElementById(
      'userSwipesPlaceholder',
  ).innerHTML = `Your Total Swipes: ${totalSwipes}`;
  hammertimeFirstOnly();
}
function leftSwipe() {
  const now = new Date();
  const cards = document.querySelectorAll('.tinder--card.removed');
  const card = cards[cards.length - 1];
  document.getElementById(`${card.id}`).className = '.tinder--card removed';
  globalSwipesBuffer.add(card.id);
  totalSwipes += 1;
  lastSwipe = now;
  document.getElementById(
      'userSwipesPlaceholder',
  ).innerHTML = `Your Total Swipes: ${totalSwipes}`;
  hammertimeFirstOnly();
}

function addMovieCard(imgurl, title, text, mediaId, release, adult) {
  const div = document.createElement('div');
  let isImageValid=true;
  div.id = mediaId;
  if (imgurl == 'http://image.tmdb.org/t/p/originalnull') {
    isImageValid = false;
    imgurl = 'Assets/noImage.png';
  }
  div.innerHTML = `<img id="img${mediaId}" src="${imgurl}">
    <div id="imgDiv${mediaId}">  
    <p class="tinderRel">Released on:<br><b>${release}</b></p>
    <h3 class="tinderH3" id="text${mediaId}"><b>${title}</b></h3>
    <p class="tinderP">${text}</p>
    </div>`;
  div.className = 'tinder--card';
  div.style.display = 'none';
  div.onclick = function() {
    if (document.getElementById(`img${mediaId}`).style.opacity != 0.2 && isCardOnTop(mediaId)) {
      showDetails(mediaId);
    } else if (isImageValid) {
      hideDetails(mediaId);
    }
  };
  document.getElementById('outerCardBody').appendChild(div);
  if (!isImageValid) {
    showDetails(mediaId);
  }
  const image = document.getElementById(`img${mediaId}`);
  image.onload = function() {
    div.style.display = 'block';
  };
  initCards();
  hammertimeFirstOnly();
  // hammertimeEach(document.getElementById(mediaId));
}

function isCardOnTop(mediaId) {
  const newCards = document.querySelectorAll('.tinder--card:not(.removed)');
  return (newCards[0].id == mediaId);
}
function showDetails(mediaId) {
  document.getElementById(`img${mediaId}`).style.opacity = 0.2;
  document.getElementById(`imgDiv${mediaId}`).style.opacity = 100;
}

function hideDetails(mediaId) {
  document.getElementById(`img${mediaId}`).style.opacity = 1;
  document.getElementById(`imgDiv${mediaId}`).style.opacity = 0;
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
  if (
    !(newCards.length == 0) &&
    globalHammerTime[newCards[0].id] === undefined
  ) {
    hammertimeEach(newCards[0]);
    globalHammerTime[newCards[0].id] = true;
    if (newCards.length == 5) {
      addSubsequentCards(newCards.length + removedCards.length);
    }
  }
  if (newCards.length == 0 && removedCards[removedCards.length - 1].id != -1) {
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
        const order = allData.movies.order;
        const swipes = allData.totalSwipes;
        totalSwipes = parseInt(swipes);
        document.getElementById(
            'userSwipesPlaceholder',
        ).innerHTML = `Your Total Swipes: ${totalSwipes}`;
        if (allData.isCreator) {
          document.getElementById('leaveSessionBtn').innerHTML = 'End Session';
        }
        for (let index = 0; index < order.length; index++) {
          const key = order[index];
          addMovieCard(
              data[key]['poster'],
              data[key]['title'],
              data[key]['description'],
              key,
              data[key]['release_date'],
              data[key]['adult'],
          );
        }
        hideLoader();
        poll();
      } else {
        // alert('Cannot load the session');
        storage.removeItem('SwipeHub_sessionId');
        document.location.href = './index.html';
      }
    }
  };
  xhr.ontimeout = function(e) {
    // alert('Cannot load the session');
    storage.removeItem('SwipeHub_sessionId');
    storage.removeItem('SwipeHub_userId');
    document.location.href = './index.html';
  };

  xhr.send(null);
}

joinSession();

function poll() {
  // if no card was swipped
  if (lastSwipe == 0) {
    setTimeout(poll, 5000);
    return;
  }
  const now = new Date();
  const seconds = (now - lastSwipe) / 1000;
  if (seconds > 45) {
    if (!pauseMessage) {
      createAlert(
          'Session is paused. Swipe again to receive session updates',
          'warning',
          7,
      );
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
  const tempLikeBuffer = [];
  globalLikeBuffer.forEach((v) => tempLikeBuffer.push(v));
  const tempSwipesBuffer = [];
  globalSwipesBuffer.forEach((v) => tempSwipesBuffer.push(v));
  const params = `totalSwipes=${tempSwipesBuffer}&likedList=${tempLikeBuffer}&sessionId=${sessionId}&userId=${userId}`;
  xhr.open('POST', `${baseUrl}/polling`, true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const allData = JSON.parse(xhr.responseText);
        const matchData = allData.match;
        const userData = allData.userData;
        if (matchData >= 1 && matchData != numMatches) {
          createAlert(
              `You've got: ${matchData} matches. <a onclick="openPage('match')">Click Here to view them</a>`,
              'success',
              3.5,
          );
          numMatches = matchData;
          document.getElementById(
              'matchTab',
          ).innerHTML = `Matches (${numMatches})`;
        }
        clearUserData();
        for (const [key, value] of Object.entries(userData)) {
          if (key == userId) {
            totalSwipes = parseInt(value);
            document.getElementById(
                'userSwipesPlaceholder',
            ).innerHTML = `Your Total Swipes: ${totalSwipes}`;
          } else {
            addUserData(key, value);
          }
        }
        globalLikeBuffer = removeFromSet(globalLikeBuffer, tempLikeBuffer);
        globalSwipesBuffer = removeFromSet(
            globalSwipesBuffer,
            tempSwipesBuffer,
        );
      } else if (xhr.status === 404) {
        createAlert(
            'This session could not be loaded. It might have been ended by the creator. You will now be redirected to homepage.',
            'danger',
            10,
        );
        setTimeout(function() {
          openPage('home');
        }, 4000);
      } else {
        console.log('Polling failed');
      }
    }
  };

  xhr.send(params);
  setTimeout(poll, 5000);
}

function addUserData(userId, likes) {
  const elem = document.getElementById(`d-${userId}`);
  if (elem != null) {
    elem.remove();
  }
  const divid = document.getElementById(`divider-${userId}`);
  if (divid != null) {
    divid.remove();
  }
  const divider = document.createElement('li');
  divider.id = `divider-${userId}`;
  divider.innerHTML = `<hr class="dropdown-divider">`;
  document.getElementById('sessionInfoDropdown').appendChild(divider);
  const li = document.createElement('li');
  li.id = `d-${userId}`;
  li.innerHTML = `<a class="dropdown-item" id="d-a-${userId}">${userId} : ${likes}</a>`;
  document.getElementById('sessionInfoDropdown').appendChild(li);
}

function clearUserData() {
  const elem = document.getElementById('sessionInfoDropdown');
  if (elem != null) {
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }
  }
}

function addSubsequentCards(totalCards) {
  const xhr = new XMLHttpRequest();
  xhr.open(
      'GET',
      `${baseUrl}/subsequentCards?id=${sessionId}&user=${userId}&totalCards=${totalCards}`,
      true,
  );
  xhr.onload = function() {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const allData = JSON.parse(xhr.responseText);
        const data = allData.movies;
        const order = allData.movies.order;
        console.log(order);
        for (let index = 0; index < order.length; index++) {
          const key = order[index];
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
    }
  };

  xhr.send(null);
}