import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InNeedPageRoutingModule } from './in-need-routing.module';

import { InNeedPage } from './in-need.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InNeedPageRoutingModule
  ],
  declarations: [InNeedPage]
})
export class InNeedPageModule {}
