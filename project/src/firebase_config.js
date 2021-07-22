import { initializeApp } from "firebase/app";
import { getFirestore, useFirestoreEmulator } from "firebase/firestore";

const firebaseApp = initializeApp({
    apiKey: process.env.VUE_APP_API_KEY,
    authDomain: process.env.VUE_APP_AUTH_DOMAIN,
    projectId: process.env.VUE_APP_PROJECT_ID
});

const db = getFirestore(firebaseApp);
if (location.hostname === "localhost") {
  console.log("using local");
  useFirestoreEmulator(db, "localhost", 8080);
}

export default db;
