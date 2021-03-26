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
      if (this.newItem === '') {
      } else {
        const addedItem = {
          isComplete: false,
          itemName: this.newItem,
          quantity: this.newQuantity,
          unit: this.newUnit,
        };
        if (this.consolidateQuantity(addedItem)===false) {
          this.sortedList.push(addedItem);
          this.updateDocument('List', {Items: this.sortedList});
          this.newItem = '';
          this.newQuantity = '';
          this.newUnit = '';
        } else {
          this.newItem = '';
          this.newQuantity = '';
          this.newUnit = '';
        }
      }
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

    /**
     * @name completionAll
     * @description Sets all sortedList isComplete that are false to true.
     * Then, it calls @function updateDocument, which updates the shoppingCollection, pushing the change to the database
     */
    completionAll(): void {
      for (let i = 0; i < this.sortedList.length; i++) {
        if (this.sortedList[i].isComplete == false) {
          this.completionToggle(this.sortedList[i]);
        }
      }
      this.updateDocument('List', {Items: this.sortedList});
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
    // Below are three functions for item consolidation: 2 sub-helper functions, and 1 large helper function of addToItemList
    /** @function
     * @name sumQuantity
     * @param {any} itemExist the item whose quantity will be updated with the quantity value from @param itemProposed
     * @param {any} itemProposed the item proposed to be added which will have its quantity used to update @param itemExist
     * @description sumQuantity combines two item's quantity. param names are for clarity, but this can technically be used between any two items
     * this is a helper function for @function compareNameUnit
     */
    sumQuantity(itemExist, itemProposed): void {
      itemExist.quantity+=itemProposed.quantity;
    }

    /** @function
     * @name compareNameUnit
     * @param {any} itemExist the item that exists in the list to have its name and units compared
     * @param {any} itemProposed the item proposed to be added which will have its name and unit compared to @param itemExist
     * @return {boolean} returns true if there is a match and false if not
     * @description compareNameUnit will test the name and unit values of two items and call @function sumQuantity
     * on the items if both fields are the same in each item
     * this is a helper function for consolidateQuantity
     */
    compareNameUnit(itemExist, itemProposed): boolean {
      if (itemExist.itemName.trim().toLowerCase()===itemProposed.itemName.trim().toLowerCase()&&itemExist.unit===itemProposed.unit) {
        this.sumQuantity(itemExist, itemProposed);
        return true;
      } else return false;
    }

    /** @function
     * @name consolidateQuantity
     * @param {any} itemProposed the item proposed to be added
     * @return {boolean} true if a match was found and the functions run. false if no match was found
     * @description consolidateQuantity is the function that is called whenever a new item is added to the shopping list
     * It looks through the existing shopping list and calls @function compareNameUnit on every item in the list.
     * (If @function compareNameUnit finds an item that matches, it calls @function sumQuantity that performs the adding of quantity values
     * in which case, @param itemProposed is NOT added to the list and @function consolidateQuantity returns true, as it has just been consolidated)
     * after finding a match and calling the appropriate functions,  @function updateDocument is called
     * if no match is found, proceed with adding the item as usual and return false.
     * This function may be called by @function addToItemList \\TODO
     * @summary consolidateQuantity takes a proposed item and checks the shopping list for a match. upon finding one, the quantities are summed,
     * the item is not added ot the shopping list, the list is updated, and consolidateQuantity returns true.
     *  If no match is found, the item gets added to the list as normal and consolidateQuantity returns false.
     */
    consolidateQuantity(itemProposed): boolean {
      let consolidated: boolean;
      const n = this.sortedList.length;
      for (let i =0; i<n; i++) {
        consolidated = this.compareNameUnit(this.sortedList[i], itemProposed);
        if (consolidated===true) {
          this.updateDocument('List', {Items: this.sortedList});
          return true;
        }
      }
      return false;
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
