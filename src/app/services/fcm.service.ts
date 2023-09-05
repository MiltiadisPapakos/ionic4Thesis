import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject } from 'rxjs'
import { getMessaging, getToken } from "firebase/messaging";

@Injectable()
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(private angularFireMessaging: AngularFireMessaging) {

    this.angularFireMessaging.messages.subscribe(
    (_messaging:any) => {
      _messaging.onMessage = _messaging.onMessage.bind(_messaging);
      _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
    }
  )
}requestPermission() {
    this.angularFireMessaging.requestPermission
      .subscribe(
        () => {
          console.log('Notification permission granted.');
          this.angularFireMessaging.getToken
            .subscribe((token) => {
              console.log('FCM token:', token);
            });
        },
        (err) => {
          console.error('Unable to get permission to notify.', err);
        }
      );
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload: any) => {
        console.log('New message received:', payload);
        this.currentMessage.next(payload);
      },
      (error: any) => {
        console.error('Error receiving FCM message:', error);
      }
    );
  }
}
