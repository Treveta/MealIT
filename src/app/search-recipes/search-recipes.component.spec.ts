import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';
import {AngularFireAnalytics} from '@angular/fire/analytics';
import {SearchRecipesComponent} from './search-recipes.component';

describe('SearchRecipesComponent', () => {
  let service: SearchRecipesComponent;
  let component: SearchRecipesComponent;
  let fixture: ComponentFixture<SearchRecipesComponent>;

  /**
   * Mock of a users recipe information
   */
  const mockRecipes = [
    {
      'recipeName': 'sausage with rice',
    },
    {
      'recipeName': 'hotdog with salad',
    },
    {
      'recipeName': 'sausage with beans',
    },
    {
      'recipeName': 'brat with salad',
    },
    {
      'recipeName': 'hotdog with rice',
    },
  ];

  /**
   * Mock of a recipes ingredients
   */
  const mockIngredients = [
    {
      'ingredientName': 'rice',
    },
    {
      'ingredientName': 'ketchup',
    },
    {
      'ingredientName': 'bbq',
    },
  ];

  beforeEach(() => {
    const angularFirestoreStub = () => ({
      collection: (collectionPath) => ({
        add: () => ({id: {}}),
        doc: () => ({update: () => ({})}),
        get: () => ({toPromise: () => ({forEach: () => ({})})}),
      }),
    });
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    const angularFireAnalyticsStub = () => ({logEvent: (string) => ({})});
    TestBed.configureTestingModule({
      providers: [
        SearchRecipesComponent,
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: AuthService, useFactory: authServiceStub},
        {provide: AngularFireAnalytics, useFactory: angularFireAnalyticsStub},
      ],
    });
    spyOn(SearchRecipesComponent.prototype, 'listRecipes');
    // spyOn(SearchRecipesComponent.prototype, 'fetchCache');
    service = TestBed.inject(SearchRecipesComponent);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.setCache(mockRecipes);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

  it(`panelOpenState has default value`, () => {
    expect(service.panelOpenState).toEqual(false);
  });

  it(`ingredientListLoading has default value`, () => {
    expect(service.ingredientListLoading).toEqual([{Loading: true}]);
  });

  it('should search for search term', () => {
    component.searchTerm = 'Hot';
    component.userRecipes = mockRecipes;
    component.searchFuzzy();
    expect(component.fuseResults).toContain({recipeName: 'hotdog with salad'});
    expect(component.fuseResults).not.toContain({recipeName: 'sausage with beans'});
  });

  it('should search for parameter', () => {
    component.userRecipes = mockRecipes;
    expect(component.searchService('Hot')).toContain({recipeName: 'hotdog with salad'});
    expect(component.searchService('Hot')).not.toContain({recipeName: 'sausage with beans'});
  });

  it('should set cache', () => {
    component.userRecipes = [];
    expect(component.userRecipes).toEqual([]);
    component.fetchCache();
    expect(component.userRecipes).toEqual(mockRecipes);
    component.setCache([{data: 'Cache Set'}]);
    component.fetchCache();
    expect(component.userRecipes).toEqual([{data: 'Cache Set'}]);
  });

  it('should fetch cache', () => {
    component.userRecipes = [];
    expect(component.userRecipes).toEqual([]); // Checks to make sure user recipes have been emptied
    component.fetchCache();
    expect(component.userRecipes).toEqual(mockRecipes); // Checks to see if the recipes have been properly fetched from local storage
  });

  it('should load temp ingredients', () => {
    component.previousUID = 1;
    component.panelOpenState = false;
    component.fetchRecipe(1, component.listIngredients);
    expect(component.ingredientList).toEqual(component.ingredientListLoading);
    expect(component.previousUID).toEqual(0);
  });

  it('should set previous uid open', async () => {
    component.previousUID = 1;
    component.panelOpenState = true;
    await component.fetchRecipe(2, component.listIngredientsStub);
    expect(component.previousUID).toEqual(2);
    expect(component.ingredientList).toEqual(mockIngredients);
  });

  it('should set previous uid closed', async () => {
    component.previousUID = 1;
    component.panelOpenState = false;
    await component.fetchRecipe(2, component.listIngredientsStub);
    expect(component.previousUID).toEqual(2);
    expect(component.ingredientList).toEqual(mockIngredients);
  });
});
