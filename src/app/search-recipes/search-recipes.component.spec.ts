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

  /**
   * Sets up stubs and providors that will be defined before each test is run
   */
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

  /**
   * Initializes Test Bed and test component
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.setCache(mockRecipes);
  });

  /**
   * Tests that the component instance loads
   */
  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Tests to determine if panelOpenState has a default value on initialization
   */
  it(`panelOpenState has default value`, () => {
    expect(service.panelOpenState).toEqual(false);
  });

  /**
   * Tests to determine if ingredientListLoading has a default value on initialization
   */
  it(`ingredientListLoading has default value`, () => {
    expect(service.ingredientListLoading).toEqual([{Loading: true}]);
  });

  /**
   * Tests the SearchFuzzy function and determines if fuseResults is set with the expected result
   */
  it('should search for search term', () => {
    component.searchTerm = 'Hot';
    component.userRecipes = mockRecipes;
    component.searchFuzzy();
    expect(component.fuseResults).toContain({recipeName: 'hotdog with salad'});
    expect(component.fuseResults).not.toContain({recipeName: 'sausage with beans'});
  });

  /**
   * Tests the searchService function and determines if it returns the expected result based on parameter search term
   */
  it('should search for parameter', () => {
    component.userRecipes = mockRecipes;
    expect(component.searchService('Hot')).toContain({recipeName: 'hotdog with salad'});
    expect(component.searchService('Hot')).not.toContain({recipeName: 'sausage with beans'});
  });

  /**
   * Tests the set cache function and determines if the cache is properly set in LocalStorage
   */
  it('should set cache', () => {
    component.userRecipes = [];
    expect(component.userRecipes).toEqual([]);
    component.fetchCache();
    expect(component.userRecipes).toEqual(mockRecipes);
    component.setCache([{data: 'Cache Set'}]);
    component.fetchCache();
    expect(component.userRecipes).toEqual([{data: 'Cache Set'}]);
  });

  /**
   * Tests the fetchCache function and determines if the cache can be properly retrieved from LocalStorage
   */
  it('should fetch cache', () => {
    component.userRecipes = [];
    expect(component.userRecipes).toEqual([]); // Checks to make sure user recipes have been emptied
    component.fetchCache();
    expect(component.userRecipes).toEqual(mockRecipes); // Checks to see if the recipes have been properly fetched from local storage
  });

  /**
   * Tests the first if clause of fetchRecipe function and determines if previous uid and ingredient list are set properly
   */
  it('should load temp ingredients', () => {
    component.previousUID = 1;
    component.panelOpenState = false;
    component.fetchRecipe(1, component.listIngredients);
    expect(component.ingredientList).toEqual(component.ingredientListLoading);
    expect(component.previousUID).toEqual(0);
  });

  /**
   * Tests the first if clause of fetchRecipe function and determines if previous uid and ingredient list are set properly
   */
  it('should set previous uid open', async () => {
    component.previousUID = 1;
    component.panelOpenState = true;
    await component.fetchRecipe(2, component.listIngredientsStub);
    expect(component.previousUID).toEqual(2);
    expect(component.ingredientList).toEqual(mockIngredients);
  });

  /**
   * Tests the first if clause of fetchRecipe function and determines if previous uid and ingredient list are set properly
   */
  it('should set previous uid closed', async () => {
    component.previousUID = 1;
    component.panelOpenState = false;
    await component.fetchRecipe(2, component.listIngredientsStub);
    expect(component.previousUID).toEqual(2);
    expect(component.ingredientList).toEqual(mockIngredients);
  });
});
