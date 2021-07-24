import { initializeApp } from "firebase/app";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";
import { getDatabase, useDatabaseEmulator } from "firebase/database";
import { getAuth, useAuthEmulator } from "firebase/auth";
import { getFunctions, useFunctionsEmulator } from "firebase/functions";

const firebaseApp = initializeApp({
  apiKey: process.env.VUE_APP_apiKey,
  authDomain: process.env.VUE_APP_authDomain,
  projectId: process.env.VUE_APP_projectId,
  databaseURL: process.env.VUE_APP_databaseURL,
  storageBucket: process.env.VUE_APP_storageBucket,
  messagingSenderId: process.env.VUE_APP_messagingSenderId,
  appId: process.env.VUE_APP_appId,
});

export const movieDb = getFirestore(firebaseApp);
export const sessionDb = getDatabase(firebaseApp);
export const auth = getAuth(firebaseApp);
export const functions = getFunctions(firebaseApp);

if (location.hostname === "localhost") {
  useFirestoreEmulator(movieDb, "localhost", 8080);
  useDatabaseEmulator(sessionDb, "localhost", 9000);
  useAuthEmulator(auth, "http://localhost:9099");
  useFunctionsEmulator(functions, "localhost", 5001);
}

// export const sessionDb;
// export const movieDb;
