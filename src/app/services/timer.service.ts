import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  secondsLeft: number = 10; // Set your desired timer duration
  interval: any;
  constructor() { }

startTimer() {
  this.interval = setInterval(() => {
    this.secondsLeft--;
    if (this.secondsLeft === 0) {
      clearInterval(this.interval);
    }
  }, 1000);
}
}
