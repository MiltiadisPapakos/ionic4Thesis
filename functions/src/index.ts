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
import _ = require("lodash");


const settings = {ignoreUndefinedProperties: true};

admin.initializeApp();

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
        console.log(matchesVol);
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
          matchesReq.push({"VolId": docId});
        }
      });
      // Perform further processing or notify potential volunteers
      console.log("Potential volunteers:", matchesReq);
    } catch (error) {
      console.error("Error occurred:", error);
      throw error;
    }
  });

