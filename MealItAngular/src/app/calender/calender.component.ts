import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../modal-functionality'; 
import { DatabaseHelperComponent } from 'app/database-helper/database-helper.component';

@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent implements OnInit {
  public Mealtimes =[];

  public newDate; 
  public newMealtype;
  public newRecipe;

  constructor() { }

  ngOnInit(): void {
  }

}
