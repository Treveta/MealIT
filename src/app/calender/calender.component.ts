import {Component, OnInit} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ModalService} from '../modal-functionality';
import {SearchRecipesComponent} from '../search-recipes/search-recipes.component';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {mealPlanWeek, mealPlanDay, mealPlanRecipe} from './mealPlan.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {ShoppinglistEditService} from 'app/services/shoppinglist-edit.service';
import {DisplayRecipesComponent} from 'app/display-recipes/display-recipes.component';
import {ArbiterService} from 'app/services/arbiter-service/arbiter.service';


@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css'],
})
/**
 * creates CalenderComponent
 *
*/
export class CalenderComponent implements OnInit {
  /**
   * Holds the uid for a user
   * @type {string}
   */
  private userInfo;

  /**
   * Search term fetched from input on HTML
   * @type {string}
   */
  public searchTerm;
  /**
   * List of results based on current search term
   * @type {Array}
   */
  public fuzzyResults;

  /**
   * Boolean if the panel is open
   * @type {boolean}
   */
  public panelOpenState;
  /**
   * Float that holds the previous id for a recipe
   * @type {float}
   */
  private previousUID;
  /**
   * Array that holds a list of ingredients
   * @type {any[]}
   */
  public ingredientList;
  /**
   * Varaible for loading ingredient list
   * @type {any[]}
   */
  public ingredientListLoading

  /**
   * The date
   * @type {Date}
   */
  public date: Date;
  /**
   * Boolean to tell if an error occurs with the date
   * @type {boolean}
   */
  public errorDate: boolean;
  /**
   * A string to inform the user of an error
   * @type {string}
   */
  public errorMessage: string;

  /**
   * An array that holds the names of the week
   * @type {string[]}
   */
  public weekDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /**
   * A week of meals for the user
   * @type {mealPlanWeek}
   */
  public mealPlanWeek: mealPlanWeek;

  /**
   * One day in a meal plan week
   * @type {mealPlanDay}
   */
  public mealPlanDay: mealPlanDay;

  /**
   * One recipe in a meal plan day
   * @type {mealPlanRecipe}
   */
  public mealPlanRecipe: mealPlanRecipe;

  /**
   * A blank base meal plan week
   */
  mealPlanBase: mealPlanWeek;

  /**
   * Holds the values of the previous, current, and next week mealPlans
   */
  currentWeekPlanObs: Observable<any>;
  previousWeekPlanObs: Observable<any>;
  nextWeekPlanObs: Observable<any>;

  /**
   * Array of the mealPlan observables
   */
  mealPlanObsArray: Array<any>;

  /**
   * The index of the observable the user is currently viewing
   */
  currentView: number;

  /**
   * The mealType (Breakfast, Lunch, Dinner) that the user is attempting to add a recipe to
   */
  mealTypeToSet: any;

  /**
   * The Date the user is trying to add a recipe to
   */
  dateToSet: any;

  /**
   * The last set partial data, used primarily for testing
   */
  partialDataLastSet;

  /**
   * The class date objects used to create the mealPlans
   */
  todayDate = new Date();
  oneWeekAgoDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate() - 7);
  oneWeekFromNowDate = new Date(this.todayDate.getFullYear(), this.todayDate.getMonth(), this.todayDate.getDate() + 7);
  currentWeekDates = this.getWeek(this.todayDate);
  previousWeekDates = this.getWeek(this.oneWeekAgoDate);
  nextWeekDates = this.getWeek(this.oneWeekFromNowDate);

  /**
   * Boolean that determines if the mealPlans exist in the database so that remediation can occur if they dont
   */
  plansExist: boolean = false;

  /**
   * A promise that allows the page time to load data before displaying information to the user
   */
  pageLoaded: Promise<boolean>;
  recipeLastRemoved: any;

  /**
   * The constructor for the modal service
   * @param {Modal} modalService
   * @param {SearchRecipesComponent} search
   * @param {AuthService} authService
   */
  constructor(private arbiter: ArbiterService, private snackBar: MatSnackBar, public shopListService: ShoppinglistEditService, public modalService: ModalService, public search: SearchRecipesComponent, private authService: AuthService, public dialog: MatDialog, public afs: AngularFirestore) {
    this.previousUID = 0;
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.previousWeekPlanObs = this.afs.collection('users/'+this.userInfo+'/mealplan', (ref) => ref.where('label', '==', 'previousWeek')).valueChanges();
      this.currentWeekPlanObs = this.afs.collection('users/'+this.userInfo+'/mealplan', (ref) => ref.where('label', '==', 'currentWeek')).valueChanges();
      this.nextWeekPlanObs = this.afs.collection('users/'+this.userInfo+'/mealplan', (ref) => ref.where('label', '==', 'nextWeek')).valueChanges();
      this.mealPlanObsArray = [{label: 'Previous Week', obs: this.previousWeekPlanObs}, {label: 'Current Week', obs: this.currentWeekPlanObs}, {label: 'Next Week', obs: this.nextWeekPlanObs}];
      this.currentView = 1; // Sets the current view index to the middle value
      this.listData('users/'+this.userInfo+'/mealplan').then((docs) => {
        // Checks to ensure 3 documents are created, if not marks a boolean to display the Start Your Meal Plan Button
        if (docs.length == 3) {
          this.plansExist = true;
          this.checkPlanDates(docs, new Date());
        }
        // Lets the html know that the data has loaded and the page can display
        this.pageLoaded = Promise.resolve(true);
      }).catch((err) => {});
    });
  }
  /**
   * Angular Lifecycle hook
   */
  ngOnInit(): void {

  }

  /**
   * Checks the plans dates and determines if remediation needs to occur to make new plans with up to date dates
   * @param {Array} docs The array of mealPlan snapshots
   * @param {Date} currentDay the currentDay
   */
  checkPlanDates(docs, currentDay) {
    // Initializes a new array to sort the meal plans into
    const orderedPlans = new Array<mealPlanWeek>(3);
    // Sorts the meal plans based on their label
    docs.forEach((plan) => {
      if (plan.label == 'previousWeek') {
        orderedPlans[0] = plan;
      }
      if (plan.label == 'nextWeek') {
        orderedPlans[2] = plan;
      }
      if (plan.label == 'currentWeek') {
        orderedPlans[1] = plan;
      }
    });
    // Double checks that the plan exists and has been properly sorted before continueing
    if (orderedPlans[1].label == 'currentWeek') {
      // Creates all the necessary dates needed to check against based off the current currentWeek startDate
      const currentStartDay = orderedPlans[1].startDate.toDate();
      const currentLastDay = new Date(currentStartDay.getFullYear(), currentStartDay.getMonth(), currentStartDay.getDate() + 6);
      const currentNextWeekLastDay = new Date(currentStartDay.getFullYear(), currentStartDay.getMonth(), currentStartDay.getDate() + 13);
      const currentTwoWeekLastDay = new Date(currentStartDay.getFullYear(), currentStartDay.getMonth(), currentStartDay.getDate() + 20);
      // Determines how many weeks to shift the plans by based on where the currentDay falls compared to the previously set check dates
      if (currentDay.getTime() < currentLastDay.getTime()) {
        // Do nothing, the week is still correct
      }
      if (currentDay.getTime() > currentLastDay.getTime() && currentDay.getTime() <= currentNextWeekLastDay.getTime()) {
        // Shift Week Over by One
        this.shiftWeek(1, orderedPlans);
      }
      if (currentDay.getTime() > currentNextWeekLastDay.getTime() && currentDay.getTime() <= currentTwoWeekLastDay.getTime()) {
        // Shift Week Over by Two
        this.shiftWeek(2, orderedPlans);
      }
      if (currentDay.getTime() > currentTwoWeekLastDay.getTime()) {
        this.shiftWeek(3, orderedPlans);
      }
    }
  }

  /**
   * Remediates the dates in the meal plan and shifts the plans over based on the results of checkPlanDates
   * @param {number} weeksToShift The number of weeks to shift the plan over by
   * @param {Array} orderedPlans The array of mealPlan snapshots
   */
  async shiftWeek(weeksToShift, orderedPlans) {
    if (weeksToShift == 1) {
      const nextWeekFirstDay = orderedPlans[2].startDate.toDate();
      const newNextFirstDay = new Date(nextWeekFirstDay.getFullYear(), nextWeekFirstDay.getMonth(), nextWeekFirstDay.getDate() + 7);
      const nextWeekDates = this.getWeek(newNextFirstDay);
      orderedPlans[1].label = 'previousWeek';
      orderedPlans[2].label = 'currentWeek';
      await this.updateDocInFireStore('previousWeek', orderedPlans[1]);
      await this.updateDocInFireStore('currentWeek', orderedPlans[2]);
      await this.addBlankPlan('nextWeek', nextWeekDates);
    }
    if (weeksToShift == 2) {
      const nextWeekFirstDay = orderedPlans[2].startDate.toDate();
      const newCurrentWeekFirstDay = new Date(nextWeekFirstDay.getFullYear(), nextWeekFirstDay.getMonth(), nextWeekFirstDay.getDate() + 7);
      const newNextWeekFirstDay = new Date(nextWeekFirstDay.getFullYear(), nextWeekFirstDay.getMonth(), nextWeekFirstDay.getDate() + 14);
      const currentWeekDays = this.getWeek(newCurrentWeekFirstDay);
      const nextWeekDates = this.getWeek(newNextWeekFirstDay);
      orderedPlans[2].label = 'previousWeek';
      await this.updateDocInFireStore('previousWeek', orderedPlans[2]);
      await this.addBlankPlan('currentWeek', currentWeekDays);
      await this.addBlankPlan('nextWeek', nextWeekDates);
    }
    if (weeksToShift == 3) {
      this.ensureMealPlansCreated();
    }
  }

  /**
   * Convert the date to simplified form
   * @param {Date} date
   * @return {string}
   */
  simplifyDate(date) {
    const simpleDate: string = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    return simpleDate;
  }

  /**
   * Checks wether a document in the meal plan collection exists
   * @param {string} docName
   * @return {boolean} exists
   */
  checkDocumentExists(docName) {
    const arrayOfLabels: Array<any> = [];
    this.listData('users/'+this.userInfo+'/mealplan/')
        .then((listOfDocs) => {
          listOfDocs.forEach((doc) => {
            arrayOfLabels.push(doc.label);
          });
        });
    if (arrayOfLabels.includes(docName)) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * A function for submitting a meal to a meal plan
   * THIS FUNCTION HAS BEEN DEPRECATED IN FAVOR OF A NEW APPROACH
   * @param {string | number} uid
   * @param {string} modalID
   * @return {string}
   */
  submitMeal(uid: string | number, modalID: string) {
    if (this.date != null) {
      alert('Adding ' + uid + ' on ' + this.simplifyDate(this.date));
      const returnMessage = 'Adding ' + uid + ' on ' + this.simplifyDate(this.date);
      this.errorDate = false;
      this.date = null;
      this.closeModal(modalID);
      return returnMessage;
    } else {
      this.errorDate = true;
      this.errorMessage = 'You must enter a valid date';
      const returnMessage = this.errorMessage;
      return returnMessage;
    }
  }

  /**
   * creates and adds a blank mealPlanWeek into firestore at the defined document path
   * @param {string} docPath the path to send the blank mealPlanWeek to
   * @param {Array} weekDates an Array of Dates to use to create the otherwise blank mealPlan
   * @return {Array} mealPlanBlankWeek, return used for testing
   */
  addBlankPlan(docPath, weekDates) {
    // Creates a blank meal plan week
    const mealPlanBlankWeek: mealPlanWeek = {
      label: docPath,
      defined: false,
      startDate: weekDates[0].date,
      days: [],
    };
    // Creates a blank mealPlanDay for each day of the week and pushes it into the days array of blankMealPlanWeek
    weekDates.forEach((element) => {
      const mealPlanBlankDay: mealPlanDay = {
        // Fetching the date from the weekDates array
        date: element.date,
        // Fetching the weekDayName from the weekDates array
        weekDayName: element.weekDayName,
        // The recipes are empty
        breakfast: [],
        lunch: [],
        dinner: [],
      };
      // Pushing the newly created blank meal plan day to the days array of blankMealPlanWeek
      mealPlanBlankWeek.days.push(mealPlanBlankDay);
    });
    // Calls the set document helper function
    this.setDocInFireStore(docPath, mealPlanBlankWeek);
    // Returns the blank meal plan week for unit testing
    return mealPlanBlankWeek;
  }

  /**
   * This is a helper function that abstracts the process of setting a documents data in firestore
   * @param {string} docPath
   * @param {Object} objectToSet
   */
  setDocInFireStore(docPath, objectToSet) {
    this.afs.collection('users/'+this.userInfo+'/mealplan').doc(docPath).set(objectToSet);
  }

  /**
   * This is a helper function that abstracts the process of setting a documents data in firestore
   * @param {string} docPath
   * @param {Object} objectToUpdate
   */
  updateDocInFireStore(docPath, objectToUpdate) {
    this.afs.collection('users/'+this.userInfo+'/mealplan').doc(docPath).update(objectToUpdate);
  }

  /**
   * A function to open a modal
   * @param {string} id
   */
  openModal(id: string) {
    this.modalService.open(id);
  }

  /**
   * A function to close a modal
   * @param {string} id
   */
  closeModal(id: string) {
    this.modalService.close(id);
  }
  /**
   * @function dialogCallEditService
   * @param {any} result the subscribe. It is a map that contains 2 maps and an array of maps
   * @description helper function to openDialog that just runs addToShoppingList on each ingredient from result.ingredient,
   * if result.ingredients is defined, that is. PPassing in true means that this is from a recipe and is thus "reserved"
   * This function is a pain to test so thats why it exists alone here.
   */
  dialogCallEditService(result) {
    if (result.ingredients) {
      result.ingredients.forEach((ingredient) => {
        this.arbiter.arbiter(ingredient);
        // this.shopListService.addToShoppingList(ingredient.ingredientName, ingredient.quantity, ingredient.unit, true);
      });
    }
  }
  /**
   * Opens the dialog on click
   */
  openDialog() {
    // Creates a reference to the dialog and declares the component to open and its options
    const dialogRef = this.dialog.open(SearchRecipesComponent, {
      width: '50%',
      height: '75%',
      data: {embeddedPage: 'mealPlan'},
    });
    // The after closed hook returns an observable with returned data when the dialog closes
    dialogRef.afterClosed().subscribe((result) => {
      // Only takes action if the result is defined
      if (result) {
        // Sets the recipe in the plan
        this.setRecipeInPlan(result.recipeName, result.uid);
        // calls the helper function to actually call addToShoppingList on each element in the ingredients array
        this.dialogCallEditService(result);
      }
    });
  }


  /**
   * Removes a recipe from the plan
   * @param {string} index the index of the recipe to be deleted within the recipes array of its given day and mealType
   * @param {string} toEditLabel the label of the currently viewed mealPlan
   */
  removeRecipeFromPlan(index, toEditLabel) {
    this.recipeLastRemoved = {
      recipe: {},
      mealTypeToSet: this.mealTypeToSet,
      dateToSet: this.dateToSet,
    };
    // Gets a snapshot of the mealPlanData, includes all existing mealPlans as an array
    this.listData('users/'+this.userInfo+'/mealplan').then((mealPlanWeeks) => {
      // Iterates over the mealPlans
      for (let i = 0; i < mealPlanWeeks.length; i++) {
        // Sets the partial data to the preexisting data from the snapshot
        const partialData = mealPlanWeeks[i];
        // Checks to make sure the meal plan being edited matches the one the user requested to edit
        if (partialData.label == toEditLabel) {
          // Iterates over the days in the mealPlan's days array
          for (let j = 0; j < partialData.days.length; j++) {
            // checks if the date the user is trying to edit equals the date in the days array
            if (partialData.days[j].date.toDate().getTime() === this.dateToSet.toDate().getTime()) {
              // If the dates matched it checks whether the mealType was breakfast lunch or dinner
              if (this.mealTypeToSet == 'breakfast') {
                // Removes the recipe from the array at the matching index
                this.recipeLastRemoved.recipe = partialData.days[j].breakfast.splice(index, 1);
              }
              if (this.mealTypeToSet == 'lunch') {
                this.recipeLastRemoved.recipe = partialData.days[j].lunch.splice(index, 1);
              }
              if (this.mealTypeToSet == 'dinner') {
                this.recipeLastRemoved.recipe = partialData.days[j].dinner.splice(index, 1);
              }
            }
          }
        }
        // Calls the update document helper function
        this.openSnackBar('Recipe has been removed', 'Undo');
        this.updateDocInFireStore(mealPlanWeeks[i].label, partialData);
      }
    });
  }

  /**
   * Opens a snackBar, a little short term notification from the botton
   * @param {string} message The main content of the snackBar
   * @param {string} action The string for the action
   */
  openSnackBar(message: string, action: string) {
    const snackBarRef = this.snackBar.open(message, action, {
      duration: 2000,
      panelClass: ['mat-app-background'],
    });
    snackBarRef.onAction().subscribe(() => {
      this.dateToSet = this.recipeLastRemoved.dateToSet;
      this.mealTypeToSet = this.recipeLastRemoved.mealTypeToSet;
      this.setRecipeInPlan(this.recipeLastRemoved.recipe[0].recipeName, this.recipeLastRemoved.recipe[0].uid);
      this.listSpecificData('users/' + this.userInfo + '/recipeList', this.recipeLastRemoved.recipe[0].uid).then((recipes) => {
        this.dialogCallEditService(recipes[0]);
      });
    });
  }

  /**
   * updates the mealPlan with the partialData representing the new recipe the user has added
   * @param {string} recipeName
   * @param {string} uid
   */
  setRecipeInPlan(recipeName, uid) {
    // Gets a snapshot of the mealPlanData, includes all existing mealPlans as an array
    this.listData('users/'+this.userInfo+'/mealplan').then((mealPlanWeeks) => {
      // Iterates over the mealPlans
      for (let i = 0; i < mealPlanWeeks.length; i++) {
        // Sets the partial data to the preexisting data from the snapshot
        const partialData = mealPlanWeeks[i];
        // Iterates over the days in the mealPlan's days array
        for (let j = 0; j < partialData.days.length; j++) {
          // checks if the date the user is trying to set equals the date in the days array
          if (partialData.days[j].date.toDate().getTime() === this.dateToSet.toDate().getTime()) {
            // If the dates matched it checks whether the mealType was breakfast lunch or dinner
            if (this.mealTypeToSet == 'breakfast') {
              // creates a new array of recipes equal to the previous recipes array concantenated with the new recipe
              const newMeal = partialData.days[j].breakfast.concat([{recipeName: recipeName, uid: uid}]);
              // Sets the meals array equal to the new meal
              partialData.days[j].breakfast = newMeal;
              // Sets a component variable with the partialData, this can then be later retrieved or used for testing
              this.partialDataLastSet = partialData;
            }
            if (this.mealTypeToSet == 'lunch') {
              // creates a new array of recipes equal to the previous recipes array concantenated with the new recipe
              const newMeal = partialData.days[j].lunch.concat([{recipeName: recipeName, uid: uid}]);
              // Sets the meals array equal to the new meal
              partialData.days[j].lunch = newMeal;
              // Sets a component variable with the partialData, this can then be later retrieved or used for testing
              this.partialDataLastSet = partialData;
            }
            if (this.mealTypeToSet == 'dinner') {
              // creates a new array of recipes equal to the previous recipes array concantenated with the new recipe
              const newMeal = partialData.days[j].dinner.concat([{recipeName: recipeName, uid: uid}]);
              // Sets the meals array equal to the new meal
              partialData.days[j].dinner = newMeal;
              // Sets a component variable with the partialData, this can then be later retrieved or used for testing
              this.partialDataLastSet = partialData;
            }
            // Ira: possilbly where to call AddToShoppingList?
            // this.shopListService.addToShoppingList('Apple', 1, 'oz'); //This Works! But unless you want to be spammed with Apples everytime you add to the meal plan, leave commented
          }
        }
        // Calls the update document helper function
        this.updateDocInFireStore(mealPlanWeeks[i].label, partialData);
      }
    });
  }

  /**
   * Creates the necessary documents in user's mealPlan collections if they dont already exist
   */
  ensureMealPlansCreated() {
    if (!this.checkDocumentExists('previousWeek')) {
      this.addBlankPlan('previousWeek', this.previousWeekDates);
    }
    if (!this.checkDocumentExists('currentWeek')) {
      this.addBlankPlan('currentWeek', this.currentWeekDates);
    }
    if (!this.checkDocumentExists('nextWeek')) {
      this.addBlankPlan('nextWeek', this.nextWeekDates);
    }
    this.plansExist = true;
  }

  /**
   * Sets the component variables mealTypeToSet and dateToSet to represent the mealType and date representing the card user has clicked on
   * @param {string} mealType the type of meal the user is attempting to set (ie Breakfast, Lunch, Dinner)
   * @param {Date} date the date the meal is being added to
   */
  setMealInfo(mealType, date) {
    this.mealTypeToSet = mealType;
    this.dateToSet = date;
  }

  /**
   * Sends search term to search service and sets fuzzyResults to the resulting list of search results
   * THIS FUNCTION IS LIKELY DEPRECATED, NEEDS INVESTIGATION BEFORE REMOVAL
   */
  public searchFuzzy() {
    this.fuzzyResults = this.search.searchService(this.searchTerm);
  }

  /**
   * Takes in a date an returns the week of that day. Sunday to Saturday.
   * @param {Date} date
   * @return {Array}
   */
  getWeek(date: Date) {
    // Set dateData to date
    const dateData = date;

    // Variable for the input day
    const day = dateData.getDay();

    // Variables for weekdays
    const weekDay = [];

    // Compiling the information for the days
    dateData.setDate(dateData.getDate() - day - 1);
    for (let i = 0; i <= 6; i++) {
      const incrementDay = dateData.getDate();
      const month = dateData.getMonth();
      const year = dateData.getFullYear();
      const newDate = {
        weekDayName: this.weekDayName[i],
        date: new Date(year, month, incrementDay + 1),
      };
      weekDay.push(newDate);
      dateData.setDate(dateData.getDate() + 1);
    }
    return weekDay;
  }

  /**
   * Changes the current view based on parameter
   * Includes bounding to ensure the user can't change to an index outside the bounds of the obs array
   * @param {number} numToChange amount to add to current view
   */
  changeView(numToChange: number) {
    if (this.currentView == 0 && numToChange < 0) {
      Error('Attempting to change view would move the view out of bounds');
    } else if (this.currentView == this.mealPlanObsArray.length - 1 && numToChange > 0) {
      Error('Attempting to change view would move the view out of bounds');
    } else {
      this.currentView = this.currentView + numToChange;
    }
  }

  /**
   * Fetches the ingredient information for a specific recipe based on its uid
   * Returns the fetched data to this.ingredients to be displayed by Material UI in HTML
   * THIS FUNCTION MAY BE DEPRECATED DUE TO CHANGES TO WHERE SEARCH ORIGINATES FROM
   * WITH SEARCH BEING HANDLED BY A TEMPLATE CALL TO <app-search-recipes> IN THE HTML
   * THIS FUNCTION IS NO LONGER REQUIRED AND ACTUALLY CAUSES ERRORS IF UNCOMMENTED
   * @param {string | number} uid
   */
  /** fetchRecipe(uid: string | number) {
    if (uid == this.previousUID && this.panelOpenState == false) {
      this.ingredientList = this.ingredientListLoading;
      this.previousUID = 0;
    } else if (uid != this.previousUID && this.panelOpenState == true) {
      this.ingredientList = this.ingredientListLoading;
      this.previousUID = uid;
      const ingredientPath = 'users/' + this.userInfo + '/recipeList/' + uid + '/ingredients';
      this.search.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    } else {
      this.previousUID = uid;
      const ingredientPath = 'users/' + this.userInfo + '/recipeList/' + uid + '/ingredients';
      this.search.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    }
  }*/

  /**
   * Debug Function to Log selected recipe to console
   * @param {string} mealSelected meal to log to console
   * @return {string}
   */
  logSelectedRecipe(mealSelected: string) {
    console.log(mealSelected);
    return mealSelected;
  }

  /**
   * Retrieves the mealPlan from the path specified as a list
   * @param {string} path - The Firestore collection path to retrieve recipes from
   */
  async listData(path: string) {
    try {
      // collects a snapshot of a Firestore collection base on parameter path
      const snapshot = await this.afs
          .collection(path)
          .get().toPromise();
      // Creates an empty list to populate collection data into
      const list = [];
      // Loops through snapshot and pushes document data to list
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push(data);
      });
      // Returns the now populated list
      return list;
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }

  /**
   * Retrieves the mealPlan from the path specified as a list
   * @param {string} path - The Firestore collection path to retrieve recipes from
   * @param {string} uidToSearch
   */
  async listSpecificData(path: string, uidToSearch) {
    try {
      // collects a snapshot of a Firestore collection base on parameter path
      const snapshot = await this.afs
          .collection(path, (ref) => ref.where('uid', '==', uidToSearch))
          .get().toPromise();
      // Creates an empty list to populate collection data into
      const list = [];
      // Loops through snapshot and pushes document data to list
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push(data);
      });
      // Returns the now populated list
      return list;
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }

  /**
   * A function to open material dialog
   * @param {any} uid
   */
  openRecipeDialog(uid) {
    // Creates a reference to the dialog and declares the component to open and its options
    // eslint-disable-next-line no-unused-vars
    const dialogRef = this.dialog.open(DisplayRecipesComponent, {
      width: '25%',
      height: '50%',
      data: {uid: uid},
    });
  }
}
