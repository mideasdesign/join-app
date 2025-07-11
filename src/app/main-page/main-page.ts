import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss'
})
export class MainPage {


}
