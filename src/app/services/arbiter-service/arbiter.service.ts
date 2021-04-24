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
  shoppingListCreated: boolean;
  sortedList: any[];
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
      this.listItems().then((list) => {
        if (!list) {
          console.log('List Not Defined');
          this.shoppingListCreated = false;
          this.sortedList = [];
        } else {
          this.shoppingListCreated = true;
          this.sortedList = list.Items;
        }
      });
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
          break;
        } else {
          returnData = {amountToAdd: amountRequested, amountRequested: amountRequested, currentUnreserved: 0, currentReserved: 0};
        }
      }
    });
    return returnData;
  }

  /**
   * 
   * @param nameToMatch 
   * @param unitToMatch 
   * @param amountToRemove 
   */
  async determineStorageShopping(nameToMatch, unitToMatch, amountToRemove): Promise<ingredientStatusModelShopping> {
    let returnData: ingredientStatusModelShopping;
    await this.listItems().then((list) => {
      console.log(list)
      for (let i = 0; i < list.length; i++) {
        if (list[i].itemName == nameToMatch && list[i].unit == unitToMatch) {
          const amountToUnreserve = list[i].quantityReserved + amountToRemove;
          returnData = {amountToUnreserve: amountToUnreserve, amountToRemove: amountToRemove, currentReserved: list[i].quantityReserved, currentUnreserved: list[i].quantity - list[i].quantityReserved};
          console.table(returnData)
          break;
        } else {
          returnData = {amountToUnreserve: amountToRemove, amountToRemove: amountToRemove, currentReserved: 0, currentUnreserved: 0};
          console.table(returnData)
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
   * 
   * @param amountToUnreserve 
   * @param amountToRemove 
   * @param currentUnreserved 
   * @param currentReserved 
   * @param ingredient 
   */
  subtractOrUnreserve(amountToUnreserve, amountToRemove, currentUnreserved, currentReserved, ingredient) {
    if (amountToUnreserve < 0) {
      this.storageList.editReserved(amountToUnreserve, currentReserved, ingredient);
      if (amountToUnreserve != amountToRemove) {
        this.shopList.addToShoppingList(ingredient.ingredientName, amountToUnreserve, ingredient.unit, true);
      }
    } else {
      this.shopList.addToShoppingList(ingredient.ingredientName, amountToRemove, ingredient.unit, true);
    }
  }

  /**
   * function handles determining the storage status of the ingredient and then running addOrReserve accordingly
   * @param {string} ingredientToMatch the ingredient to determine the storage of
   */
  arbiter(ingredientToMatch) {
    this.determineStorage(ingredientToMatch.ingredientName, ingredientToMatch.unit, ingredientToMatch.quantity).then((ingredientStatus) => {
      console.log(ingredientStatus.amountToAdd);
      this.addOrReserve(ingredientStatus.amountToAdd, ingredientStatus.amountRequested, ingredientStatus.currentUnreserved, ingredientStatus.currentReserved, ingredientToMatch);
    });
  }

  /**
   * 
   * @param ingredientToMatch 
   */
  reverseArbiter(recipeToFindUid) {
    console.log(recipeToFindUid);
    this.findRecipeIngredients(recipeToFindUid).then((ingredientList) => {
      ingredientList.forEach((ingredientToMatch) => {
        console.table(ingredientToMatch);
        this.determineStorageShopping(ingredientToMatch.ingredientName, ingredientToMatch.unit, -ingredientToMatch.quantity).then((ingredientStatus) => {
          console.table(ingredientStatus);
          this.determineStorage(ingredientToMatch.ingredientName, ingredientToMatch.unit, -ingredientToMatch.quantity).then((ingredientStatusStorage) => {
            this.subtractOrUnreserve(ingredientStatus.amountToUnreserve, ingredientStatus.amountToRemove, ingredientStatusStorage.currentUnreserved, ingredientStatusStorage.currentReserved, ingredientToMatch);
          });
        });
      });
    });
  }

  /**
   * 
   * @param uid 
   */
  async findRecipeIngredients(uid) {
    const snapshot = await this.afs.collection('users/' + this.userInfo + '/recipeList', (ref) => ref.where('uid', '==', uid)).get().toPromise();
    const list = [];
    // Loops through snapshot and pushes document data to list
    snapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      list.push(data);
    });
    // Returns the now populated list
    return list[0].ingredients;
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
      const snapshot = await this.afs.collection('users/' + this.userInfo + '/shoppingList').doc('List')
          .get().toPromise();
      return snapshot.data().Items;
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

export interface ingredientStatusModelShopping {
  amountToUnreserve: number,
  amountToRemove: number,
  currentUnreserved: number,
  currentReserved: number,
}
