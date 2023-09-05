import { Component, OnInit , NgZone} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router} from "@angular/router";
import {getApp} from "@angular/fire/app";
import {AlertController} from "@ionic/angular";
import {addDoc, collection, doc, getFirestore, setDoc} from "@angular/fire/firestore";
import {RetrieveUserDataService} from "../services/retrieve-user-data.service";
import {RetrieveRequestListService} from "../services/retrieve-request-list.service";
import {google} from "google-maps";


declare const google: any;

@Component({
  selector: 'app-volunteer',
  templateUrl: './volunteer.page.html',
  styleUrls: ['./volunteer.page.scss'],
})
export class VolunteerPage implements OnInit {

  declare map: google.maps.Map;
  drawnRectangles: google.maps.Rectangle[] = [];
  availabilityArea: any =[];
  checkboxChecked : boolean =  false;
  dayTable: any[] = [];
  requestSelect: any[] = [];
  requestList: any[]  = [];
  private getTimeTable() {
    return [{time: '9-11', value: false}, {time: '11-13', value: false}, {time: '13-15',value: false}, {time: '15-17', value: false},
      {time: '17-19', value: false}, {time: '19-21', value: false}];
  }

  constructor(private authService: AuthService,
              private router: Router,
              private userService :RetrieveUserDataService,
              private requestListService: RetrieveRequestListService,
              private zone: NgZone,
              private alertController : AlertController) {

    this.dayTable = [{day: 'Δεύτερα',coded:1, value: false, hours: this.getTimeTable()}, {day: 'Τρίτη',coded:2, value: false, hours: this.getTimeTable()}, {day: 'Τετάρτη',coded:3,value: false, hours: this.getTimeTable()}, {day: 'Πέμπτη',coded:4, value: false, hours: this.getTimeTable()},
      {day: 'Παρασκευή',coded:5, value: false, hours: this.getTimeTable()}, {day: 'Σάββατο',coded:6, value: false, hours: this.getTimeTable()}, {day: 'Κυριακή',coded:0, value: false,hours: this.getTimeTable()}];


  }

  async ngOnInit() {
    this.requestList = await this.requestListService.getRequestList();
    this.requestSelect.push(this.requestList[0]['uid']);
    await this.initMap();
  }


  async initMap(): Promise<void> {
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    this.map = new Map(document.getElementById("map") as HTMLElement, {
      center: { lat: 38.23, lng: 21.766 },
      zoom: 8,
    });
    const drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          // google.maps.drawing.OverlayType.MARKER,
          // google.maps.drawing.OverlayType.CIRCLE,
          // google.maps.drawing.OverlayType.POLYGON,
          // google.maps.drawing.OverlayType.POLYLINE,
          google.maps.drawing.OverlayType.RECTANGLE,
        ],
      },
      markerOptions: {
        icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
      },
      circleOptions: {
        fillColor: "#ffff00",
        fillOpacity: 1,
        strokeWeight: 5,
        clickable: false,
        editable: true,
        zIndex: 1,
      },
    });

    drawingManager.setMap(this.map);
    google.maps.event.addListener(drawingManager, 'rectanglecomplete', (rectangle: any) => {
      this.handleRectangleComplete(rectangle);
    });

  }
  handleRectangleComplete(rectangle: any ) {
    // Get the rectangle bounds
    const bounds = rectangle.getBounds();
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();

    // Log the coordinates
    console.log('North-East: ', northEast.lat(), northEast.lng());
    console.log('South-West: ', southWest.lat(), southWest.lng());
    this.availabilityArea = { "topLeftLat":  northEast.lat(), "bottomRightLat" : southWest.lat(),"topLeftLng": northEast.lng(),"bottomRightLng" : southWest.lng()}
    // this.availabilityArea = [];
    // this.availabilityArea.push(northEast.lat());
    // this.availabilityArea.push(northEast.lng());
    // this.availabilityArea.push(southWest.lat());
    // this.availabilityArea.push(southWest.lng());
    // Add an event listener to update the coordinates when the rectangle is changed
    // google.maps.event.addListener(rectangle, 'bounds_changed', () => {
    //   const updatedBounds = rectangle.getBounds();
    //   const updatedNorthEast = updatedBounds.getNorthEast();
    //   const updatedSouthWest = updatedBounds.getSouthWest();
    //
    //   console.log('Updated North-East: ', updatedNorthEast.lat(), updatedNorthEast.lng());
    //   console.log('Updated South-West: ', updatedSouthWest.lat(), updatedSouthWest.lng());
    // });

    // Αποθηκευση τετραγώνων και περιορισμος σε μία περιοχή
    if (this.drawnRectangles.length === 0) {
      this.drawnRectangles.push(rectangle);

    }else{
      this.clearDrawnRectangles()
      this.drawnRectangles.push(rectangle)
      console.log(this.drawnRectangles)
    }
  }

  clearDrawnRectangles() {
    for (const rectangle of this.drawnRectangles) {
      rectangle.setMap(null);
    }
    this.zone.run(() => {
      this.drawnRectangles = [];
    });
  }


  setDay(i: number){
    this.dayTable[i].value = !this.dayTable[i].value;
    if(!this.dayTable[i].value){
      this.dayTable[i].hours.map((e: { time : string; value: boolean; }) => e.value = false)
    }
  }
  getDays(){
    let day = []
    for(let j in this.dayTable) {
      if (this.dayTable[j].value) {
        day.push(this.dayTable[j].coded)
      }
    }
    return day
  }
  setTime(i: number, j : number) {
    this.dayTable[i].hours[j].value = !this.dayTable[i].hours[j].value;
  }
  getTime(){
    let hours =[]
    for(let i in this.dayTable) {
      // if (this.dayTable[i].value){
      //   hours.push(this.dayTable[i].day)
      // }
      for (let j in this.dayTable[i].hours) {
        if (this.dayTable[i].value && this.dayTable[i].hours[j].value) {
          hours.push(this.dayTable[i].hours[j].time + this.dayTable[i].coded)
        }
      }
    }
    return hours
  }
  checkValidation(): boolean{
    for(let element of this.dayTable ){
      let count =0;
      if(element.value){
        for (let hourElement of element.hours){
          if(!hourElement.value){
            count++;

          }
        }
        if(count === element.hours.length){
          return false;
        }
      }
    }
    return true
  }
   isValid(){
     return (this.getDays().length !== 0 && this.checkValidation() && this.requestSelect.length!== 0
       && this.drawnRectangles.length!==0);

  }
  async onSubmit(){
    const firebaseApp = getApp();
    const database = getFirestore(firebaseApp);

    // const userInfo = collection(database, 'registration-details')
    const userId = await this.userService.getUid();
    const bigData = {days : this.getDays() , timeInfo : this.getTime(), requestAvailability: this.requestSelect, carAvailability: this.checkboxChecked, availabilityArea: this.availabilityArea  }

    await setDoc(doc(database,'volunteer-availability',userId ), bigData);
    await this.showAlert('Επιτυχής Υποβολή', 'Τα στοιχεια σας αποθηκεύτηκαν!')
    await this.router.navigateByUrl('/volunteer-home', {replaceUrl: true});
  }

  async showAlert(header: string, message: string){
    const alert= await this.alertController.create({
      header,
      message,
      buttons: ['OK']

    });
    await alert.present();
  }

  async logout() {
    await this.authService.logout();
    await this.router.navigateByUrl('/', {replaceUrl: true});
  }
}
