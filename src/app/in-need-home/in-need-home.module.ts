import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InNeedHomePageRoutingModule } from './in-need-home-routing.module';

import { InNeedHomePage } from './in-need-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InNeedHomePageRoutingModule
  ],
  declarations: [InNeedHomePage]
})
export class InNeedHomePageModule {}
