import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-in-need-login',
  templateUrl: './in-need-home.page.html',
  styleUrls: ['./in-need-home.page.scss'],
})
export class InNeedHomePage implements OnInit {

  constructor(private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
  }
  async setInNeedDetails() {
    await this.router.navigateByUrl('/in-need', {replaceUrl: true});
  }
  async logout(){
    await this.authService.logout();
    await this.router.navigateByUrl('/',{ replaceUrl: true});
  }
}
