import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';

import {DatabaseHelperComponent} from './database-helper.component';

describe('DatabaseHelperComponent', () => {
  let component: DatabaseHelperComponent;
  let fixture: ComponentFixture<DatabaseHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatabaseHelperComponent],
      providers: [{provide: AngularFirestore, useValue: {}}, {provide: AuthService, useClass: class {
        fetchUserData = jasmine.createSpy('fetchUserData')
      }}],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
