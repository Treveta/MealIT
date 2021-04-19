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
    });
  }

  private userInfo;
  public sortedList: Array<any>;
  storageCollection: AngularFirestoreCollection<storageList>;
  storageItems$: Observable<storageList[]>;
  private subscription: Subscription;

  /**
   * @param {any} itemQuantity the quantity of the item the user wants to change
   * @param {any} changeQuantity quantity the user wants to change reserved by
   * @param {any} quantityReserved quantity the has already has reserved
   * Function to edit reserved amount in food storage
   */
  editReserved(itemQuantity: any, changeQuantity: any, quantityReserved): void {
    // changeQuantity is positive if user wishes to add to the amount reserved
    if (changeQuantity > 0) {
      if ((quantityReserved+changeQuantity) > itemQuantity) {
        // do nothing if addition results in more reserved than currently available
      } else {
        quantityReserved+=changeQuantity;
      }
    // changeQuantity is negative if user wishes to reduce the amount reserved
    } else if (changeQuantity < 0) {
      if ((quantityReserved+changeQuantity) < 0) {
        // do nothing if reduction results in less than zero
      } else {
        quantityReserved+=changeQuantity;
      }
    }
    this.updateDocument('List', {Items: this.sortedList});
  }
  /**
   * @param {string} docName name of document to update
   * @param {any} data the data to update the document with
   * function to update the food storage with new data
   */
  updateDocument(docName: string, data):void {
    this.storageCollection.doc(docName).update(data);
  }
}
