/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {sendMatches} from "./sendMatches";
import {changeStatus, getInNeedFcmToken, getVolFcmTokens} from "./fcmUtils";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import _ = require("lodash");
import {getAuth} from "firebase-admin/auth";


const settings = {ignoreUndefinedProperties: true};

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const volunteersCollection = "volunteer-availability";
const requestsCollection = "request_info";
const firestore = admin.firestore();
firestore.settings(settings);

export const matchVolunteersToInNeed = functions.firestore
  .document(`${volunteersCollection}/{volunteerID}`)
  .onWrite(async (change, res) => {
    try {
      // Get the volunteer data
      const volunteerData = change.after.exists ? [change.after.data()] : [];
      // Check if the volunteer is new or the availability has changed
      const isNewVolunteer = !change.before.exists && change.after.exists;
      // eslint-disable-next-line max-len
      const availabilityChanged = !_.isEqual(change.before.data(), change.after.data());
      const matchesVol: any[] =[];
      if (volunteerData.length > 0 && (isNewVolunteer || availabilityChanged)) {
        const availabilityArea = volunteerData[0]?.availabilityArea;
        const requestAvailability = volunteerData[0]?.requestAvailability;
        const days = volunteerData[0]?.days;
        const timeInfo = volunteerData[0]?.timeInfo;

        if (availabilityArea) {
          // eslint-disable-next-line max-len
          const requestsSnapshot = await firestore.collection(requestsCollection).get();
          requestsSnapshot.docs
            .map((doc) => ({docId: doc.id, ...doc.data()}))
            .filter((request) => {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const {locationLat, locationLng} = request.coordinates;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const {requestId} = request;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const {day} = request;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const {time} = request;
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const {uid} = request;
              const {docId} = request;
              // Margin of error for latitude and longitude comparisons
              const latMargin = 0.0000001; // Adjust as needed
              const lngMargin = 0.0000001; // Adjust as needed

              const isInRectangle =
                locationLat <= availabilityArea.topLeftLat - latMargin &&
                locationLat >= availabilityArea.bottomRightLat + latMargin &&
                locationLng <= availabilityArea.topLeftLng - lngMargin &&
                locationLng >= availabilityArea.bottomRightLng + lngMargin;

              // Check for additional parameters
              // eslint-disable-next-line max-len
              const hasRequestId = requestAvailability ? requestAvailability.includes(requestId) : true;
              const hasDay = days ? days.includes(day) : true;
              // eslint-disable-next-line max-len
              const hasTime = timeInfo ? timeInfo.some((volunteerTime: string) => time.includes(volunteerTime)) : true;
              if (isInRectangle && hasRequestId && hasDay && hasTime) {
                matchesVol.push({"docId": docId, "uid": uid});
              }
            });
        }
      }
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  });

export const matchRequestsToVolunteers = functions.firestore
  .document(`${requestsCollection}/{requestID}`)
  .onCreate(async (snapshot, context) => {
    try {
      // Get the new request data
      const requestData = snapshot.data();
      const reqId = snapshot.id;
      const matchesReq: any[] = [];
      // Fetch all volunteers
      // eslint-disable-next-line max-len
      const volunteersSnapshot = await firestore.collection(volunteersCollection).get();
      // eslint-disable-next-line max-len
      const volunteersData = volunteersSnapshot.docs.map((doc) => ({docId: doc.id, ...doc.data()}));
      // Filter potential volunteers based on request criteria
      volunteersData.filter((volunteer) => {
        // eslint-disable-next-line max-len
        // const { days} = volunteer;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const {requestAvailability, days, timeInfo, docId} = volunteer;
        // eslint-disable-next-line max-len,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line max-len
        const {bottomRightLat, bottomRightLng, topLeftLat, topLeftLng} = volunteer.availabilityArea;
        // eslint-disable-next-line max-len
        // Margin of error for latitude and longitude comparisons
        const latMargin = 0.0000001; // Adjust as needed
        const lngMargin = 0.0000001; // Adjust as needed

        const isInRectangle =
          requestData.coordinates.locationLat <= topLeftLat - latMargin &&
          // eslint-disable-next-line max-len
          requestData.coordinates.locationLat >= bottomRightLat + latMargin &&
          requestData.coordinates.locationLng <= topLeftLng - lngMargin &&
          requestData.coordinates.locationLng >= bottomRightLng + lngMargin;

        // eslint-disable-next-line max-len
        const hasRequestId = requestAvailability ? requestAvailability.includes(requestData.requestId) : true;
        const hasDay = days ? days.includes(requestData.day) : true;
        // eslint-disable-next-line max-len
        // eslint-disable-next-line max-len
        const hasTime = timeInfo ? timeInfo.some((time: string | any[]) => time.includes(requestData.time[0])) : true;
        if (isInRectangle && hasRequestId && hasDay && hasTime) {
          matchesReq.push( docId);
        }
      });
      // Perform further processing or notify potential volunteers
      sendMatches(matchesReq, reqId);
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  });
export const notifyVolunteers = functions.https.onCall(async (data) => {
  const requestList = await getVolFcmTokens(data.uid);
  changeStatus(requestList);
  requestList.forEach((request) =>{
    request.tokens.forEach((token: any)=>{
      return admin.messaging().send(createVolMassage(request, token))
        .then((response) => {
          // Response is a message ID string.
          console.log("Successfully sent message:", response);
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    });
  });
});
// eslint-disable-next-line require-jsdoc
function updateDateTime(originalJson: any) {
  // Extract day code from the originalJson
  const dayCode = originalJson.day;
  // eslint-disable-next-line max-len
  const dayTable = [{day: "Δεύτερα", coded: 1, value: false}, {day: "Τρίτη", coded: 2, value: false}, {day: "Τετάρτη", coded: 3, value: false}, {day: "Πέμπτη", coded: 4, value: false},
    // eslint-disable-next-line max-len
    {day: "Παρασκευή", coded: 5, value: false}, {day: "Σάββατο", coded: 6, value: false}, {day: "Κυριακή", coded: 0, value: false}];

  // Find the corresponding day value from dayTable
  const selectedDay = dayTable.find((day) => day.coded === dayCode);

  if (selectedDay) {
    // Update the day and time fields in the originalJson
    originalJson.day = selectedDay.day;

    // Extract hour from the time field (remove the last character)
    originalJson.time = originalJson.time[0].slice(0, -1);
  }

  return originalJson;
}

// eslint-disable-next-line require-jsdoc
function createVolMassage(request : any, token : string) {
  const updatedReq = updateDateTime(request);
  return {
    notification: {
      title: "Νεο αίτημα " + updatedReq.requestName,
      body: "Πληροφοριες " + updatedReq.locationName + " " + updatedReq.time,
    },
    token: token,
  };
}
export const acceptReq = functions.https.onCall(async (data) => {
  const flag = "accept";
  const token = await getInNeedFcmToken(data.uid);
  const valid = createInNeedMassage(flag, token);
  if (valid !== null) {
    admin.messaging().send(valid)
      .then((response) => {
        // Response is a message ID string.
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  }
});
export const rejectReq = functions.https.onCall(async (data) => {
  const flag = "reject";
  const token = await getInNeedFcmToken(data.uid);
  const valid = createInNeedMassage(flag, token);
  if (valid !== null) {
    admin.messaging().send(valid)
      .then((response) => {
        // Response is a message ID string.
        console.log("Successfully sent message:", response);
      })
      .catch((error) => {
        console.log("Error sending message:", error);
      });
  }
});
// eslint-disable-next-line require-jsdoc
function createInNeedMassage(flag : string, token : string) {
  if (flag === "accept") {
    return {
      notification: {
        title: "ΑΠΟΔΟΧΗ ΑΙΤΗΜΑΤΟΣ ",
        body: "Το αίτημά σας έγινε αποδεκτό πατήστε για παραπάνω πληροφορίες ",
      },
      token: token,
    };
  } else if (flag === "reject") {
    return {
      notification: {
        title: "ΑΠΟΡΡΙΨΗ ΑΙΤΗΜΑΤΟΣ ",
        body: "Το αίτημά σας απορρίφθηκε από ολους τους πιθανούς εθελοντές",
      },
      token: token,
    };
  }
  return null;
}
// eslint-disable-next-line require-jsdoc
export const deleteUser = functions.https.onCall(async (data) => {
  await getAuth().deleteUser(data.userID);
});

