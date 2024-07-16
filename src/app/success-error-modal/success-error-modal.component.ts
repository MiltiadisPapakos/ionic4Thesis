import {Component, Input, OnInit} from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-success-error-modal',
  templateUrl: './success-error-modal.component.html',
  styleUrls: ['./success-error-modal.component.scss']
})
export class SuccessErrorModalComponent implements OnInit {

  @Input() title: string | undefined;
  @Input() message: string | undefined;
  @Input() type: 'success' | 'error' | undefined;

  iconClass: string | undefined;
  iconColor: string | undefined;
  iconSize: any;
  path_image : string | undefined;

  constructor(private modalController: ModalController) {
  }

  ngOnInit() {
    this.path_image = this.type === 'success' ? "assets/check.png" : "assets/x.png";
    this.iconColor = this.type === 'success' ? '#28a745' : '#dc3545';
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
