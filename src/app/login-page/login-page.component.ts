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
  emailSignUp: string;
  passwordSignUp: string;
  emailLogin: string;
  passwordLogin: string;

  /**
   * The constructor for the modal service
   * @param {ModalService} modalService Variable to hold modal service functions to allow modal functionality
   * @param {AuthService} auth Authentication variable for authenticating user
   * @param {AngularFirestore} firestore Holds reference to the firestore
   * @param {DatabaseHelperComponent} dbHelp Database helper reference to help with database calls
   */
  constructor(public modalService: ModalService, public auth: AuthService, private firestore: AngularFirestore, private dbHelp: DatabaseHelperComponent) {
  }
  /**
   * A function for a user to sign up for an account
   */
  signUp(): void {
    this.auth.createEmailUser(this.emailSignUp, this.passwordSignUp);
  }
  /**
   * A function for a user to log in with an account
   */
  login(): void {
    this.auth.signInEmailUser(this.emailLogin, this.passwordLogin);
  }
  /**
   * A function to open a modal
   * @param {string} id Id to identify the name of the modal being called
   */
  openModal(id: string) {
    this.modalService.open(id);
  }
  /**
   * A function to close a modal
   * @param {string} id Id to identify the name of the modal being called
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
