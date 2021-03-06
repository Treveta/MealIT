import {Component, OnInit, OnDestroy, Injectable, Input, Output, EventEmitter, Inject} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';
import {AngularFireAnalytics} from '@angular/fire/analytics';
import FuzzySearch from 'fuzzy-search';
import mocker from 'mocker-data-generator';
import {MatDialogRef} from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DatabaseHelperComponent} from 'app/database-helper/database-helper.component';


@Injectable({providedIn: 'root'})
@Component({
  selector: 'app-search-recipes',
  templateUrl: './search-recipes.component.html',
  styleUrls: ['./search-recipes.component.css'],
})
/**
 * Componenent that handles the searching of recipes. Uses a fuzzy search algorithm.
 */
export class SearchRecipesComponent implements OnDestroy, OnInit {
  @Input()
    embeddedPage: string;

  @Output() onMealSelected = new EventEmitter<string>();

  searchTerm: string;
  userInfo: unknown;
  collectionPath: string;
  arrayOfTerms: any;

  recipes: any;

  userRecipes: any[];
  recipeFuse: string;
  fuseResults: any;

  ingredients: AngularFirestoreCollection<unknown>;

  ingredientList: void | any[];

  panelOpenState = false;
  previousUID: string | number;
  ingredientListLoading = [{Loading: true}]
  tested: boolean = true;
  /**
   * Creates a search component
   * @param {AngularFirestore} afs
   * @param {AuthService} authService
   * @param {AngularFireAnalytics} analytics
   */
  constructor(private afs: AngularFirestore, private authService: AuthService, private analytics: AngularFireAnalytics, public dialogRef: MatDialogRef<SearchRecipesComponent>, @Inject(MAT_DIALOG_DATA) public data: {embeddedPage: string}, private dbHelp: DatabaseHelperComponent) {
    this.previousUID = 0;
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.collectionPath = 'users/' + uid + '/recipeList';
      if (localStorage.getItem('cachedRecipes') === null || localStorage.getItem('updatePending') === 'true' || localStorage.getItem('cachedRecipes') === undefined) {
        this.listRecipes(this.collectionPath).then((list) => {
          this.userRecipes = list;
          localStorage.setItem('cachedRecipes', JSON.stringify(list));
          localStorage.setItem('updatePending', 'false');
          this.fuseResults = this.userRecipes;
          this.searchTerm = ' ';
          this.searchFuzzy();
          analytics.logEvent('Cache Update');
        });
      } else {
        this.fetchCache();
        this.fuseResults = this.userRecipes;
        this.searchTerm = ' ';
        this.searchFuzzy();
      }
    });
  }

  /**
   * Initializes the component as a lifecycle hook
   */
  ngOnInit(): void {
    if (this.embeddedPage) {
      this.data.embeddedPage = this.embeddedPage;
    }
    console.log(this.embeddedPage);
  }
  /**
   * Destroys the component
   */
  ngOnDestroy(): void {
    delete this.userRecipes;
  }

  /**
   * If the component is referenced as a dialog this function can close it and send variable to parent
   * @param {string} selectedMealuid the uid of the recipe to send back to parent component
   * @param {string} selectedMealName the common name of the recipe to send back to parent component
   * @param {any} selectedMealIngredients the array of ingredients to return
   */
  selectMealDialogClose(selectedMealuid: string, selectedMealName: string, selectedMealIngredients: any): void {
    const returnData = {
      recipeName: selectedMealName,
      uid: selectedMealuid,
      ingredients: selectedMealIngredients,
    };
    this.dialogRef.close(returnData);
  }

  /**
   * On Click function that sends selected meal to parent through an event listener
   * @param {string} selectedMeal the uid of the meal the user has selected
   */
  selectMeal(selectedMeal: string): void {
    this.onMealSelected.emit(selectedMeal);
  }

  /**
   * Search function to be used without a parameter
   */
  searchFuzzy() {
    this.recipeFuse = new FuzzySearch(this.userRecipes, ['recipeName'], {keys: ['recipeName']});
    this.fuseResults = this.recipeFuse.search(this.searchTerm);
  }

  /**
   * Sets fuseResults
   * @param {string} item
   */
  setFuseResults(item) {
    this.fuseResults = item;
  }

  /**
   * Search function to be used with a parameter. Designed to be used when imported in another component
   * @param {string} searchterm - the user defined string that drives the search
   * @return {Array} Returns the search results based on searchterm
   */
  searchService(searchterm) {
    this.recipeFuse = new FuzzySearch(this.userRecipes, ['recipeName'], {keys: ['recipeName']});
    return this.recipeFuse.search(searchterm);
  }

  /**
   * Retrieves the cache from localStorage and sets it to userRecipes
   * @return {string}
   */
  fetchCache() {
    this.userRecipes = JSON.parse(localStorage.getItem('cachedRecipes'));
    return 'Cache Fetched';
  }

  /**
   * Sets the cachedRecipes variable in localStorage
   * @param {Object} data - The value to set cachedRecipes to
   */
  setCache(data) {
    localStorage.setItem('cachedRecipes', JSON.stringify(data));
  }

  /**
   * Fetches the ingredient information for a specific recipe based on its uid
   * Returns the fetched data to this.ingredients to be displayed by Material UI in HTML
   * @param {string | number} uid
   * @param {function} ingredientFunction
   */
  fetchRecipe(uid: string | number, ingredientFunction) {
    // If the previously viewed recipe and the recipe being fetched match there is no need to fetch new data
    if (uid == this.previousUID && this.panelOpenState == false) {
      this.ingredientList = this.ingredientListLoading;
      this.previousUID = 0;
    // If the previously viewed recipe and the recipe being fetched do no match and the panel is open, sub data with temp data while new data is fetched
    } else if (uid != this.previousUID && this.panelOpenState == true) {
      this.ingredientList = this.ingredientListLoading;
      this.previousUID = uid;
      const ingredientPath = 'users/' + this.userInfo + '/recipeList/' + uid + '/ingredients';
      ingredientFunction(this, ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    // If none of the other cases are true fetch new data
    } else {
      this.previousUID = uid;
      const ingredientPath = 'users/' + this.userInfo + '/recipeList/' + uid + '/ingredients';
      ingredientFunction(this, ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    }
  }

  /**
   * Stub Function for use in testing to bypass need for Firestore API in fetchRecipe
   * @param {string} path
   * @return {Promise}
   */
  listIngredientsStub(path) {
    const ingredientPromise = new Promise((resolve) => {
      resolve([
        {
          'ingredientName': 'rice',
        },
        {
          'ingredientName': 'ketchup',
        },
        {
          'ingredientName': 'bbq',
        },
      ]);
    });
    return ingredientPromise;
  }

  /**
   * Function adds a NUMBER of new randomly generated recipes to the users database
   * Creates random data based on defined schemas and adds them to a list before systematically adding each list element to the database
   * Used for testing, to be removed in production build
   */
  async addData() {
    // Defines a schema to be used by mocker to create random recipes
    const recipeNameScheme = {
      recipeName: {faker: 'random.words'},
    };
    const recipeCalorieScheme = {
      calories: {faker: 'random.number'},
    };
    const recipeServingsScheme = {
      servings: {faker: 'random.number'},
    };
    // Defines a schema to be used by mocker to create random Ingredients
    const ingredientScheme = {
      ingredientName: {faker: 'random.word'},
      quantity: {faker: 'random.number'},
      unit: {faker: 'random.word'},
    };
    // Number of recipes to add when function runs
    const numAdded = 10;
    // Systematically generates random data based on schemas and adds them to the database
    for (let i = 0; i < numAdded; i++) {
      // Creates a random recipe and random list of ingredients based on schema
      const data = mocker()
          .schema('recipeName', recipeNameScheme, 1)
          .schema('recipeCalories', recipeCalorieScheme, 1)
          .schema('recipeServing', recipeServingsScheme, 1)
          .schema('ingredients', ingredientScheme, 5)
          .buildSync();
      // Adds random recipe to database
      let index = 0;
      const unitTypes = ['lb', 'tsp', 'tbsp', 'ct', 'oz'];
      data.ingredients.forEach((ingredient) => {
        ingredient.unit = unitTypes[index];
        index++;
      });
      const dataAdd = {
        recipeName: data.recipeName[0].recipeName,
        calories: data.recipeCalories[0].calories,
        servings: data.recipeServing[0].servings,
        ingredients: data.ingredients,
      };
      const documentAdded = await this.afs.collection(this.collectionPath).add(dataAdd);
      this.afs.collection(this.collectionPath).doc(documentAdded.id).update({uid: documentAdded.id});
      console.log(dataAdd);
      localStorage.setItem('updatePending', 'true');
    }
  }

  /**
   * Delete a document in a specific location
   * @param {any} query
   */
  public deleteDoc(query) {
    this.dbHelp.deleteDocWhere('users/'+this.userInfo+'/recipeList/', query);
  }

  /**
   * splice the temp at the index
   * @param {any} temp
   * @param {any} index
   */
  public tempSplice(temp, index) {
    temp.splice(index, 1);
  }

  /**
   * @param {any} temp
   */
  public setLocalStorageDelete(temp) {
    localStorage.setItem('cachedRecipes', JSON.stringify(temp));
    this.fetchCache();
  }

  /**
   * @param {string} message
   * @return {any}
   */
  public askConfirm(message) {
    return confirm(message);
  }

  /**
   * A funtion that remove a recipe from the databse
   * @param {any} recipe Recipe being deleted
   * @param {any} r Holds boolean value of the confirmation popup
   */
  public deleteRecipe(recipe) {
    const r = this.askConfirm('Are you sure you want to delete this recipe?');
    if (r == true) {
      const query = 'recipeName:==:'+ recipe.recipeName+'';

      this.deleteDoc(query);

      localStorage.setItem('updatePending', 'true');
      const temp: Array<any> = JSON.parse(localStorage.getItem('cachedRecipes'));
      const index = temp.findIndex((index) => index.recipeName === recipe.recipeName);

      this.tempSplice(temp, index);
      this.setLocalStorageDelete(temp);
      this.searchFuzzy();
    }
  }

  /**
   * Retrieves the recipes from the path specified as a list
   * @param {string} path - The Firestore path to retrieve recipes from
   */
  async listRecipes(path: string) {
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
        data.id = doc.id;
        list.push(data);
      });
      // Returns the now populated list
      return list;
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }

  /**
   * Retrieves the ingredients from the path specified as a list
   * @param {this} component - passes the instance of the component to the function, allows it to be used a parameter inside another function
   * @param {string} path - The Firestore path to retrieve ingredients from
   */
  async listIngredients(component: this, path: string) {
    try {
      // collects a snapshot of a Firestore collection base on parameter path
      const snapshot = await component.afs
          .collection(path)
          .get().toPromise();
      // Creates an empty list to populate collection data into
      const list = [];
      // Loops through snapshot and pushes document data to list
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        list.push(data);
      });
      // Returns the now populated list
      return list;
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }

  /**
   * Debug function that logs the space taken up by a users local storage
   */
  localStorageSpace() {
    let data = '';

    console.log('Current local storage: ');

    // Determines current size of local storage objects
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        data += window.localStorage[key];
        // Logs how much space is used by a specific key
        console.log( key + ' = ' + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
      }
    }

    // Logs total space used in local storage
    console.log(data ? '\n' + 'Total space used: ' + ((data.length * 16)/(8 * 1024)).toFixed(2) + ' KB' : 'Empty (0 KB)');
    console.log(data ? 'Approx. space remaining: ' + (5120 - ((data.length * 16)/(8 * 1024)) + ' KB') : '5 MB');
  };
}
