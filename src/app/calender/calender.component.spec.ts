import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {SearchRecipesComponent} from 'app/search-recipes/search-recipes.component';
import {AuthService} from 'app/services/auth.service';

import {CalenderComponent} from './calender.component';

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

  it('Get a week', () => {
    let week: string[] = [];
    const longDate = 'Sunday 2/14/2021';
    const shortDate = new Date(2021, 1, 16);

    week = component.getWeek(shortDate);

    expect(longDate).toBe(week[0]);
  });

  it('Submit meal: null date', () => {
    let error: string = '';
    error = component.submitMeal('uid', 'modalid');

    expect(component.errorDate).toBe(true);
    expect(error).toBe('You must enter a valid date');
  });

  it('Submit meal: not null date', () => {
    let error: string = '';
    component.date = new Date(2021, 1, 19);
    error = component.submitMeal('uid', 'modalid');

    expect(component.errorDate).toBe(false);
    expect(component.date).toBe(null);
    expect(error).toBe('Adding uid on 2/19/2021');
  });
});
