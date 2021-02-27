import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {SearchRecipesComponent} from 'app/search-recipes/search-recipes.component';
import {AuthService} from 'app/services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {ModalService} from '../modal-functionality';
import {CalenderComponent} from './calender.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;

  beforeEach(async () => {
    const modalServiceStub = () => ({open: (id) => ({}), close: (id) => ({})});
    await TestBed.configureTestingModule({
      declarations: [CalenderComponent],
      providers: [
        {provide: AngularFirestore, useValue: {}}, {provide: AuthService, useClass: class {
          getUid = () => {
            return new Promise(function(resolve) {
              resolve('');
            });
          }
        }},
        {provide: ModalService, useFactory: modalServiceStub},
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

  /**
   * This should test the component is made with the calendar component constructor
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * This should create an array that accurately represents the days of a week for one week based on the date
   */
  it('Get a week', () => {
    // String array to hold week days
    let week: string[] = [];
    // The expected date. The first day of the week containing the selected day
    const longDate = 'Sunday 2/14/2021';
    // The date being tested
    const shortDate = new Date(2021, 1, 16);

    // week will now be an array that holds 7 days
    week = component.getWeek(shortDate);

    // Check the first day is the expected date
    expect(longDate).toBe(week[0]);
  });

  /**
   * Checking that the submit meal doesn't run when the date is null
   */
  it('Submit meal: null date', () => {
    // Used to receive the error message
    let error: string = '';
    // error should be equal to the error message
    error = component.submitMeal('uid', 'modalid');

    // Check that errorDate is true and the error message is as expected
    expect(component.errorDate).toBe(true);
    expect(error).toBe('You must enter a valid date');
  });

  /**
   * Checking that the submit meal runs properly when the date is not null
   */
  it('Submit meal: not null date', () => {
    // Used to recieve the add message
    let rMessage: string = '';
    // Set the components date to be tested
    component.date = new Date(2021, 1, 19);
    // The add message should say a meal was added
    rMessage = component.submitMeal('uid', 'modalid');

    // Test that the errorDate is full, the date is set to null, and the add message is as expected
    expect(component.errorDate).toBe(false);
    expect(component.date).toBe(null);
    expect(rMessage).toBe('Adding uid on 2/19/2021');
  });

  /**
   * Testing that a date can be simplified
   */
  it('Simplify the date', () => {
    // The date to be tested
    const date: Date = new Date(2021, 1, 26);
    // The date should be simplified
    const simpleDate: string = component.simplifyDate(date);

    // Checking the date was simplified correctly
    expect(simpleDate).toBe('2/26/2021');
  });

  /**
   * Check the modal is opened
   */
  it('Open a modal', () => {
    // Spy on the modal services open method
    spyOn(component.modalService, 'open');
    // The test id
    const id: string = '1234abcd';

    component.openModal(id);

    // Check the modal service open method was called with id
    expect(component.modalService.open).toHaveBeenCalledWith(id);
  });

  /**
   * Check the modal is closed
   */
  it('Close a modal', () => {
    // Spy on the modal service close method
    spyOn(component.modalService, 'close');
    // The test id
    const id: string = '1234abcd';

    component.closeModal(id);

    // Check the modal service close method was called with id
    expect(component.modalService.close).toHaveBeenCalledWith(id);
  });

  /**
   * Check that a selected meal is put into the debug log
   */
  it('Log the selected meal', () => {
    // Spy on the colsole's log method
    spyOn(console, 'log');
    // The test meal
    const meal: string = 'noodles';

    component.logSelectedRecipe(meal);

    // Check the console's log method was called with meal
    expect(console.log).toHaveBeenCalledWith(meal);
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
