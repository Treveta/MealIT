/* eslint-disable require-jsdoc */
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFireAnalytics} from '@angular/fire/analytics';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';
import {SearchRecipesComponent} from './search-recipes.component';

describe('SearchRecipesComponent', () => {
  let component: SearchRecipesComponent;
  let fixture: ComponentFixture<SearchRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchRecipesComponent],
      providers: [{provide: AngularFirestore, useValue: {}},
        {provide: AuthService, useClass: class {
          getUid = () => {
            return new Promise(function(resolve) {
              resolve('');
            });
          }
        }},
        {provide: AngularFireAnalytics, useValue: {}}],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
