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
  document.getElementById("loading").style.display = "block";
  store.setItem("SwipeFlix_userId", user_id);

  var xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `${baseUrl}/sessionValid?id=${input_id}`,
    true
  );
  // If specified, responseType must be empty string or "text"
  // xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        store.setItem("SwipeFlix_sessionId", input_id);
        document.getElementById("loading").style.display = "none";
        window.location.href = "./session.html";
      } else {
        alert("cannot Join");
        document.getElementById("loading").style.display = "none";
      }
    }
  };

  xhr.send(null);
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
  document.getElementById("loading").style.display = "block";
  document.getElementById("createSessionPage").style.display = "none";

  var xhr = new XMLHttpRequest();
  const username = document.getElementById("email").innerHTML;
  var header = document.getElementById("multiButtonGroup");
  var btns = header.getElementsByClassName("active");
  var categories = "";
  for (var i = 0; i < btns.length; i++) {
    // console.log(btns[i].id);
    categories += btns[i].id + `|`
  }
  categories = categories.substring(0, categories.length - 1);
  const languages = document.getElementById('language').value;
  var params = `username=${username}&categories=${categories}&languages=${languages}`;
  xhr.open(
    "POST",
    `${baseUrl}/createSession`,
    true
  );

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  // If specified, responseType must be empty string or "text"
  // xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        store.setItem(
          "SwipeFlix_sessionId",
          JSON.parse(xhr.responseText)["sessionId"]
        );
        document.getElementById("loading").style.display = "none";
        window.location.href = "./session.html";
      } else {
        alert("cannot Create Session");
        document.getElementById("loading").style.display = "none";
      }
    }
  };

  xhr.send(params);
}


function openSessionPage(){
    const sessionId = localStorage.getItem("SwipeFlix_sessionId");
    if (sessionId != null) {
        window.location.href = "./session.html";
    }
    else{
        alert("Please create or join a session first");
    }      
}