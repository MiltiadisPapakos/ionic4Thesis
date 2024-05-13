import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VolunteerHomePageRoutingModule } from './volunteer-home-routing.module';

import { VolunteerHomePage } from './volunteer-home.page';
import {InNeedHomePageModule} from "../in-need-home/in-need-home.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        VolunteerHomePageRoutingModule,
        InNeedHomePageModule
    ],
  declarations: [VolunteerHomePage]
})
export class VolunteerHomePageModule {}
