import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InNeedHomePageRoutingModule } from './in-need-home-routing.module';

import { InNeedHomePage } from './in-need-home.page';
import {RequestsListComponent} from "../requests-list/requests-list.component";
import {NgxQRCodeModule} from "@techiediaries/ngx-qrcode";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InNeedHomePageRoutingModule,
    NgxQRCodeModule
  ],
  exports: [
    RequestsListComponent
  ],
  declarations: [InNeedHomePage, RequestsListComponent]
})
export class InNeedHomePageModule {}
