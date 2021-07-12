const functions = require("firebase-functions");
const axios = require("axios");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
const apiToken = functions.config().tmdb.key;
const TelegramURL = functions.config().telegram.url;
const TelegramToken = functions.config().telegram.token;
const TelegramChatID = functions.config().telegram.chatid;
const expectedToken = TelegramToken.split(":")[1].toLowerCase();

exports.sessionValid = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    const id = req.query.id.toUpperCase();
    const sessionDb = admin.firestore().collection("sessions").doc(id);
    const doc = await sessionDb.get();
    if (isValidSession(doc)) {
      res.status(200).send("Allowed");
      return;
    } else {
      res.status(404).send("Session doesn't exist");
      return;
    }
  } catch (error) {
    console.error(error);
    sendErrorNotification("sessionValid", error);
    res.status(500).send("error");
  }
});

exports.createSession = functions.https.onRequest(async (req, res) => {
  try {
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
    let sortby = "";
    let dataSet = [];
    if (movie === "true") {
      if (order == "Popularity") {
        sortby = "popularity.desc";
      } else if (order == "Release") {
        sortby = "primary_release_date.desc";
      } else if (order == "Revenue") {
        sortby = "revenue.desc";
      }
      dataSet = await generateMovieList(
          languages,
          categories,
          platform,
          region,
          sortby,
          1,
      );
    }
    if (movie != "true") {
      if (order == "Popularity") {
        sortby = "popularity.desc";
      } else if (order == "Release") {
        sortby = "first_air_date.desc";
      } else if (order == "Revenue") {
        sortby = "popularity.desc";
      }
      dataSet = await generateTVList(
          languages,
          categories,
          platform,
          region,
          sortby,
          1,
      );
    }
    const data = {
      created: date,
      creator: username,
      categories: categories,
      languages: languages,
      platform: platform,
      region: region,
      mediaInfo: dataSet,
      order: sortby,
      isMovie: movie,
      isValid: true,
      likes: {},
      participants: {},
    };
    await admin.firestore().collection("sessions").doc(id).set(data);
    res.status(200).send({sessionId: id});
  } catch (error) {
    console.error(error);
    sendErrorNotification("createSession", error);
    res.status(500).send("error");
  }
});

exports.joinSession = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    const date = new Date();
    const id = req.query.id.toUpperCase();
    const userId = req.query.user;
    const sessionDb = admin.firestore().collection("sessions").doc(id);
    const doc = await sessionDb.get();
    if (!isValidSession(doc)) {
      res.status(404).send("Session doesn't exist");
      return;
    } else {
      const users = doc.data().participants;
      if (!(userId in users)) {
        users[userId] = {};
      }
      users[userId]["joined_at"] = date;
      if (users[userId]["totalSwipes"] == undefined) {
        users[userId]["totalSwipes"] = [];
      }
      const data = {
        participants: users,
      };
      const oldMovieData = doc.data().mediaInfo;
      const newMovieData = {order: []};
      const totalSwipeLength = users[userId]["totalSwipes"].length;
      const oldMovieLength = oldMovieData["order"].length;
      let upper = totalSwipeLength + 20;
      if (totalSwipeLength + 20 > oldMovieLength) {
        upper = oldMovieLength;
      }
      for (let index = totalSwipeLength; index < upper; index++) {
        const key = oldMovieData["order"][index];
        newMovieData["order"].push(key);
        newMovieData[key] = oldMovieData[key];
      }
      await admin
          .firestore()
          .collection("sessions")
          .doc(id)
          .set(data, {merge: true});
      res.status(200).send({
        movies: newMovieData,
        isCreator: doc.data().creator == userId,
        totalSwipes: users[userId]["totalSwipes"].length,
      });
    }
  } catch (error) {
    console.error(error);
    sendErrorNotification("joinSession", error);
    res.status(500).send("error");
  }
});

exports.leaveSession = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    const id = req.query.id.toUpperCase();
    const userId = req.query.user;
    const sessionDb = admin.firestore().collection("sessions").doc(id);
    const doc = await sessionDb.get();
    if (!isValidSession(doc)) {
      res.status(404).send("Session doesn't exist");
      return;
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
      res.status(200).send({
        movies: doc.data().mediaInfo,
        isCreator: doc.data().creator == userId,
      });
    }
  } catch (error) {
    console.error(error);
    sendErrorNotification("leaveSession", error);
    res.status(500).send("error");
  }
});

exports.subsequentCards = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    const id = req.query.id.toUpperCase();
    let totalCards = parseInt(req.query.totalCards);
    const sessionDb = admin.firestore().collection("sessions").doc(id);
    const doc = await sessionDb.get();
    if (!isValidSession(doc)) {
      res.status(404).send("Session doesn't exist");
      return;
    } else {
      const currentMovieSize = Object.keys(doc.data().mediaInfo).length - 1;
      const movie = doc.data().isMovie;
      const languages = doc.data().languages;
      const categories = doc.data().categories;
      const platform = doc.data().platform;
      const region = doc.data().region;
      const sortby = doc.data().order;
      let dataSet = {};
      const oldDataSet = doc.data().mediaInfo;
      totalCards = upperValue(totalCards);
      if (totalCards >= currentMovieSize) {
        const pageNum = totalCards / 20 + 1;
        if (movie === "true") {
          dataSet = await generateMovieList(
              languages,
              categories,
              platform,
              region,
              sortby,
              pageNum,
          );
        }
        if (movie != "true") {
          dataSet = await generateTVList(
              languages,
              categories,
              platform,
              region,
              sortby,
              pageNum,
          );
        }
        const newOrder = dataSet["order"];
        for (let index = 0; index < newOrder.length; index++) {
          const key = newOrder[index];
          oldDataSet["order"].push(key);
          oldDataSet[key] = dataSet[key];
        }
        const data = {
          mediaInfo: oldDataSet,
        };
        await admin
            .firestore()
            .collection("sessions")
            .doc(id)
            .set(data, {merge: true});
      } else {
        let lower = totalCards;
        const upper = totalCards + 19;
        const oldOrder = oldDataSet["order"];
        dataSet["order"] = [];
        for (lower; lower <= upper; lower++) {
          const key = oldOrder[lower];
          dataSet[key] = oldDataSet[key];
          dataSet["order"].push(key);
        }
      }
      res.status(200).send({movies: dataSet});
    }
  } catch (error) {
    console.error(error);
    sendErrorNotification("subsequentCards", error);
    res.status(500).send("error");
  }
});

exports.polling = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    const username = req.body.userId;
    const sessionId = req.body.sessionId.toUpperCase();
    let totalSwipes = req.body.totalSwipes;
    let likedList = req.body.likedList;
    const sessionDb = admin.firestore().collection("sessions").doc(sessionId);
    const doc = await sessionDb.get();
    if (!isValidSession(doc)) {
      res.status(404).send("Session doesn't exist");
      return;
    } else {
      const data = doc.data();
      const matches = new Set();
      const active = Object.keys(doc.data().participants).length;
      if (likedList != "") {
        likedList = likedList.split(",");
        likedList.forEach((element) => {
          element = element.toString();
          const newdata = toSet(data["likes"][element]);
          newdata.add(username);
          const sendBuffer = [];
          newdata.forEach((v) => sendBuffer.push(v));
          data["likes"][element] = sendBuffer;
        });
      }
      for (const [key, value] of Object.entries(data["likes"])) {
        if (value.length == active && active > 1) {
          matches.add(key);
        }
      }
      const results = [];
      matches.forEach((v) => results.push(v));
      data["matches"] = results;
      let currentSwipes = doc.data().participants[username]["totalSwipes"];
      if (totalSwipes != "") {
        totalSwipes = totalSwipes.split(",");
        currentSwipes = toSet(currentSwipes);
        totalSwipes.forEach((element) => {
          currentSwipes = currentSwipes.add(element);
        });
        currentSwipes = toArray(currentSwipes);
      }
      data["participants"][username]["totalSwipes"] = currentSwipes;
      const participantData = {};
      for (const [key, value] of Object.entries(data["participants"])) {
        participantData[key] = value["totalSwipes"].length;
      }
      await admin
          .firestore()
          .collection("sessions")
          .doc(sessionId)
          .set(data, {merge: true});
      res.status(200).send({match: results.length, userData: participantData});
      return;
    }
  } catch (error) {
    console.error(error);
    sendErrorNotification("polling", error);
    res.status(500).send("error");
  }
});

exports.matchPolling = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    const username = req.body.userId;
    const sessionId = req.body.sessionId.toUpperCase();
    const sessionDb = admin.firestore().collection("sessions").doc(sessionId);
    const doc = await sessionDb.get();
    if (!isValidSession(doc)) {
      res.status(404).send("Session doesn't exist");
      return;
    } else {
      const data = doc.data();
      const matches = data.matches;
      const movieData = {};
      for (let index = 0; index < matches.length; index++) {
        const element = matches[index];
        movieData[element] = data.mediaInfo[element];
      }
      const participantData = {};
      for (const [key, value] of Object.entries(data["participants"])) {
        participantData[key] = value["totalSwipes"].length;
      }
      res
          .status(200)
          .send({movies: movieData, isCreator: doc.data().creator == username, userData: participantData} );
    }
    return;
  } catch (error) {
    console.error(error);
    sendErrorNotification("matchPolling", error);
    res.status(500).send("error");
  }
});

exports.deploymessages = functions.https.onRequest(async (req, res) => {
  try {
    res.set("Access-Control-Allow-Origin", "*");
    const title = req.body.title;
    const key = req.query.token;
    const branch = req.body.branch;
    const status = req.body.state;
    if (title == undefined || status == undefined || branch == undefined) {
      res.status(200).send("Data Error");
      return;
    }
    if (key == undefined || key.toLowerCase() != expectedToken) {
      res.status(200).send("Unauthorized!");
      return;
    }
    if (title.includes(":NF:")) {
      res.status(200).send("Done!");
      return;
    }
    const content = `Deployment: ${title}\nBranch : ${branch}\nStatus: ${status}`;
    try {
      await axios.get(
          `${TelegramURL}/${TelegramToken}/sendMessage?text=${content}&chat_id=${TelegramChatID}`,
      );
      res.status(200).send("Done");
    } catch (error) {
      res.status(200).send("Error");
    }
    return;
  } catch (error) {
    console.error(error);
    sendErrorNotification("deploymessages", error);
    res.status(500).send("error");
  }
});

/**
 * @param {string} caller
 * @param {string} error
 * @return {boolean}
 */
async function sendErrorNotification(caller, error) {
  try {
    const content = `Error Notification.\n Raised by: ${caller}\n Error: ${error}`;
    await axios.get(
        `${TelegramURL}/${TelegramToken}/sendMessage?text=${content}&chat_id=${TelegramChatID}`,
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
/**
 * @param  {string} lang
 * @param  {string} genres
 * @param  {string} platform
 * @param  {string} region
 * @param  {string} sort
 * @param  {number} page
 */
async function generateMovieList(lang, genres, platform, region, sort, page) {
  const final = {};
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiToken}`;
  const resp = await axios.get(
      `${url}&with_original_language=${lang}&with_genres=${genres}&sort_by=${sort}&with_ott_providers=${platform}&ott_region=${region}&page=${page}`,
  );
  const data = resp.data.results;
  for (let i = 0; i < data.length; i++) {
    if (!("order" in final)) {
      final["order"] = [];
    }
    final["order"].push(data[i]["id"]);
    const tempDict = {};
    tempDict["title"] = data[i]["title"];
    tempDict["description"] = data[i]["overview"];
    tempDict["poster"] =
      "https://image.tmdb.org/t/p/original" + data[i]["poster_path"];
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
 * @param  {number} page
 */
async function generateTVList(lang, genres, platform, region, sort, page) {
  const final = {};
  const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiToken}`;
  const resp = await axios.get(
      `${url}&with_original_language=${lang}&with_genres=${genres}&sort_by=${sort}&with_ott_providers=${platform}&ott_region=${region}&page=${page}`,
  );
  const data = resp.data.results;
  for (let i = 0; i < data.length; i++) {
    const tempDict = {};
    if (!("order" in final)) {
      final["order"] = [];
    }
    final["order"].push(data[i]["id"]);
    tempDict["title"] = data[i]["original_name"];
    tempDict["description"] = data[i]["overview"];
    tempDict["poster"] =
      "https://image.tmdb.org/t/p/original" + data[i]["poster_path"];
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
  for (const [key, value] of Object.entries(sessionData["likes"])) {
    // value is the array of userIds who liked the movieId(key)
    // {key -> [value], key -> [value]}
    // for each key, take value, find index of user, remove that index from value, set new value to that key
    const index = value.indexOf(userId);
    if (index > -1) {
      value.splice(index, 1);
    }
    sessionData["likes"][key] = value;
  }
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

/**
 * @param  {object} doc
 * @return {boolean}
 */
function isValidSession(doc) {
  if (doc.exists && doc.data().isValid) {
    return true;
  }
  return false;
}

/**
 * @param {any} inp
 * @return {any}
 */
function toArray(inp) {
  return Array.from(inp);
}

/**
 * @param {any} inp
 * @return {any}
 */
function toSet(inp) {
  return new Set(inp);
}

/**
 * @param  {number} numberOfCards
 * @return {number} val
 */
function upperValue(numberOfCards) {
  const ceiledNum = Math.ceil(numberOfCards / 10);
  let val = 0;
  if (ceiledNum % 2 == 0) {
    val = ceiledNum * 10;
  } else {
    val = (ceiledNum + 1) * 10;
  }
  return val;
}
