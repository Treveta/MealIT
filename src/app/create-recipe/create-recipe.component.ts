import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AuthService} from '../services/auth.service';
import {recipeList} from '../models/recipeList.model';
import {ingredientTraits} from '../models/ingredientTraits.model';
import {ModalService} from '../modal-functionality';
import {DatabaseHelperComponent} from 'app/database-helper/database-helper.component';
import {SearchRecipesComponent} from '../search-recipes/search-recipes.component';


// import { Console } from 'console';
@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.css'],
})
/**
 * Creates a recipe component
 */
export class CreateRecipeComponent {
       /**
        * List that hold ingredients
        * @type {any[]}
        */
       public Ingredients = [];
       /**
        * List that holds the number portion of an ingredient
        * @type {float[]}
        */
       public amount = [];
       /**
        * List that holds the size portion of an ingredient
        * @type {float[]}
        */
       public units = [];

       /**
        * A string holding an ingredient
        * @type {string}
        */
       public newIngredient;
       /**
        * A string holding an ingredient amount
        * @type {string}
        */
       public newAmount;
       /**
        * A string holding an ingredient unit
        * @type {string}
        */
       public newUnit;
       /**
        *  A string holding the number of servings
        * @type {string}
        */
       public servings;
       /**
        * A string holding the number of calories
        * @type {string}
        */
       public calories;
       /**
        * A string holding the recipe name
        * @type {string}
        */
       public recipeName;
       /**
        * The user's information
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

       ingredientsCollection: AngularFirestoreCollection<ingredientTraits>;;
       ingredientObserve: Observable<ingredientTraits[]>;
       public recipe;

        recipeListCollection: AngularFirestoreCollection<recipeList>;
        listRecipes: Observable<recipeList[]>

        /**
         * The constructor for the modal services
         * @param {Modal} modalService
         * @param {any} afs Change this later
         * @param {AuthService} authService
         * @param {any} dbHelp Change this later
         * @param {SearchRecipesComponent} search
         */
        constructor(
        public modalService: ModalService,
        private afs: AngularFirestore,
        private authService: AuthService,
        private dbHelp: DatabaseHelperComponent,
        public search: SearchRecipesComponent,
        ) {
          authService.getUid().then((uid) => {
            this.userInfo = uid;
            this.recipeListCollection = this.afs.collection<recipeList>('users/'+uid+'/recipeList');
            // this.listRecipes = this.recipeListCollection.valueChanges();
            this.recipe = {
              recipeName: null,
              calories: null,
              servings: null,
            };
          });
        }
        /**
         * A function that adds an ingredient to a recipe list
         */
        public addToList() {
          const amount= parseFloat(this.newAmount);
          // console.log(amount);
          if (this.newIngredient == ''|| this.newUnit == '' || isNaN(amount)) {
          } else {
            this.Ingredients.push(this.newIngredient);
            this.amount.push(amount);
            this.units.push(this.newUnit);
            this.newIngredient = '';
            this.newAmount = '';
            this.newUnit = '';
          }
        }

        /**
         * A funtion that removes an ingredient from the recipe list
         * @param {int} index
         */
        public deleteIngredient(index) {
          this.Ingredients.splice(index, 1);
          this.amount.splice(index, 1);
          this.units.splice(index, 1);
        }

        /**
         * Update the document of the recipe list collection
         * @param {any} documentAdded
         */
        public docAndUpdate(documentAdded) {
          this.recipeListCollection.doc(documentAdded.id).update({uid: documentAdded.id});
        }

        /**
         * Setting the local storage with recipes
         * @param {any} data
         */
        public setLocalStorage(data) {
          localStorage.setItem('updatePending', 'true');
          const temp: Array<any> = JSON.parse(localStorage.getItem('cachedRecipes'));
          temp.push(data);
          localStorage.setItem('cachedRecipes', JSON.stringify(temp));
        }

        /**
         * Adding the ingredients
         * @param {any} documentAdded
         */
        public ingredientAdd(documentAdded) {
          this.search.fetchCache();
          const ingredients = this.afs.collection('users/'+this.userInfo+'/recipeList/'+ documentAdded.id + '/ingredients');

          for (let i = 0; i < this.Ingredients.length; i++) {
            ingredients.add(
                {
                  ingredientName: this.Ingredients[i],
                  amount: this.amount[i],
                  unit: this.units[i],
                },
            );
          }
        }

        /**
         * Add a document
         * @param {any} data
         * @return {any}
         */
        async addDocumentRC(data) {
          return this.recipeListCollection.add(data);
        }

        public adding

        /**
         * A function that brings a form to fill out for a recipe
         */
        async submitRecipe() {
          if (this.Ingredients.length>0 && this.servings != '' && this.calories != '' && this.recipeName != '') {
            const data = {
              uid: '',
              recipeName: this.recipeName, // get this stuff from auth.service.ts
              calories: this.calories,
              servings: this.servings,
            };
            const documentAdded = await this.addDocumentRC(data);

            this.docAndUpdate(documentAdded);
            this.setLocalStorage(data);

            this.ingredientAdd(documentAdded);

            this.Ingredients = [];
            this.amount = [];
            this.units = [];
            this.servings='';
            this.calories='';
            this.recipeName='';
          } else {
            window.alert('Please fill in all fields and have at least one ingredient');
          }
        }
        /**
         * A funtion that opens a modal
         * @param {string} id
         */
        openModal(id: string) {
          this.modalService.open(id);
        }
        /**
         * A funtion that closes a modal
         * @param {string} id
         */
        closeModal(id: string) {
          this.modalService.close(id);
        }

        /**
         * Delete a document in a specific location
         * @param {any} query
         */
        public deleteDoc(query) {
          this.dbHelp.deleteDocWhere('users/'+this.userInfo+'/recipeList/', query);
        }

        /**
         * Splice the temp at the index
         * @param {any} temp
         * @param {any} index
         */
        public tempSplice(temp, index) {
          temp.splice(index, 1);
        }

        /**
         * Set the local storage for delection
         * @param {any} temp
         */
        public setLocalStorageDelete(temp) {
          localStorage.setItem('cachedRecipes', JSON.stringify(temp));
          this.search.fetchCache();
        }

        /**
         * Ask for confirmation about deletion
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
            console.log(recipe);
            const query = 'recipeName:==:'+ recipe.recipeName+'';

            this.deleteDoc(query);

            localStorage.setItem('updatePending', 'true');
            const temp: Array<any> = JSON.parse(localStorage.getItem('cachedRecipes'));
            const index = temp.findIndex((index) => index.recipeName === recipe.recipeName);

            this.tempSplice(temp, index);
            this.setLocalStorageDelete(temp);
          }
        }

        /**
         * Test function that prints fuzzyResults to console
         */
        public logResults() {
          console.log(this.fuzzyResults);
        }

        /**
         * A funtion that opens a recipes information
         * @param {any} recipe
         */
        async openRecipe(recipe) {
          this.recipe.recipeName = recipe.recipeName;
          this.recipe.calories = recipe.calories;
          this.recipe.servings = recipe.servings;
          this.ingredientsCollection = this.afs.collection('users/'+this.userInfo+'/recipeList/'+ recipe.uid + '/ingredients');
          this.ingredientObserve = this.ingredientsCollection.valueChanges();

          this.openModal('custom-modal-3');
        }
}
