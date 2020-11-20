/* eslint-disable require-jsdoc */
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, FormControl} from '@angular/forms';
import {Observable, Subscription} from 'rxjs'; // Needed for Database
import {shoppingList} from '../services/shoppingList.model';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore'; // Needed for Database
import {ModalService} from '../modal-functionality';

import {AuthService} from '../services/auth.service'; // Needed for Database

export interface Item { name: string; seeds: number; }


interface Unit{
    value: string;
    viewValue: string;
}

interface UnitGroup {
    disabled?: boolean;
    name: string;
    unit: Unit[];
}

@Component({
  selector: 'item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.css'],
})

export class ItemListComponent {
  // sets up the form groups for the checkboxes
  constructor(
        private modalService: ModalService,
        private fb: FormBuilder,
        private afs: AngularFirestore,
        private authService: AuthService,
  ) {
    this.form = this.fb.group({
      checkArray: this.fb.array([]),
    });

    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.shoppingCollection = this.afs.collection<shoppingList>('users/' + this.userInfo + '/shoppingList');
      this.listItems$ = this.shoppingCollection.valueChanges();
    });
  }
    form: FormGroup;

    public newItem;
    public newQuantity;
    public newUnit;

    public editBool;
    private userInfo;

    shoppingCollection: AngularFirestoreCollection<shoppingList>;
    listItems$: Observable<shoppingList[]>;
    private subscription: Subscription;

    unitControl = new FormControl();
    unitGroups: UnitGroup[] = [
      {
        name: 'US Units',
        unit: [
          {value: 'lb', viewValue: 'lb(s)'},
          {value: 'cup', viewValue: 'cup(s)'},
          {value: 'oz', viewValue: 'ounce(s)'},
          {value: 'tsp', viewValue: 'teaspoon(s)'},
          {value: 'tbsp', viewValue: 'tablespoon(s)'},
        ],
      },
      {
        name: 'Metric Units',
        unit: [
          {value: 'g', viewValue: 'gram(s)'},
          {value: 'mL', viewValue: 'milliliter(s)'},
          {value: 'L', viewValue: 'Liter(s)'},
        ],
      },
      {
        name: 'Other Units',
        unit: [
          {value: 'ct', viewValue: 'count(s)'},
          {value: 'pinch', viewValue: 'pinch(es)'},
        ],
      },

    ];

    async addToItemList() {
      if (this.newItem == '') {
      } else {
        const addedItem = {
          uid: '',
          itemName: this.newItem,
          quantity: this.newQuantity,
          unit: this.newUnit,
        };
        const documentAdded = await this.shoppingCollection.add(addedItem);
        this.shoppingCollection.doc(documentAdded.id).update({uid: documentAdded.id});
        this.newItem = '';
        this.newQuantity = '';
        this.newUnit = '';
      }
    }

    public editItemList() {
      if (false) {
        this.editBool = false;
      } else {
        this.editBool = true;
      }
    }

    public saveEdits() {
      for (let i = 0; i < this.form.get('checkArray').value.length; i++) {
        this.subscription = this.listItems$.subscribe((item) => {
          for (let j = 0; j < item.length; j++) {
            if (item[j].itemName == this.form.get('checkArray').value[i]) {
              this.shoppingCollection.doc(item[j].uid).delete();
            }
          }
        });
      }
      this.editBool = false;
    }

    ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

    // checks whether the box has been checked
    onCheckBoxChange(event) {
      const checkArray: FormArray = this.form.get('checkArray') as FormArray;

      if (event.target.checked) {
        checkArray.push(new FormControl(event.target.value));
      } else {
        const i = 0;
        checkArray.controls.forEach((uncheckedItem: FormControl) => {
          if (uncheckedItem.value == event.target.value) {
            checkArray.removeAt(i);
            return;
          }
        });
      }
    }

    // these functions are all that is needed to show and hide a modal view
    openModal(id: string) {
      this.modalService.open(id);
    }

    closeModal(id: string) {
      this.modalService.close(id);
    }
}


