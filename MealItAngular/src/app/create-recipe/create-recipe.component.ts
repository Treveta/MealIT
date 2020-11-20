/* eslint-disable import/prefer-default-export */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-empty */
/* eslint-disable no-plusplus */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-alert */
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { DatabaseHelperComponent } from 'app/database-helper/database-helper.component';
import { AuthService } from '../services/auth.service';
import { recipeList } from '../models/recipeList.model';
import { ingredientTraits } from '../models/ingredientTraits.model';
import { ModalService } from '../modal-functionality';

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

       public directions;

       public tags;

       private userInfo;

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
        ) {
          authService.getUid().then((uid) => {
            this.userInfo = uid;
            this.recipeListCollection = this.afs.collection<recipeList>(`users/${uid}/recipeList`);
            this.listRecipes = this.recipeListCollection.valueChanges();
            this.recipe = {
              recipeName: null,
              calories: null,
              servings: null,
            };
          });
        }

        public addToList() {
          const amount = parseFloat(this.newAmount);
          if (this.newIngredient === '' || this.newUnit === '' || isNaN(amount)) {
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
          if (this.Ingredients.length > 0 && this.servings !== '' && this.calories !== '' && this.recipeName !== '') {
            const data = {
              uid: '',
              recipeName: this.recipeName, // get this stuff from auth.service.ts
              calories: this.calories,
              servings: this.servings,
            };
            const documentAdded = await this.recipeListCollection.add(data);
            this.recipeListCollection.doc(documentAdded.id).update({ uid: documentAdded.id });
            const ingredients = this.afs.collection(`users/${this.userInfo}/recipeList/${documentAdded.id}/ingredients`);

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
            this.servings = '';
            this.calories = '';
            this.recipeName = '';
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

        public deleteRecipe(path) {
        }

        async openRecipe(recipe) {
          this.recipe.recipeName = recipe.recipeName;
          this.recipe.calories = recipe.calories;
          this.recipe.servings = recipe.servings;
          this.ingredientsCollection = this.afs.collection(`users/${this.userInfo}/recipeList/${recipe.uid}/ingredients`);
          this.ingredientObserve = this.ingredientsCollection.valueChanges();

          this.openModal('custom-modal-3');
        }
}
