import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-database-helper',
  templateUrl: './database-helper.component.html',
  styleUrls: ['./database-helper.component.css']
})
export class DatabaseHelperComponent implements OnInit {

  private userInfo;
  public data;
  queryCollection: AngularFirestoreCollection<any>;
  fetchedList: Observable<any[]>

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService
  ) {

    this.userInfo = authService.fetchUserData();

   }

  ngOnInit(): void {
  }

  private parseQuery(query){
    return query.split(":");
  }

  public fetchCollectionOneWhere(path, query1){
    query1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]));
    return this.queryCollection;
  }

  public fetchCollectionTwoWhere(path, query1, query2){
    query1 = this.parseQuery(query1);
    query2 = this.parseQuery(query2);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]).where(query2[0], query2[1], query2[2]));
    return this.queryCollection;
  }

  public fetchCollectionThreeWhere(path, query1, query2, query3){
    query1 = this.parseQuery(query1);
    query2 = this.parseQuery(query2);
    query3 = this.parseQuery(query3);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]).where(query2[0], query2[1], query2[2]).where(query3[0], query3[1], query3[2]));
    return this.queryCollection;
  }

  public fetchDocIdsFromCollection(collection){
    this.queryCollection = collection;
    return new Promise((resolve, reject) => {
      let documentIDs = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe(item => {
          Array.from(item).forEach(row => {
            //data = row.payload.doc.data(); //Sets data equal to the fields of queried document
            documentIDs.push(row.payload.doc.id); //Sets data equal to the id of the queried document
          });
          resolve(documentIDs);
        });
    });
  }

  public fetchDocIdOneWhere(path, query1){
    query1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]));
    return new Promise((resolve, reject) => {
      let data = [];
      this.queryCollection
        .snapshotChanges()
        .subscribe(item => {
          Array.from(item).forEach(row => {
            data.push(row.payload.doc.id); //Sets data equal to the id of the queried document
          });
          resolve(data);
        });
    });
  }

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
