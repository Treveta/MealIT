/* eslint-disable require-jsdoc */
import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {ModalService} from '../modal-functionality';
import {DatabaseHelperComponent} from '../database-helper/database-helper.component';

export interface Item { name: string, seeds: number;}

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent implements OnInit {
  itemCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>

  constructor(private modalService: ModalService, public auth: AuthService, private firestore: AngularFirestore, private dbHelp: DatabaseHelperComponent) {
    this.itemCollection = dbHelp.fetchCollectionOneWhere('items', 'name:==:Melon');
    this.items = this.itemCollection.valueChanges();
    this.test();
  }

  signUp(): void {
    const inputUsername = (<HTMLInputElement>document.getElementById('signUpEmail')).value;
    const inputPassword = (<HTMLInputElement>document.getElementById('signUpPassword')).value;

    this.auth.createEmailUser(inputUsername, inputPassword);
  }

  login(): void {
    const inputUsername = (<HTMLInputElement>document.getElementById('loginEmail')).value;
    const inputPassword = (<HTMLInputElement>document.getElementById('loginPassword')).value;

    this.auth.signInEmailUser(inputUsername, inputPassword);
  }

  async test() {
    const data = (await this.dbHelp.fetchDocIdOneWhere('items', 'name:==:Melon'))[0];
    this.dbHelp.deleteDocWhere('items', 'name:==:Orange');
    console.log(data);
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
