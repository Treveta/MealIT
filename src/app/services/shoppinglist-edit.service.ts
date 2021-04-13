/* eslint-disable require-jsdoc */
import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable, Subscription} from 'rxjs';
import {AuthService} from './auth.service';
import {shoppingList} from './shoppingList.model';
// To call in html, use <service name from constructor>.<functionName>(@params)
// Will need to create a reference

@Injectable({

  providedIn: 'root',

})


export class ShoppinglistEditService {
  // need to imort and use authservice and firestore
  /** @constructor
   * @name constructor
   * @description Constructor for shoppinglist-edit.service.
   */
  constructor(
    private authService: AuthService,
    public afs: AngularFirestore,
  ) {
    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.shoppingCollection = this.afs.collection<shoppingList>('users/' + this.userInfo + '/shoppingList');
      this.listItems$ = this.shoppingCollection.valueChanges(); // Change to local pull similar to search-recipes, relies on listRecipes style function
      this.listItems().then((list) => {
        this.sortedList = list.Items;
      });
    });
  }

  private userInfo;
  public sortedList: Array<any>;
  shoppingCollection: AngularFirestoreCollection<shoppingList>;
  listItems$: Observable<shoppingList[]>;
  private subscription: Subscription;

  /** Idea for deletion of shopping list item
   * @param {ingredientName}
   * @param {quantity} quantity quantity to remove
   * @param {unit}
   * Then calls consolidate quantity with negative quantity
   */

  /** @function
    * @name printANumber
    * @description merely exists to test connectivity to a component.
    */
  printANumber() {
    console.log(6);
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
     * @param {any} itemExist the item whose quantity will be updated with the quantity values from @param itemProposed
     * @param {any} itemProposed the item proposed to be added which will have its quantities used to update @param itemExist
     * @description sumQuantity combines two item's quantity and reserved Quantity. param names are for clarity,
     * but this can technically be used between any two items
     * this is a helper function for @function compareNameUnit
     */
  sumQuantity(itemExist, itemProposed): void {
    itemExist.quantity+=itemProposed.quantity;
    itemExist.quantityReserved+=itemProposed.quantityReserved;
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
     * This function is called by @function addToItemList
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

  /** @function
     * @async
     * @name addToShoppingList
     * @param {any} proposedIngredient the name of the ingredient to be added or consolidated
     * @param {any} proposedQuantity the quantity of the ingredient to be added or consolidated
     * @param {any} proposedUnit the unit name of the ingredient to be added or consolidated
     * @param {boolean} fromRecipe boolean that when true indicates that the ingredient was added from a recipe
     * @constant addedItem a constant that contains the boolean isComplete as well as fields to accept the data parameters
     * itemName to store newItem, quantity to store newQuantity, and unit to store newUnit
     * @description addToShoppingList is a void function that first tests if new item is empty.
     * If it is not empty, it creates the constant addedItem that has 4 elements.
     * isComplete is set to false, while itemName, quantity, and unit are all set to the parameters.
     * Then, @function consolidateQuantity is run on @constant addedItem. if a match was found, stop. But if no match was found,
     * addedItem gets pushed to the sortedList and update is called on the shoppingCollection.
     * @summary addToShoppinhList takes info from the parameters and packages it into a constant.
     * It then either pushes that constant to the list or updates the list before updating the list.
     */
  async addToShoppingList(proposedIngredient, proposedQuantity, proposedUnit, fromRecipe:boolean) {
    // if the item name is blank, ignore all this
    if (proposedIngredient === '') {
    } else {
      // construct a proposed item from class variables
      let addedItem;
      // if it's  from a recipe, the reservedQuantity is just the quantity
      if (fromRecipe === true) {
        addedItem = {
          isComplete: false,
          itemName: proposedIngredient,
          quantity: proposedQuantity,
          unit: proposedUnit,
          quantityReserved: proposedQuantity,
        };
      } else {
        // if it's  not from a recipe, the reservedQuantity is 0
        addedItem = {
          isComplete: false,
          itemName: proposedIngredient,
          quantity: proposedQuantity,
          unit: proposedUnit,
          quantityReserved: 0,
        };
      }
      // run consolidateQuantity on the proposed item, and if false add it to the list
      if (this.consolidateQuantity(addedItem)===false) {
        this.sortedList.push(addedItem);
        this.updateDocument('List', {Items: this.sortedList});
      }
    }
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
}

