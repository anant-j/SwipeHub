// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const axios = require("axios");
const apiToken = "";

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

exports.sessionValid = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  // Grab the text parameter.
  const id = req.query.id.toUpperCase();
  const usersRef = admin.firestore().collection("sessions").doc(id);
  usersRef.get().then((docSnapshot) => {
    if (docSnapshot.exists) {
      usersRef.onSnapshot((doc) => {
        // do stuff with the data
        res.status(200).send("Allowed");
      });
    } else {
      res.status(404).send("Session doesn't exist");
    }
  });
});

exports.createSession = functions.https.onRequest(async (req, res) => {
res.set('Access-Control-Allow-Origin', '*');
  const id = await generateSessionId();
  const username = "something";
  const categories = "10751|36|10402|878|53";
  const languages = "";
  const date = new Date();
  const type = "MOVIE";
  let dataSet = []
  if (type === "TV") {
    const tvdata=await generateTvList("en-US", categories);
    dataSet = dataSet.concat(tvdata);
  }
  if (type === "MOVIE") {
    dataSet=await generateMovieList("en-US", categories);
    // console.log(dataSet);
    // dataSet = dataSet.concat(moviedata);
  }
  const data = {
    created: date,
    creator: username,
    categories: categories,
    languages: languages,
    moviesList: dataSet,
    likes: {},
  };

  await admin.firestore().collection("sessions").doc(id).set(data);
  res.status(200).send("Done");
//   res.status(200).send({"Session":id,"data":dataSet});
});

async function generateMovieList(lang, genres) {
  let final = {};
  url =
    `https://api.themoviedb.org/3/discover/movie?api_key=${apiToken}`;
  const resp = await axios.get(
    `${url}&language=${lang}&with_genres=${genres}&sort_by=popularity.desc&with_watch_providers=8&watch_region=CA`
  );
  const data = resp.data.results;
  for (let i = 0; i < data.length; i++) {
    let temp_dict={}
    temp_dict["title"] = data[i]["title"];
    temp_dict["description"] = data[i]["overview"];
    temp_dict["poster"] = "http://image.tmdb.org/t/p/original"+data[i]["poster_path"];
    temp_dict["release_date"] = data[i]["release_date"];
    temp_dict["adult"] = data[i]["adult"];
    final[data[i]["id"]] = temp_dict
  }
  return final;
}

async function generateTvList(lang, genres) {
  let final = [];
  url =
    `https://api.themoviedb.org/3/discover/tv?api_key=${apiToken}`;
  const resp = await axios.get(
    `${url}&language=${lang}&with_genres=${genres}&sort_by=popularity.desc&with_watch_providers=8&watch_region=CA`
  );
  const data = resp.data.results;
  for (let i = 0; i < data.length; i++) {
      
    final.push(data[i]);
  }
  return final;
}

async function generateSessionId() {
  let id = randomSessionCode();
  let idExists = true;
  while (idExists === true) {
    const docSnapshot = await admin
      .firestore()
      .collection("sessions")
      .doc(id)
      .get();
    if (docSnapshot.exists) {
      id = randomSessionCode();
    } else {
      return id;
    }
  }
}

function randomSessionCode() {
  const length = 6;
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
