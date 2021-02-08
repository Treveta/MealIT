/* eslint-disable require-jsdoc */
import {Component, OnInit} from '@angular/core';
import {ThemeService} from 'app/theme-service/theme.service';
import {AuthService} from '../services/auth.service';

// This component could be where we set up tabs, but it might be more of a process than we think
@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements OnInit {
  constructor(public auth: AuthService, private themeService: ThemeService) {
    this.themeService.initTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }
  isDarkMode: boolean;

  toggleDarkMode() {
    this.isDarkMode = this.themeService.isDarkMode();

    this.isDarkMode ? this.themeService.updateTheme('custom-light-theme') : this.themeService.updateTheme('custom-dark-theme');
  }

  ngOnInit() { }
}
