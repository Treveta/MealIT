import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms'

// this service file pulls the json object and uses it here dynamically
import { ItemService } from '../item.service';

@Component({
    selector: 'item-list',
    templateUrl: './item-list.component.html',
    styleUrls: ['./item-list.component.css']
})
export class ItemListComponent implements OnInit {
    form: FormGroup;
    itemType;

    // sets up the form groups for the checkboxes
    constructor(
        private itemService: ItemService,
        private fb: FormBuilder
    ) { 
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

    ngOnInit() { 
        this.itemType = this.itemService.getItem();
    }
}