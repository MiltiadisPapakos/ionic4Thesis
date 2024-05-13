import { Component, OnInit, NgZone } from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {getApp} from "@angular/fire/app";
import {addDoc, collection, doc, getDocs, getFirestore, setDoc} from "@angular/fire/firestore";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";
import {RetrieveRequestListService} from "../services/retrieve-request-list.service";
import {AlertController} from "@ionic/angular";
import { formatDate } from '@angular/common';
declare const google: any;
@Component({
  selector: 'app-in-need',
  templateUrl: './in-need.page.html',
  styleUrls: ['./in-need.page.scss'],
})
export class InNeedPage implements OnInit {

  requestList: any[]  = [];
  requestSelect: string = '';
  locationName: string ='';
  locationLat: number = 0;
  locationLng: number = 0;
  showGrid = true;
  showDatePicker = false;
  currentDate = new Date();
  minDate = formatDate(this.currentDate, 'yyyy-MM-dd', 'en');
  selectedDate: string = ''; // Initialize the property here
  dayOfWeekNumber: number = 0;
  timeTable = [{time: '9-11', value: false}, {time : '11-13', value: false}, {time: '13-15', value: false}, {time: '15-17', value: false},
    {time: '17-19', value: false}, {time: '19-21', value: false}];

  dayTable = [{day: 'Δεύτερα',coded: 1, value: false}, { day: 'Τρίτη',coded:2 ,value: false}, {day: 'Τετάρτη',coded:3, value: false}, {day: 'Πέμπτη',coded:4 , value: false},
    {day: 'Παρασκευή',coded:5 , value: false}, {day: 'Σάββατο',coded:6 , value: false}, {day: 'Κυριακή',coded:0 , value: false}];

  constructor(private authService: AuthService,
              private router: Router,
              private userService: RetrieveUserDataService,
              private requestListService: RetrieveRequestListService,
              private zone: NgZone,
              private alertController : AlertController) {}


  async ngOnInit()
    {
      this.requestList = await this.requestListService.getRequestList()
      this.requestSelect = this.requestList[0]['uid']
      this.loadGoogleMapsApi(() => {
        const autocomplete = new google.maps.places.Autocomplete(
          document.getElementById('autocomplete'),
          {
            types: ['geocode'],
            componentRestriction: {'country': ['GR']},
            fields: ['place_id', 'geometry', 'name']
          }
        );
        autocomplete.addListener('place_changed', () => this.onPlaceChanged(autocomplete));

      });
    }
  onToggleChange() {
    if (this.showDatePicker) {
      // Hide the grid and show the date picker
      this.showGrid = false;
      this.showDatePicker = true;
      this.resetDays()
    } else {
      // Hide the date picker and show the grid
      this.showGrid = true;
      this.showDatePicker = false;
    }
  }
  onPlaceChanged(autocomplete: any) {
    let place = autocomplete.getPlace();

    if (!place.geometry) {
      (document.getElementById('autocomplete') as HTMLInputElement).placeholder = 'Βάλε τοποθεσία αιτήματος'
    }else{
      this.zone.run(() => {     //επιβεβλημενο refresh για εξεταση conditions της isValid
        this.locationName = place.name
        this.locationLat = place.geometry.location.lat()
        this.locationLng = place.geometry.location.lng()
      })
    }
  }
  loadGoogleMapsApi(callback: () => void) {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCm-scEKpmk0LxHXrp_5Kosiaw_8BkHn28&libraries=places`;
    script.onload = callback;
    document.body.appendChild(script);
  }
getDayByCalender(){
  const selectedDateObj = new Date(this.selectedDate);
  this.dayOfWeekNumber= selectedDateObj.getUTCDay();

  return this.dayOfWeekNumber
}
resetDays(){
  for(let j in this.dayTable){
    this.dayTable[j].value = false;
  }
}
setDay(i: number){
    for(let j in this.dayTable){
      this.dayTable[j].value = false;
    }
    this.dayTable[i].value = true;
    return this.dayTable[i].day
  }
getDay(){
  let day
  for(let j in this.dayTable) {
    if (this.dayTable[j].value) {
       day = this.dayTable[j].coded
    }
  }
  return day
}

setTime(i : number) {
  this.timeTable[i].value = !this.timeTable[i].value;
}
getTime(){
  let time= []
    for(let j in this.timeTable) {
      if (this.timeTable[j].value) {
        if (this.showGrid){
          time.push(this.timeTable[j].time + this.getDay())
        }else if(this.showDatePicker){
          time.push(this.timeTable[j].time + this.getDayByCalender())
        }
      }
    }
   return time
}
isValid(){
  let condition1 = !(this.getDay() === undefined || this.getTime().length === 0 || this.locationName === '');
  let condition2 = !(this.getDayByCalender() === undefined || this.getTime().length === 0 || this.locationName === '');
  return condition1 || condition2
}

async onSubmit(){
    const firebaseApp = getApp();
    const database = getFirestore(firebaseApp);

    const userId = await this.userService.getUid();
    let dayTimeData: any;
    if (this.showGrid){
      dayTimeData= this.getDay();
    }else if(this.showDatePicker){
      dayTimeData = this.getDayByCalender();
    }
    const timeTableData = this.getTime();
    const requestLoc = { "locationLat": this.locationLat, "locationLng" : this.locationLng}
    const requestInfo = {"uid": userId ,"day": dayTimeData, "time": timeTableData,"requestId" : this.requestSelect, "coordinates" : requestLoc, "locationName" : this.locationName , "status" : "available" }
    await addDoc(collection(database, 'request_info'), requestInfo);
    await this.showAlert('Επιτυχής Υποβολή', 'Το αίτημα σας αποθηκεύτηκε!')
    await this.router.navigateByUrl('/in-need-home', {replaceUrl: true});

}

  async showAlert(header: string, message: string){
    const alert= await this.alertController.create({
      header,
      message,
      buttons: ['OK']

    });
    await alert.present();
  }

  async logout(){
    await this.authService.logout();
    await this.router.navigateByUrl('/',{ replaceUrl: true});
  }
}
