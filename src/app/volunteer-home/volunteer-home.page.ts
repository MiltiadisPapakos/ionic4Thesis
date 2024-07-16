// @ts-ignore

import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";
import {AuthService} from "../services/auth.service";
import {arrayUnion, collection, deleteDoc, getDocs, query, where} from "@angular/fire/firestore";
import {getFirestore, onSnapshot} from "@angular/fire/firestore";
import {initializeApp} from "@angular/fire/app";
import { DateTimeUtilsTsService } from '../services/date-time-utils.ts.service';
import {RetrieveInNeedHomeRequestService} from "../services/retrieve-in-need-home-request.service";
import {doc, getDoc, updateDoc} from "@firebase/firestore";
import {acceptReq} from "../../../functions/src/handleVolRes";
import {getFunctions, httpsCallable} from "@angular/fire/functions";

@Component({
  selector: 'app-volunteer-login',
  templateUrl: './volunteer-home.page.html',
  styleUrls: ['./volunteer-home.page.scss'],
})
export class VolunteerHomePage implements OnInit {
  firebaseConfig = {
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
  app = initializeApp(this.firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(this.app);
  jsonDataList: any[] = [];
  whichSegment = 0;
  content_visibility = 'visible';
  requests : any[]= [];
  // @ts-ignore
  volunteerID : string= ' '

  constructor(private authService: AuthService,
              private router: Router,
              private uid: RetrieveUserDataService,
              private updateDateTime: DateTimeUtilsTsService,
              private requestNames: RetrieveInNeedHomeRequestService,
  ) {
  }

  async ngOnInit() {
    this.volunteerID = await this.uid.getUid();
    const q1 = query(collection(this.db, "request_info"), where("status", "==", "pendingConfirmation"),
      where("matchedVolIds", "array-contains", await this.uid.getUid()));
    const q2 = query(collection(this.db, "request_info"), where("status", "==", "pendingConfirmation"),
      where("rejectedVol", "array-contains", await this.uid.getUid()));

    const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    // Combine the results
    const combinedDocs = [...querySnapshot1.docs, ...querySnapshot2.docs].filter(
      (doc, index, self) => index === self.findIndex((t) => t.id === doc.id)
    );

    // Call the createList function with the combined results
    this.createList(combinedDocs);
  }
  async createList(documents: any){
    for(const requestDoc of documents){
    const currentDoc = requestDoc.data();
    const reqName = await this.requestNames.retrieveRequestName()
    currentDoc['nameReq'] = reqName.find((l) => requestDoc.data()["requestId"] === l.id).data.request
    const updatedDoc = this.updateDateTime.updateDateTime(currentDoc);
    updatedDoc.id = requestDoc.id;
    await getDoc(doc(this.db, 'registration-details', updatedDoc.uid)).then((docSnapshot) =>{
      if (docSnapshot.exists()) {
        updatedDoc.in_needName= docSnapshot.data()["name"];
        updatedDoc.in_needSurname= docSnapshot.data()["surname"];
        updatedDoc.in_needAge = docSnapshot.data()["age"];
      } else {
        console.log('No such document!');
      }
    })
      .catch((error) => {
        console.error('Error getting document:', error);
      });
    this.jsonDataList.push(updatedDoc);
    }
  }


  async setVolunteerDetails() {
    await this.router.navigateByUrl('/volunteer', {replaceUrl: true});
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('/', {replaceUrl: true});
  }

  async acceptRequest(requestId: string, uid: string) {
    const documentRef = doc(this.db, 'request_info', requestId);
    const updateField = {
      "matchedVolIds": [await this.uid.getUid()],
      "status": "matched"
    };
    updateDoc(documentRef, updateField)
    const functions = getFunctions(this.app)
    const acceptReq = httpsCallable(functions, 'acceptReq')
    await acceptReq({"uid": uid})
  }

  async rejectRequest(requestId: string, uid: string) {
    const documentRef = doc(this.db, 'request_info', requestId);
    const documentSnap = await getDoc(documentRef);
    let userId: string;
    if (documentSnap.exists()) {
      const requestData = documentSnap.data();
      const matchedVolIds = requestData['matchedVolIds'] || [];
      userId = await this.uid.getUid()
      // Remove the provided uid from the matchedVolIds array
      const updatedMatchedVolIds = matchedVolIds.filter((id: string) => id !== userId);
      // Update the document with the updated matchedVolIds
      await updateDoc(documentRef, {"matchedVolIds": updatedMatchedVolIds, "rejectedVol" : arrayUnion(await this.uid.getUid())});

      // Check if the updated matchedVolIds is empty
      const isEmpty = updatedMatchedVolIds.length === 0;
      if (isEmpty) {
        const functions = getFunctions(this.app)
        const rejectReq = httpsCallable(functions, 'rejectReq')
        await rejectReq({"uid": uid})
        await deleteDoc(documentRef);
      }
    }
  }
  requestsSegmentChanged(event :any){
    this.whichSegment = event.detail.value;
  }
  hideBackground(event: string){
    this.content_visibility = event;

  }
}
