import { Injectable } from '@angular/core';
import {Auth} from "@angular/fire/auth";
import {getApp, initializeApp} from "@angular/fire/app";
import {doc, getDoc, getFirestore, updateDoc} from "@angular/fire/firestore";
import { collection, query, where, getDocs } from "firebase/firestore";
import {RetrieveUserDataService} from "./retrieve-user-data.service";
import {getFunctions, httpsCallable} from "@angular/fire/functions";
import {DateTimeUtilsTsService} from "./date-time-utils.ts.service";

@Injectable({
  providedIn: 'root'
})
export class RetrieveInNeedHomeRequestService {
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

  constructor(private userId : RetrieveUserDataService,
              private updateDateTime: DateTimeUtilsTsService) { }

  async retrieveRequests(reqStatus : string) {
    let requests  : any[]= [];

    const q = query(collection(this.db, "request_info"), where("uid", "==", await this.userId.getUid()),
      where("status", "==",reqStatus))
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      requests.push({
        "id" : doc.id,
        "data" : this.updateDateTime.updateDateTime(doc.data())
      })
    });
    return requests;
  }
  async retrieveVols() {
   let volunteers  : any[]= [];
    const vol = query(collection(this.db, "registration-details"), where("role", "==", 'volunteer' ))
    const querySnapshot = await getDocs(vol);
    querySnapshot.forEach((doc) => {
      volunteers.push({
        "id" : doc.id,
        "data" : doc.data()
      })
    });
    return volunteers;
  }
  async retrieveRequestName(){
    let reqName  : any[]= [];
    const names = query(collection(this.db, "request-list"))
    const querySnapshot = await getDocs(names);
    querySnapshot.forEach((doc) => {
      reqName.push({
        "id" : doc.id,
        "data" : doc.data()
      })
    });
    return reqName;
  }
  async requestConfig(reqStatus: string){
    let requests  : any[]= [];
    let volunteers  : any[]= [];
    let reqName  : any[]= [];
    requests = await this.retrieveRequests(reqStatus);
    volunteers = await this.retrieveVols();
    reqName = await this.retrieveRequestName();
    requests.forEach(request =>{
      request.matchVols = volunteers.filter(e => request.data.matchedVolIds !== undefined && request.data.matchedVolIds.indexOf(e.id) > -1)
      request.nameReq = reqName.find(l => request.data.requestId === l.id).data.request
    })
    return requests;

  }
  async updateVols(requestVol : any[], ){
    for (const request of requestVol) {
      if(request.volunteers.length !== 0) {
        const reqRef = doc(this.db, "request_info", request.id);
        await updateDoc(reqRef, {"matchedVolIds": request.volunteers, "status": "pendingVol"})
      }
    }

    const functions = getFunctions(this.app)
    const notifyVolunteers = httpsCallable(functions, 'notifyVolunteers')
    await notifyVolunteers({"uid" : await this.userId.getUid() })
  }

}
