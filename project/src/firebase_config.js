import { initializeApp } from "firebase/app";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";
import { getDatabase, useDatabaseEmulator } from "firebase/database";
import { getAuth, useAuthEmulator } from "firebase/auth";
import { getFunctions, useFunctionsEmulator } from "firebase/functions";

const firebaseApp = initializeApp({
  // apiKey: process.env.VUE_APP_API_KEY,
  // authDomain: process.env.VUE_APP_AUTH_DOMAIN,
  // projectId: process.env.VUE_APP_PROJECT_ID,
  // databaseURL: process.env.VUE_APP_DATABASE_URL,
  // storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
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
