import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {NO_ERRORS_SCHEMA} from '@angular/core';

import {AuthService} from '../services/auth.service';

import {ModalService} from '../modal-functionality';

import {SearchRecipesComponent} from '../search-recipes/search-recipes.component';

import {MatDialog, MatDialogRef} from '@angular/material/dialog';

import {AngularFirestore} from '@angular/fire/firestore';

import {FormsModule} from '@angular/forms';

import {CalenderComponent} from './calender.component';
import firebase from 'firebase';
import {of} from 'rxjs';
import {mealPlanWeek} from './mealPlan.model';
import {By} from '@angular/platform-browser';


describe('CalenderComponent', () => {
  let component: CalenderComponent;

  let fixture: ComponentFixture<CalenderComponent>;

  let debugBreakfastButton;
  let debugLunchButton;
  let debugDinnerButton;

  let debugBreakfastCard;
  let debugLunchCard;
  let debugDinnerCard;

  let debugBreakfastRecipeCard;
  let debugLunchRecipeCard;
  let debugDinnerRecipeCard;

  let debugLoadNewButton;


  beforeEach(() => {
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});

    const modalServiceStub = () => ({open: (id) => ({}), close: (id) => ({})});

    const searchRecipesComponentStub = () => ({

      searchService: (searchTerm) => ({}),

    });

    const matDialogStub = () => ({

      open: (searchRecipesComponent, object) => ({

        afterClosed: () => ({subscribe: (f) => f({})}),

      }),

    });

    const angularFirestoreStub = () => ({

      collection: (arg, function0) => ({

        valueChanges: () => ({}),

        doc: () => ({set: () => ({}), update: () => ({})}),

        get: () => ({toPromise: () => ({forEach: () => ({})})}),

      }),

    });

    TestBed.configureTestingModule({

      imports: [FormsModule],

      schemas: [NO_ERRORS_SCHEMA],

      declarations: [CalenderComponent],

      providers: [

        {provide: AuthService, useFactory: authServiceStub},

        {provide: ModalService, useFactory: modalServiceStub},

        {

          provide: SearchRecipesComponent,

          useFactory: searchRecipesComponentStub,

        },

        {provide: MatDialog, useFactory: matDialogStub},

        {provide: AngularFirestore, useFactory: angularFirestoreStub},

      ],

    });

    fixture = TestBed.createComponent(CalenderComponent);

    component = fixture.componentInstance;
  });

  /**
   * Tests that the component builds
   */
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Tests that weekDayName array has a default value when component is generated
   */
  it(`weekDayName has default value`, () => {
    expect(component.weekDayName).toEqual([

      `Sunday`,

      `Monday`,

      `Tuesday`,

      `Wednesday`,

      `Thursday`,

      `Friday`,

      `Saturday`,

    ]);
  });

  /**
   * Tests for openDialog
   */
  describe('openDialog', () => {
    it('makes expected calls', () => {
      const matDialogStub: MatDialog = fixture.debugElement.injector.get(

          MatDialog,

      );
      // Spys for the functions called in openDialog
      spyOn(component, 'setRecipeInPlan').and.callThrough();
      spyOn(matDialogStub, 'open').and.callThrough();

      // Runs the function
      component.openDialog();
      // Expects setRecipeInPlan to have been called
      expect(component.setRecipeInPlan).toHaveBeenCalled();
      // Expects the dialog to have been opened
      expect(matDialogStub.open).toHaveBeenCalled();
    });
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
    it('addBlankPlan should call setDocInFirestore', () => {
      spyOn(component, 'setDocInFireStore');
      component.addBlankPlan('docPath', mockWeekDates);
      expect(component.setDocInFireStore).toHaveBeenCalled();
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
      component.dateToSet = firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7));
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
    /**
     * Tests that when the setMealInfo function is called it sets the proper component variables
     * with the proper values based on its parameters
     */
    it('Should set component variables based on given parameters', () => {
      expect(component.mealTypeToSet).toBeUndefined();
      expect(component.dateToSet).toBeUndefined();
      component.setMealInfo('breakfast', firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7)));
      expect(component.mealTypeToSet).toBe('breakfast');
      expect(component.dateToSet).toEqual(firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7)));
    });
  });

  /**
   * These tests test the HTML template in an state that assumes that firestore does not have the correct number of mealPlans
   */
  describe('Start New Meal Plan Button Template Tests', () => {
    /**
     * This before each sets the values that determine what state the template will be in on render
     */
    beforeEach(async () => {
      // Makes sure the page will render, this variable is used to allow the asyncronous data to be collected before
      // the page will load, it needs to resolve a true promise before anything will appear at all
      component.pageLoaded = Promise.resolve(true);
      // Assumes that the constructor did not recieve back the correct number of documents from firestore and that the user
      // needs to start or restart their mealPlan
      component.plansExist = false;
      // after something in the component changes, you should detect changes
      fixture.detectChanges();

      // everything else in the beforeEach needs to be done here.
    });
    /**
     * This second beforeEach awaits the fixture becoming stable and the debug elements being retrieved
     * The changes made to the variables (ngIf tested variables) in the first beforeEach will cause the
     * template to rerender and we need to make sure we collect our debugElements after that happens
     */
    beforeEach(async () => {
      await fixture.whenStable().then(() => {
        fixture.detectChanges();
        debugLoadNewButton = fixture.debugElement.queryAll(By.css('button[name=\'loadNewButton\']'));
        debugBreakfastButton = fixture.debugElement.queryAll(By.css('button[name=\'breakfastButton\']'));
        debugLunchButton = fixture.debugElement.queryAll(By.css('button[name=\'lunchButton\']'));
        debugDinnerButton = fixture.debugElement.queryAll(By.css('button[name=\'dinnerButton\']'));
      });
    });
    /**
     * Makes sure that there are debugElements in the debug arrays used for testing
     */
    it('Should have debug elements', async () => {
      expect(debugLoadNewButton.length).toBeGreaterThan(0);
    });
    /**
     * Checks to make sure exactly one button with the name loadNewButton is on the page
     */
    it('Should Display start new meal plan button when plansExist is false', () => {
      expect(debugLoadNewButton.length).toBe(1);
    });
    /**
     * Makes sure that the mealPlan does not display by checking if the add meal buttons are appearing on the page
     */
    it('Should not display meal plan if plansExist is false', () => {
      expect(debugBreakfastButton.length).toBe(0);
      expect(debugLunchButton.length).toBe(0);
      expect(debugDinnerButton.length).toBe(0);
    });
  });
  /**
   * These tests test the HTML template in an assumed state where firestore returned all the necessary mealPlans in the constructor
   */
  describe('MealPlan Template Tests', () => {
    /**
     * This before each sets the values that determine what state the template will be in on render
     * It also declares the necessary consts used for testing these tests
     */
    beforeEach(async () => {
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
      // Sets the previous, current, and next week observables to observables of the mockPartialData as an array
      component.previousWeekPlanObs = of([mockPartialData]);
      component.currentWeekPlanObs = of([mockPartialData]);
      component.nextWeekPlanObs = of([mockPartialData]);
      // Sets the mealPlanObsArray to an array of objects containing the week label and the matching observable
      component.mealPlanObsArray = [{label: 'Previous Week', obs: component.previousWeekPlanObs}, {label: 'Current Week', obs: component.currentWeekPlanObs}, {label: 'Next Week', obs: component.nextWeekPlanObs}];
      // Puts the template into a state where it believes it got the right number of mealPlans returned from firestore
      component.plansExist = true;
      // Sets the current view to the currentWeek
      component.currentView = 1;
      // Makes sure the page will render, this variable is used to allow the asyncronous data to be collected before
      // the page will load, it needs to resolve a true promise before anything will appear at all
      component.pageLoaded = Promise.resolve(true);
      fixture.detectChanges();
    });
    /**
     * This second beforeEach awaits the fixture becoming stable and the debug elements being retrieved
     * The changes made to the variables (ngIf tested variables) in the first beforeEach will cause the
     * template to rerender and we need to make sure we collect our debugElements after that happens
     */
    beforeEach(async () => {
      await fixture.whenStable().then(() => {
        fixture.detectChanges();
        debugLoadNewButton = fixture.debugElement.queryAll(By.css('button[name=\'loadNewButton\']'));
        debugBreakfastButton = fixture.debugElement.queryAll(By.css('button[name=\'breakfastButton\']'));
        debugLunchButton = fixture.debugElement.queryAll(By.css('button[name=\'lunchButton\']'));
        debugDinnerButton = fixture.debugElement.queryAll(By.css('button[name=\'dinnerButton\']'));
        debugBreakfastCard = fixture.debugElement.queryAll(By.css('mat-card[name=\'breakfastCard\']'));
        debugLunchCard = fixture.debugElement.queryAll(By.css('mat-card[name=\'lunchCard\']'));
        debugDinnerCard = fixture.debugElement.queryAll(By.css('mat-card[name=\'dinnerCard\']'));
        debugBreakfastRecipeCard = fixture.debugElement.queryAll(By.css('mat-card[name=\'breakfastRecipeCard\']'));
        debugLunchRecipeCard = fixture.debugElement.queryAll(By.css('mat-card[name=\'lunchRecipeCard\']'));
        debugDinnerRecipeCard = fixture.debugElement.queryAll(By.css('mat-card[name=\'dinnerRecipeCard\']'));
      });
    });
    /**
     * Tests to ensure the necessary debugElements were obtained
     */
    it('Should have Debug Elements', () => {
      expect(debugBreakfastButton.length).toBeGreaterThan(0);
      expect(debugLunchButton.length).toBeGreaterThan(0);
      expect(debugDinnerButton.length).toBeGreaterThan(0);
      expect(debugBreakfastCard.length).toBeGreaterThan(0);
      expect(debugLunchCard.length).toBeGreaterThan(0);
      expect(debugDinnerCard.length).toBeGreaterThan(0);
      expect(debugBreakfastRecipeCard.length).toBeGreaterThan(0);
      // These expects are commented out because the partial data being tested with does not include lunch and dinner data
      // thus these arrays will be empty, they are further tested in the Should display correct recipe cards based on data test
      // expect(debugLunchRecipeCard.length).toBeGreaterThan(0);
      // expect(debugDinnerRecipeCard.length).toBeGreaterThan(0);
    });
    /**
     * Test to make sure the right number of recipe cards are displayed based on data
     */
    it('Should display correct recipe cards based on data', () => {
      // Based on the mockPartialData being used to create the observables there should be one breakfast recipe card and no lunch or dinner recipe cards
      expect(debugBreakfastRecipeCard.length).toBe(1);
      expect(debugLunchRecipeCard.length).toBe(0);
      expect(debugDinnerRecipeCard.length).toBe(0);
    });
    /**
     * Tests to make sure the right number of day and meal cards are displayed
     */
    it('Should display correct day and meal cards based on data', () => {
      // Based on the mockPartialData being used to create the observables there should be 7 of each type of meal card, one for each day of the week
      expect(debugBreakfastCard.length).toBe(7);
      expect(debugLunchCard.length).toBe(7);
      expect(debugDinnerCard.length).toBe(7);
    });
    /**
     * Tests to make sure the right number of add meal buttons are displayed
     */
    it('Should display correct add meal buttons based on data', () => {
      // Based on the mockPartialData being used to create the observables there should be 7 of each type of button, one per card for each day of the week
      expect(debugBreakfastButton.length).toBe(7);
      expect(debugLunchButton.length).toBe(7);
      expect(debugDinnerButton.length).toBe(7);
    });
    /**
     * Tests to make sure start new meal plan button doesn't display when template is in this state
     */
    it('Should not display start new meal plan button if plansExist is true', () => {
      expect(debugLoadNewButton.length).toBe(0);
    });
    /**
     * Tests to ensure clicking on the button brings up the dialog
     */
    it('Should open search recipe dialog when breakfastButton is clicked', fakeAsync( () => {
      spyOn(component, 'openDialog');
      debugBreakfastButton[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(component.openDialog).toHaveBeenCalled();
    }));
    /**
     * Tests to ensure clicking on the button brings up the dialog
     */
    it('Should open search recipe dialog when lunchButton is clicked', fakeAsync( () => {
      spyOn(component, 'openDialog');
      debugLunchButton[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(component.openDialog).toHaveBeenCalled();
    }));
    /**
     * Tests to ensure clicking on the button brings up the dialog
     */
    it('Should open search recipe dialog when dinnerButton is clicked', fakeAsync( () => {
      spyOn(component, 'openDialog');
      debugDinnerButton[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(component.openDialog).toHaveBeenCalled();
    }));
    /**
     * Tests that this button runs the setMealInfo function with the correct parameters
     */
    it('Should run setMealInfo with proper parameters when breakfastButton is clicked', fakeAsync( () => {
      const dateToExpect = firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7)); // Should match mockWeekDates[0]
      spyOn(component, 'setMealInfo');
      debugBreakfastButton[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(component.setMealInfo).toHaveBeenCalledOnceWith('breakfast', dateToExpect);
    }));
    /**
     * Tests that this button runs the setMealInfo function with the correct parameters
     */
    it('Should run setMealInfo with proper parameters when lunchButton is clicked', fakeAsync( () => {
      const dateToExpect = firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7)); // Should match mockWeekDates[0]
      spyOn(component, 'setMealInfo');
      debugLunchButton[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(component.setMealInfo).toHaveBeenCalledOnceWith('lunch', dateToExpect);
    }));
    /**
     * Tests that this button runs the setMealInfo function with the correct parameters
     */
    it('Should run setMealInfo with proper parameters when dinnerButton is clicked', fakeAsync( () => {
      const dateToExpect = firebase.firestore.Timestamp.fromDate(new Date(2021, 2, 7)); // Should match mockWeekDates[0]
      spyOn(component, 'setMealInfo');
      debugDinnerButton[0].nativeElement.click();
      fixture.detectChanges();
      tick();
      expect(component.setMealInfo).toHaveBeenCalledOnceWith('dinner', dateToExpect);
    }));
  });
});

