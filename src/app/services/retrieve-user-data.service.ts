import { Injectable } from '@angular/core';
import {Auth} from "@angular/fire/auth";
import {getApp, initializeApp} from "@angular/fire/app";
import {doc, getDoc, getFirestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class RetrieveUserDataService {
  constructor(
    private af : Auth
  ) {}

  async getUid(): Promise<string> {

    let user = await this.af.currentUser;
    return user?.uid ?? ''

  }
  async getRole(): Promise<string>{
    const firebaseApp = getApp();
// Initialize Cloud Firestore and get a reference to the service
    const db = getFirestore(firebaseApp);

    const userId = await this.getUid()
    if(userId === ''){
      return  ''
    }

    const docRef = doc(db, 'registration-details',userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data()['role']
    } else {
      return 'No Data'
    }
  }

}
