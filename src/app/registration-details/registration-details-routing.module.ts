import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrationDetailsPage } from './registration-details.page';

const routes: Routes = [
  {
    path: '',
    component: RegistrationDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationDetailsPageRoutingModule {}
