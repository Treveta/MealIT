import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';

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

  public fetchDataOneWhere(path, query1){
    query1 = this.parseQuery(query1);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]));
    return this.queryCollection;
  }

  public fetchDataTwoWhere(path, query1, query2){
    query1 = this.parseQuery(query1);
    query2 = this.parseQuery(query2);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]).where(query2[0], query2[1], query2[2]));
    return this.queryCollection;
  }

  public fetchDataThreeWhere(path, query1, query2, query3){
    query1 = this.parseQuery(query1);
    query2 = this.parseQuery(query2);
    query3 = this.parseQuery(query3);
    this.queryCollection = this.afs.collection(path, ref => ref.where(query1[0], query1[1], query1[2]).where(query2[0], query2[1], query2[2]).where(query3[0], query3[1], query3[2]));
    return this.queryCollection;
  }

}
