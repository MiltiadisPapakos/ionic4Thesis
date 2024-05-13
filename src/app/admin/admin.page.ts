import {Component, NgZone, OnInit} from '@angular/core';
import {RetrieveUserDetailsService} from "../services/retrieve-user-details.service";
import {RetrieveRequestListService} from "../services/retrieve-request-list.service";
import {Router} from "@angular/router";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";
import {AuthService} from "../services/auth.service";
import {getApp} from "@angular/fire/app";
import {addDoc, collection, deleteDoc, getFirestore} from "@angular/fire/firestore";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {doc} from "@firebase/firestore";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  userList: any[] =[];
  requestList: any[] =[];
  request= '';
  constructor(private retrieveUserDetailsService: RetrieveUserDetailsService,
              private retrieveRequestList: RetrieveRequestListService,
              private router: Router,
              private authService: AuthService,
              private zone: NgZone,
              private firestore: AngularFirestore) { }

  async ngOnInit() {
    this.userList = await this.retrieveUserDetailsService.getUserList()
    this.requestList = await this.retrieveRequestList.getRequestList()
  }
  async createRequestItem(){
    const firebaseApp = getApp();
    const database = getFirestore(firebaseApp);
    const myInput = document.getElementById("request") as HTMLInputElement;
    const requestData = {request : myInput.value}

    await addDoc(collection(database, 'request-list'), requestData);
    location.reload()
    // this.zone.run(() => {
    // });
  }
  async deleteUser(userID : string){
    const firebaseApp = getApp();
    const database = getFirestore(firebaseApp);
    await deleteDoc(doc(database, "registration-details", userID));
  }
  async logout(){
    await this.authService.logout();
    await this.router.navigateByUrl('/',{ replaceUrl: true});

  }
}
