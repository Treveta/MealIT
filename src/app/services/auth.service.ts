import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {User} from './user.model';

import {auth} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

declare const checkPassword: any;

@Injectable({
  providedIn: 'root',
})
/**
 * creates the AuthService component
 */
export class AuthService {
  /**
   * Holds the observable type User to easily identify who is logged in
   * @type {User}
   */
  user$: Observable<User>;
  /**
   * Holds the information of the user
   * @type {any}
   */
  private userInfo;

  /**
   * The constructor for the Auth Service
   * @param {AngularFireAuth} afAuth
   * @param {AngularFirestore} afs
   * @param {Router} router
   */
  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    this.user$ = this.afAuth.authState.pipe(
        switchMap((user) => {
          // Logged in
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            // Logged out
            return of(null);
          }
        }),
    );
  }
  /**
   * Function for when a user signs in with a google account
   * @return {credential}
   */
  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }
  /**
   *A function that creates a user with a given email and password
   * @param {string} email
   * @param {string} password
   * @return {credential}
   */
  async createEmailUser(email, password) {
    const isValid = checkPassword(password);
    if (isValid) {
      try {
        const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
        return this.updateUserData(credential.user);
      } catch (error) {
        // Handle errors here
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
      }
    } else {
      // Handle Invalid Password Here
    }
  }
  /**
   * A function for a user to log in with a valid email and password
   * @param {string} email
   * @param {string} password
   * @return {credential}
   */
  async signInEmailUser(email, password) {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
      return this.updateUserData(credential.user);
    } catch (error) {
      // Handle errors here
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
      console.log(error);
    }
  }
  /**
   * A function that updates the user's data in firestore on login
   * @param {any} user
   * @return {userRef}
   */
  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const shoppingList = this.afs.collection('users/'+user.uid+'/shoppingList').doc('List');
    const recipeList = this.afs.collection('users/'+user.uid+'/recipeList').doc('InitializationItem');
    const storageList = this.afs.collection('users/'+user.uid+'/storageList').doc('InitializationItem');

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };

    const shoppingData = {
      Items: [],
    };

    const recipeData = {
      recipeName: null,
      calories: null,
      servings: null,
    };

    const storageData = {
      itemName: null,
      quantity: null,
      unit: null,
    };

    shoppingList.ref.get().then((snapshot) => {
      if (snapshot.exists) {
        // Do nothing
      } else {
        shoppingList.set(shoppingData, {merge: true});
      }
    });
    recipeList.set(recipeData, {merge: true});
    storageList.set(storageData, {merge: true});

    this.userInfo = user;

    return userRef.set(data, {merge: true});
  }
  /**
   * A function for a user to sign out
   */
  async signOut() {
    await this.afAuth.signOut();
    this.router.navigate(['/']);
  }
  /**
   * A function that fetches a user's data
   * @return {afAuth}
   */
  async fetchUserData() {
    // const  user  =  JSON.parse(localStorage.getItem('user'));
    return await this.afAuth.currentUser;
  }
  /**
   * A function that gets the user ID of the current user
   * @return {Promise}
   */
  public getUid() {
    return new Promise((resolve, reject) => {
      let data;
      this.user$
          .subscribe((item) => {
            data = (item.uid); // Sets data equal to the id of the queried document
            resolve(data);
          });
    });
  }
}
