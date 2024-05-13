import {getApp} from "./appUtils";
// eslint-disable-next-line max-len
import {doc, getFirestore, collection, getDoc, getDocs, query, where, updateDoc} from "@firebase/firestore";

// eslint-disable-next-line require-jsdoc
export async function getVolFcmTokens( uid : string) {
  let volIds : any[]= [];
  const app = getApp();
  const database = getFirestore(app);
  // eslint-disable-next-line max-len
  const q = query(collection(database, "request_info"), where("uid", "==", uid),
    where("status", "==", "pendingVol"));
  const requests = await getDocs(q);
  requests.forEach((doc) => {
    // the `...` operator takes only the items of a collection
    volIds.push(...doc.data().matchedVolIds);
  });
  // by creating a new Set using the list as a constructor argument, we end up
  // with a Set that has only the unique values of that list
  // then we keep only the elements of that Set using the `...` operator, and
  // we use them to create a new list
  volIds = [...new Set(volIds)];
  // get tokens from volIds
  // map tokens with ids
  const volunteerToken: any[]= [];
  for (const volId of volIds) {
    const volunteerDocRef = doc(database, "registration-details", volId);
    const volunteerDocSnapshot = await getDoc(volunteerDocRef);
    if (volunteerDocSnapshot.exists()) {
      // If the document exists, push its tokens into the volunteerToken array
      // eslint-disable-next-line max-len
      volunteerToken.push({"uidVol": volunteerDocSnapshot.id, "token": volunteerDocSnapshot.data().token});
    }
  }
  // put tokens in `requests` according to the ids
  const requestsToReturn: any[] = [];
  requests.forEach((request) => {
    const currentRequest = request.data();
    currentRequest.docId = request.id;
    currentRequest.tokens = [];
    currentRequest.matchedVolIds.forEach((uid : string)=>{
      const token = volunteerToken.find((vol)=> vol.uidVol === uid).token;
      currentRequest.tokens.push(token);
    });
    requestsToReturn.push(currentRequest);
  });
  const k = query(collection(database, "request-list"));
  const reqName = await getDocs(k);
  requestsToReturn.forEach((request)=>{
    // eslint-disable-next-line max-len
    const requestName = reqName.docs.find((names)=> request.requestId === names.id);
    request.requestName = requestName?.data().request;
  });
  // return `requests` to index.ts
  return requestsToReturn;
  // send messages
}
// eslint-disable-next-line require-jsdoc
export function changeStatus( requests : any []) {
  const app = getApp();
  const database = getFirestore(app);
  requests.forEach((request) =>{
    const reqRef = doc(database, "request_info", request.docId);
    updateDoc(reqRef, {"status": "pendingConfirmation"});
  });
}
// eslint-disable-next-line require-jsdoc
export async function getInNeedFcmToken(uid: string) {
  const app = getApp();
  const database = getFirestore(app);
  const documentRef = doc(database, "registration-details", uid);
  const documentSnapshot = await getDoc(documentRef);
  // eslint-disable-next-line max-len
  // const q = query(collection(database, "registration-details"), where('__name__', '==', documentRef));
  // const fcmId = await getDocs(q);
  if (documentSnapshot.exists()) {
    // Extract the document data
    const fcmId = documentSnapshot.data()["token"];
    console.log(fcmId);
    console.log(fcmId.docs);
    return fcmId;
  } else {
    console.log("Document does not exist");
    return null;
  }
}
