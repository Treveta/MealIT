import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

//Allows component to be used as an injectable in other components
@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-database-helper',
  templateUrl: './database-helper.component.html',
  styleUrls: ['./database-helper.component.css']
})
export class DatabaseHelperComponent implements OnInit {

  private userInfo; // Stores user info (such as id)
  queryCollection: AngularFirestoreCollection<any>; // Firestore collection object to hold any collection
  fetchedList: Observable<any[]> // Observable to hold any returned Observable 

  constructor(
    private afs: AngularFirestore, // Firestore instance
    private authService: AuthService // Authservice instance
  ) {

    //Quickly returns the local user from the authService
    this.userInfo = authService.fetchUserData();

   }

  ngOnInit(): void {
  }

  // Helper function designed to take a user defined query and deliminate based on the : symbol
  // Precondition: recieve a passed string variable in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: return a list of strings deliminated based on : symbol in the form [string, operator, string]
  private parseQuery(query: string){
    return query.split(":");
  }

  // Function designed to make querying for a collection a little more user friendly. Importable as part of the injectable.
  // Fetches collection from firestore based on user defined path and query. Query is a single where query. Currently only supports string based where.
  // Precondition: recieves a passed string that is in the form of a Firestore path and a string in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns a Firestore collection object matching the passed query
  public fetchCollectionOneWhere(path, query1){
    query1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]));
    return this.queryCollection;
  }

  // Function designed to make querying for a collection a little more user friendly. Importable as part of the injectable.
  // Fetches collection from firestore based on user defined path and query. Query is a compound double where query. Currently only supports string based where.
  // Precondition: recieve a passed string that is in the form of a Firestore path and two strings in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns a Firestore collection object matching the passed query
  public fetchCollectionTwoWhere(path, query1, query2){
    query1 = this.parseQuery(query1);
    query2 = this.parseQuery(query2);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]).where(query2[0], query2[1], query2[2]));
    return this.queryCollection;
  }

  // Function designed to make querying for a collection a little more user friendly. Importable as part of the injectable.
  // Fetches collection from firestore based on user defined path and query. Query is a compound triple where query. Currently only supports string based where.
  // Precondition: recieves a passed string that is in the form of a Firestore path and three strings in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns a Firestore collection object matching the passed query
  public fetchCollectionThreeWhere(path, query1, query2, query3){
    query1 = this.parseQuery(query1);
    query2 = this.parseQuery(query2);
    query3 = this.parseQuery(query3);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]).where(query2[0], query2[1], query2[2]).where(query3[0], query3[1], query3[2]));
    return this.queryCollection;
  }

  // Function currently does not work as intended. More testing is required.
  // Function designed to make getting a list of document Ids from the collection easier.
  // Precondition: recieves a Firestore collection object
  // Postcondition: returns an array of document Ids in the form [id, id, ...]
  public fetchDocIdsFromCollection(collection){
    this.queryCollection = collection;
    return new Promise((resolve, reject) => {
      let documentIDs = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe(item => {
          Array.from(item).forEach(row => {
            //data = row.payload.doc.data(); //Sets data equal to the fields of queried document
            documentIDs.push(row.payload.doc['id']); //Sets data equal to the id of the queried document
          });
          resolve(documentIDs);
        });
    });
  }

  // Function designed to make getting the document Ids of a queried Firestore collection easier
  // Precondition: recieves a string in the form of a Firestore path and a string in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns an array of document Ids from the collection matching the query in the form [id, id, ...]
  public fetchDocIdOneWhere(path, query1){
    query1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]));
    return new Promise((resolve, reject) => {
      let data = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe(item => {
          Array.from(item).forEach(row => {
            data.push(row.payload.doc['id']); //Sets data equal to the id of the queried document
          });
          resolve(data);
        });
    });
  }

  // Function designed to make getting the data from a specific document or set of documents easier
  // Precondition: recieves a string in the form of a Firestore collection path and a string in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: returns an array of document data (json style objects) that match the query in the form [jsonStyleData, jsonStyleData, ...]
  public fetchDataOneWhere(path, query1){
    query1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]));
    return new Promise((resolve, reject) => {
      let data = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe(item => {
          Array.from(item).forEach(row => {
            data.push(row.payload.doc.data()); //Sets data equal to the fields of queried document
          });
          resolve(data);
        });
    });
  }

  // Function designed to make deleting a specific document easier. Only deletes the first document matching the query and NOT all matches. 
  // Precondition: recieves a string in the form of a Firestore collection path and a string in the form 'fieldname:operator:stringtosearchfor'
  // Postcondition: Deletes the first document that matches the query 
  async deleteDocWhere(path, query1){
    this.fetchDocIdOneWhere(path, query1).then((docId) => {
      if(docId[0]){
        this.afs.collection(path).doc(docId[0]).delete().then(function() {
          //Deletion Success
          console.log("Deleted Successfully")
        }).catch(function(error) {
          //Deletion Failure
          console.error("Deletion Failed: " + error)
        });
      }else{
        console.error("Query returned no results while attempting to delete.");
      }
    })
  }

}
