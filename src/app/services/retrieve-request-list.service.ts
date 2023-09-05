import { Injectable } from '@angular/core';
import {getApp} from "@angular/fire/app";
import {collection, getDocs, getFirestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class RetrieveRequestListService {
  requestList: any[]  = [];
  constructor() { }

async getRequestList(){
  this.requestList = []; //Αχρικοποιηση της λιστασ για αποφυγη διπλοτυπου κατα την κληση της OnInit
  const firebaseApp = getApp();
  const database = getFirestore(firebaseApp);
  const querySnapshot = await getDocs(collection(database, "request-list"));
  querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      let requestListInfo = {"uid":doc.id ,"request_name" :doc.data()['request']}
      this.requestList.push(requestListInfo)
    }
  )
  return this.requestList
}
}
