import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InNeedHomePage } from './in-need-home.page';

const routes: Routes = [
  {
    path: '',
    component: InNeedHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InNeedHomePageRoutingModule {}
