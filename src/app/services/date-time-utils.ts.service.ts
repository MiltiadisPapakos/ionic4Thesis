import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateTimeUtilsTsService {

  constructor() {
  }

  updateDateTime(originalJson: any) {
    // Extract day code from the originalJson
    const dayCode = originalJson.day;
    const dayTable = [{day: 'Δεύτερα', coded: 1, value: false}, {day: 'Τρίτη', coded: 2, value: false}, {day: 'Τετάρτη', coded: 3, value: false}, {day: 'Πέμπτη', coded: 4, value: false},
      {day: 'Παρασκευή', coded: 5, value: false}, {day: 'Σάββατο', coded: 6, value: false}, {day: 'Κυριακή', coded: 0, value: false}];

    // Find the corresponding day value from dayTable
    const selectedDay = dayTable.find(day => day.coded === dayCode);

    if (selectedDay) {
      // Update the day and time fields in the originalJson
      originalJson.day = selectedDay.day;

      // Extract hour from the time field (remove the last character)
      originalJson.time = originalJson.time[0].slice(0, -1);
    }

    return originalJson;
  }

}
