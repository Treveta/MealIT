import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {storageList} from 'app/models/foodStorage.model';
import {Observable, Subscription} from 'rxjs';
import {AuthService} from './auth.service';

@Injectable({

  providedIn: 'root',

})
/**
* Service to edit the food storage page
*/
export class FoodstorageEditService {
  foodStorageListCreated: boolean;
  /**
   * Constructor for foodstorage-edit.service
   */
  constructor(
    private authService: AuthService,
    public afs: AngularFirestore,
  ) {
    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.storageCollection = this.afs.collection<storageList>('users/' + this.userInfo + '/storageList');
      this.storageItems$ = this.storageCollection.valueChanges();
      this.storageItems().then((list) => {
        if (!list) {
          console.log('List Not Defined');
          this.foodStorageListCreated = false;
          this.sortedList = [];
        } else {
          this.foodStorageListCreated = true;
          this.sortedList = list.Items;
        }
      });
    });
  }

  private userInfo;
  public sortedList: Array<any>;
  storageCollection: AngularFirestoreCollection<storageList>;
  storageItems$: Observable<storageList[]>;
  private subscription: Subscription;

  /**
   * Function to edit reserved amount in food storage
   * @param {number} changeQuantity the amount to change the quantity reserved by
   * @param {number} currentReserved the current reserved value in food storage
   * @param {any} ingredient the ingredient that is being reserved
   */
  editReserved(changeQuantity: number, currentReserved: number, ingredient): void {
    if (currentReserved + changeQuantity > 0) {
      console.log(ingredient.quantityReserved);
      const foundItem = this.findIngredientInStorage(ingredient);
      const addedItem = foundItem.info;
      addedItem.quantityReserved = currentReserved + changeQuantity;
      this.sortedList.splice(foundItem.index, 1, addedItem);
      this.updateDocument('List', {Items: this.sortedList});
    }
  }

  /**
   * Finds an ingredient in foodStorage and returns the ingredients info and index in the list
   * @param {any} ingredientToFind the ingredient to find in storage
   * @return {Object}
   */
  findIngredientInStorage(ingredientToFind) {
    const foundIngredient = {
      index: undefined,
      info: undefined,
    };
    for (let i = 0; i < this.sortedList.length; i++) {
      if (this.compareNameUnit(this.sortedList[i], ingredientToFind)) {
        foundIngredient.index = i;
        foundIngredient.info = this.sortedList[i];
      }
    }
    return foundIngredient;
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
    if (itemExist.itemName.trim().toLowerCase()===itemProposed.ingredientName.trim().toLowerCase()&&itemExist.unit===itemProposed.unit) {
      return true;
    } else return false;
  }
  /**
   * @param {string} docName name of document to update
   * @param {any} data the data to update the document with
   * function to update the food storage with new data
   */
  updateDocument(docName: string, data):void {
    this.storageCollection.doc(docName).update(data);
  }
  /**
   * @constant {Promise} snapshot a constant promise for list doc from the foodstorage
   * @return {Object} data inside the document
   * function to pull the list of items in food storage
   */
  async storageItems() {
    try {
      const snapshot = await this.storageCollection.doc('List')
          .get().toPromise();
      return snapshot.data();
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }
}
