import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';
import {SearchRecipesComponent} from 'app/search-recipes/search-recipes.component';
import {CreateRecipeComponent} from './create-recipe.component';

describe('CreateRecipeComponent', () => {
  let component: CreateRecipeComponent;
  let fixture: ComponentFixture<CreateRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateRecipeComponent],
      providers: [{provide: AngularFirestore, useValue: {}}, {provide: AuthService, useClass: class {
        getUid = () => {
          return new Promise(function(resolve) {
            resolve('');
          });
        }
        fetchUserData = jasmine.createSpy('fetchUserData');
      }},
      {provide: SearchRecipesComponent, useValue: {}}],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
