import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {canActivate, redirectUnauthorizedTo, redirectLoggedInTo} from "@angular/fire/auth-guard";

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo([''])
const redirectLoggedInToHome = () => redirectLoggedInTo(['home'])
const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    ...canActivate(redirectUnauthorizedToLogin)
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    ...canActivate(redirectLoggedInToHome)
  },
  {
    path: 'volunteer',
    loadChildren: () => import('./volunteer/volunteer.module').then( m => m.VolunteerPageModule)
  },
  {
    path: 'registration-details',
    loadChildren: () => import('./registration-details/registration-details.module').then( m => m.RegistrationDetailsPageModule)
  },
  {
    path: 'in-need',
    loadChildren: () => import('./in-need/in-need.module').then( m => m.InNeedPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: 'volunteer-home',
    loadChildren: () => import('./volunteer-home/volunteer-home.module').then( m => m.VolunteerHomePageModule)
  },
  {
    path: 'in-need-home',
    loadChildren: () => import('./in-need-home/in-need-home.module').then( m => m.InNeedHomePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
