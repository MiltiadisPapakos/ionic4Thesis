import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;

  constructor(private authService: AuthService) {}

  signup() {
    this.authService.signup(this.email, this.password, this.name);
  }
}
