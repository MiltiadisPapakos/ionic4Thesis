import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-volunteer-login',
  templateUrl: './volunteer-home.page.html',
  styleUrls: ['./volunteer-home.page.scss'],
})
export class VolunteerHomePage implements OnInit {

  constructor(private authService: AuthService,
              private router: Router,
              ) { }

  ngOnInit() {
  }
  async setVolunteerDetails() {
    await this.router.navigateByUrl('/volunteer', {replaceUrl: true});
  }
  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('/', {replaceUrl: true});
  }
}
