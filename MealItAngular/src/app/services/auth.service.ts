import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.model';
import { shoppingList } from './shoppingList.model';


import { auth } from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from '@angular/fire/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

declare var checkPassword: any; // Allows the use of the password check script

// Makes this service injectable into other components
@Injectable({
  providedIn: 'root'
})

export class AuthService {

  user$: Observable<User>; // An observable to be used to watch the User state
  private userInfo; // Used to store current user data

  constructor(
    private afAuth: AngularFireAuth, // Firebase Authentication instance
    private afs: AngularFirestore, // Firebase Database instance
    private router: Router // Angular router instance
    ) { 

      // Get the auth state, then fetch the Firestore user document or return null
      this.user$ = this.afAuth.authState.pipe(
        switchMap(user => {
            // Logged in
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
          } else {
            // Logged out
            return of(null);
          }
        })
      );
    }

    // Attempt to sign user in with Google as their authentication provider
    // Postcondition: User is signed in and current user is updated to match the authenticated users information as retrieved from Firebase
    async googleSignin() {
      const provider = new auth.GoogleAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);
      return this.updateUserData(credential.user);
    }

    // Attempts to create a user in Firebase given an email and password
    // Checks to ensure email is in a valid form and that password is up to complexity standards
    // Firebase checks to ensure the email is not a duplicate and handles hashing and security as part of its API
    // If email and password combo are invalid on any of these checks the user is not created and an error is thrown
    // Postcondition: a user is added in Firebase with the email and password provided
    async createEmailUser(email,password){
      console.log(password)
      let isValid = checkPassword(password);
      // INCLUDE MISSING EMAIL CHECK HERE
      if(isValid){
        try{
          const credential = await this.afAuth.createUserWithEmailAndPassword(email,password);
          return this.updateUserData(credential.user)
        }catch{
          //Handle errors here
        }
      }else{
        //Handle Invalid Password Here
      }
    }

    // Attempts to sign in user based on provided email and password
    // Firebase handles all the Authentication and Security using its API so that even without a backend server passwords are protected and users are properly authenticated
    // Postcondition: If email and password are authenticated User is signed in and current user is updated to match the authenticated users information as retrieved from Firebase
    async signInEmailUser(email,password){
      try{
        const credential = await this.afAuth.signInWithEmailAndPassword(email,password);
        return this.updateUserData(credential.user)
      }catch{
        //Handle errors here
      }
    }
  
    // Updates the users local information based on the user information recieved from Firebase during authentication
    // Makes sure that Firestore database is kept up to date with users current information: uid, email, and displayName
    // Firestore collections are based on the users uid, which is assigned to them when they first authenticate
    // While storing the uid on the user record in the database may seem insecure due to Firestore records being trasmitted in plain text in GET requests this is not the case
    // Backend Firebase rules use the users authentication state directly to compare to API requests. If the uid of the auth state doesn't match the uid attempting to read from or written to then the request will fail
    // On first sign in creates user specific collections in Firestore to hold user information
    // Postcondition: user info in Firestore is updated to match user info collected on Authentication (Which is more up to date) and collections are created for user if necessary
    private updateUserData(user) { 
      const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`); 
      let shoppingList = this.afs.collection('users/'+user.uid+'/shoppingList').doc('InitializationItem'); // Firestore collections must have at least one document in them at all times. So when creating them on sign in an empty Initialization document is created
      let recipeList = this.afs.collection('users/'+user.uid+'/recipeList').doc('InitializationItem'); // Reads are cheaper than writes, need to come up with a check to ensure that Initialization item is only created if it doesn't already exist

      // creates data object to be passed to Firestore, based on user information obtained during authentication
      const data = { 
        uid: user.uid, 
        email: user.email, 
        displayName: user.displayName,
      } 

      // Creates shoppingList and recipeList initializationItems
      const shoppingData = {
        itemName: null,
        quantity: null,
        unit: null
      }

      const recipeData = {
        recipeName: null,
        calories: null,
        servings: null
      }

      // Merges newly created or updated data into Firestore
      shoppingList.set(shoppingData, {merge: true}) // merge: true indicates that if data exists in database it should be merged instead of overwritten. That way, for example, users can have information stored on their document that doesn't derive from their Auth state
      recipeList.set(recipeData, {merge: true})

      this.userInfo = user;

      return userRef.set(data, { merge: true })
  
    }
  
    // Signs the user out and redirects them to the landing page of the website
    async signOut() {
      await this.afAuth.signOut();
      this.router.navigate(['/']);
    }

    // Returns the current user as determined by the Firebase auth state
    async fetchUserData() {
      return await this.afAuth.currentUser; 
    }

    // Retrieves the current users uid
    // Used to pass a users auth state across different components and during page refresh
    // Postcondition: returns a promise that contains the users uid
    public getUid() {
      return new Promise((resolve, reject) => {
        let data;
        this.user$
          .subscribe(item => {
              data = (item.uid); //Sets data equal to the id of the queried document
            resolve(data);
          });
      });
  }
}
