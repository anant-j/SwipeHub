const functions = require("firebase-functions");
const axios = require("axios");
const admin = require("firebase-admin");
admin.initializeApp({databaseURL: "https://theswipehub-default-rtdb.firebaseio.com/"});
const apiToken = functions.config().tmdb.key;
const TelegramURL = functions.config().telegram.url;
const TelegramToken = functions.config().telegram.token;
const TelegramChatID = functions.config().telegram.chatid;
const expectedToken = TelegramToken.split(":")[1].toLowerCase();
const sessionDb = admin.database();

exports.registerTenant = functions.https.onCall(async (data, context) => {
  if (data.requestType === "join") {
    const username = data.username;
    const sessionId = data.sessionId;
    const snap = await sessionDb.ref(sessionId).get();
    if (!snap.val()) {
      return ({status: "error", message: "SessionId is not valid!"});
    }
    const token = await generateJWTToken(username, sessionId);
    sessionDb.ref(sessionId).child("users").child(username).update({
      isActive: true,
    });
    sessionDb.ref(sessionId).child("sessionActivity").child("users").child(username).update({
      joinedAt: new Date().getTime(),
    });
    const isCreator = snap.val()["sessionInfo"]["creator"] == username;
    return ({status: "success", token: token, isCreator: isCreator});
  } else if (data.requestType === "create") {
    const sessionId = await generateSessionId();
    const username=data.username;
    const categories=data.categories;
    const languages=data.language;
    const platform=data.platform;
    const region=data.region;
    const type=data.type;
    const order=data.order;
    sessionDb.ref(sessionId).set({
      sessionInfo: {
        categories: categories,
        creator: username,
        languages: languages,
        platform: platform,
        region: region,
        isMovie: type,
        order: order,
      },
      sessionActivity: {
        matches: [],
        contentOrder: [],
        isValid: true,
        users:
      {
        [username]: {
          swipes: 0,
          joinedAt: new Date().getTime(),
        },
      },
      },
      users: {
        [username]: {
          likes: [],
          dislikes: [],
          isActive: true,
        },
      },
    });
    const token = await generateJWTToken(data.username, sessionId, true);
    return ({token: token, sessionId: sessionId, userId: data.username});
  } else {
    throw new functions.https.HttpsError("invalid-argument", "The function must be called with correct request type");
  }
});

exports.swipeHandler = functions.https.onCall(async (data, context) => {
  const sessionId = context.auth.token.sessionId;
  const userId = context.auth.token.userId;
  const snap = await sessionDb.ref(sessionId).child("users").get();
  let updateVariable = "";
  let likeLength = 0;
  let dislikeLength = 0;
  const movieId = data.id;
  if (snap.val()) {
    const userData = snap.val()[userId];
    // const numUsers = Object.keys(snap.val()).length;
    if (data.requestType === "like") {
      updateVariable = "likes";
    } else if ( data.requestType === "dislike") {
      updateVariable = "dislikes";
    } else {
      return;
    }
    if ((!userData.likes || !(userData.likes.includes(movieId))) && ( !userData.dislikes || !(userData.dislikes.includes(movieId)))) {
      sessionDb.ref(sessionId).child("users").child(userId).update({
        [updateVariable]: (userData[updateVariable] || []).concat(movieId),
      });
      if (userData.likes) {
        likeLength = parseInt(userData.likes.length);
      }
      if (userData.dislikes) {
        dislikeLength = parseInt(userData.dislikes.length);
      }
      const oldData = snap.val();
      if (!oldData[userId][updateVariable]) {
        oldData[userId][updateVariable]=[];
      }
      oldData[userId][updateVariable].push(movieId);

      const matches = getMatches(oldData);
      sessionDb.ref(sessionId).child("sessionActivity").child("users").child(userId).update({
        swipes: likeLength + dislikeLength + 1,
      });
      sessionDb.ref(sessionId).child("sessionActivity").update({
        matches: matches,
      });
    }
    return;
  }
});

/**
 * @param {any} data
 * @param {any} userId
 * @param {any} movieId
 * @param {any} updateVariable
 * @return {any}
 */
function getMatches(data) {
  const matches = [];
  let allLikes = [];
  const matchMap = {};
  for (const eachUser of Object.keys(data)) {
    const likes = data[eachUser]["likes"];
    if (likes) {
      allLikes = allLikes.concat(...likes);
    }
  }
  for (const mediaId of allLikes) {
    if (!matchMap[mediaId]) {
      matchMap[mediaId] = 1;
    } else {
      matchMap[mediaId] += 1;
    }
    if (matchMap[mediaId] == Object.keys(data).length && Object.keys(data).length > 1) {
      matches.push(mediaId);
    }
  }
  return matches;
}

exports.generateInitialData = functions.database.ref("{sessionId}")
    .onCreate(async (snapshot, context) => {
      const sessionInfo = snapshot.val().sessionInfo;
      const sessionId = snapshot.key;
      const categories = sessionInfo.categories;
      const languages = sessionInfo.languages;
      const platform = sessionInfo.platform;
      const region = sessionInfo.region;
      let sortby = sessionInfo.order;
      let dataSet = [];
      const movie = sessionInfo.isMovie;
      if (movie === true) {
        if (sortby == "Popularity") {
          sortby = "popularity.desc";
        } else if (sortby == "Release") {
          sortby = "primary_release_date.desc";
        } else if (sortby == "Revenue") {
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
      } else {
        if (sortby == "Popularity") {
          sortby = "popularity.desc";
        } else if (sortby == "Release") {
          sortby = "first_air_date.desc";
        } else if (sortby == "Revenue") {
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
      return sessionDb.ref(sessionId).child("sessionActivity").update({
        mediaOrder: dataSet,
      });
    });

exports.leaveSession = functions.https.onCall(async (data, context) => {
  const userId = context.auth.token.userId;
  const sessionId = context.auth.token.sessionId;
  const isCreator = context.auth.token.isCreator;
  await admin.auth().deleteUser(`${sessionId}|${userId}`);
  if (isCreator) {
    sessionDb.ref(sessionId).child("sessionActivity").update({
      isValid: false,
    });
  } else {
    sessionDb.ref(sessionId).child("sessionActivity").child("users").child(userId).set({
    });
    sessionDb.ref(sessionId).child("users").child(userId).set({
    });
  }
  const snap = await sessionDb.ref(sessionId).child("users").get();
  const matches = getMatches(snap.val());
  sessionDb.ref(sessionId).child("sessionActivity").update({
    matches: matches,
  });
});
// exports.leaveSession = functions.https.onRequest(async (req, res) => {
//   try {
//     res.set("Access-Control-Allow-Origin", "*");
//     const id = req.query.id.toUpperCase();
//     const userId = req.query.user;
//     const sessionDb = admin.firestore().collection("sessions").doc(id);
//     const doc = await sessionDb.get();
//     if (!isValidSession(doc)) {
//       res.status(404).send("Session doesn't exist");
//       return;
//     } else {
//       const users = doc.data().participants;
//       if (users[userId] != undefined) {
//         if (userId == doc.data().creator) {
//           await endSession(id);
//         } else {
//           await leaveSession(id, userId, doc.data());
//         }
//       } else {
//         res.status(404).send("Session does not exist");
//       }
//       res.status(200).send({
//         movies: doc.data().mediaInfo,
//         isCreator: doc.data().creator == userId,
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     sendErrorNotification("leaveSession", error);
//     res.status(500).send("error");
//   }
// });

// exports.subsequentCards = functions.https.onRequest(async (req, res) => {
//   try {
//     res.set("Access-Control-Allow-Origin", "*");
//     const id = req.query.id.toUpperCase();
//     let totalCards = parseInt(req.query.totalCards);
//     const sessionDb = admin.firestore().collection("sessions").doc(id);
//     const doc = await sessionDb.get();
//     if (!isValidSession(doc)) {
//       res.status(404).send("Session doesn't exist");
//       return;
//     } else {
//       const currentMovieSize = Object.keys(doc.data().mediaInfo).length - 1;
//       const movie = doc.data().isMovie;
//       const languages = doc.data().languages;
//       const categories = doc.data().categories;
//       const platform = doc.data().platform;
//       const region = doc.data().region;
//       const sortby = doc.data().order;
//       let dataSet = {};
//       const oldDataSet = doc.data().mediaInfo;
//       totalCards = upperValue(totalCards);
//       if (totalCards >= currentMovieSize) {
//         const pageNum = totalCards / 20 + 1;
//         if (movie === "true") {
//           dataSet = await generateMovieList(
//               languages,
//               categories,
//               platform,
//               region,
//               sortby,
//               pageNum,
//           );
//         }
//         if (movie != "true") {
//           dataSet = await generateTVList(
//               languages,
//               categories,
//               platform,
//               region,
//               sortby,
//               pageNum,
//           );
//         }
//         const newOrder = dataSet["order"];
//         for (let index = 0; index < newOrder.length; index++) {
//           const key = newOrder[index];
//           oldDataSet["order"].push(key);
//           oldDataSet[key] = dataSet[key];
//         }
//         const data = {
//           mediaInfo: oldDataSet,
//         };
//         await admin
//             .firestore()
//             .collection("sessions")
//             .doc(id)
//             .set(data, {merge: true});
//       } else {
//         let lower = totalCards;
//         const upper = totalCards + 19;
//         const oldOrder = oldDataSet["order"];
//         dataSet["order"] = [];
//         for (lower; lower <= upper; lower++) {
//           const key = oldOrder[lower];
//           dataSet[key] = oldDataSet[key];
//           dataSet["order"].push(key);
//         }
//       }
//       res.status(200).send({movies: dataSet});
//     }
//   } catch (error) {
//     console.error(error);
//     sendErrorNotification("subsequentCards", error);
//     res.status(500).send("error");
//   }
// });


// exports.polling = functions.https.onRequest(async (req, res) => {
//   try {
//     res.set("Access-Control-Allow-Origin", "*");
//     const username = req.body.userId;
//     const sessionId = req.body.sessionId.toUpperCase();
//     let totalSwipes = req.body.totalSwipes;
//     let likedList = req.body.likedList;
//     const sessionDb = admin.firestore().collection("sessions").doc(sessionId);
//     const doc = await sessionDb.get();
//     if (!isValidSession(doc)) {
//       res.status(404).send("Session doesn't exist");
//       return;
//     } else {
//       const data = doc.data();
//       const matches = new Set();
//       const active = Object.keys(doc.data().participants).length;
//       if (likedList != "") {
//         likedList = likedList.split(",");
//         likedList.forEach((element) => {
//           element = element.toString();
//           const newdata = toSet(data["likes"][element]);
//           newdata.add(username);
//           const sendBuffer = [];
//           newdata.forEach((v) => sendBuffer.push(v));
//           data["likes"][element] = sendBuffer;
//         });
//       }
//       for (const [key, value] of Object.entries(data["likes"])) {
//         if (value.length == active && active > 1) {
//           matches.add(key);
//         }
//       }
//       const results = [];
//       matches.forEach((v) => results.push(v));
//       data["matches"] = results;
//       let currentSwipes = doc.data().participants[username]["totalSwipes"];
//       if (totalSwipes != "") {
//         totalSwipes = totalSwipes.split(",");
//         currentSwipes = toSet(currentSwipes);
//         totalSwipes.forEach((element) => {
//           currentSwipes = currentSwipes.add(element);
//         });
//         currentSwipes = toArray(currentSwipes);
//       }
//       data["participants"][username]["totalSwipes"] = currentSwipes;
//       const participantData = {};
//       for (const [key, value] of Object.entries(data["participants"])) {
//         participantData[key] = value["totalSwipes"].length;
//       }
//       await admin
//           .firestore()
//           .collection("sessions")
//           .doc(sessionId)
//           .set(data, {merge: true});
//       res.status(200).send({match: results.length, userData: participantData});
//       return;
//     }
//   } catch (error) {
//     console.error(error);
//     sendErrorNotification("polling", error);
//     res.status(500).send("error");
//   }
// });

// exports.matchPolling = functions.https.onRequest(async (req, res) => {
//   try {
//     res.set("Access-Control-Allow-Origin", "*");
//     const username = req.body.userId;
//     const sessionId = req.body.sessionId.toUpperCase();
//     const sessionDb = admin.firestore().collection("sessions").doc(sessionId);
//     const doc = await sessionDb.get();
//     if (!isValidSession(doc)) {
//       res.status(404).send("Session doesn't exist");
//       return;
//     } else {
//       const data = doc.data();
//       const matches = data.matches;
//       const movieData = {};
//       for (let index = 0; index < matches.length; index++) {
//         const element = matches[index];
//         movieData[element] = data.mediaInfo[element];
//       }
//       const participantData = {};
//       for (const [key, value] of Object.entries(data["participants"])) {
//         participantData[key] = value["totalSwipes"].length;
//       }
//       res
//           .status(200)
//           .send({movies: movieData, isCreator: doc.data().creator == username, userData: participantData} );
//     }
//     return;
//   } catch (error) {
//     console.error(error);
//     sendErrorNotification("matchPolling", error);
//     res.status(500).send("error");
//   }
// });

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
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiToken}`;
  const resp = await axios.get(
      `${url}&with_original_language=${lang}&with_genres=${genres}&sort_by=${sort}&with_ott_providers=${platform}&ott_region=${region}&page=${page}`,
  );
  const data = resp.data.results;
  const res = [];
  for (let i = 0; i < data.length; i++) {
    const id = data[i].id.toString();
    const sessionDb = admin.firestore().collection("media").doc(id);
    const doc = await sessionDb.get();
    if (!doc.exists) {
      await admin
          .firestore()
          .collection("media")
          .doc(id)
          .set(data[i]);
    }
    res.push(id);
  }
  return res;
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
  const validId = true;
  while (validId) {
    const snap = await sessionDb.ref(id).get();
    if (!snap.val()) {
      return id;
    } else {
      id = randomSessionCode();
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

// /**
//  * @param {any} sessionId
//  * @param {any} userId
//  * @param {any} sessionData
//  * @return {any}
//  */
// async function leaveSession(sessionId, userId, sessionData) {
//   for (const [key, value] of Object.entries(sessionData["likes"])) {
//     // value is the array of userIds who liked the movieId(key)
//     // {key -> [value], key -> [value]}
//     // for each key, take value, find index of user, remove that index from value, set new value to that key
//     const index = value.indexOf(userId);
//     if (index > -1) {
//       value.splice(index, 1);
//     }
//     sessionData["likes"][key] = value;
//   }
//   delete sessionData["participants"][userId];
//   await admin
//       .firestore()
//       .collection("sessions")
//       .doc(sessionId)
//       .set(sessionData);
// }

// /**
//  * @param {any} sessionId
//  * @return {any}
//  */
// async function endSession(sessionId) {
//   const data = {
//     isValid: false,
//   };
//   await admin
//       .firestore()
//       .collection("sessions")
//       .doc(sessionId)
//       .set(data, {merge: true});
// }

// /**
//  * @param  {object} doc
//  * @return {boolean}
//  */
// function isValidSession(doc) {
//   if (doc.exists && doc.data().isValid) {
//     return true;
//   }
//   return false;
// }

// /**
//  * @param  {number} numberOfCards
//  * @return {number} val
//  */
// function upperValue(numberOfCards) {
//   const ceiledNum = Math.ceil(numberOfCards / 10);
//   let val = 0;
//   if (ceiledNum % 2 == 0) {
//     val = ceiledNum * 10;
//   } else {
//     val = (ceiledNum + 1) * 10;
//   }
//   return val;
// }

/**
 * @param  {String} userId
 * @param  {String} sessionId
 * @param  {Boolean} isCreator
*/
async function generateJWTToken(userId, sessionId, isCreator = false) {
  const additionalClaims = {
    isCreator: isCreator,
    sessionId: sessionId,
    userId: userId,
  };
  const customToken = await admin.auth().createCustomToken(`${sessionId}|${userId}`, additionalClaims);
  return customToken;
}
