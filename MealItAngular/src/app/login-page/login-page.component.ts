import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

export interface Item { name: string, seeds: number;}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  itemCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>

  constructor(public auth: AuthService, private firestore: AngularFirestore) { 
    this.itemCollection = this.firestore.collection<Item>('items');
    this.items = this.itemCollection.valueChanges();
  }

  ngOnInit(): void {
  }

}
