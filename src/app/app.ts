import { Component, inject } from '@angular/core';
import { Firebase } from './shared/services/firebase-services';
import { RouterOutlet } from '@angular/router';
import { Vocabulary } from './vocabulary/vocabulary';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Vocabulary],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'vocabulary';
  firebase = inject(Firebase);
}