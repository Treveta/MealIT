/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {AuthService} from '../services/auth.service';
import {ModalService} from '../modal-functionality';
import {DatabaseHelperComponent} from 'app/database-helper/database-helper.component';
import {SearchRecipesComponent} from '../search-recipes/search-recipes.component';


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
  public Mealtimes =[];

  public newDate;
  public newMealtype;
  public newRecipe;

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

  public panelOpenState;
  private previousUID;
  public ingredientList;
  public ingredientListLoading

  constructor(private modalService: ModalService, private search: SearchRecipesComponent, private authService: AuthService) {
    this.previousUID = 0;
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
    });
  }
  submitMeal() {

  }
  openModal(id: string) {
    this.modalService.open(id);
  }

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
   * Test function that prints fuzzyResults to console
   */
  public logResults() {
    console.log(this.fuzzyResults);
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
