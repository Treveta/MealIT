import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.model';
import { shoppingList } from './shoppingList.model';


import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<User>;
  private userInfo;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
    ) { 

      // Get the auth state, then fetch the Firestore user document or return null
      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
            // Logged in
          if (user) {
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            // Logged out
            return of(null);
          }
        })
      );
    }

    async googleSignin() {
      const provider = new auth.GoogleAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);
      return this.updateUserData(credential.user);
    }

    async createEmailUser(email,password){
      try{
        const credential = await this.afAuth.createUserWithEmailAndPassword(email,password);
        return this.updateUserData(credential.user)
      }catch{
        //Handle errors here
      }
    }

    async signInEmailUser(email,password){
      try{
        const credential = await this.afAuth.signInWithEmailAndPassword(email,password);
        return this.updateUserData(credential.user)
      }catch{
        //Handle errors here
      }
    }
  
    private updateUserData(user) {
      // Sets user data to firestore on login
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);
      //let shoppingList = this.afs.collection('users/'+user.uid+'/shoppingList')
      let shoppingList = this.afs.collection('users/'+user.uid+'/shoppingList').doc('InitializationItem');

      const data = { 
        uid: user.uid, 
        email: user.email, 
        displayName: user.displayName,
      } 

      const shoppingData = {
        itemName: null,
        quantity: null,
        unit: null
      }

      shoppingList.set(shoppingData, {merge: true})

      this.userInfo = user;

      return userRef.set(data, { merge: true })
  
    }
  
    async signOut() {
      await this.afAuth.signOut();
      this.router.navigate(['/']);
    }

    public fetchUserData() {
      return this.userInfo
    }
}
