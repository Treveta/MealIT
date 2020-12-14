/* eslint-disable require-jsdoc */
import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {Observable, Subscription} from 'rxjs'; // Needed for Database
import {shoppingList} from '../services/shoppingList.model';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore'; // Needed for Database
import {ModalService} from '../modal-functionality';

import {AuthService} from '../services/auth.service'; // Needed for Database
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {
  getSupportedInputTypes,
  Platform,
  supportsPassiveEventListeners,
  supportsScrollBehavior,
} from '@angular/cdk/platform';


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

export class ItemListComponent implements OnDestroy, OnInit {
  supportedInputTypes = Array.from(getSupportedInputTypes()).join(', ');
  supportsPassiveEventListeners = supportsPassiveEventListeners();
  supportsScrollBehavior = supportsScrollBehavior();
  // sets up the form groups for the checkboxes
  constructor(
        private modalService: ModalService,
        private fb: FormBuilder,
        private afs: AngularFirestore,
        private authService: AuthService,
        public platform: Platform,
  ) {
    this.form = this.fb.group({
      checkArray: this.fb.array([]),
    });

    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.shoppingCollection = this.afs.collection<shoppingList>('users/' + this.userInfo + '/shoppingList');
      this.listItems$ = this.shoppingCollection.valueChanges(); // Change to local pull similar to search-recipes, relies on listRecipes style function
      this.listItems().then((list) => {
        this.sortedList = list.Items;
      });
    });
  }


  displayedColumns: string[] = ['name', 'quantity', 'unit'];
  public editToggle: boolean = false;
  public isLarge: boolean = true;
  public screenWidth: any = window.innerWidth;

  toggleEdit():void {
    this.editToggle= !this.editToggle;
  }

@HostListener('window:resize') checkWidth() {
  //  alert('it works!');
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 600) {
      this.isLarge = false;
    } else {
      this.isLarge = true;
    }
  }

    form: FormGroup;

    public newItem;
    public newQuantity;
    public newUnit;

    public editBool;
    private userInfo;

    public testSortedList: Array<any>;
    public sortedList: Array<any>;

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
      if (this.newItem === '') {
      } else {
        const addedItem = {
          itemName: this.newItem,
          quantity: this.newQuantity,
          unit: this.newUnit,
        };
        this.sortedList.push(addedItem);
        this.shoppingCollection.doc('List').update({Items: this.sortedList});
        this.newItem = '';
        this.newQuantity = '';
        this.newUnit = '';
      }
    }

    ngOnInit() {
      if (this.screenWidth <= 600) {
        this.isLarge = false;
      } else {
        this.isLarge = true;
      }
    }
    ngOnDestroy(): void {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

    // checks whether the box has been checked
    onCheckBoxChange(item): void {
      const index = this.sortedList.indexOf(item);
      this.sortedList.splice(index, 1);
      this.shoppingCollection.doc('List').update({Items: this.sortedList});
    }

    // these functions are all that is needed to show and hide a modal view
    openModal(id: string): void {
      this.modalService.open(id);
    }

    closeModal(id: string): void {
      this.modalService.close(id);
      this.editBool = false;
      this.editToggle = false;
    }

    async listItems() {
      try {
        const snapshot = await this.shoppingCollection.doc('List')
            .get().toPromise();
        return snapshot.data();
      } catch (err) {
        console.log('Error getting documents', err);
      }
    }

    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.sortedList, event.previousIndex, event.currentIndex);
      this.shoppingCollection.doc('List').update({Items: this.sortedList});
    }
}
