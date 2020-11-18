/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
import { Component, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
// eslint-disable-next-line import/no-unresolved
import AuthService from '../services/auth.service';

// Allows component to be used as an injectable in other components
@Injectable({
  providedIn: 'root',
})

@Component({
  selector: 'app-database-helper',
  templateUrl: './database-helper.component.html',
  styleUrls: ['./database-helper.component.css'],
})
export default class DatabaseHelperComponent {
  private userInfo; // Stores user info (such as id)

  // Firestore collection object to hold any collection
  queryCollection: AngularFirestoreCollection<any>;

  fetchedList: Observable<any[]>; // Observable to hold any returned Observable

  constructor(
    // eslint-disable-next-line no-unused-vars
    private afs: AngularFirestore, // Firestore instance
    private authService: AuthService, // Authservice instance
  ) {
    // Quickly returns the local user from the authService
    this.userInfo = authService.fetchUserData();
  }

  // Helper function designed to take a user defined query and deliminate based on the : symbol
  // Precondition: recieve a passed string variable in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: return a list of strings deliminated based on : symbol in the form [string, operator, string]
  private parseQuery(query: string): any[] {
    return query.split(':');
  }

  // Function designed to make querying for a collection a little more user friendly. Importable as part of the injectable.
  // Fetches collection from firestore based on user defined path and query. Query is a single where query.
  // Currently only supports string based where.
  // Precondition: recieves a passed string that is in the form of a Firestore path and a string
  // in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns a Firestore collection object matching the passed query
  public fetchCollectionOneWhere(path, query1): AngularFirestoreCollection<any> {
    const query = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, (ref) => ref.where(query[0], query[1], query[2]));
    return this.queryCollection;
  }

  // Function designed to make querying for a collection a little more user friendly. Importable as part of the injectable.
  // Fetches collection from firestore based on user defined path and query. Query is a compound double where query. Currently only supports string based where.
  // Precondition: recieve a passed string that is in the form of a Firestore path and two strings in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns a Firestore collection object matching the passed query
  public fetchCollectionTwoWhere(path, query1, query2): AngularFirestoreCollection<any> {
    const queryMod1 = this.parseQuery(query1);
    const queryMod2 = this.parseQuery(query2);
    this.queryCollection = this.afs.collection(path, (ref) => ref.where(queryMod1[0], queryMod1[1], queryMod1[2]).where(queryMod2[0], queryMod2[1], queryMod2[2]));
    return this.queryCollection;
  }

  // Function designed to make querying for a collection a little more user friendly. Importable as part of the injectable.
  // Fetches collection from firestore based on user defined path and query. Query is a compound triple where query. Currently only supports string based where.
  // Precondition: recieves a passed string that is in the form of a Firestore path and three strings in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns a Firestore collection object matching the passed query
  public fetchCollectionThreeWhere(path, query1, query2, query3): AngularFirestoreCollection<any> {
    const queryMod1 = this.parseQuery(query1);
    const queryMod2 = this.parseQuery(query2);
    const queryMod3 = this.parseQuery(query3);
    this.queryCollection = this.afs.collection(path, (ref) => ref.where(queryMod1[0], queryMod1[1], queryMod1[2]).where(queryMod2[0], queryMod2[1], queryMod2[2]).where(queryMod3[0], queryMod3[1], queryMod3[2]));
    return this.queryCollection;
  }

  // Function currently does not work as intended. More testing is required.
  // Function designed to make getting a list of document Ids from the collection easier.
  // Precondition: recieves a Firestore collection object
  // Postcondition: returns an array of document Ids in the form [id, id, ...]
  public fetchDocIdsFromCollection(collection): Promise<any> {
    this.queryCollection = collection;
    return new Promise((resolve) => {
      const documentIDs = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe((item) => {
          Array.from(item).forEach((row) => {
            // data = row.payload.doc.data(); //Sets data equal to the fields of queried document
            documentIDs.push(row.payload.doc.id); // Sets data equal to the id of the queried document
          });
          resolve(documentIDs);
        });
    });
  }

  // Function designed to make getting the document Ids of a queried Firestore collection easier
  // Precondition: recieves a string in the form of a Firestore path and a string in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns an array of document Ids from the collection matching the query in the form [id, id, ...]
  public fetchDocIdOneWhere(path, query1): Promise<any> {
    const queryMod1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, (ref) => ref.where(queryMod1[0], queryMod1[1], queryMod1[2]));
    return new Promise((resolve) => {
      const data = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe((item) => {
          Array.from(item).forEach((row) => {
            data.push(row.payload.doc.id); // Sets data equal to the id of the queried document
          });
          resolve(data);
        });
    });
  }

  // Function designed to make getting the data from a specific document or set of documents easier
  // Precondition: recieves a string in the form of a Firestore collection path and a string in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns an array of document data (json style objects) that match the query in the form [jsonStyleData, jsonStyleData, ...]
  public fetchDataOneWhere(path, query1): Promise<any> {
    const queryMod1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, (ref) => ref.where(queryMod1[0], queryMod1[1], queryMod1[2]));
    return new Promise((resolve) => {
      const data = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe((item) => {
          Array.from(item).forEach((row) => {
            data.push(row.payload.doc.data()); // Sets data equal to the fields of queried document
          });
          resolve(data);
        });
    });
  }

  // Function designed to make deleting a specific document easier. Only deletes the first document matching the query and NOT all matches.
  // Precondition: recieves a string in the form of a Firestore collection path and a string in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: Deletes the first document that matches the query
  async deleteDocWhere(path, query1): Promise<void> {
    this.fetchDocIdOneWhere(path, query1).then((docId) => {
      if (docId[0]) {
        this.afs.collection(path).doc(docId[0]).delete().then(() => {
          // Deletion Success
        })
          .catch(() => {
          // Deletion Failure
          });
      }
    });
  }
}
