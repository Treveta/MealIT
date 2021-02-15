/* eslint-disable require-jsdoc */
import {Injectable, Renderer2, RendererFactory2} from '@angular/core';


@Injectable({

  providedIn: 'root',

})

export class ThemeService {
  private renderer: Renderer2;
  private customTheme: string;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  initTheme() {
    this.getTheme();
    this.renderer.addClass(document.body, this.customTheme);
  }

  updateTheme(theme: 'custom-dark-theme' | 'custom-light-theme') {
    this.setTheme(theme);
    const previousTheme = (theme === 'custom-dark-theme' ? 'custom-light-theme' : 'custom-dark-theme');
    this.renderer.removeClass(document.body, previousTheme);
    this.renderer.addClass(document.body, theme);
  }

  isDarkMode() {
    return this.customTheme === 'custom-dark-theme';
  }

  private setTheme(theme) {
    this.customTheme = theme;
    localStorage.setItem('themePreference', theme);
  }

  private getTheme() {
    if (localStorage.getItem('themePreference')) {
      this.customTheme = localStorage.getItem('themePreference');
    } else {
      this.customTheme = 'custom-light-theme';
    }
  }
}

