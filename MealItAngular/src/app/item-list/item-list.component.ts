import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms'
import { Observable } from 'rxjs'; //Needed for Database
import { shoppingList } from '../services/shoppingList.model';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'; //Needed for Database
import { ModalService } from '../modal-functionality'; 

import { AuthService } from '../services/auth.service'; //Needed for Database

export interface Item { name: string, seeds: number;}

@Component({
    selector: 'item-list',
    templateUrl: './item-list.component.html',
    styleUrls: ['./item-list.component.css']
})
export class ItemListComponent {
    form: FormGroup;


    public Items = []; 
    public newItem; 
    public editBool;
    private userInfo;

    shoppingCollection: AngularFirestoreCollection<shoppingList>;
    listItems: Observable<shoppingList[]>
    

    // sets up the form groups for the checkboxes
    constructor(
        private modalService: ModalService,
        private fb: FormBuilder,
        private afs: AngularFirestore,
        private authService: AuthService
    ) { 
        this.form = this.fb.group({
            checkArray: this.fb.array([])
        })
        
        this.userInfo = authService.fetchUserData()
        this.shoppingCollection = this.afs.collection<shoppingList>('users/'+this.userInfo.uid+'/shoppingList');
        this.listItems = this.shoppingCollection.valueChanges();
        
    }
  
    public addToItemList() { 
        if (this.newItem == '') { 
        } 
        else { 
            this.Items.push(this.newItem);
            const data = {
                itemName: this.newItem,
                quantity: null,
                unit: null
            }
            this.shoppingCollection.add(data)
            this.newItem = ''; 
        } 
    } 

    public editItemList() {
        if (this.Items.length === 0) {
            this.editBool = false;
        } else {
            this.editBool = true;
        }
        
    }

    public saveEdits() {
        for (let i = 0; i < this.Items.length; i++) {
            for (let j = 0; j < this.form.get('checkArray').value.length; j++){
                if (this.Items[i] == this.form.get('checkArray').value[j]) {
                    this.Items.splice(i, 1);
                }
            }
        }

        this.editBool = false;
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

    submitForm() {
        console.log(this.form.value);
    }

    // these functions are all that is needed to show and hide a modal view
    openModal(id: string) {
        this.modalService.open(id);
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }
}
