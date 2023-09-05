import { Injectable } from '@angular/core';
import {getApp} from "@angular/fire/app";
import {collection, getDocs, getFirestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class RetrieveUserDetailsService {
  userList : any[]= [];
  constructor() {
  }

  async getUserList() {
    const firebaseApp = getApp();
    const database = getFirestore(firebaseApp);
    const querySnapshot = await getDocs(collection(database, "registration-details"));
    querySnapshot.forEach((doc) => {
        let userListInfo = {"userID": doc.id, "Name": doc.data()['name'], "Surname": doc.data()['`surname'],
          "Age" : doc.data()['age'],"Role": doc.data()['role'], "Phone_Number" : doc.data()['phone_number']}
        this.userList.push(userListInfo)

      }
    )
    console.log(this.userList)
    return this.userList
  }
}
