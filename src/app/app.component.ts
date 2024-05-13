import { Component } from '@angular/core';
import {NgxQrcodeElementTypes} from "@techiediaries/ngx-qrcode";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  title = "push-notification";
  message: any;
  constructor() {}

  ngOnInit() {
  }

  elementType = NgxQrcodeElementTypes.IMG;
}
