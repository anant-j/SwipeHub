"use strict";

var tinderContainer = document.querySelector(".tinder");
var allCards = document.querySelectorAll(".tinder--card");
var nope = document.getElementById("nope");
var love = document.getElementById("love");
const storage = window.localStorage;
const sessionId = localStorage.getItem("SwipeFlix_sessionId");
const userId = localStorage.getItem("SwipeFlix_userId");
// const baseUrl = "http://localhost:5001/tinder-netflix/us-central1";
const baseUrl = "https://us-central1-tinder-netflix.cloudfunctions.net";

if (sessionId === null || userId === null) {
  window.location.href = "./index.html";
}

document.getElementById("sessionId_placeholder").innerHTML = `Session ID: <b>${sessionId}</b>`;

function initCards(card, index) {
  var newCards = document.querySelectorAll(".tinder--card:not(.removed)");

  newCards.forEach(function (card, index) {
    card.style.zIndex = allCards.length - index;
    card.style.transform =
      "scale(" + (20 - index) / 20 + ") translateY(-" + 30 * index + "px)";
    card.style.opacity = (10 - index) / 10;
  });

  tinderContainer.classList.add("loaded");
}

initCards();

function hammertime_each(el) {
  var hammertime = new Hammer(el);

  hammertime.on("pan", function (event) {
    el.classList.add("moving");
  });

  hammertime.on("pan", function (event) {
    if (event.deltaX === 0) return;
    if (event.center.x === 0 && event.center.y === 0) return;

    tinderContainer.classList.toggle("tinder_love", event.deltaX > 0);
    tinderContainer.classList.toggle("tinder_nope", event.deltaX < 0);

    var xMulti = event.deltaX * 0.03;
    var yMulti = event.deltaY / 80;
    var rotate = xMulti * yMulti;

    event.target.style.transform =
      "translate(" +
      event.deltaX +
      "px, " +
      event.deltaY +
      "px) rotate(" +
      rotate +
      "deg)";
  });

  hammertime.on("panend", function (event) {
    el.classList.remove("moving");
    tinderContainer.classList.remove("tinder_love");
    tinderContainer.classList.remove("tinder_nope");

    var moveOutWidth = document.body.clientWidth;
    var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

    event.target.classList.toggle("removed", !keep);

    if (keep) {
      event.target.style.transform = "";
    } else {
      var endX = Math.max(
        Math.abs(event.velocityX) * moveOutWidth,
        moveOutWidth
      );
      var toX = event.deltaX > 0 ? endX : -endX;
      var endY = Math.abs(event.velocityY) * moveOutWidth;
      var toY = event.deltaY > 0 ? endY : -endY;
      var xMulti = event.deltaX * 0.03;
      var yMulti = event.deltaY / 80;
      var rotate = xMulti * yMulti;

      if (event.deltaX > 0) {
        rightSwipe();
      }
      if (event.deltaX < 0) {
        leftSwipe();
      }
      event.target.style.transform =
        "translate(" +
        toX +
        "px, " +
        (toY + event.deltaY) +
        "px) rotate(" +
        rotate +
        "deg)";
      initCards();
    }
  });
}

function createButtonListener(love) {
  return function (event) {
    var cards = document.querySelectorAll(".tinder--card:not(.removed)");
    var moveOutWidth = document.body.clientWidth * 1.5;

    if (!cards.length) return false;

    var card = cards[0];

    card.classList.add("removed");

    if (love) {
      card.style.transform =
        "translate(" + moveOutWidth + "px, -100px) rotate(-30deg)";
      rightSwipe();
    } else {
      card.style.transform =
        "translate(-" + moveOutWidth + "px, -100px) rotate(30deg)";
      leftSwipe();
    }

    initCards();

    event.preventDefault();
  };
}

var nopeListener = createButtonListener(false);
var loveListener = createButtonListener(true);

nope.addEventListener("click", nopeListener);
love.addEventListener("click", loveListener);

function rightSwipe() {
  var cards = document.querySelectorAll(".tinder--card.removed");
  const card = cards[cards.length - 1];
  console.log("right" + card.id);
}
function leftSwipe() {
  var cards = document.querySelectorAll(".tinder--card.removed");
  const card = cards[cards.length - 1];
  console.log("left" + card.id);
}

function addCard(imgurl, title, text, mediaId, release, adult) {
  var div = document.createElement("div");
  div.id = mediaId;
  let adultResult=""
  if(adult){
    adultResult = "🔞"
  }
  div.innerHTML = `<img id="img${mediaId}" src="${imgurl}"><p id="rightCard${mediaId}" class="rightCard">Released on:<br><b>${release}</b><br><br><span style="font-size:30px">${adultResult}</span></p>
    <h3 id="text${mediaId}"><u>${title}</u></h3>
    <p>${text}</p>`;
  div.className = "tinder--card";
  div.onclick = function () {
    if (document.getElementById(`img${mediaId}`).style.display != "none") {
      document.getElementById(`img${mediaId}`).style.display = "none";
      document.getElementById(`text${mediaId}`).style.paddingTop = "20px";
      document.getElementById(`rightCard${mediaId}`).style.float = "none";
      document.getElementById(`rightCard${mediaId}`).style.marginRight = "0px";
    } else {
      document.getElementById(`img${mediaId}`).style.display = "inline";
      document.getElementById(`rightCard${mediaId}`).style.float = "right";
      document.getElementById(`text${mediaId}`).style.paddingTop = "10px";
      document.getElementById(`rightCard${mediaId}`).style.marginRight = "30px";
    }
  };
  document.getElementById("outerCardBody").appendChild(div);
  initCards();
  hammertime_each(document.getElementById(mediaId));
}

function joinSession() {
  document.getElementById("loading").style.display = "block";

  var xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `${baseUrl}/joinSession?id=${sessionId}&user=${userId}`,
    true
  );
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        for (var key in data) {
          if (data.hasOwnProperty(key)) {
            addCard(
              data[key]["poster"],
              data[key]["title"],
              data[key]["description"],
              key,
              data[key]["release_date"],
              data[key]["adult"]
            );
          }
        }
        document.getElementById("loading").style.display = "none";
      } else {
        alert("Cannot load the session");
        storage.removeItem("SwipeFlix_sessionId");
        window.location.href = "./index.html";
        // document.getElementById("loading").style.display = "none";
      }
    }
  };
  xhr.ontimeout = function (e) {
    alert("Cannot load the session");
    storage.removeItem("SwipeFlix_sessionId");
    window.location.href = "./index.html";
    // XMLHttpRequest timed out. Do something here.
  };
  
  xhr.send(null);
}

joinSession();

