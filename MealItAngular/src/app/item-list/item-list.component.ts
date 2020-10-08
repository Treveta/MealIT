import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms'

// this service file pulls the json object and uses it here dynamically
import { ItemService } from '../item.service';

@Component({
    selector: 'item-list',
    templateUrl: './item-list.component.html',
    styleUrls: ['./item-list.component.css']
})
export class ItemListComponent {
    form: FormGroup;
    itemType;

    // sets up the form groups for the checkboxes
    constructor(
        private itemService: ItemService,
        private fb: FormBuilder
    ) { 
        this.itemType = this.itemService.getItem();
        this.form = this.fb.group({
            checkArray: this.fb.array([])
        })
    }

    // checks whether the box has been checked
    onCheckBoxChange(event) {
        const checkArray: FormArray = this.form.get('checkArray') as FormArray;

        if (event.target.checked) {
            checkArray.push(new FormControl(event.target.value));
        } else {
            let i: number = 0;
            checkArray.controls.forEach((uncheckedItem: FormControl) => {
                if (uncheckedItem.value == event.target.value) {
                    checkArray.removeAt(i);
                    return;
                }
            })
        }
    }

    // can do other things in the future, 
    // currently prints the objects into the console as a formarray
    submitForm() {
        console.log(this.form.value);
    }

    public Items = []; 

    public newItem; 
  
    public addToItemList() { 
        if (this.newItem == '') { 
        } 
        else { 
            this.Items.push(this.newItem); 
            this.newItem = ''; 
        } 
    } 
  /*
    public deleteIngredient(index) { 
        this.Ingredients.splice(index, 1); 
    } 
   

    public submitRecipe(){
      
    }
 */

}

