import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string | undefined;
  password: string | undefined;


  constructor(private navController: NavController) {}

  login() {
    // Perform authentication logic here
    if (this.email === 'example@example.com' && this.password === 'password') {
      this.navController.navigateRoot('/home');
    } else {
      console.log('Invalid credentials');
    }
  }
}
