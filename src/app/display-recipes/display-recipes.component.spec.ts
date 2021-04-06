import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../services/auth.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DisplayRecipesComponent} from './display-recipes.component';

describe('DisplayRecipesComponent', () => {
  let component: DisplayRecipesComponent;
  let fixture: ComponentFixture<DisplayRecipesComponent>;

  beforeEach(() => {
    const angularFirestoreStub = () => ({
      collection: (arg) => ({}),
      doc: (arg) => ({}),
    });
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DisplayRecipesComponent],
      providers: [
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: AuthService, useFactory: authServiceStub},
        {provide: MAT_DIALOG_DATA, useValue: {}},
      ],
    });
    fixture = TestBed.createComponent(DisplayRecipesComponent);
    component = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
});
