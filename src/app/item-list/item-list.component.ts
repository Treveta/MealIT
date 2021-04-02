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
import {storageList} from 'app/models/foodStorage.model';
import {ShoppinglistEditService} from 'app/services/shoppinglist-edit.service';

/** @interface
 * @name Item
 * @description Interface for an individual item.
 */
export interface Item {
  name: string;
  seeds: number;
}

/** @interface
 * @name Unit
 * @description Interface for an individual unit.
 */
interface Unit{
    value: string;
    viewValue: string;
}

/** @interface
 * @name UnitGroup
 * @implements {Unit}
 * @description Interface for a group of units.
 */
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

/** @class
 * @name ItemListComponent
 * @implements {UnitGroup}
 * @implements {Item}
 * @implements {OnDestroy}
 * @implements {OnInit}
 * @description Primary class for item-list.component.ts.
 */
export class ItemListComponent implements OnDestroy, OnInit {
  supportedInputTypes = Array.from(getSupportedInputTypes()).join(', ');
  supportsPassiveEventListeners = supportsPassiveEventListeners();
  supportsScrollBehavior = supportsScrollBehavior();
  storageCollection: AngularFirestoreCollection<any>;
  listStorageItems$: Observable<any[]>;
  sortedStorageList: any[];
  // sets up the form groups for the checkboxes

  /** @constructor
   * @name constructor
   * @description Constructor for class ItemListComponent.
   */
  constructor(
        private modalService: ModalService,
        private fb: FormBuilder,
        private authService: AuthService,
        public platform: Platform,
        public afs: AngularFirestore,
        public shopList: ShoppinglistEditService,
  ) {
    this.form = this.fb.group({
      checkArray: this.fb.array([]),
    });

    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.storageCollection = this.afs.collection<storageList>('users/' + this.userInfo + '/storageList');
      this.shoppingCollection = this.afs.collection<shoppingList>('users/' + this.userInfo + '/shoppingList');
      this.listItems$ = this.shoppingCollection.valueChanges(); // Change to local pull similar to search-recipes, relies on listRecipes style function
      this.listItems().then((list) => {
        if (!list) {
          this.createDocument();
          this.sortedList = [];
        } else {
          this.sortedList = list.Items;
        }
      });
      this.listStorageItems$ = this.storageCollection.valueChanges();
      this.listStorageItems().then((list) => {
        if (!list) {
          this.createStorageDocument();
          this.sortedStorageList = [];
        } else {
          this.sortedStorageList = list.Items;
        }
      });
    });
  }


  displayedColumns: string[] = ['name', 'quantity', 'unit'];
  public editToggle: boolean = false;
  public isLarge: boolean = true;
  public screenWidth: any = window.innerWidth;

  /**
   * @function createDocument
   */
  createDocument():void {
    this.shoppingCollection.doc('List').set({Items: []});
  }

  /**
   * @function createDocument
   */
  createStorageDocument():void {
    this.storageCollection.doc('List').set({Items: []});
  }

  /** @function
   * @name toggleEdit
   * @description toggleEdit changes the boolean editToggle opposite to what it was
   */
  toggleEdit():void {
    this.editToggle= !this.editToggle;
  }

  /** @function
   * @name checkWidth
   * @listens window:resize
   * @hostListener
   * @description checkWidth listens to window resize and adjusts the isLarge Boolean.
   */
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
    /** @type Array[{Map}]
   * @name unitGroups
   * @implements {UnitGroup}
   * @description unitGroups is an array of type UnitGroup that is used for
   * the unit dropdown on item-list-component.html
   */
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

    /** @function
     * @async
     * @name addToItemList
     * @constant addedItem a constant that contains the boolean isComplete as well as fields to accept the class variables
     * itemName to store newItem, quantity to store newQuantity, and unit to store newUnit
     * @description addToItemList is a void function that first tests if new item is empty.
     * If it is not empty, it creates the constant addedItem that has 4 elements.
     * isComplete is set to false, while itemName, quantity, and unit are all set to previously declared variables.
     * Then, @function consolidateQuantity is run on @constant addedItem. if a match was found, stop. But if no match was found,
     * addedItem gets pushed to the sortedList and update is called on the shoppingCollection.
     * Finally, the class variables are reset to empty
     * @summary addToItemList pulls information from class variables and packages it into a constant
     * it then pushes that constant to the list and updates the collection
     */
    async addToItemList() {
      this.shopList.addToShoppingList(this.newItem, this.newQuantity, this.newUnit);
      this.sortedList = this.shopList.sortedList;
      this.newItem = '';
      this.newQuantity = '';
      this.newUnit = '';
    }

    /** @function
     * @name ngOnInit
     * @description ngOnInit runs at page initialization. it currently does the initial check for screensize to inititialize
     * the page properly
     */
    ngOnInit() {
      // console logs to output platforms
      // console.log('android: ', this.platform.ANDROID);
      // console.log('iOS: ', this.platform.IOS);

      // testing for screenwidth
      if (this.screenWidth <= 600) {
        this.isLarge = false;
      } else {
        this.isLarge = true;
      }
    }

    /** @function
     * @name ngOnDestroy
     * @description ngOnDestory runs on page close. It currently unsubscribes from the private variable subscription.
     */
    ngOnDestroy(): void {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

    /** @function
     * @name onCheckBoxChange
     * @param {any} item the item to be deleted
     * @const index the index of the item in the sorted list
     * @description onCheckBoxChange will first get the index of the item then splice it with 1-removing it from the list.
     * Then, it calls @function updateDocument , which updates the shoppingCollection, pushing the change to the database.
     */
    onCheckBoxChange(item): void {
      const index = this.sortedList.indexOf(item);
      this.sortedList.splice(index, 1);
      this.updateDocument('List', {Items: this.sortedList});
    }

    /** @function
     * @name completionToggle
     * @param {any} item the item whose isComplete value is to be edited
     * @description completionToggle sets isComplete opposite to what it was, similar to togggleEdit
     * Then, it calls @function updateDocument, which updates the shoppingCollection, pushing the change to the database
     */
    completionToggle(item): void {
      item.isComplete=!item.isComplete;
      this.updateDocument('List', {Items: this.sortedList});
    }

    allTrue = false;
    /**
     * @name completionAll
     * @description Sets all sortedList isComplete that are false to true.
     * Then, it calls @function updateDocument, which updates the shoppingCollection, pushing the change to the database
     */
    completionAll(): void {
      if (this.allTrue == false) {
        for (let i = 0; i < this.sortedList.length; i++) {
          if (this.sortedList[i].isComplete == false) {
            this.completionToggle(this.sortedList[i]);
          }
        }
        this.allTrue = true;
      } else {
        for (let i = 0; i < this.sortedList.length; i++) {
          if (this.sortedList[i].isComplete == true) {
            this.completionToggle(this.sortedList[i]);
          }
        }
        this.allTrue = false;
      }
      this.updateDocument('List', {Items: this.sortedList});
    }

    /**
     * @name toStorage
     * @description Send completed items from sorted list to the storage list in the database, then update.
     */
    toStorage(): void {
      for (let i = 0; i < this.sortedList.length; i++) {
        if (this.sortedList[i].isComplete == true) {
          // Send information of completed item to storage list in the database
          this.sortedStorageList.push(this.sortedList[i]);
          // Remove the item from the sorted list
          this.sortedList.splice(i, 1);
        }
      }
      this.updateStorageDocument('List', {Items: this.sortedStorageList});
      this.updateDocument('List', {Items: this.sortedList});
    }

    /** @function
     * @name updateStorageDocument
     * @param {string} docName name of the document to update
     * @param {any} data the data to update the document with
     * @description helper function. API call to update the list.
     */
    updateStorageDocument(docName: string, data):void {
      this.storageCollection.doc(docName).update(data);
    }

    /** @function
     * @name updateDocument
     * @param {string} docName name of the document to update
     * @param {any} data the data to update the document with
     * @description helper function. API call to update the list.
     */
    updateDocument(docName: string, data):void {
      this.shoppingCollection.doc(docName).update(data);
    }
    // these functions are all that is needed to show and hide a modal view

    /** @function
     * @name openModal
     * @param {string} id id to open with modalService
     * @description openModal uses modalService to open a modal with id
     */
    openModal(id: string): void {
      this.modalService.open(id);
    }

    /** @function
     * @name closeModal
     * @param {string} id id to close with modalService
     * @description closeModal will use modalService to close modal with id.
     * Additionally, it will set  class variables editBool and editToggle both to false
     */
    closeModal(id: string): void {
      this.modalService.close(id);
      this.editBool = false;
      this.editToggle = false;
    }
    /** @function
     * @async
     * @name listItems
     * @constant {Promise} snapshot a constant that will contain a promise for list doc from shoppingCollection
     * @return {Object} data inside the document promised in snapshot
     * @description listItems tries to pull the list from shoppingcollection and return that data if it suceeds
     * if it fails, it will send an error message to the console
     */
    async listItems() {
      try {
        const snapshot = await this.shoppingCollection.doc('List')
            .get().toPromise();
        return snapshot.data();
      } catch (err) {
        console.log('Error getting documents', err);
      }
    }

    /** @function
     * @async
     * @name listStorageItems
     * @constant {Promise} snapshot a constant that will contain a promise for list doc from shoppingCollection
     * @return {Object} data inside the document promised in snapshot
     * @description listItems tries to pull the list from shoppingcollection and return that data if it suceeds
     * if it fails, it will send an error message to the console
     */
    async listStorageItems() {
      try {
        const snapshot = await this.storageCollection.doc('List')
            .get().toPromise();
        return snapshot.data();
      } catch (err) {
        console.log('Error getting documents', err);
      }
    }

    /** @function
     * @name drop
     * @param {CdkDragDrop<string[]>} event an interface defined in @angular\cdk\drag-drop\drag-events.d.ts for use in the drag and drop functionality
     * @description drop uses the imported function moveItemInArray and takes event's current and previous index to reorder sortedList
     * Then, it updates the shoppingCollection, pushing the changes to the database
     */
    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.sortedList, event.previousIndex, event.currentIndex);
      this.shoppingCollection.doc('List').update({Items: this.sortedList});
    }
}
