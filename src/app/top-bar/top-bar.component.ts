import {Component, HostListener, OnInit} from '@angular/core';
import {ThemeService} from 'app/theme-service/theme.service';
import {AuthService} from '../services/auth.service';

// This component could be where we set up tabs, but it might be more of a process than we think
@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
/**
 * Creates the navigation bar component
 */
export class TopBarComponent implements OnInit {
  screenWidth: number;
  isLarge: boolean;
  /**
   * The constructor for the nav bar functions
   * @param {AuthService} auth Authentication vairiable for authenticating user
   * @param {ThemeService} themeService Theme service to allow dark mode functionality
   */
  constructor(public auth: AuthService, private themeService: ThemeService) {
    this.themeService.initTheme();
    this.isDarkMode = this.themeService.isDarkMode();
  }
  /** @function
   * @name checkWidth
   * @listens window:resize
   * @hostListener
   * @description checkWidth listens to window resize and adjusts the isLarge Boolean.
   */
@HostListener('window:resize') checkWidth() {
  //  alert('it works!');
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 600) {
      this.isLarge = false;
    } else {
      this.isLarge = true;
    }
  }
  /**
   * Holds a boolean value to toggle dark mode on the page
   * @type {boolean}
   */
  isDarkMode: boolean;
  /**
   * A function for toggling dark mode
   */
  toggleDarkMode() {
    this.isDarkMode = this.themeService.isDarkMode();

    this.isDarkMode ? this.themeService.updateTheme('custom-light-theme') : this.themeService.updateTheme('custom-dark-theme');
  }
  /**
   * A function from the auth service that only is called when a user accesses the site for the first time
   */
  ngOnInit() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 600) {
      this.isLarge = false;
    } else {
      this.isLarge = true;
    }
  }
}
