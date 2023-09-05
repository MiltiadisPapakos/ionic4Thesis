import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VolunteerHomePage } from './volunteer-home.page';

const routes: Routes = [
  {
    path: '',
    component: VolunteerHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VolunteerHomePageRoutingModule {}
