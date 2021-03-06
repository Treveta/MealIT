/* eslint-disable require-jsdoc */
import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable, Subscription} from 'rxjs';
import {ModalService} from '../modal-functionality';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import {storageList} from '../models/foodStorage.model';
import {shoppingList} from '../services/shoppingList.model';

@Component({
  selector: 'food-storage',
  templateUrl: './food-storage.component.html',
  styleUrls: ['./food-storage.component.css'],
})
export class FoodStorageComponent {
  private userInfo;
  private form: FormGroup;
  private editStorageList = false;
  storageCollection: AngularFirestoreCollection<storageList>;
  storageItems$: Observable<storageList[]>;
  shoppingCollection: AngularFirestoreCollection<shoppingList>;
  listItems$: Observable<shoppingList[]>;
  public testSortedList: Array<any>;
  private subscription: Subscription;
  sortedStorageList: any[];

  constructor(
    private authService: AuthService,
    private afs: AngularFirestore,
    private modalService: ModalService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      checkArray: this.fb.array([]),
    });
    authService.getUid().then((uid) => {
      // grab items from shoppingList and storageList
      this.userInfo = uid;
      this.storageCollection = this.afs.collection<storageList>('users/' + this.userInfo + '/storageList');
      this.storageItems$ = this.storageCollection.valueChanges();
      this.shoppingCollection = this.afs.collection<shoppingList>('users/' + this.userInfo + '/shoppingList');
      this.listItems$ = this.shoppingCollection.valueChanges();
      this.listItems().then((list) => {
        this.testSortedList = list.Items;
      });
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

  /**
   * @function createDocument
   */
  createStorageDocument():void {
    this.storageCollection.doc('List').set({Items: []});
  }

  /**
   * Shows that the storage list is being edited
   */
  storageListIsBeingEdited(): void {
    this.editStorageList = !this.editStorageList;
  }

  /**
   * Displays the items in the food storage list
   * @return {snapshot} snapshot of the data
   */
  async listItems() {
    try {
      const snapshot = await this.afs
          .collection('items').doc('Test')
          .get().toPromise();
      return snapshot.data();
    } catch (err) {
      console.log('Error getting documents', err);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.testSortedList, event.previousIndex, event.currentIndex);
    this.afs.collection('items').doc('Test').update({Items: this.testSortedList});
  }

  /**
   * Opens a modal
   * @param {string} id
   */
  openModal(id: string): void {
    this.modalService.open(id);
  }

  /**
   * Closes a modal
   * @param {string} id
   */
  closeModal(id: string): void {
    this.modalService.close(id);
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
}
