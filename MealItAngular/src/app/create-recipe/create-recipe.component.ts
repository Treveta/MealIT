import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { recipeList } from '../models/recipeList.model';
// import { Console } from 'console';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.css']
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

        recipeListCollection: AngularFirestoreCollection<recipeList>;
        listRecipes: Observable<recipeList[]>

       constructor(
        private afs: AngularFirestore,
        private authService: AuthService)
        {
            this.userInfo = authService.fetchUserData()
            this.recipeListCollection = this.afs.collection<recipeList>('users/'+this.userInfo.uid+'/recipeList');
            this.listRecipes = this.recipeListCollection.valueChanges();
        }
     
       public addToList() { 
            var amount= parseFloat(this.newAmount);
            //console.log(amount);
           if (this.newIngredient == ''|| this.newUnit == '' || isNaN(amount)) { 
           } 
           else { 
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

       async submitRecipe(){
            if(this.Ingredients.length>0 && this.servings != '' && this.calories != '' && this.recipeName != ''){
                const data = {
                    recipeName: this.recipeName,  //get this stuff from auth.service.ts
                    calories: this.calories,      
                    servings: this.servings
                }
                let documentAdded = await this.recipeListCollection.add(data)
                let ingredients = this.afs.collection('users/'+this.userInfo.uid+'/recipeList/'+ documentAdded.id + '/ingredients');

                for (var i = 0; i < this.Ingredients.length; i++) {
                    ingredients.add(
                        {
                            ingredientName: this.Ingredients[i],
                            amount: this.amount[i],
                            unit: this.units[i]
                        }
                        );
                }
                this.Ingredients = []; 
                this.amount = []; 
                this.units = []; 
                this.servings='';
                this.calories='';
                this.recipeName='';
            }
            else{
                window.alert("Please fill in all fields and have at least one ingredient");
            }
       }

}
