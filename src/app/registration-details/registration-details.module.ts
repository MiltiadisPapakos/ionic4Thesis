import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrationDetailsPageRoutingModule } from './registration-details-routing.module';

import { RegistrationDetailsPage } from './registration-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrationDetailsPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [RegistrationDetailsPage]
})
export class RegistrationDetailsPageModule {}
