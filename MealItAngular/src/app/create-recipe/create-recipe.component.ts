import { Component, OnInit } from '@angular/core';
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

       public submitRecipe(){
            var fullRecipe = {"name" : this.recipeName , "Ingredients" : this.Ingredients , "Amounts" : this.amount , "units" : this.units , "calories" : this.calories , "servings" : this.servings};
            var recipeJSON = JSON.stringify(fullRecipe);
            window.alert(recipeJSON);
       }

}
