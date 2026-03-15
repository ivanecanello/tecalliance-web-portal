import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, HeaderComponent, MatCardModule, MatIconModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {}
