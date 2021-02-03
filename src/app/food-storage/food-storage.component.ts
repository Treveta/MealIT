/* eslint-disable require-jsdoc */
import {Component} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, FormControl} from '@angular/forms';
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
    });
  }

  storageListIsBeingEdited(): void {
    this.editStorageList = !this.editStorageList;
  }

  onCheckBoxChange(event): void {
    const checkArray: FormArray = this.form.get('checkArray') as FormArray;
    if (event.target.checked) {
      checkArray.push(new FormControl(event.target.value));
    } else {
      const i = 0;
      checkArray.controls.forEach((uncheckedItem: FormControl) => {
        if (uncheckedItem.value === event.target.value) {
          checkArray.removeAt(i);
          return;
        }
      });
    }
  }

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

  openModal(id: string): void {
    this.modalService.open(id);
  }

  closeModal(id: string): void {
    this.modalService.close(id);
  }
}
