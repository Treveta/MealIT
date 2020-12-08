/* eslint-disable require-jsdoc */
import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
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
export class CreateRecipeComponent {
       public Ingredients = [];
       public amount = [];
       public units = [];

       public newIngredient;
       public newAmount;
       public newUnit;
       public servings;
       public calories;
       public recipeName;
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

        constructor(
        private modalService: ModalService,
        private afs: AngularFirestore,
        private auth: AngularFireAuth,
        private authService: AuthService,
        private dbHelp: DatabaseHelperComponent,
        private search: SearchRecipesComponent,
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

        public deleteIngredient(index) {
          this.Ingredients.splice(index, 1);
          this.amount.splice(index, 1);
          this.units.splice(index, 1);
        }

        async submitRecipe() {
          if (this.Ingredients.length>0 && this.servings != '' && this.calories != '' && this.recipeName != '') {
            const data = {
              uid: '',
              recipeName: this.recipeName, // get this stuff from auth.service.ts
              calories: this.calories,
              servings: this.servings,
            };
            const documentAdded = await this.recipeListCollection.add(data);
            this.recipeListCollection.doc(documentAdded.id).update({uid: documentAdded.id});
            localStorage.setItem('updatePending', 'true');
            const temp: Array<any> = JSON.parse(localStorage.getItem('cachedRecipes'));
            temp.push(data);
            localStorage.setItem('cachedRecipes', JSON.stringify(temp));
            this.search.updateCache();
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

        openModal(id: string) {
          this.modalService.open(id);
        }

        closeModal(id: string) {
          this.modalService.close(id);
        }

        public deleteRecipe(recipe) {
          console.log(recipe);
          const query = 'recipeName:==:'+ recipe.recipeName+'';
          this.dbHelp.deleteDocWhere('users/'+this.userInfo+'/recipeList/', query);
          localStorage.setItem('updatePending', 'true');
          const temp: Array<any> = JSON.parse(localStorage.getItem('cachedRecipes'));
          const index = temp.findIndex((index) => index.recipeName === recipe.recipeName);
          temp.splice(index, 1);
          localStorage.setItem('cachedRecipes', JSON.stringify(temp));
          this.search.updateCache();
          this.searchFuzzy();
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

        async openRecipe(recipe) {
          this.recipe.recipeName = recipe.recipeName;
          this.recipe.calories = recipe.calories;
          this.recipe.servings = recipe.servings;
          this.ingredientsCollection = this.afs.collection('users/'+this.userInfo+'/recipeList/'+ recipe.uid + '/ingredients');
          this.ingredientObserve = this.ingredientsCollection.valueChanges();

          this.openModal('custom-modal-3');
        }
}
