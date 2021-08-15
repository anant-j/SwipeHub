import { initializeApp } from "firebase/app";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";
import { getDatabase, useDatabaseEmulator } from "firebase/database";
import { getAuth, useAuthEmulator } from "firebase/auth";
import { getFunctions, useFunctionsEmulator } from "firebase/functions";
import { getAnalytics, logEvent } from "firebase/analytics";
import { httpsCallable } from "firebase/functions";

const localMode = location.hostname === "localhost";
const firebaseApp = initializeApp({
  apiKey: process.env.VUE_APP_API_KEY,
  authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_PROJECT_ID,
  databaseURL: process.env.VUE_APP_DATABASE_URL,
  storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_ID,
  measurementId: process.env.VUE_APP_MEASUREMENT_ID,
});

export const movieDb = getFirestore(firebaseApp);
export const sessionDb = getDatabase(firebaseApp);
export const auth = getAuth(firebaseApp);
export const functions = getFunctions(firebaseApp);
export const JWTService = httpsCallable(functions, "registerTenant");
export const leave = httpsCallable(functions, "leaveSession");
export const requestSubsequentCards = httpsCallable(
  functions,
  "subsequentCards"
);
let analytics;

if (localMode) {
  useFirestoreEmulator(movieDb, "localhost", 8080);
  useDatabaseEmulator(sessionDb, "localhost", 9000);
  useAuthEmulator(auth, "http://localhost:9099");
  useFunctionsEmulator(functions, "localhost", 5001);
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.VUE_APP_APPCHECK_DEBUG;
} else {
  analytics = getAnalytics(firebaseApp);
}

const {
  initializeAppCheck,
  ReCaptchaV3Provider,
} = require("firebase/app-check");
initializeAppCheck(firebaseApp, {
  provider: new ReCaptchaV3Provider(process.env.VUE_APP_APP_CHECK_KEY),
  isTokenAutoRefreshEnabled: true,
});

/**
 * @param  {string} event Event to log
 */
export function eventLogger(event) {
  if (!localMode) {
    logEvent(analytics, event);
  } else {
    let logString = `Firebase Analytics Event: ${event}`;
    console.log(logString);
  }
}
