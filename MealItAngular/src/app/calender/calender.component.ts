/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {AuthService} from '../services/auth.service';
import {ModalService} from '../modal-functionality';
import {DatabaseHelperComponent} from 'app/database-helper/database-helper.component';


@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css'],
})
/**
 * creates CalenderComponent
 *
*/
export class CalenderComponent {
  public Mealtimes =[];

  public newDate;
  public newMealtype;
  public newRecipe;

  constructor(private modalService: ModalService) {


  }
  submitMeal() {

  }
  openModal(id: string) {
    this.modalService.open(id);
  }

  closeModal(id: string) {
    this.modalService.close(id);
  }
}
