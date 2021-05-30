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
  store.setItem("SwipeFlix_userId", user_id);

  var xhr = new XMLHttpRequest();
  xhr.open("GET", `${baseUrl}/sessionValid?id=${input_id}`, true);
  // If specified, responseType must be empty string or "text"
  // xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        store.setItem("SwipeFlix_sessionId", input_id);
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

function showLoader(){
  document.getElementById("loading").style.display = "block";
  document.getElementById("outer_container").style.display = "none";
}

function hideLoader(){
  document.getElementById("loading").style.display = "none";
  document.getElementById("outer_container").style.display = "flex";
}

var header = document.getElementById("multiButtonGroup");
var btns = header.getElementsByClassName("genreButton");
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function () {
    // var current = document.getElementsByClassName("active");
    if (this.className.includes("active")) {
      this.className = this.className.replace(" active", "");
    } else {
      this.className += " active";
      // console.log(this.id);
    }
  });
}

function createSession() {
  const input_id = document.getElementById("sessionId").value;
  showLoader();
  var xhr = new XMLHttpRequest();
  const username = document.getElementById("email").value;
  var header = document.getElementById("multiButtonGroup");
  var btns = header.getElementsByClassName("active");
  var categories = "";
  for (var i = 0; i < btns.length; i++) {
    // console.log(btns[i].id);
    categories += btns[i].id + `|`;
  }
  categories = categories.substring(0, categories.length - 1);
  const languages = document.getElementById("language").value;
  var params = `username=${username}&categories=${categories}&languages=${languages}`;
  xhr.open("POST", `${baseUrl}/createSession`, true);

  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  // If specified, responseType must be empty string or "text"
  // xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        store.setItem(
          "SwipeFlix_sessionId",
          JSON.parse(xhr.responseText)["sessionId"]
        );
        store.setItem("SwipeFlix_userId", username);
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
  const sessionId = localStorage.getItem("SwipeFlix_sessionId");
  if (sessionId != null) {
    window.location.href = "./session.html";
  } else {
    alert("Please create or join a session first");
  }
}
