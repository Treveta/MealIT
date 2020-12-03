/* eslint-disable require-jsdoc */
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {User} from './user.model';

import {auth, storage} from 'firebase/app';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

declare const checkPassword: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User>;
  private userInfo;

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

  async googleSignin() {
    const provider = new auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  async createEmailUser(email, password) {
    console.log(password);
    const isValid = checkPassword(password);
    if (isValid) {
      try {
        const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
        return this.updateUserData(credential.user);
      } catch {
        // Handle errors here
      }
    } else {
      // Handle Invalid Password Here
    }
  }

  async signInEmailUser(email, password) {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
      return this.updateUserData(credential.user);
    } catch {
      // Handle errors here
    }
  }

  private updateUserData(user) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
    const shoppingList = this.afs.collection('users/'+user.uid+'/shoppingList').doc('InitializationItem');
    const recipeList = this.afs.collection('users/'+user.uid+'/recipeList').doc('InitializationItem');
    const storageList = this.afs.collection('users/'+user.uid+'/storageList').doc('InitializationItem');

    const data = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };

    const shoppingData = {
      itemName: null,
      quantity: null,
      unit: null,
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

    shoppingList.set(shoppingData, {merge: true});
    recipeList.set(recipeData, {merge: true});
    storageList.set(storageData, {merge: true});

    this.userInfo = user;

    return userRef.set(data, {merge: true});
  }

  async signOut() {
    await this.afAuth.signOut();
    this.router.navigate(['/']);
  }

  async fetchUserData() {
    // const  user  =  JSON.parse(localStorage.getItem('user'));
    return await this.afAuth.currentUser;
  }

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
