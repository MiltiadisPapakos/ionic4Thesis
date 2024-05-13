
import {getFirestore, doc, updateDoc} from "@firebase/firestore";
import {initializeApp} from "@firebase/app";


// eslint-disable-next-line require-jsdoc
export function sendMatches(matchesVol : any[], reqId: string) {
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCXWydohCURGsRUMzo_0Or0sbLY4orvEUs",
    authDomain: "ionic4thesis.firebaseapp.com",
    databaseURL: "https://ionic4thesis-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "ionic4thesis",
    storageBucket: "ionic4thesis.appspot.com",
    messagingSenderId: "841782522419",
    appId: "1:841782522419:web:b00accb5317b2f45f72946",
    measurementId: "G-0X7Y6859Y7",
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);


  const database = getFirestore(app);

  const reqRef = doc(database, "request_info", reqId);

  updateDoc(reqRef, {"matchedVolIds": matchesVol, "status": "pending"});
}
