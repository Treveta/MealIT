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
  public indexEdit: number = -1; // for determining what mat card to swap templates
  public quantityEdit: number; // when taking the input of a user's edit
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

    /**
     * @function
     * @async
     * @name addToItemList
     * @description addToItemList is a void function that calls the addToShoppingList
     * sets the sortedList to the newly updated sortedList from the service, and resets the class variables to empty
     */
    async addToItemList() {
      this.shopList.addToShoppingList(this.newItem, this.newQuantity, this.newUnit, false);
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

    /**
     * Create a confirm option with a message
     * @param {string} message
     * @return {boolean}
     */
    confirmAction(message): boolean {
      if (confirm(message)) {
        return true;
      } else {
        return false;
      }
    }

    onProceed = false; // Boolean to keep track if the fucntion should proceed
    /** @function
     * @name onCheckBoxChange
     * @param {any} item the item to be deleted
     * @const index the index of the item in the sorted list
     * @description onCheckBoxChange will first get the index of the item then splice it with 1-removing it from the list.
     * Then, it calls @function updateDocument , which updates the shoppingCollection, pushing the change to the database.
     */
    onCheckBoxChange(item): void {
      // In the case of reserved food
      if (item.quantityReserved > 0) {
        this.onProceed = this.confirmAction('Are you sure you want to delete this item? The item is reserved.');
      // In the case of no reserved food
      } else {
        this.onProceed = this.confirmAction('Are you sure you want to delete this item?');
      }
      // In the case of null, proceed (Mainly here for testing purposes)
      if (this.onProceed == null) {
        this.onProceed = true;
      }
      // If the confirmation is true
      if (this.onProceed == true) {
        const index = this.sortedList.indexOf(item);
        this.sortedList.splice(index, 1);
        this.shopList.sortedList = this.sortedList;
        this.updateDocument('List', {Items: this.sortedList});
        this.onProceed = false;
      }
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
     * @name setAllTrue
     * @description Determine if a list is all complete or not
     */
    setAllTrue(): void {
      this.allTrue = true;
      for (let i = 0; i < this.sortedList.length; i++) {
        if (this.sortedList[i].isComplete == false) {
          this.allTrue = false;
        }
      }
    }

    /**
     * @name completionAll
     * @description Sets all sortedList isComplete that are false to true. If all items are completed, it will set all sortedList isComplete back to false
     * Then, it calls @function updateDocument, which updates the shoppingCollection, pushing the change to the database
     */
    completionAll(): void {
      this.setAllTrue(); // Check to see if all items are complete or not
      // If all of them are not complete, turn all incomplete to complete
      if (this.allTrue == false) {
        for (let i = 0; i < this.sortedList.length; i++) {
          if (this.sortedList[i].isComplete == false) {
            this.completionToggle(this.sortedList[i]);
          }
        }
        this.allTrue = true;
      // If all of them are complete, turn all complete to incomplete
      } else {
        for (let i = 0; i < this.sortedList.length; i++) {
          if (this.sortedList[i].isComplete == true) {
            this.completionToggle(this.sortedList[i]);
          }
        }
        this.allTrue = false;
      }
      // Update the database
      this.updateDocument('List', {Items: this.sortedList});
    }

    /** @function
     * @name consolidateStorage
     * @param {any} itemProposed the item proposed to be added
     * @return {boolean} true if a match was found and the functions run. false if no match was found
     * @description consolidateStorage  is the function that is called whenever a new item is added to the shopping list
     * It looks through the existing shopping list and calls @function compareNameUnit on every item in the list. Note that it is calling the service function here
     * (If @function compareNameUnit finds an item that matches, it calls @function sumQuantity that performs the adding of quantity values
     * in which case, @param itemProposed is NOT added to the list and @function consolidateStorage  returns true, as it has just been consolidated)
     * after finding a match and calling the appropriate functions,  @function updateDocument is called
     * if no match is found, proceed with adding the item as usual and return false.
     * This function is called by @function addToStorage
     * @summary consolidateStorage  takes a proposed item and checks the shopping list for a match. upon finding one, the quantities are summed,
     * the item is not added ot the shopping list, the list is updated, and consolidateStorage returns true.
     *  If no match is found, the item gets added to the list as normal and consolidateStorage  returns false.
     */
    consolidateStorage(itemProposed): boolean {
      let consolidated: boolean;
      const n = this.sortedStorageList.length;
      for (let i =0; i<n; i++) {
        consolidated = this.shopList.compareNameUnit(this.sortedStorageList[i], itemProposed);
        if (consolidated===true) {
          this.updateDocument('List', {Items: this.sortedStorageList});
          return true;
        }
      }
      return false;
    }
    /**
   * @name addToStorage
   * @param {any} ingredient the ingredient to either push or consolidate to the list
   * @description helper function of toStorage calls consolidateStorageQuantity, If false pushes the item to the array
   * if true, then considation already happened, no need to add anything
   */
    addToStorage(ingredient): void {
      if (this.consolidateStorage(ingredient)===false) {
        this.sortedStorageList.push(ingredient);
      }
    }

    /**
   * @name toStorage
   * @description Send completed items from sorted list to the storage list in the database, then update.
   */
    toStorage(): void {
      for (let i = this.sortedList.length - 1; i >= 0; i--) {
        if (this.sortedList[i].isComplete == true) {
        // Send information of completed item to storage list in the database
          this.addToStorage(this.sortedList[i]);
          // Remove the item from the sorted list
          this.sortedList.splice(i, 1);
          i = this.sortedList.length - 1;
        }
      }
      if (this.sortedList.length == 1) {
        if (this.sortedList[0].isComplete == true) {
        // Send information of completed item to storage list in the database
          this.addToStorage(this.sortedList[0]);
          // Remove the item from the sorted list
          this.sortedList.splice(0, 1);
        }
      }
      this.updateStorageDocument('List', {Items: this.sortedStorageList});
      this.shopList.sortedList = this.sortedList;
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
      this.indexEdit =-1;
    }
    /**
     * @function setEditIndex
     * @param {number} htmlIndex the number gotten from the ngFor
     * @description setEditIndex will set the public index value to the number.
     * currently used to make sure templates switch properly and to cancel edit
     */
    setEditIndex(htmlIndex: number) {
      this.indexEdit = htmlIndex;
      // console.log(this.indexEdit);
    }
    /**
     * @function setQuantityEdit
     * @param {number} index the index of the sortedList whose
     * quantity quantityEdit will set itself to
     */
    setQuantityEdit(index: number) {
      this.quantityEdit = this.sortedList[index].quantity;
      console.log(this.quantityEdit);
    }
    /**
     * @function confirmEdit
     * @param {number} index the nuumber to alter in the sortedList
     * @description runs when a user accepts the changes made (clicking the checkmark). If the amount the ingredient
     * has reserved is less than or equal to the amount the user wants to change it to, the change gets accepted
     * and it updates the list and close out of editing.
     * But if the amount the ingredient has reserved is greater than the amount the user wants to change it to, it asks
     * for a confirmation before setting both the quantity and quantity reserved to the new proposed quantity.
     * @summary @function confirmEdit runs when clicking the checkmark and handles the setting of quantites and issuing
     * warnings when appropriate
     */
    confirmEdit(index: number) {
      if (this.sortedList[index].quantityReserved <= this.quantityEdit) {
        this.sortedList[index].quantity = this.quantityEdit;
        this.shopList.sortedList = this.sortedList;
        if (this.sortedList[index].quantity == 0) {
          this.sortedList.splice(index, 1);
        }
        this.updateDocument('List', {Items: this.sortedList});
        this.setEditIndex(-1);
        this.quantityEdit = undefined;
      } else if (this.sortedList[index].quantityReserved > this.quantityEdit) {
        this.onProceed = this.confirmAction('The remaining quantity would be less than what was reserved. Continue?');
      }
      if (this.onProceed == true) {
        this.sortedList[index].quantity = this.quantityEdit;
        this.sortedList[index].quantityReserved = this.quantityEdit;
        this.shopList.sortedList = this.sortedList;
        if (this.sortedList[index].quantity == 0) {
          this.sortedList.splice(index, 1);
        }
        this.updateDocument('List', {Items: this.sortedList});
        this.onProceed = false;
        this.setEditIndex(-1);
        this.quantityEdit = undefined;
      }
    }
}
