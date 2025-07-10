import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firebase = inject(FireStore) 

  constructor() { }
}
