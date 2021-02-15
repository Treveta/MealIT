import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {SearchRecipesComponent} from 'app/search-recipes/search-recipes.component';
import {AuthService} from 'app/services/auth.service';

import {CalenderComponent} from './calender.component';

describe('Get a week', function() {
  let a: CalenderComponent;
  let b: string[] = [];
  const c = 'Sunday 2/14/2021';
  const d = new Date(2021, 2, 14);

  b = a.getWeek(d);

  expect(c).toBe(b[0]);
});

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalenderComponent],
      providers: [{provide: AngularFirestore, useValue: {}}, {provide: AuthService, useClass: class {
        getUid = () => {
          return new Promise(function(resolve) {
            resolve('');
          });
        }
      }},
      {provide: SearchRecipesComponent, useValue: {}}],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
