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
  try {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "The function must be called from an App Check verified app.");
    }
    if (data.requestType === "join") {
      const username = data.username;
      const sessionId = data.sessionId;
      const snap = await sessionDb.ref(sessionId).once("value");
      if (!snap.val()) {
        return ({status: "error", message: "SessionId is not valid!"});
      }
      const isCreator = snap.val()["sessionInfo"]["creator"] == username;
      const token = await generateJWTToken(username, sessionId, isCreator);
      sessionDb.ref(sessionId).child("users").child(username).update({
        isActive: true,
      });
      sessionDb.ref(sessionId).update({
        [`sessionActivity/users/${username}/joinedAt`]: new Date().getTime(),
        [`users/${username}/isActive`]: true,
        "sessionActivity/matches": [],
      });
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
      const token = await generateJWTToken(username, sessionId, true);
      return ({token: token, sessionId: sessionId, userId: username});
    } else {
      throw new functions.https.HttpsError("invalid-argument", "The function must be called with correct request type");
    }
  } catch (err) {
    sendErrorNotification("Register Tenant", err);
  }
});

exports.swipe = functions.database.ref("{sessionId}/users/{userId}/swipes")
    .onWrite(async (change, context) => {
      if (!change.after.exists()) {
        return null;
      }
      const sessionId = context.params.sessionId;
      const userId = context.params.userId;
      const mySwipes = change.after.val();
      const snap = await sessionDb.ref(sessionId).once("value");
      const matches = getMatches(snap.val()["users"]);
      const mySwipesLength = Object.keys(mySwipes).length;
      const mediaOrder = snap.val()["sessionActivity"]["mediaOrder"];
      const mediaOrderLength = mediaOrder.length;
      if (mediaOrderLength >= 300) {
        if (!(mediaOrder.includes("null"))) {
          mediaOrder.push("null");
        }
      } else if ((mediaOrderLength - mySwipesLength == 9) && (!(mediaOrder[mediaOrderLength - 1] == "null"))) {
        const page = getPageNumber(mediaOrderLength);
        const sessionInfo = snap.val()["sessionInfo"];
        const newData = await mediaData(sessionInfo, page);
        for (const mediaId of newData) {
          if (!(mediaOrder.includes(mediaId))) {
            mediaOrder.push(mediaId);
          }
        }
      }
      sessionDb.ref(sessionId).update({
        [`sessionActivity/users/${userId}/swipes`]: mySwipesLength,
        "sessionActivity/matches": matches,
        "sessionActivity/mediaOrder": mediaOrder,
      });
      return;
    });

exports.generateInitialData = functions.database.ref("{sessionId}")
    .onCreate(async (snapshot, context) => {
      const sessionInfo = snapshot.val().sessionInfo;
      const sessionId = snapshot.key;
      const dataSet = await mediaData(sessionInfo, 1);
      return sessionDb.ref(sessionId).child("sessionActivity").update({
        mediaOrder: dataSet,
      });
    });

exports.leaveSession = functions.https.onCall(async (data, context) => {
  try {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
          "failed-precondition",
          "The function must be called from an App Check verified app.");
    }
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
    const snap = await sessionDb.ref(sessionId).child("users").once("value");
    const matches = getMatches(snap.val());
    sessionDb.ref(sessionId).child("sessionActivity").update({
      matches: matches,
    });
    return;
  } catch (err) {
    sendErrorNotification("Leave Session", err);
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
    functions.logger.error(error);
    sendErrorNotification("deploymessages", error);
    res.status(500).send("error");
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
  const allLikes = [];
  const matchMap = {};
  if (Object.keys(data).length <=1) {
    return matches;
  }
  for (const eachUser of Object.keys(data)) {
    const likes = data[eachUser]["swipes"];
    for (const movieId in likes) {
      if (likes[movieId]) {
        allLikes.push(movieId);
      }
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

/**
 * @param  {string} sessionInfo
 * @param  {number} page
 */
async function mediaData(sessionInfo, page) {
  const categories = sessionInfo.categories;
  const languages = sessionInfo.languages;
  const platform = sessionInfo.platform;
  const region = sessionInfo.region;
  let sortby = sessionInfo.order;
  const movie = sessionInfo.isMovie;
  let dataSet = [];
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
        page,
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
        page,
    );
  }
  if (dataSet.length < 20) {
    dataSet.push("null");
  }
  return dataSet;
}

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
    functions.logger.error(error);
    return true;
  } catch (err) {
    functions.logger.error(err);
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
    data[i]["poster_path"] = `https://image.tmdb.org/t/p/original${data[i].poster_path}`;
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
  const url = `https://api.themoviedb.org/3/discover/tv?api_key=${apiToken}`;
  const resp = await axios.get(
      `${url}&with_original_language=${lang}&with_genres=${genres}&sort_by=${sort}&with_ott_providers=${platform}&ott_region=${region}&page=${page}`,
  );
  const data = resp.data.results;
  const res = [];
  for (let i = 0; i < data.length; i++) {
    const id = data[i].id.toString();
    const sessionDb = admin.firestore().collection("media").doc(id);
    const doc = await sessionDb.get();
    data[i]["title"] = data[i]["original_name"];
    data[i]["poster"] =
    "https://image.tmdb.org/t/p/original" + data[i]["poster_path"];
    data[i]["release_date"] = data[i]["first_air_date"];
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
 */
async function generateSessionId() {
  let id = randomSessionCode();
  const validId = true;
  while (validId) {
    const snap = await sessionDb.ref(id).once("value");
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

/**
 * @param  {number} numberOfCards
 * @return {number} val
 */
function getPageNumber(numberOfCards) {
  const ceiledNum = Math.ceil(numberOfCards / 10);
  let val = 0;
  if (ceiledNum % 2 == 0) {
    val = ceiledNum;
  } else {
    val = (ceiledNum + 1);
  }
  return val;
}

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
  const customToken = await admin.auth().createCustomToken(`${sessionId}|${userId}|${isCreator}`, additionalClaims);
  return customToken;
}
