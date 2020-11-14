/* eslint-disable max-len */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from 'app/services/auth.service';
import FuzzySearch from 'fuzzy-search';
import mocker from 'mocker-data-generator';

@Component({
  selector: 'app-search-recipes',
  templateUrl: './search-recipes.component.html',
  styleUrls: ['./search-recipes.component.css'],
})
export default class SearchRecipesComponent implements OnInit, OnDestroy {
  searchTerm: string; // The search term for the fuzzy search

  userInfo: unknown; // The current users uid

  collectionPath: string; // Firestore collection path to current users recipeList

  userRecipes: string | any[]; // List of all users recipes as a json style object

  fuzzySearch: string; // The fuzzy search object

  fuzzyResults: any; // Stores the results of the fuzzy search as a json style list

  ingredients: AngularFirestoreCollection<unknown>; // Firestore collection path to a recipes ingredients subcollection

  ingredientList: { Loading: boolean; }[]; // json style list containing the ingredient info from a specific recipe

  panelOpenState = false; // The state of an expansion panel

  previousUID = 0; // The previous recipe uid

  ingredientListLoading = [{ Loading: true }]; // A stock list used as a go between while loading new ingredients

  // eslint-disable-next-line no-unused-vars, no-useless-constructor, no-empty-function
  constructor(private afs: AngularFirestore, private authService: AuthService) {}

  ngOnInit(): void {
    // Ensures auth state is passed
    this.authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.collectionPath = `users/${uid}/recipeList`; // Sets collection path to users recipe list

      // Retrieves the users recipes and saves them as a local list
      this.listRecipes(this.collectionPath).then((list) => {
        this.userRecipes = list;
      });
    });
  }

  // Manual garbage collection
  ngOnDestroy(): void {
    delete this.userRecipes;
    delete this.fuzzySearch;
  }

  // Fuzzily searches userRecipes based on recipe name and searchTerm
  searchFuzzy(): void {
    this.fuzzySearch = new FuzzySearch(this.userRecipes, ['recipeName'], { keys: ['recipeName'] });
    this.fuzzyResults = this.fuzzySearch.search(this.searchTerm);
  }

  // Fetches a recipe's ingredients based on the recipe uid
  fetchRecipe(uid: number): void {
    // Handles the loading of ingredients based on expansion panel state and previously fetched info
    if (uid === this.previousUID && this.panelOpenState === false) { // If panel is being closed and uid equals previous uid
      // This clause prevents a query to the database everytime an expansion panel is closed
      // Only querying the database when the panel is opened.
      this.ingredientList = this.ingredientListLoading;
      this.previousUID = 0;
    } else if (uid !== this.previousUID && this.panelOpenState === true) { // if panel is being opened and uid does not match previous uid
      this.ingredientList = this.ingredientListLoading;
      this.previousUID = uid;
      const ingredientPath = `users/${this.userInfo}/recipeList/${uid}/ingredients`;
      this.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    } else {
      this.previousUID = uid;
      const ingredientPath = `users/${this.userInfo}/recipeList/${uid}/ingredients`;
      this.listIngredients(ingredientPath).then((list) => {
        this.ingredientList = list;
      });
    }
  }

  // Debugging/Testing function to count how many recipes are currently in userRecipes
  getNumberOfRecipes(): void {
    // eslint-disable-next-line no-console
    console.log(this.userRecipes.length);
  }

  // Debugging/Testing function that adds recipes filled with random data into the database
  // Used to test how the site handles large datasets and its speed and memory use
  // Postcondition: Adds numAdded recipes to users recipeList collection in Firestore
  async addData(): Promise<void> {
    const recipeScheme = {
      recipeName: { faker: 'random.words' },
      calories: { faker: 'random.number' },
      servings: { faker: 'random.number' },
    };
    const ingredientScheme = {
      ingredientName: { faker: 'random.word' },
      calories: { faker: 'random.number' },
      unit: { faker: 'random.word' },
    };
    const numAdded = 100;
    for (let i = 0; i < numAdded; i + 1) {
      const data = mocker()
        .schema('recipe', recipeScheme, 1)
        .schema('ingredients', ingredientScheme, 5)
        .buildSync();
      // eslint-disable-next-line no-await-in-loop
      const documentAdded = await this.afs.collection(this.collectionPath).add(data.recipe[0]);
      this.afs.collection(this.collectionPath).doc(documentAdded.id).update({ uid: documentAdded.id });
      this.ingredients = this.afs.collection(`users/${this.userInfo}/recipeList/${documentAdded.id}/ingredients`);
      // eslint-disable-next-line no-restricted-syntax
      for (i of data.ingredients) {
        this.ingredients.add(data.ingredients[i]);
      }
    }
  }

  // Queries Firestore and returns all recipes where the names are not null
  // Postcondition: returns a json style list containing recipe data
  async listRecipes(path: string): Promise<void | any> {
    try {
      const snapshot = await this.afs
        .collection(path)
        .get().toPromise();
      const list = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.recipeName != null) {
          data.id = doc.id;
          list.push(data);
        }
      });
      return list;
    } catch (err) {
      return err;
    }
  }

  // Queries Firestore and returns all ingredients in a recipe
  // Postcondition: returns a json style list containing ingredient data
  async listIngredients(path: string): Promise<void | any> {
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
      return err;
    }
  }
}
