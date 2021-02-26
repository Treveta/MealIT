import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {SearchRecipesComponent} from 'app/search-recipes/search-recipes.component';
import {AuthService} from 'app/services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';

import {CalenderComponent} from './calender.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalenderComponent],
      providers: [{provide: AngularFirestore, useValue: {}}, {provide: AuthService, useClass: class {
        getUid = () => {
          return new Promise(function(resolve) {
            resolve('');
          });
        }
      }},
      {provide: SearchRecipesComponent, useValue: {}},
      {provide: MatDialog, useClass: class {
        open = () => {};
      }}],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [SearchRecipesComponent],
      },
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Get a week', () => {
    let week: string[] = [];
    const longDate = 'Sunday 2/14/2021';
    const shortDate = new Date(2021, 1, 16);

    week = component.getWeek(shortDate);

    expect(longDate).toBe(week[0]);
  });

  it('Submit meal: null date', () => {
    let error: string = '';
    error = component.submitMeal('uid', 'modalid');

    expect(component.errorDate).toBe(true);
    expect(error).toBe('You must enter a valid date');
  });

  it('Submit meal: not null date', () => {
    let error: string = '';
    component.date = new Date(2021, 1, 19);
    error = component.submitMeal('uid', 'modalid');

    expect(component.errorDate).toBe(false);
    expect(component.date).toBe(null);
    expect(error).toBe('Adding uid on 2/19/2021');
  });

  /**
   * Checks to make sure when a dialog is closed and a defined value is passed back to the parent
   * the function logSelectedRecipe is called. This function should only be called when
   * the value is defined.
   */
  it('Should log data from dialog when data is defined', () => {
    // Creates a spy on the component's dialog's open function.
    // Changes the open function's return behavior to be a function that returns a observable with a undefined value.
    spyOn(component.dialog, 'open')
        .and
        .returnValue({afterClosed: () => of('uidstring')} as MatDialogRef<typeof component>);
    // Creates a spy on the openDialog that will delegate to the component's implementation
    spyOn(component, 'openDialog').and.callThrough();
    // Creates a spy on the logSelectedRecipe function
    spyOn(component, 'logSelectedRecipe');
    // Runs the openDialog function
    component.openDialog();
    // Expects the component.dialog variable to defined
    expect(component.dialog).toBeDefined();
    // Expects that the spy registered at least one call to the logSelectedRecipe function
    expect(component.logSelectedRecipe).toHaveBeenCalled();
  });

  /**
   * Checks to make sure when a dialog is closed and a undefined value is passed back to
   * the parent the function logSelectedRecipe is not called. This function should only be
   * called when the dialogs returned value is defined.
   */
  it('Should not log data from dialog when data is undefined', () => {
    // Creates a spy on the component's dialog's open function.
    // Changes the open function's return behavior to be a function that returns a observable with an undefined value.
    spyOn(component.dialog, 'open')
        .and
        .returnValue({afterClosed: () => of('')} as MatDialogRef<typeof component>);
    // Creates a spy on the openDialog that will delegate to the component's implementation
    spyOn(component, 'openDialog').and.callThrough();
    // Creates a spy on the logSelectedRecipe function
    spyOn(component, 'logSelectedRecipe');
    // Runs the openDialog function
    component.openDialog();
    // Expects the component.dialog variable to defined
    expect(component.dialog).toBeDefined();
    // Expects that the spy registered at least one call to the logSelectedRecipe function
    expect(component.logSelectedRecipe).not.toHaveBeenCalled();
  });
});
