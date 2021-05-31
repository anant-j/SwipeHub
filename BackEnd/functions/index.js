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
  const sessionDb = admin.firestore().collection("sessions").doc(id);
  const doc = await sessionDb.get();
  if (doc.exists && doc.data().isValid) {
    res.status(200).send("Allowed");
  } else {
    res.status(404).send("Session doesn't exist");
  }
});

exports.createSession = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const id = await generateSessionId();
  const username = req.body.username;
  const categories = req.body.categories;
  const languages = req.body.languages;
  const platform = req.body.platform;
  const region = req.body.region;
  const date = new Date();
  const movie = req.body.type;
  const order = req.body.order;
  let sortby="";
  let dataSet = [];
  if (movie === "true") {
    if (order == "Popularity") {
      sortby = "popularity.desc";
    } else if (order == "Release") {
      sortby = "primary_release_date.desc";
    } else if (order == "Revenue") {
      sortby = "revenue.desc";
    }
    dataSet = await generateMovieList(languages, categories, platform, region, sortby);
  }
  if (movie != "true") {
    if (order == "Popularity") {
      sortby = "popularity.desc";
    } else if (order == "Release") {
      sortby = "first_air_date.desc";
    } else if (order == "Revenue") {
      sortby = "popularity.desc";
    }
    dataSet = await generateTVList(languages, categories, platform, region, sortby);
  }

  const data = {
    created: date,
    creator: username,
    categories: categories,
    languages: languages,
    moviesList: dataSet,
    isValid: true,
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
  const sessionDb = admin.firestore().collection("sessions").doc(id);
  const doc = await sessionDb.get();
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
    res.status(200).send({movies: doc.data().moviesList, isCreator: doc.data().creator == userId});
  }
});

exports.leaveSession = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  // Grab the text parameter.
  const id = req.query.id.toUpperCase();
  const userId = req.query.user.toLowerCase();
  const sessionDb = admin.firestore().collection("sessions").doc(id);
  const doc = await sessionDb.get();
  if (!doc.exists) {
    res.status(404).send("Session doesn't exist");
  } else {
    const users = doc.data().participants;
    if (users[userId] != undefined) {
      if (userId == doc.data().creator) {
        await endSession(id);
      } else {
        await leaveSession(id, userId, doc.data());
      }
    } else {
      res.status(404).send("Session does not exist");
    }
    // do stuff with the data
    res.status(200).send({movies: doc.data().moviesList, isCreator: doc.data().creator == userId});
  }
});

exports.polling = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const x = Math.floor((Math.random() * 10) + 1);
  res.status(200).send({usersData: {
    "anant": x,
    "varun": 10,
  }, matches: x});
});

/**
 * @param  {string} lang
 * @param  {string} genres
 * @param  {string} platform
 * @param  {string} region
 * @param  {string} sort
*/
async function generateMovieList(lang, genres, platform, region, sort) {
  const final = {};
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiToken}`;
  const resp = await axios.get(
      `${url}&with_original_language=${lang}&with_genres=${genres}&sort_by=${sort}&with_ott_providers=${platform}&ott_region=${region}`,
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
 * @param  {string} lang
 * @param  {string} genres
 * @param  {string} platform
 * @param  {string} region
 * @param  {string} sort
*/
async function generateTVList(lang, genres, platform, region, sort) {
  const final = {};
  const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiToken}`;
  const resp = await axios.get(
      `${url}&with_original_language=${lang}&with_genres=${genres}&sort_by=${sort}&with_ott_providers=${platform}&ott_region=${region}`,
  );
  const data = resp.data.results;
  for (let i = 0; i < data.length; i++) {
    const tempDict = {};
    tempDict["title"] = data[i]["original_name"];
    tempDict["description"] = data[i]["overview"];
    tempDict["poster"] =
      "http://image.tmdb.org/t/p/original" + data[i]["poster_path"];
    tempDict["release_date"] = data[i]["first_air_date"];
    tempDict["adult"] = false;
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

/**
 * @param {any} sessionId
 * @param {any} userId
 * @param {any} sessionData
 * @return {any}
 */
async function leaveSession(sessionId, userId, sessionData) {
  // const users = sessionData.participants;
  delete sessionData["participants"][userId];
  await admin
      .firestore()
      .collection("sessions")
      .doc(sessionId)
      .set(sessionData);
}

/**
 * @param {any} sessionId
 * @return {any}
 */
async function endSession(sessionId) {
  const data = {
    isValid: false,
  };
  await admin
      .firestore()
      .collection("sessions")
      .doc(sessionId)
      .set(data, {merge: true});
}
