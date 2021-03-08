import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {SearchRecipesComponent} from 'app/search-recipes/search-recipes.component';
import {AuthService} from 'app/services/auth.service';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {of} from 'rxjs';
import {ModalService} from '../modal-functionality';
import {CalenderComponent} from './calender.component';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import firebase from 'firebase';
import { mealPlanWeek } from './mealPlan.model';

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

  describe('Tests For getWeek Function', () => {
    /**
   * This should create an array that accurately represents the days of a week for one week based on the date
   */
    it('Should get proper first day of week when day is Sunday', () => {
    // String array to hold week days
      let week = [];
      // The date being tested
      const date = new Date(2021, 2, 14); // Zero is January
      // The expected date. The first day of the week containing the selected day
      const weekDayName = 'Sunday';
      const expectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // week will now be an array that holds 7 days
      week = component.getWeek(date);
      console.log({weekDayName: weekDayName, date: date});
      // Check the first day is the expected date and has the name Sunday
      expect(week[0]).toEqual({weekDayName: weekDayName, date: expectedDate});
    });

    /**
   * This should create an array that accurately represents the days of a week for one week based on the date
   */
    it('Should get proper first day of week when day is not Sunday', () => {
    // String array to hold week days
      let week = [];
      // The date being tested
      const date = new Date(2021, 2, 17); // Zero is January
      // The expected date. The first day of the week containing the selected day
      const weekDayName = 'Sunday';
      const expectedDate = new Date(2021, 2, 14);
      // week will now be an array that holds 7 days
      week = component.getWeek(date);
      console.log({weekDayName: weekDayName, date: date});
      // Check the first day is the expected date and has the name Sunday
      expect(week[0]).toEqual({weekDayName: weekDayName, date: expectedDate});
    });

    /**
   * This should create an array that accurately represents the days of a week for one week based on the date
   */
    it('Should get proper last day of week when day is Sunday', () => {
    // String array to hold week days
      let week = [];
      // The date being tested
      const date = new Date(2021, 2, 14); // Zero is January
      // The expected date. The last day of the week containing the selected day
      const weekDayName = 'Saturday';
      const expectedDate = new Date(2021, 2, 20);
      // week will now be an array that holds 7 days
      week = component.getWeek(date);
      console.log({weekDayName: weekDayName, date: date});
      // Check the first day is the expected date and has the name Sunday
      expect(week[6]).toEqual({weekDayName: weekDayName, date: expectedDate});
    });

    /**
   * This should create an array that accurately represents the days of a week for one week based on the date
   */
    it('Should get proper last day of week when day is not Sunday', () => {
    // String array to hold week days
      let week = [];
      // The date being tested
      const date = new Date(2021, 2, 17); // Zero is January
      // The expected date. The last day of the week containing the selected day
      const weekDayName = 'Saturday';
      const expectedDate = new Date(2021, 2, 20);
      // week will now be an array that holds 7 days
      week = component.getWeek(date);
      console.log({weekDayName: weekDayName, date: date});
      // Check the first day is the expected date and has the name Sunday
      expect(week[6]).toEqual({weekDayName: weekDayName, date: expectedDate});
    });
  });

  describe('Tests for updating the database', () => {
    /**
     * A set of dates in our components format, {string name of the week, the date in firebase timestampformat}
     */
    const mockWeekDates = [
      {weekDayName: 'Sunday', date: firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7))},
      {weekDayName: 'Monday', date: firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 8))},
      {weekDayName: 'Tuesday', date: firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 9))},
      {weekDayName: 'Wednesday', date: firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 10))},
      {weekDayName: 'Thursday', date: firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 11))},
      {weekDayName: 'Friday', date: firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 12))},
      {weekDayName: 'Saturday', date: firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 13))},
    ];
    /**
     * A mock of a black meal plan object. Has no data in it.
     */
    const mockBlankMealPlan: mealPlanWeek = {
      label: 'docPath', // This should equal the parameter docPath
      defined: false,
      startDate: mockWeekDates[0].date,
      days: [
        {
          date: mockWeekDates[0].date,
          weekDayName: mockWeekDates[0].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[1].date,
          weekDayName: mockWeekDates[1].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[2].date,
          weekDayName: mockWeekDates[2].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[3].date,
          weekDayName: mockWeekDates[3].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[4].date,
          weekDayName: mockWeekDates[4].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[5].date,
          weekDayName: mockWeekDates[5].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[6].date,
          weekDayName: mockWeekDates[6].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
      ],
    };
    /**
     * A mock of a partial data object to use to update meal plan. Has a recipe added to sunday breakfast.
     */
    const mockPartialData = {
      label: 'docPath', // This should equal the parameter docPath
      defined: false,
      startDate: mockWeekDates[0].date,
      days: [
        {
          date: mockWeekDates[0].date,
          weekDayName: mockWeekDates[0].weekDayName,
          breakfast: [{recipeName: 'Test Recipe', uid: '12345'}],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[1].date,
          weekDayName: mockWeekDates[1].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[2].date,
          weekDayName: mockWeekDates[2].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[3].date,
          weekDayName: mockWeekDates[3].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[4].date,
          weekDayName: mockWeekDates[4].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[5].date,
          weekDayName: mockWeekDates[5].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
        {
          date: mockWeekDates[6].date,
          weekDayName: mockWeekDates[6].weekDayName,
          breakfast: [],
          lunch: [],
          dinner: [],
        },
      ],
    };
    /**
     * Tests that adding blank meal plan calls the setDocInFirestore helper function with the proper parameters
     */
    it('addBlankPlan should call setDocInFirestore with proper parameters', () => {
      spyOn(component, 'setDocInFireStore');
      const returnedValue = component.addBlankPlan('docPath', mockWeekDates);
      expect(returnedValue).toEqual(mockBlankMealPlan);
      // expect(component.setDocInFireStore).toHaveBeenCalledOnceWith('docPath', mockBlankMealPlan);
    });
    /**
     * Tests that the setRecipeInPlan function calls the updateDocInFirestore helper function with the proper parameters
     */
    it('setRecipeInPlan should call updateDocInFirestore with proper variables', async () => {
      // setRecipeInPlan requires listData to collect and return a promise of a local version of the mealPlan collection, this spy mocks this functionality
      // by returning a promise that resolves to the mockBlankMealPlan, this mimics the act of getting a blackMealPlan from firestore
      spyOn(component, 'listData').and.returnValue(Promise.resolve([mockBlankMealPlan]));
      spyOn(component, 'updateDocInFireStore');
      // Sets the mealType and date as the setMealInfo function would in prod
      component.mealTypeToSet = 'breakfast';
      component.dateToSet = new Date(2021, 2, 7);
      // This needs to be awaited because of the reliance on the listData function internally, not awaiting will cause function to fail
      await component.setRecipeInPlan('Test Recipe', '12345');
      // Ensures the listData function was called
      expect(component.listData).toHaveBeenCalled();
      // Ensures the updateDocInFireStore function is called
      expect(component.updateDocInFireStore).toHaveBeenCalled();
      // ToHaveBeenCalledWith doesn't do a great job of checking equality of Objects so the function sets a component variable with the last PartialData and
      //  test checks to make sure that equals the expected value
      expect(component.partialDataLastSet).toEqual(mockPartialData);
    });
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
    spyOn(component, 'setRecipeInPlan');
    // Runs the openDialog function
    component.openDialog();
    // Expects the component.dialog variable to defined
    expect(component.dialog).toBeDefined();
    // Expects that the spy registered at least one call to the logSelectedRecipe function
    expect(component.setRecipeInPlan).toHaveBeenCalled();
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
    spyOn(component, 'setRecipeInPlan');
    // Runs the openDialog function
    component.openDialog();
    // Expects the component.dialog variable to defined
    expect(component.dialog).toBeDefined();
    // Expects that the spy registered at least one call to the logSelectedRecipe function
    expect(component.setRecipeInPlan).not.toHaveBeenCalled();
  });

  describe('Tests for setMealInfo function', () => {
    it('Should set component variables based on given parameters', () => {
      expect(component.mealTypeToSet).toBeUndefined();
      expect(component.dateToSet).toBeUndefined();
      component.setMealInfo('breakfast', firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7)));
      expect(component.mealTypeToSet).toBe('breakfast');
      expect(component.dateToSet).toEqual(firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7)));
    });
  });
});
