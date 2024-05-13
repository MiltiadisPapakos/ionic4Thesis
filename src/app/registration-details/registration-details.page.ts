import { Component, OnInit } from '@angular/core';
import {AvatarService} from "../services/avatar.service";
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {getApp} from "@angular/fire/app";
import {doc, getFirestore, setDoc} from "@angular/fire/firestore";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";
import {updateDoc} from "@firebase/firestore";
import {FCM} from "@capacitor-community/fcm";
import {PushNotifications} from "@capacitor/push-notifications";

@Component({
  selector: 'app-registration-details',
  templateUrl: './registration-details.page.html',
  styleUrls: ['./registration-details.page.scss'],
})
export class RegistrationDetailsPage implements OnInit {
  formData: FormGroup;
  checkboxChecked =false;
  constructor(
    private fb: FormBuilder,
    private userService: RetrieveUserDataService,
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController) {
    this.formData= this.fb.group({
      name:['', [Validators.required]],
      surname:['', [Validators.required]],
      age:['',[Validators.required]],
      phone_number:['',[Validators.required]],
      role:[ '', [Validators.required, this.validateSelect]],



    });

  }
  get name(){
    return this.formData.get('name');
  }
  get surname(){
    return this.formData.get('surname');
  }
  get age(){
    return this.formData.get('age');
  }
  get phone_number(){
    return this.formData.get('phone_number');
  }
  get role(){
    return this.formData.get('role')
  }
  get checked_checkbox(){
    return this.formData.get('checked_checkbox')
  }


  ngOnInit() {

  };


  async onSubmit(){
   const firebaseApp = getApp();
   const database = getFirestore(firebaseApp);

   const userId = await this.userService.getUid()
   await setDoc(doc(database,'registration-details',userId),this.formData.value)
   await updateDoc(doc(database,'registration-details',userId), await FCM.getToken())
   let role = this.formData.get('role')?.value;

    if (role === "volunteer"){
      await this.router.navigateByUrl('/volunteer', {replaceUrl: true});
    }else if (role ==="in-need") {
     await this.router.navigateByUrl('/in-need', {replaceUrl: true});
    }
    await PushNotifications.requestPermissions();
    await PushNotifications.register()
  }
  validateSelect(c: FormControl) {
    const selectedValue = c.value;
    return selectedValue ? null : { required: true };
  }

  async logout(){
     await this.authService.logout();
    await this.router.navigateByUrl('/',{ replaceUrl: true});
  }
}
