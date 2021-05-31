store = window.localStorage;
// const baseUrl = "http://localhost:5001/tinder-netflix/us-central1";
const baseUrl = "https://us-central1-tinder-netflix.cloudfunctions.net";

function joiningPage() {
  document.getElementById("initialButtons").style.display = "none";
  document.getElementById("joinSession").style.display = "block";
}

function createSessionPage() {
  document.getElementById("initialButtons").style.display = "none";
  document.getElementById("createSessionPage").style.display = "block";
}

function toHomePage() {
  document.getElementById("initialButtons").style.display = "block";
  document.getElementById("joinSession").style.display = "none";
  document.getElementById("createSessionPage").style.display = "none";
}

function joinSession() {
  const input_id = document.getElementById("sessionId").value;
  const user_id = document.getElementById("userId").value;
  showLoader();
  store.setItem("Shwiper_userId", user_id);

  var xhr = new XMLHttpRequest();
  xhr.open("GET", `${baseUrl}/sessionValid?id=${input_id}`, true);
  // If specified, responseType must be empty string or "text"
  // xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        store.setItem("Shwiper_sessionId", input_id);
        hideLoader();
        window.location.href = "./session.html";
      } else {
        alert("cannot Join");
        hideLoader();
      }
    }
  };

  xhr.send(null);
}

function showLoader() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("outer_container").style.display = "none";
}

function hideLoader() {
  document.getElementById("loading").style.display = "none";
  document.getElementById("outer_container").style.display = "flex";
}

var header = document.getElementById("multiButtonGroup");
var btns = header.getElementsByClassName("genreButton");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    // var current = document.getElementsByClassName("active");
    if (this.className.includes("create_active")) {
      this.className = this.className.replace(" create_active", "");
    } else {
      this.className += " create_active";
      // console.log(this.id);
    }
  });
}

function createSession() {
  console.log("creating session");
  showLoader();
  var xhr = new XMLHttpRequest();
  const username = document.getElementById("email").value;
  var header = document.getElementById("multiButtonGroup");
  var btns = header.getElementsByClassName("create_active");
  var mix = true;
  var movie = true;
  if (document.getElementById("btnradio1").checked) {
    mix = false;
  }
  if (document.getElementById("flexRadioDefault2").checked) {
    movie = false;
  }
  var categories = "";
  for (var i = 0; i < btns.length; i++) {
    if (mix) {
      categories += btns[i].id + `|`;
    }
    else {
      categories += btns[i].id + `,`;
    }
  }
  categories = categories.substring(0, categories.length - 1);
  const languages = document.getElementById("language").value;
  const platform = document.getElementById("platform").value;
  const order = document.getElementById("sort_by").value;
  const region = document.getElementById("region").value;
  var params = `username=${username}&categories=${categories}&languages=${languages}&platform=${platform}&region=${region}&type=${movie}&order=${order}`;
  xhr.open("POST", `${baseUrl}/createSession`, true);

  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  // If specified, responseType must be empty string or "text"
  // xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        store.setItem(
          "Shwiper_sessionId",
          JSON.parse(xhr.responseText)["sessionId"]
        );
        store.setItem("Shwiper_userId", username);
        hideLoader();
        window.location.href = "./session.html";
      } else {
        alert("cannot Create Session");
        hideLoader();
      }
    }
  };

  xhr.send(params);
}

function openSessionPage() {
  const sessionId = localStorage.getItem("Shwiper_sessionId");
  if (sessionId != null) {
    window.location.href = "./session.html";
  } else {
    alert("Please create or join a session first");
  }
}

var words = document.getElementsByClassName('word');
var wordArray = [];
var currentWord = 0;

words[currentWord].style.opacity = 1;
for (var i = 0; i < words.length; i++) {
  splitLetters(words[i]);
}

function changeWord() {
  let isInitialVisible = document.getElementById("initialButtons").style.display != "none";
  if (!isInitialVisible) {
    return;
  }
  var cw = wordArray[currentWord];
  var nw = currentWord == words.length - 1 ? wordArray[0] : wordArray[currentWord + 1];
  for (var i = 0; i < cw.length; i++) {
    animateLetterOut(cw, i);
  }

  for (var i = 0; i < nw.length; i++) {
    nw[i].className = 'letter behind';
    nw[0].parentElement.style.opacity = 1;
    animateLetterIn(nw, i);
  }

  currentWord = (currentWord == wordArray.length - 1) ? 0 : currentWord + 1;
}

function animateLetterOut(cw, i) {
  setTimeout(function () {
    cw[i].className = 'letter out';
  }, i * 80);
}

function animateLetterIn(nw, i) {
  setTimeout(function () {
    nw[i].className = 'letter in';
  }, 340 + (i * 80));
}

function splitLetters(word) {
  var content = word.innerHTML;
  word.innerHTML = '';
  var letters = [];
  for (var i = 0; i < content.length; i++) {
    var letter = document.createElement('span');
    letter.className = 'letter';
    letter.innerHTML = content.charAt(i);
    word.appendChild(letter);
    letters.push(letter);
  }

  wordArray.push(letters);
}

changeWord();
setInterval(changeWord, 4000);
