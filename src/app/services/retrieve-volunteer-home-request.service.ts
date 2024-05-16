import { Injectable } from '@angular/core';
import {initializeApp} from "@angular/fire/app";
import {getFirestore} from "@angular/fire/firestore";
import {collection, getDocs, query, where} from "firebase/firestore";
import {RetrieveUserDataService} from "./retrieve-user-data.service";
import {DateTimeUtilsTsService} from "./date-time-utils.ts.service";

@Injectable({
  providedIn: 'root'
})
export class RetrieveVolunteerHomeRequestService {

  constructor(private userId : RetrieveUserDataService,
  private updateDateTime: DateTimeUtilsTsService ) { }

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

  async retrieveRequests(reqStatus : string) {
    let requests  : any[]= [];
    const userId = await this.userId.getUid();
    const q = query(collection(this.db, "request_info"), where("matchedVolIds", "array-contains", userId),
      where("status", "==",reqStatus));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      requests.push({
        "id" : doc.id,
        "data" : this.updateDateTime.updateDateTime(doc.data())
      })
    });
    console.log(requests);
    return requests;
  }
  async retrieveInNeed() {
    let in_need  : any[]= [];
    const vol = query(collection(this.db, "registration-details"), where("role", "==", 'in-need' ))
    const querySnapshot = await getDocs(vol);
    querySnapshot.forEach((doc) => {
      in_need.push({
        "id" : doc.id,
        "data" : doc.data()
      })
    });
    return in_need;
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
    let in_needs  : any[]= [];
    let reqName  : any[]= [];
    requests = await this.retrieveRequests(reqStatus);
    in_needs = await this.retrieveInNeed();
    reqName = await this.retrieveRequestName();
    requests.forEach(request =>{
      request.matchVols = in_needs.filter(e => request.data.uid !== undefined && request.data.uid.indexOf(e.id) > -1)
      request.nameReq = reqName.find(l => request.data.requestId === l.id).data.request
    })
    return requests;

  }
}
