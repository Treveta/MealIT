/* eslint-disable no-unused-vars */
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {AuthService} from '../services/auth.service';
import {AngularFirestore} from '@angular/fire/firestore';
import {ModalService} from '../modal-functionality';
import {DatabaseHelperComponent} from '../database-helper/database-helper.component';
import {LoginPageComponent} from './login-page.component';
import {of} from 'rxjs';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  const mockFirestore = function() {
    const obj = {valueChanges() {
      return of({data: 'data'});
    },
    };
    return obj;
  };

  beforeEach(async () => {
    const authServiceStub = () => ({
      createEmailUser: (inputUsername, inputPassword) => ({}),
      signInEmailUser: (inputUsername, inputPassword) => ({}),
    });
    const angularFirestoreStub = () => ({});
    const modalServiceStub = () => ({open: (id) => ({}), close: (id) => ({})});
    const databaseHelperComponentStub = () => ({});
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [LoginPageComponent],
      providers: [
        {provide: AuthService, useFactory: authServiceStub},
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: ModalService, useFactory: modalServiceStub},
        {provide: AngularFirestore, useValue: {mockFirestore}},
        {provide: AuthService, useClass: class {
          fetchUserData = jasmine.createSpy('fetchUserData')
        }},
        {
          provide: DatabaseHelperComponent,
          useFactory: databaseHelperComponentStub,
        },
      ],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
