/* eslint-disable require-jsdoc */
import {Component, OnInit, OnDestroy, Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';
import {AngularFireAnalytics} from '@angular/fire/analytics';
import FuzzySearch from 'fuzzy-search';
import mocker from 'mocker-data-generator';

@Injectable({providedIn: 'root'})
@Component({
  selector: 'app-search-recipes',
  templateUrl: './search-recipes.component.html',
  styleUrls: ['./search-recipes.component.css'],
})
export class SearchRecipesComponent implements OnInit, OnDestroy {
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

  constructor(private afs: AngularFirestore, private authService: AuthService, private analytics: AngularFireAnalytics) {
    this.previousUID = 0;
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.collectionPath = 'users/' + uid + '/recipeList';
      if (localStorage.getItem('cachedRecipes') === null || localStorage.getItem('updatePending') === 'true' || localStorage.getItem('cachedRecipes') === undefined) {
        this.listRecipes(this.collectionPath).then((list) => {
          this.userRecipes = list;
          localStorage.setItem('cachedRecipes', JSON.stringify(list));
          localStorage.setItem('updatePending', 'false');
          analytics.logEvent('Cache Update');
        });
      } else {
        this.fetchCache();
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    delete this.userRecipes;
  }

  searchFuzzy() {
    this.recipeFuse = new FuzzySearch(this.userRecipes, ['recipeName'], {keys: ['recipeName']});
    this.fuseResults = this.recipeFuse.search(this.searchTerm);
  }

  searchService(searchterm) {
    this.recipeFuse = new FuzzySearch(this.userRecipes, ['recipeName'], {keys: ['recipeName']});
    return this.recipeFuse.search(searchterm);
  }

  selectRecipe(recipe: { uid: any; }) {
    console.log(recipe.uid);
  }

  fetchCache() {
    this.userRecipes = JSON.parse(localStorage.getItem('cachedRecipes'));
    console.log('Cache Fetched');
  }

  setCache(data) {
    localStorage.setItem('cachedRecipes', JSON.stringify(data));
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
      this.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    } else {
      this.previousUID = uid;
      const ingredientPath = 'users/' + this.userInfo + '/recipeList/' + uid + '/ingredients';
      this.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    }
  }

  getNumberOfRecipes() {
    console.log(this.userRecipes.length);
  }

  /**
   * Function adds a NUMBER of new randomly generated recipes to the users database
   * Used for testing, to be removed in production build
   */
  async addData() {
    const recipeScheme = {
      recipeName: {faker: 'random.words'},
      calories: {faker: 'random.number'},
      servings: {faker: 'random.number'},
    };
    const ingredientScheme = {
      ingredientName: {faker: 'random.word'},
      calories: {faker: 'random.number'},
      unit: {faker: 'random.word'},
    };
    const numAdded = 100;
    for (let i = 0; i < numAdded; i++) {
      const data = mocker()
          .schema('recipe', recipeScheme, 1)
          .schema('ingredients', ingredientScheme, 5)
          .buildSync();
      const documentAdded = await this.afs.collection(this.collectionPath).add(data.recipe[0]);
      this.afs.collection(this.collectionPath).doc(documentAdded.id).update({uid: documentAdded.id});
      this.ingredients = this.afs.collection('users/'+this.userInfo+'/recipeList/'+ documentAdded.id + '/ingredients');
      for (let i = 0; i < data.ingredients.length; i++) {
        this.ingredients.add(data.ingredients[i]);
      }
    }
  }

  async listRecipes(path: string) {
    try {
      const snapshot = await this.afs
          .collection(path)
          .get().toPromise();
      const list = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        list.push(data);
      });
      return list;
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }

  async listIngredients(path: string) {
    try {
      const snapshot = await this.afs
          .collection(path)
          .get().toPromise();
      const list = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        list.push(data);
      });
      return list;
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }

  localStorageSpace() {
    let data = '';

    console.log('Current local storage: ');

    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        data += window.localStorage[key];
        console.log( key + ' = ' + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
      }
    }

    console.log(data ? '\n' + 'Total space used: ' + ((data.length * 16)/(8 * 1024)).toFixed(2) + ' KB' : 'Empty (0 KB)');
    console.log(data ? 'Approx. space remaining: ' + (5120 - ((data.length * 16)/(8 * 1024)) + ' KB') : '5 MB');
  };
}
