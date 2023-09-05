import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VolunteerHomePageRoutingModule } from './volunteer-home-routing.module';

import { VolunteerHomePage } from './volunteer-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VolunteerHomePageRoutingModule
  ],
  declarations: [VolunteerHomePage]
})
export class VolunteerHomePageModule {}
