// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require("firebase-functions");
const axios = require("axios");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const apiToken = functions.config().tmdb.key;
// const apiToken = "";

exports.sessionValid = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
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
  res.set("Access-Control-Allow-Origin", "*");
  const id = await generateSessionId();
  const username = "something";
  const categories = "10751|36|10402|878|53";
  const languages = "";
  const date = new Date();
  const type = "MOVIE";
  let dataSet = [];
  // if (type === "TV") {
  //   const tvdata = await generateTvList("en-US", categories);
  //   dataSet = dataSet.concat(tvdata);
  // }
  if (type === "MOVIE") {
    dataSet = await generateMovieList("en-US", categories);
  }
  const data = {
    created: date,
    creator: username,
    categories: categories,
    languages: languages,
    moviesList: dataSet,
    likes: {},
    participants: {},
  };

  await admin.firestore().collection("sessions").doc(id).set(data);
  // res.status(200).send("Done");
  res.status(200).send({sessionId: id});
});

exports.joinSession = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  // Grab the text parameter.
  const date = new Date();
  const id = req.query.id.toUpperCase();
  const userId = req.query.user.toLowerCase();
  const usersRef = admin.firestore().collection("sessions").doc(id);
  const doc = await usersRef.get();
  if (!doc.exists) {
    res.status(404).send("Session doesn't exist");
  } else {
    const users = doc.data().participants;
    users[userId] = {joined_at: date};
    const data = {
      participants: users,
    };
    await admin
        .firestore()
        .collection("sessions")
        .doc(id)
        .set(data, {merge: true});
    // do stuff with the data
    res.status(200).send(doc.data().moviesList);
    console.log("Document data:", doc.data());
  }
});

/**
 * @param  {string} lang
 * @param  {string} genres
 */
async function generateMovieList(lang, genres) {
  const final = {};
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiToken}`;
  const resp = await axios.get(
      `${url}&language=${lang}&with_genres=${genres}&sort_by=popularity.desc&with_watch_providers=8&watch_region=CA`,
  );
  const data = resp.data.results;
  for (let i = 0; i < data.length; i++) {
    const tempDict = {};
    tempDict["title"] = data[i]["title"];
    tempDict["description"] = data[i]["overview"];
    tempDict["poster"] =
      "http://image.tmdb.org/t/p/original" + data[i]["poster_path"];
    tempDict["release_date"] = data[i]["release_date"];
    tempDict["adult"] = data[i]["adult"];
    final[data[i]["id"]] = tempDict;
  }
  return final;
}

/**
 */
async function generateSessionId() {
  let id = randomSessionCode();
  const idExists = true;
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

/**
 * @return {string} A random 6 digit code
 */
function randomSessionCode() {
  const length = 6;
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
