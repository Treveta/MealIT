/* eslint-disable no-unused-vars */
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
/**
 * creates LoginPageComponent
 */
export class LoginPageComponent implements OnInit {
  /**
   * Holds collections of items from angular firestore
   * @type {Item}
   */
  itemCollection: any;
  /**
   * Holds observable array of items from angular firestore
   * @type {any[]}
   */
  items: any;
  /**
   * Holds username and password from signup modal
   * @type {string}
   */
  email: string;
  password: string;

  /**
   * The constructor for the modal service
   * @param {ModalService} modalService
   * @param {AuthService} auth
   * @param {AngularFirestore} firestore
   * @param {DatabaseHelperComponent} dbHelp
   */
  constructor(public modalService: ModalService, public auth: AuthService, private firestore: AngularFirestore, private dbHelp: DatabaseHelperComponent) {
  }
  /**
   * A function for a user to sign up for an account
   */
  signUp(): void {
    this.auth.createEmailUser(this.email, this.password);
  }
  /**
   * A function for a user to log in with an account
   */
  login(): void {
    this.auth.signInEmailUser(this.email, this.password);
  }
  /**
   * A function to open a modal
   * @param {string} id
   */
  openModal(id: string) {
    this.modalService.open(id);
  }
  /**
   * A function to close a modal
   * @param {string} id
   */
  closeModal(id: string) {
    this.modalService.close(id);
  }
  /**
   * A function from the auth service that only is called when a user accesses the site for the first time
   */
  ngOnInit(): void {
  }
}
