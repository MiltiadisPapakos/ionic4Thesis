import {Component, Input} from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-success-error-modal',
  templateUrl: './success-error-modal.component.html',
  styleUrls: ['./success-error-modal.component.scss']
})
export class SuccessErrorModalComponent {

  @Input() title: string | undefined;
  @Input() message: string | undefined;
  @Input() type: 'success' | 'error' | undefined;

  iconClass: string | undefined;
  iconColor: string | undefined;
  iconSize: any;

  constructor(private modalController: ModalController) {
    this.iconClass = this.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle';
    this.iconColor = this.type === 'success' ? '#28a745' : '#dc3545';
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
