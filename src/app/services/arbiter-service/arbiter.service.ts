// Imports
import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../auth.service';
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
  ) {
    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.storageCollection = this.afs.collection('users/' + this.userInfo + '/storageList');
      this.shoppingCollection = this.afs.collection('users/' + this.userInfo + '/shoppingList');
    });
  }

  /**
   * Determines how many of an item (quantity) with a given name and unit
   */
  async determineStorage(nameToMatch, unitToMatch, amountRequested): Promise<ingredientStatusModel> {
    let returnData: ingredientStatusModel;
    await this.listStorage().then((list) => {
      console.table(list);
      for (let i = 0; i < list.length; i++) {
        if (list[i].itemName == nameToMatch && list[i].unit == unitToMatch) {
          const amountToAdd = (amountRequested + list[i].quantityReserved) - list[i].quantity;
          returnData = {amountToAdd: amountToAdd, amountRequested: amountRequested, currentUnreserved: list[i].quantity - list[i].reservedQuantity};
        }
      }
    });
    returnData = {amountToAdd: amountRequested, amountRequested: amountRequested, currentUnreserved: 0};
    return returnData;
  }

  /**
   * Add or Reserve
   * @param amountToAdd 
   * @param amountRequested 
   * @param itemName 
   * @param unit 
   */
  addOrReserve(amountToAdd, amountRequested, itemName, unit) {
    if (amountToAdd > 0) {
      this.shopList.addToShoppingList(itemName, amountToAdd, unit, true);
      // Reserve all of ingredient in foodStorage
    } else {
      // Add the amountRequested to quantityReserved in foodStorage
    }
  }

  /**
   * 
   * @param nameToMatch 
   * @param unitToMatch 
   * @param amountRequested 
   */
  arbiter(nameToMatch, unitToMatch, amountRequested) {
    this.determineStorage(nameToMatch, unitToMatch, amountRequested).then((ingredientStatus) => {
      this.addOrReserve(ingredientStatus.amountToAdd, ingredientStatus.amountRequested, nameToMatch, unitToMatch);
    });
  }

  /**
   * Retrieves the documents from the path specified as a list
   *
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
     * @name listItems
     * @constant {Promise} snapshot a constant that will contain a promise for list doc from shoppingCollection
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
}
