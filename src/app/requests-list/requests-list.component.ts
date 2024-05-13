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

@Component({
  selector: 'app-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
})

export class RequestsListComponent  implements OnInit {
  constructor(private requestListInNeed : RetrieveInNeedHomeRequestService,
              private requestListVol : RetrieveVolunteerHomeRequestService,
              private modalController: ModalController) {

  }
  @Input() reqStatus : string = " ";
  requests : any[]= [];
  selectedVolunteersList: { id: any, volunteers: any[] }[] = [];
  @Input() flag : number = 0;
  async ngOnInit() {
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
        title: 'Success',
        message: 'Operation completed successfully!',
        type: 'success'
      }
    });
    await modal.present();
  }

  async presentErrorModal() {
    const modal = await this.modalController.create({
      component: SuccessErrorModalComponent,
      componentProps: {
        title: 'Error',
        message: 'An error occurred. Please try again.',
        type: 'error'
      }
    });
    await modal.present();
  }
}


