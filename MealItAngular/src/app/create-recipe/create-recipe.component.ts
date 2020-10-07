import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.css']
})
export class CreateRecipeComponent {


       public Ingredients = []; 

       public newIngredient; 
     
       public addToList() { 
           if (this.newIngredient == '') { 
           } 
           else { 
               this.Ingredients.push(this.newIngredient); 
               this.newIngredient = ''; 
           } 
       } 
     
       public deleteIngredient(index) { 
           this.Ingredients.splice(index, 1); 
       } 

       public submitRecipe(){
         
       }

}
