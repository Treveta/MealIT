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

  const mockUsername = 'testUser@gmail.com';
  const mockPassword = 'testPass123';
  const mockFirestore = function() {
    const obj = {valueChanges() {
      return of({data: 'data'});
    },
    };
    return obj;
  };
  /**
   * Constructs stubs and providers to be defined before tests are run
   */
  beforeEach(async () => {
    const authServiceStub = () => ({createEmailUser: (inputUsername, inputPassword) => ({}), signInEmailUser: (inputUsername, inputPassword) => ({})});
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
        {
          provide: DatabaseHelperComponent,
          useFactory: databaseHelperComponentStub,
        },
      ],
    })
        .compileComponents();
  });
  /**
   * Initializes Test Bed and test component
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  /**
   * Tests that the component loads
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  /**
   * Tests if the modal successfully opens
   */
  it('should open modal', () => {
    spyOn(component.modalService, 'open');
    component.openModal('test');
    expect(component.modalService.open).toHaveBeenCalled();
  });
  /**
   * Tests if the modal successfully closes
   */
  it('should close modal', () => {
    spyOn(component.modalService, 'close');
    component.closeModal('test');
    expect(component.modalService.close).toHaveBeenCalled();
  });
  /**
    * Tests if the user login works successfully
    */
  it('should login successfully', () => {
    spyOn(component.auth, 'signInEmailUser');
    component.login();
    expect(component.auth.signInEmailUser).toHaveBeenCalled();
  });
  /**
    * Tests if the user sign up works successfully
    */
  it('should sign up successfully', () => {
    spyOn(component.auth, 'createEmailUser');
    component.signUp();
    expect(component.auth.createEmailUser).toHaveBeenCalled();
  });
});
