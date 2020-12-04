import {Component} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {storageList} from '../models/foodStorage.model';

@Component({
  selector: 'food-storage',
  templateUrl: './food-storage.component.html',
  styleUrls: ['./food-storage.component.css'],
})
export class FoodStorageComponent {
  private userInfo;
  storageCollection: AngularFirestoreCollection<storageList>;
  storageItems$: Observable<storageList[]>;


  constructor(
    private authService: AuthService,
    private afs: AngularFirestore
  ){
    authService.getUid().then((uid) => {
      this.userInfo = uid;
      this.storageCollection = this.afs.collection<storageList>('users/' + this.userInfo + '/storageList');
      this.storageItems$ = this.storageCollection.valueChanges();
    });
  }


}