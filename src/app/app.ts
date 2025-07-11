import { Component, inject } from '@angular/core';
import { Firebase } from './shared/services/firebase-services';
import { RouterOutlet } from '@angular/router';
import { Header } from './Sidebar/header/header';
import { SectionSidebar } from './Sidebar/section-sidebar/section-sidebar';
import { CommonModule } from '@angular/common';
import { Vocabulary } from './vocabulary/vocabulary';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, SectionSidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'join app';
  firebase = inject(Firebase);
}