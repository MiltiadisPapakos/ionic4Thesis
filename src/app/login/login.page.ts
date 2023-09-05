import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertController, LoadingController} from "@ionic/angular";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  credentials: FormGroup;

  constructor(
    // private retrieveUserRole :RetrieveUserDataService,
    private fb: FormBuilder,
    private userService: RetrieveUserDataService,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private router: Router
  ) { this.credentials = this.fb.group({
    email:['', [Validators.required, Validators.email]],
    password:['', [Validators.required, Validators.minLength(6)]],
  });}




  get email(){
    return this.credentials.get('email');
  }

  get password(){
    return this.credentials.get('password')
  }

  ngOnInit() {

  }
  async register(){
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.register(this.credentials.value);
    await loading.dismiss();



    if (user){
      await this.router.navigateByUrl('/registration-details', {replaceUrl: true});
    }else {
      await this.showAlert('Registration failed', 'Please try again!')
    }
  }
  async login(){
    const loading = await this.loadingController.create();
    await loading.present();

    const user = await this.authService.login(this.credentials.value);
    await loading.dismiss();

    const role = await this.userService.getRole()
    if(role === ''){
      await this.showAlert('Login failed', 'Please try again!')
    }
    else if(role === "volunteer"){
      await this.router.navigateByUrl('/volunteer-home', {replaceUrl: true});
    }else if(role === "in-need") {
      await this.router.navigateByUrl('/in-need-home', {replaceUrl: true});
    }else if(role === "No Data"){
      await this.router.navigateByUrl('/registration-details', {replaceUrl: true});
    }else if(role ==="admin"){
      await this.router.navigateByUrl('/admin', {replaceUrl: true});
    }
  }
  async showAlert(header: string, message: string){
    const alert= await this.alertController.create({
      header,
      message,
      buttons: ['OK']

    });
    await alert.present();
  }
}
