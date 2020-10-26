import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ModalService } from '../modal-functionality';

export interface Item { name: string, seeds: number;}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {

  itemCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>

  constructor(private modalService: ModalService, public auth: AuthService, private firestore: AngularFirestore) { 
    this.itemCollection = this.firestore.collection<Item>('items');
    this.items = this.itemCollection.valueChanges();
  }

  signUp(): void {
    var inputUsername = (<HTMLInputElement>document.getElementById("email")).value;
    var inputPassword = (<HTMLInputElement>document.getElementById("password")).value;

    this.auth.createEmailUser(inputUsername, inputPassword);
  }

  login(): void {
    var inputUsername = (<HTMLInputElement>document.getElementById("email")).value;
    var inputPassword = (<HTMLInputElement>document.getElementById("password")).value;

    this.auth.signInEmailUser(inputUsername, inputPassword);
  }

  openModal(id: string) {
    this.modalService.open(id);
}

closeModal(id: string) {
    this.modalService.close(id);
}

  ngOnInit(): void {
  }

}
