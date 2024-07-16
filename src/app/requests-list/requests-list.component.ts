import {Component, EventEmitter, Input, OnInit, Output, } from '@angular/core';
import {RetrieveInNeedHomeRequestService} from "../services/retrieve-in-need-home-request.service";
import {NgxQrcodeElementTypes} from '@techiediaries/ngx-qrcode';
// import {NgxQrcodeErrorCorrectionLevels} from "@techiediaries/ngx-qrcode/lib/qrcode.types";
import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
import {flag} from "ionicons/icons";
import {RetrieveVolunteerHomeRequestService} from "../services/retrieve-volunteer-home-request.service";
import {DateTimeUtilsTsService} from "../services/date-time-utils.ts.service";
import { ModalController } from '@ionic/angular';
import {SuccessErrorModalComponent} from "src/app/success-error-modal/success-error-modal.component";
import {initializeApp} from "@angular/fire/app";
import {doc, getDoc, getFirestore, limit, orderBy, updateDoc} from "@angular/fire/firestore";
import {Router} from "@angular/router";
import {collection, getDocs, query, where} from "firebase/firestore";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";


@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
})

export class RequestsListComponent  implements OnInit {
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
  constructor(private requestListInNeed : RetrieveInNeedHomeRequestService,
              private requestListVol : RetrieveVolunteerHomeRequestService,
              private modalController: ModalController,
              private router: Router,
              private userId: RetrieveUserDataService) {

  }
  @Input() reqStatus : string = " ";
  requests : any[]= [];
  selectedVolunteersList: { id: any, volunteers: any[] }[] = [];
  are_matched : any = [];
  @Input() flag : number = 0;
  async ngOnInit() {
    const userId = await this.userId.getUid();
    const docRef = doc(this.db ,"registration-details",userId);
    const docSnap = await getDoc(docRef);
    this.are_matched= docSnap.data()?.["matched"]
   await this.retrieveRequests()
  }
  async retrieveRequests(){
    if(this.flag === 0) {
      this.requests = await this.requestListInNeed.requestConfig(this.reqStatus);
    }else{
      this.requests = await this.requestListVol.requestConfig(this.reqStatus);

    }
  }

  selectedVolunteers: Set<any> = new Set();
  elementType = NgxQrcodeElementTypes.IMG;
  isQRbuttonclicked = ' ';
  close_camera_button = "hidden";

  @Output() newItemEvent = new EventEmitter<string>();
  toggleVolunteerSelection(request: any, volunteer: any): void {
    const requestId = request.id;
    const volunteerId = volunteer.id;

    const index = this.selectedVolunteersList.findIndex(item => item.id === requestId);

    if (index !== -1) {
      const selectedVolunteers = this.selectedVolunteersList[index].volunteers;

      if (selectedVolunteers.includes(volunteerId)) {
        selectedVolunteers.splice(selectedVolunteers.indexOf(volunteerId), 1);
      } else {
        selectedVolunteers.push(volunteerId);
      }
    } else {
      this.selectedVolunteersList.push({ id: requestId, volunteers: [volunteerId] });
    }
  }



  isVolunteerSelected(request: any, volunteer: any): boolean {
    const requestId = request.id;
    const volunteerId = volunteer.id;

    const index = this.selectedVolunteersList.findIndex(item => item.id === requestId);

    return index !== -1 && this.selectedVolunteersList[index].volunteers.includes(volunteerId);
  }
  submitSelection(): void {
    // You can now use this.selectedVolunteersList for further processing or sending to a server.
    this.requestListInNeed.updateVols(this.selectedVolunteersList);
  }
  showQR(request : any){
    this.isQRbuttonclicked = request;
  }
  async openCamera(requestId: string){
    const startScan = async () => {
      // Check camera permission
      // This is just a simple example, check out the better checks below
      await BarcodeScanner.checkPermission({ force: true });

      // make background of WebView transparent
      // note: if you are using ionic this might not be enough, check below
      document.querySelector('body')?.classList.add('scanner-active');
      this.close_camera_button = "visible";
      this.newItemEvent.emit('hidden');
      await BarcodeScanner.hideBackground();

      const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] }); // start scanning and wait for a result

      // if the result has content
      if (result.hasContent) {
        if (result.content === requestId) {
          await this.presentSuccessModal();
          //////////////UPDATE FIELD STATUS REQ TO DONE
          const reqRef = doc(this.db, "request_info", requestId);
          await updateDoc(reqRef, { "status": "done"})
        } else {
          await this.presentErrorModal();
        }
      }

      document.querySelector('body')?.classList.remove('scanner-active');
      this.close_camera_button = "hidden";
      this.newItemEvent.emit('visible');

    };
    await startScan();
  }
  async presentSuccessModal() {
    const modal = await this.modalController.create({
      component: SuccessErrorModalComponent,
      componentProps: {
        title: 'ΕΠΙΤΥΧΗΣ ΤΑΥΤΟΠΟΙΗΣΗ',
        message: 'Η ΤΑΥΤΟΠΟΙΗΣΗ ΕΓΙΝΕ ΕΠΙΤΥΧΩΣ',
        type: 'success'
      }
    });
    await modal.present();

  }

  async presentErrorModal() {
    const modal = await this.modalController.create({
      component: SuccessErrorModalComponent,
      componentProps: {
        title: 'ΑΠΟΤΥΧΙΑ ΚΑΤΑ ΤΗΝ ΤΑΥΤΟΠΟΙΗΣΗ',
        message: 'Η ΤΑΥΤΟΠΟΙΗΣΗ ΕΓΙΝΕ ΑΝΕΠΙΤΥΧΩΣ',
        type: 'error'
      }
    });
    await modal.present();
  }
   areMatchedAgain(volunteerId:string){
    if(this.are_matched && Array.isArray(this.are_matched)){
      return !!this.are_matched.includes(volunteerId);
    }else{
      return false;
    }
  }
  async setReview(requestId: string) {
    await this.router.navigate(['/review-form'], { queryParams: { requestId } });
  }
}



