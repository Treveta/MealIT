// Imports
import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../auth.service';
import {FoodstorageEditService} from '../foodstorage-edit.service';
import {ShoppinglistEditService} from '../shoppinglist-edit.service';

@Injectable({
  providedIn: 'root',
})
/**
 * The Arbiter Service is designed to help facilitate the reserving of ingredients and adding to your shopping list
 */
export class ArbiterService {
  userInfo: unknown;
  storageCollection: any;
  shoppingCollection: any;
  /**
   * Constructor
   */
  constructor(
    private authService: AuthService,
    public afs: AngularFirestore,
    public shopList: ShoppinglistEditService,
    public storageList: FoodstorageEditService,
  ) {
    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.storageCollection = this.afs.collection('users/' + this.userInfo + '/storageList');
      this.shoppingCollection = this.afs.collection('users/' + this.userInfo + '/shoppingList');
    });
  }

  /**
   * Determines the amountToAdd to shopping list
   * Also returns amountRequested and currentUnreserved for possible use in visualizations
   * @param {string} nameToMatch the name of the ingredient to determine the storage of
   * @param {string} unitToMatch the unit of the ingredient to determine the storage of
   * @param {number} amountRequested the amount the recipe is requesting
   * @return {Object}
   */
  async determineStorage(nameToMatch, unitToMatch, amountRequested): Promise<ingredientStatusModel> {
    let returnData: ingredientStatusModel;
    await this.listStorage().then((list) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].itemName == nameToMatch && list[i].unit == unitToMatch) {
          const amountToAdd = (amountRequested + list[i].quantityReserved) - list[i].quantity;
          returnData = {amountToAdd: amountToAdd, amountRequested: amountRequested, currentUnreserved: list[i].quantity - list[i].quantityReserved, currentReserved: list[i].quantityReserved};
          console.table(returnData);
          break;
        } else {
          returnData = {amountToAdd: amountRequested, amountRequested: amountRequested, currentUnreserved: 0, currentReserved: 0};
        }
      }
    });
    return returnData;
  }

  /**
   * Add or Reserve based on amountToAdd
   * @param {number} amountToAdd the quantity of the ingredient to add to shopping list
   * @param {number} amountRequested the quantity the recipe requests
   * @param {number} currentUnreserved the amount of the ingredient in food storage that has yet to be reserved
   * @param {number} currentReserved
   * @param {string} ingredient the ingredient to add or reserve
   */
  addOrReserve(amountToAdd, amountRequested, currentUnreserved, currentReserved, ingredient) {
    if (amountToAdd > 0) {
      this.shopList.addToShoppingList(ingredient.ingredientName, amountToAdd, ingredient.unit, true);
      // Reserve all of ingredient in foodStorage
      if (amountToAdd != amountRequested) {
        this.storageList.editReserved(currentUnreserved, currentReserved, ingredient);
      }
    } else {
      // Add the amountRequested to quantityReserved in foodStorage
      this.storageList.editReserved(amountRequested, currentReserved, ingredient);
    }
  }

  /**
   * function handles determining the storage status of the ingredient and then running addOrReserve accordingly
   * @param {string} ingredientToMatch the ingredient to determine the storage of
   */
  arbiter(ingredientToMatch) {
    this.determineStorage(ingredientToMatch.ingredientName, ingredientToMatch.unit, ingredientToMatch.quantity).then((ingredientStatus) => {
      this.addOrReserve(ingredientStatus.amountToAdd, ingredientStatus.amountRequested, ingredientStatus.currentUnreserved, ingredientStatus.currentReserved, ingredientToMatch);
    });
  }

  /**
   * Retrieves the documents from the path specified as a list
   * @param {AngularFirestoreCollection} collection the collection to get documents from
   */
  async listDocs(collection) {
    try {
      // collects a snapshot of a Firestore collection base on parameter path
      const snapshot = await collection
          .get().toPromise();
      // Creates an empty list to populate collection data into
      const list = [];
      // Loops through snapshot and pushes document data to list
      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        list.push(data);
      });
      // Returns the now populated list
      return list;
    } catch (err) {
      console.log('Error getting documents', err);
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

  /** @function
     * @async
     * @name listStorage
     * @constant {Promise} snapshot a constant that will contain a promise for list doc from storageCollection
     * @return {Object} data inside the document promised in snapshot
     * @description listItems tries to pull the list from shoppingcollection and return that data if it suceeds
     * if it fails, it will send an error message to the console
     */
  async listStorage() {
    try {
      const snapshot = await this.storageCollection.doc('List')
          .get().toPromise();
      return snapshot.data().Items;
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }
}

export interface ingredientStatusModel {
  amountToAdd: any,
  amountRequested: any,
  currentUnreserved: any,
  currentReserved: any,
}
