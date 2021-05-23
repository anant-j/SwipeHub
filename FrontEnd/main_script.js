store = window.localStorage;
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
  document.getElementById("loading").style.display = "block";

  var xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `http://localhost:5001/tinder-netflix/us-central1/sessionValid?id=${input_id}`,
    true
  );
  // If specified, responseType must be empty string or "text"
  // xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        store.setItem("SwipeFlix_sessionId", input_id);
        document.getElementById("loading").style.display = "none";
        window.location.href = "http://127.0.0.1:5500/FrontEnd/session.html";
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
      console.log(this.id);
    }
  });
}


function createSession() {
    const input_id = document.getElementById("sessionId").value;
    document.getElementById("loading").style.display = "block";
    document.getElementById("createSessionPage").style.display = "none"; 
  
    var xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      `http://localhost:5001/tinder-netflix/us-central1/createSession`,
      true
    );
    // If specified, responseType must be empty string or "text"
    // xhr.responseType = 'text';
    xhr.onload = function () {
      if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
          store.setItem("SwipeFlix_sessionId", JSON.parse(xhr.responseText)["sessionId"]);
          document.getElementById("loading").style.display = "none";
          window.location.href = "http://127.0.0.1:5500/FrontEnd/session.html";
        } else {
          alert("cannot Create Session");
          document.getElementById("loading").style.display = "none";
        }
      }
    };
  
    xhr.send(null);
  }
  