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

  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }

  ngOnInit(): void {
  }
}
