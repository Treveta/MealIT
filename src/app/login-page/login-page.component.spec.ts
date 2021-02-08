import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';
import {of} from 'rxjs';
import {LoginPageComponent} from './login-page.component';

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
    await TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      providers: [{provide: AngularFirestore, useValue: {mockFirestore}}, {provide: AuthService, useClass: class {
        fetchUserData = jasmine.createSpy('fetchUserData')
      }}],
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
