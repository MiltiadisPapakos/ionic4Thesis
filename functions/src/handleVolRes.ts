import * as functions from "firebase-functions";
export const acceptReq = functions.https.onCall(async (data) => {
  console.log(data.uid);
});
