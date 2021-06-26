function joinViaLink() {
  if (window.location.href.includes("?join=")) {
    const id = window.location.href.split("=")[1];
    joiningPage();
    document.getElementById("sessionId").readOnly = true;
    document.getElementById("sessionId").value = id;
  }
}

joinViaLink();

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
  const sessionId = document.getElementById("sessionId").value;
  const userId = document.getElementById("joinUserId").value;
  showLoader();

  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${baseUrl}/sessionValid?id=${sessionId}`, true);
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        storage.setItem("SwipeHub_sessionId", sessionId);
        storage.setItem("SwipeHub_userId", userId);
        document.location.href = "./session.html";
        return;
      }
      if (xhr.status === 404) {
        createAlert(
          "The session doesn not exist. Please retry with a valid Session ID.",
          "danger",
          7
        );
        hideLoader();
        return;
      } else {
        createAlert(
          "The session could not be joined. Please try again later.",
          "danger",
          7
        );
        hideLoader();
      }
    }
  };

  xhr.send(null);
}

function createSession() {
  showLoader();
  const xhr = new XMLHttpRequest();
  const username = document.getElementById("createUserId").value;
  const languages = document.getElementById("language").value;
  const platform = document.getElementById("platform").value;
  const order = document.getElementById("sort_by").value;
  const region = document.getElementById("region").value;
  let mix = true;
  let movie = true;
  if (document.getElementById("btnradio1").checked) {
    mix = false;
  }
  if (document.getElementById("flexRadioDefault2").checked) {
    movie = false;
  }
  const header = document.getElementById("multiButtonGroup");
  const btns = header.getElementsByClassName("create_active");
  let categories = "";
  for (let i = 0; i < btns.length; i++) {
    if (mix) {
      categories += btns[i].id + "|";
    } else {
      categories += btns[i].id + ",";
    }
  }
  categories = categories.substring(0, categories.length - 1);
  const params = `username=${username}&categories=${categories}&languages=${languages}&platform=${platform}&region=${region}&type=${movie}&order=${order}`;
  xhr.open("POST", `${baseUrl}/createSession`, true);

  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        storage.setItem(
          "SwipeHub_sessionId",
          JSON.parse(xhr.responseText)["sessionId"]
        );
        storage.setItem("SwipeHub_userId", username);
        document.location.href = "./session.html";
      } else {
        createAlert(
          "The session could not be created. Please try again later",
          "danger",
          7
        );
        hideLoader();
        return;
      }
    }
  };
  xhr.send(params);
}

const words = document.getElementsByClassName("word");
const wordArray = [];
let currentWord = 0;

words[currentWord].style.opacity = 1;
for (let i = 0; i < words.length; i++) {
  splitLetters(words[i]);
}

function changeWord() {
  const isInitialVisible =
    document.getElementById("initialButtons").style.display != "none";
  if (!isInitialVisible) {
    return;
  }
  const cw = wordArray[currentWord];
  const nw =
    currentWord == words.length - 1 ? wordArray[0] : wordArray[currentWord + 1];
  for (let i = 0; i < cw.length; i++) {
    animateLetterOut(cw, i);
  }

  for (let i = 0; i < nw.length; i++) {
    nw[i].className = "letter behind";
    nw[0].parentElement.style.opacity = 1;
    animateLetterIn(nw, i);
  }

  currentWord = currentWord == wordArray.length - 1 ? 0 : currentWord + 1;
}

function animateLetterOut(cw, i) {
  setTimeout(function () {
    cw[i].className = "letter out";
  }, i * 80);
}

function animateLetterIn(nw, i) {
  setTimeout(function () {
    nw[i].className = "letter in";
  }, 340 + i * 80);
}

function splitLetters(word) {
  const content = word.innerHTML;
  word.innerHTML = "";
  const letters = [];
  for (let i = 0; i < content.length; i++) {
    const letter = document.createElement("span");
    letter.className = "letter";
    letter.innerHTML = content.charAt(i);
    word.appendChild(letter);
    letters.push(letter);
  }

  wordArray.push(letters);
}

changeWord();
setInterval(changeWord, 1700);

const header = document.getElementById("multiButtonGroup");
const btns = header.getElementsByClassName("genreButton");
for (let i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    if (this.className.includes("create_active")) {
      this.className = this.className.replace(" create_active", "");
    } else {
      this.className += " create_active";
    }
  });
}
