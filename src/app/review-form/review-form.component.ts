import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";
import {ActivatedRoute, Router} from '@angular/router';
import {getApp} from "@angular/fire/app";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc
} from "@angular/fire/firestore";
import {AlertController} from "@ionic/angular";
@Component({
  selector: 'app-review-form',
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.scss'],
})
export class ReviewFormComponent implements OnInit {
  reviewForm!: FormGroup;
  reviewerType: string = 'volunteer'; // Default to 'volunteer', can be changed dynamically
  requestId: string = ' ';
  constructor(private fb: FormBuilder,
              private userService: RetrieveUserDataService,
              private route: ActivatedRoute,
              private alertController : AlertController,
              private router: Router,
              private uid: RetrieveUserDataService,) {}

  async ngOnInit() {

    this.route.queryParams.subscribe(params => {
      this.requestId = params['requestId'];
    });
    this.reviewerType =  await this.userService.getRole()
    await this.initializeForm();
  }

  async initializeForm() {
    const parameters = await this.getParams(this.requestId);
    const commonFields = {
      service_id: [parameters.req, Validators.required],
      overall_satisfaction: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: [''],
      match_again: false,
      reviewee_id : [parameters.id]
    };

    if (this.reviewerType === 'volunteer') {

      this.reviewForm = this.fb.group({
        ...commonFields,
        volunteer_id: [parameters.name + ' ' +parameters.surname, Validators.required],
        punctuality: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
        helpfulness: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
        communication: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      });
    } else {
      this.reviewForm = this.fb.group({
        ...commonFields,
        person_id: [parameters.name + ' ' +parameters.surname, Validators.required],
        clarity_of_request: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
        respectfulness: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
        cooperation: [null, [Validators.required, Validators.min(1), Validators.max(5)]],

      });
    }
  }
  async getParams(requestId : string){
    const parameters : any = { };
    const firebaseApp = getApp();
    const database = getFirestore(firebaseApp);
    const docRefReq = doc(database, 'request_info', requestId);
    const docSnapshot = await getDoc(docRefReq);
    if(this.reviewerType === 'volunteer') {
      // @ts-ignore
      const docRefInNeed = doc(database, 'registration-details', docSnapshot.data()['uid']);
      const docSnapshotInNeed = await getDoc(docRefInNeed);
      parameters.id = docSnapshot.data()?.['uid']
      parameters.name = docSnapshotInNeed.data()?.['name'];
      parameters.surname = docSnapshotInNeed.data()?.['surname']
      parameters.req = docSnapshot.data()?.['requestId']
      // @ts-ignore
      const docRef = doc(database, 'request-list', parameters.req);
      const docSnapshotReq = await getDoc(docRef);
      parameters.req = docSnapshotReq.data()?.['request']
      return parameters;

    }else {
      // @ts-ignore
      const docRefVol = doc(database, 'registration-details', docSnapshot.data()['matchedVolIds'][0]);
      const docSnapshotVol = await getDoc(docRefVol)
      parameters.id = docSnapshot.data()?.['matchedVolIds'][0]
      parameters.name = docSnapshotVol.data()?.['name'];
      parameters.surname = docSnapshotVol.data()?.['surname']
      parameters.req = docSnapshot.data()?.['requestId']
      // @ts-ignore
      const docRef = doc(database, 'request-list', parameters.req);
      const docSnapshotReq = await getDoc(docRef);
      parameters.req = docSnapshotReq.data()?.['request']
      return parameters;
    }
  }
  async onSubmit() {
    const firebaseApp = getApp();
    const database = getFirestore(firebaseApp);
    const formData = this.reviewForm.value;
    formData.timestamp = new Date();
    const userId = await this.uid.getUid();
    formData.reviewer_id = userId;

    if(formData.match_again){
       await updateDoc(doc(database, "registration-details",userId) ,{"matched" : arrayUnion(formData.reviewee_id)} )
    }else{
      await updateDoc(doc(database, "registration-details", userId) ,{"matched" : arrayRemove(formData.reviewee_id)} )
    }

    await addDoc(collection(database, 'reviews'),formData)
    await this.showAlert('Επιτυχής Υποβολή', 'Η αξιολόγηση σας αποθηκεύτηκε!')
    if(this.reviewerType === 'volunteer'){
      await this.router.navigateByUrl('/volunteer-home', {replaceUrl: true});
    }else{
      await this.router.navigateByUrl('/in-need-home', {replaceUrl: true});
    }
    }

  async showAlert(header: string, message: string){
    const alert= await this.alertController.create({
      header,
      message,
      buttons: ['OK']

    });
    await alert.present();
  }
}
