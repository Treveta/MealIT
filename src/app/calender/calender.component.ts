import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ModalService} from '../modal-functionality';
import {SearchRecipesComponent} from '../search-recipes/search-recipes.component';
import {MatDialog} from '@angular/material/dialog';
import {mealPlanWeek, mealPlanDay, mealPlanRecipe} from './mealPlan.model';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css'],
})
/**
 * creates CalenderComponent
 *
*/
export class CalenderComponent {
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
   * Holds the current values of the current week mealPlan
   */
  currentWeekPlanObs: Observable<any>;

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
   * This boolean determines if the constructor is run, it acts as a stopgap to prevent blank workplans from getting set twice on initializations
   */
  constructorHasRun: boolean = false;

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
   * The constructor for the modal service
   * @param {Modal} modalService
   * @param {SearchRecipesComponent} search
   * @param {AuthService} authService
   */
  constructor(public modalService: ModalService, public search: SearchRecipesComponent, private authService: AuthService, public dialog: MatDialog, public afs: AngularFirestore) {
    this.previousUID = 0;
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.currentWeekPlanObs = this.afs.collection('users/'+this.userInfo+'/mealplan', (ref) => ref.where('label', '==', 'currentWeek')).valueChanges();
      this.listData('users/'+this.userInfo+'/mealplan').then((listOfDocs) => {
        for (let i = 0; i < listOfDocs.length; i++) {
          if (listOfDocs[i].label == 'currentWeek') {
            if (listOfDocs[i].defined == false) {
              const currentWeekDates = this.getWeek(new Date());
              this.addBlankPlan('currentWeek', currentWeekDates);
              this.constructorHasRun = true;
            }
          }
        }
      });
    });
  }
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
   */
  addBlankPlan(docPath, weekDates) {
    const mealPlanBlankWeek: mealPlanWeek = {
      label: docPath,
      defined: false,
      startDate: weekDates[0].date,
      days: [],
    };
    weekDates.forEach((element) => {
      const mealPlanBlankDay: mealPlanDay = {
        date: element.date,
        weekDayName: element.weekDayName,
        breakfast: [],
        lunch: [],
        dinner: [],
      };
      mealPlanBlankWeek.days.push(mealPlanBlankDay);
    });
    this.setDocInFireStore(docPath, mealPlanBlankWeek);
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
   * Opens the dialog on click
   */
  openDialog() {
    const dialogRef = this.dialog.open(SearchRecipesComponent, {
      width: '50%',
      height: '75%',
      data: {embeddedPage: 'mealPlan'},
    });
    dialogRef.afterClosed().subscribe((result) => {
      // Only takes action if the result is defined
      if (result) {
        this.setRecipeInPlan(result.recipeName, result.uid);
      }
    });
  }

  /**
   * updates the mealPlan with the partialData representing the new recipe the user has added
   * @param {string} recipeName
   * @param {string} uid
   */
  setRecipeInPlan(recipeName, uid) {
    this.listData('users/'+this.userInfo+'/mealplan').then((mealPlanWeeks) => {
      for (let i = 0; i < mealPlanWeeks.length; i++) {
        const partialData = mealPlanWeeks[i];
        for (let j = 0; j < partialData.days.length; j++) {
          if (partialData.days[j].date.toDate().toDateString() === this.dateToSet.toDateString()) {
            if (this.mealTypeToSet == 'breakfast') {
              const newMeal = partialData.days[j].breakfast.concat([{recipeName: recipeName, uid: uid}]);
              partialData.days[j].breakfast = newMeal;
              // Sets a component variable with the partialData, this can then be later retrieved or used for testing
              this.partialDataLastSet = partialData;
            }
          }
        }
        this.updateDocInFireStore(mealPlanWeeks[i].label, partialData);
        // this.afs.collection('users/'+this.userInfo+'/mealplan').doc(mealPlanWeeks[i].label).update(partialData);
      }
    });
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
        // date: this.weekDayName[i] + ' ' + (dateData.getMonth() + 1) + '/' + dateData.getDate(); + '/' + dateData.getFullYear(),
      };
      weekDay.push(newDate);
      dateData.setDate(dateData.getDate() + 1);
    }
    return weekDay;
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
   * @param {string} path - The Firestore path to retrieve recipes from
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
}
