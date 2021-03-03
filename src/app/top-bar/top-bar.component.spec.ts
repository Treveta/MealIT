import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ThemeService} from 'app/theme-service/theme.service';
import {AuthService} from '../services/auth.service';
import {FormsModule} from '@angular/forms';
import {TopBarComponent} from './top-bar.component';

describe('TopBarComponent', () => {
  let component: TopBarComponent;
  let fixture: ComponentFixture<TopBarComponent>;

  /**
   * Sets up stubs and providers that will be defined before each test is run
   */
  beforeEach(() => {
    const themeServiceStub = () => ({
      initTheme: () => ({}),
      isDarkMode: () => ({}),
      updateTheme: (string: any) => ({}),
    });
    const authServiceStub = () => ({});
    TestBed.configureTestingModule({
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [TopBarComponent],
      providers: [
        {provide: ThemeService, useFactory: themeServiceStub},
        {provide: AuthService, useFactory: authServiceStub},
      ],
    });
    fixture = TestBed.createComponent(TopBarComponent);
    component = fixture.componentInstance;
  });
  /**
   * Tests that component loads
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  /**
   * Tests that when the dark mode gets toggled, both isDarkMode is called as well as the theme gets updated
   */
  it('should change setting dark mode and update theme', () => {
    const themeServiceStub: ThemeService = fixture.debugElement.injector.get(
        ThemeService,
    );
    spyOn(themeServiceStub, 'isDarkMode').and.callThrough();
    spyOn(themeServiceStub, 'updateTheme').and.callThrough();
    component.toggleDarkMode();
    expect(themeServiceStub.isDarkMode).toHaveBeenCalled();
    expect(themeServiceStub.updateTheme).toHaveBeenCalled();
  });
});
