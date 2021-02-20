import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {ModalService} from '../modal-functionality';
import {SearchRecipesComponent} from '../search-recipes/search-recipes.component';
import {mealPlanWeek, mealPlanDay, mealPlanRecipe} from './mealPlan.model';

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
  constructor(private modalService: ModalService, private search: SearchRecipesComponent, private authService: AuthService) {
    this.previousUID = 0;
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
    });
  }
  /**
   * A function for submitting a meal to a meal plan
   * @param {string | number} uid
   * @param {string} modalID
   * @return {string}
   */
  submitMeal(uid: string | number, modalID: string) {
    if (this.date != null) {
      alert('Adding ' + uid + ' on ' + this.simplifyDate(this.date));
      let returnMessage = 'Adding ' + uid + ' on ' + this.simplifyDate(this.date);
      this.errorDate = false;
      this.date = null;
      returnMessage += ' ' + this.errorDate + this.date;
      // this.closeModal(modalID);
      return returnMessage;
    } else {
      this.errorDate = true;
      this.errorMessage = 'You must enter a valid date';
      const returnMessage = this.errorDate + this.errorMessage;
      return returnMessage;
    }
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
   * Sends search term to search service and sets fuzzyResults to the resulting list of search results
   */
  public searchFuzzy() {
    this.fuzzyResults = this.search.searchService(this.searchTerm);
  }

  /**
   * Takes in a date an returns the week of that day. Sunday to Saturday.
   * @param {Date} uid
   * @return {Array}
   */
  getWeek(uid: Date) {
    // Set dateData to uid
    const dateData = uid;

    // Variable for the input day
    const day = dateData.getDay();

    // Variables for weekdays
    const weekDay = [];
    let newDate;
    let dt;

    // Compiling the information for the days
    dateData.setDate(dateData.getDate() - day);
    for (let i = 0; i <= 6; i++) {
      dt = dateData.getDate();
      newDate = this.weekDayName[i] + ' ' + (dateData.getMonth() + 1) + '/' + dt + '/' + dateData.getFullYear();
      dateData.setDate(dateData.getDate() + 1);
      weekDay.push(newDate);
      return weekDay;
    }

    // Print out weekDay as a test
    console.log(weekDay);
    for (let i = 0; i <= 6; i++) {
      console.log(weekDay[i]);
    }
  }

  /**
   * Fetches the ingredient information for a specific recipe based on its uid
   * Returns the fetched data to this.ingredients to be displayed by Material UI in HTML
   * @param {string | number} uid
   */
  fetchRecipe(uid: string | number) {
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
  }
}
