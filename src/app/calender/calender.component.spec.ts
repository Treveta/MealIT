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

    expect(error).toBe('trueYou must enter a valid date');
  });

  it('Submit meal: not null date', () => {
    let error: string = '';
    component.date = new Date(2021, 1, 19);
    error = component.submitMeal('uid', 'modalid');

    expect(error).toBe('Adding uid on 2/19/2021 falsenull');
  });

  /**
   * Checks to make sure when a dialog is closed and a defined value is passed back to the parent
   * the function logSelectedRecipe is called. This function should only be called when
   * the value is defined.
   */
  it('Should log data from dialog when data is defined', () => {
    spyOn(component.dialog, 'open')
        .and
        .returnValue({afterClosed: () => of('uidstring')} as MatDialogRef<typeof component>);
    spyOn(component, 'openDialog').and.callThrough();
    spyOn(component, 'logSelectedRecipe');
    component.openDialog();
    expect(component.dialog).toBeDefined();
    expect(component.logSelectedRecipe).toHaveBeenCalled();
  });

  /**
   * Checks to make sure when a dialog is closed and a undefined value is passed back to
   * the parent the function logSelectedRecipe is not called. This function should only be
   * called when the dialogs returned value is defined.
   */
  it('Should not log data from dialog when data is undefined', () => {
    spyOn(component.dialog, 'open')
        .and
        .returnValue({afterClosed: () => of('')} as MatDialogRef<typeof component>);
    spyOn(component, 'openDialog').and.callThrough();
    spyOn(component, 'logSelectedRecipe');
    component.openDialog();
    expect(component.dialog).toBeDefined();
    expect(component.logSelectedRecipe).not.toHaveBeenCalled();
  });
});
