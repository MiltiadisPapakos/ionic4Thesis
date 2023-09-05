import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InNeedPage } from './in-need.page';

const routes: Routes = [
  {
    path: '',
    component: InNeedPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InNeedPageRoutingModule {}
