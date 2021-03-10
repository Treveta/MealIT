import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from 'app/services/auth.service';
import {AngularFireAnalytics} from '@angular/fire/analytics';
import {SearchRecipesComponent} from './search-recipes.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDialogRef} from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';
import {MatFormFieldModule} from '@angular/material/form-field';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import { DatabaseHelperComponent } from 'app/database-helper/database-helper.component';

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

  let debugSelectMeal;
  let debugShowRecipe;


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
    const databaseHelperComponentStub = () => ({
      deleteDocWhere: (arg, query) => ({}),
    });
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    const angularFireAnalyticsStub = () => ({logEvent: (string) => ({})});
    TestBed.configureTestingModule({
      declarations: [SearchRecipesComponent],
      providers: [
        SearchRecipesComponent,
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: AuthService, useFactory: authServiceStub},
        {provide: AngularFireAnalytics, useFactory: angularFireAnalyticsStub},
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}},
        {
          provide: DatabaseHelperComponent,
          useFactory: databaseHelperComponentStub,
        },
      ],
      imports: [
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
    });
    spyOn(SearchRecipesComponent.prototype, 'listRecipes');
    // spyOn(SearchRecipesComponent.prototype, 'fetchCache');
    service = TestBed.inject(SearchRecipesComponent);
  });

  describe('General Tests', function() {
  /**
   * Initializes Test Bed and test component
   */
    beforeEach(async () => {
      fixture = TestBed.createComponent(SearchRecipesComponent);
      component = fixture.componentInstance;
      component.fuseResults = mockRecipes;
      fixture.whenStable().then(() => {
        // after something in the component changes, you should detect changes
        fixture.detectChanges();

        // everything else in the beforeEach needs to be done here.
        component.setCache(mockRecipes);
      });
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

  describe('Dialog on Meal Plan Page', function() {
    /**
   * Initializes Test Bed and test component
   */
    beforeEach(async () => {
      fixture = TestBed.createComponent(SearchRecipesComponent);
      component = fixture.componentInstance;
      component.fuseResults = mockRecipes;
      component.data.embeddedPage = 'mealPlan';
      fixture.whenStable().then(() => {
        // after something in the component changes, you should detect changes
        fixture.detectChanges();

        // everything else in the beforeEach needs to be done here.
        debugSelectMeal = fixture.debugElement.queryAll(By.css('button[name=\'SelectRecipe\']'));
        debugShowRecipe = fixture.debugElement.queryAll(By.css('button[name=\'ShowRecipe\']'));
        component.setCache(mockRecipes);
      });
    });

    it('should show Select Recipe button', function() {
      expect(debugSelectMeal.length).toBeGreaterThan(0);
    });

    it('should not have Show Recipe button', function() {
      expect(debugShowRecipe.length).toBe(0);
    });

    /**
   * Test to ensure search-recipes dialog closes when Select Meal button is pressed
   * Uses the fakeAsync function wrapper to allow for the use of the tick function
   */
    it('dialog should close on Close', fakeAsync( () => {
    // Creats a spy on the selectMealDialogClose function
      spyOn(component, 'selectMealDialogClose');
      // Gets the native html element of the first item in the debugSelectMeal array and runs a click event on it
      debugSelectMeal[0].nativeElement.click();
      // Detects changes to the fixture
      fixture.detectChanges();
      // Fakes async activity to all changes to occur
      tick();
      // Looks at selectMealDialogClose spy and expects that the function has been run
      expect(component.selectMealDialogClose).toHaveBeenCalled();
    }));
  });

  describe('Embedded on Recipe Page', function() {
    /**
   * Initializes Test Bed and test component
   */
    beforeEach(async () => {
      fixture = TestBed.createComponent(SearchRecipesComponent);
      component = fixture.componentInstance;
      component.fuseResults = mockRecipes;
      component.data.embeddedPage = 'recipe';
      fixture.whenStable().then(() => {
      // after something in the component changes, you should detect changes
        fixture.detectChanges();

        // everything else in the beforeEach needs to be done here.
        debugSelectMeal = fixture.debugElement.queryAll(By.css('button[name=\'SelectRecipe\']'));
        debugShowRecipe = fixture.debugElement.queryAll(By.css('button[name=\'ShowRecipe\']'));
        component.setCache(mockRecipes);
      });
    });

    it('should not have Select Recipe button', function() {
      expect(debugSelectMeal.length).toBe(0);
    });

    it('should have Show Recipe button', function() {
      expect(debugShowRecipe.length).toBeGreaterThan(0);
    });
    it(`delete a recipe`, () => {
      spyOn(component, 'deleteDoc');
      spyOn(component, 'tempSplice');
      spyOn(component, 'setLocalStorageDelete');
      spyOn(component, 'askConfirm').and.returnValue(true);

      component.deleteRecipe({'servings': 96608, 'uid': '10GYtAA7wQcGnO7KrNJn', 'recipeName': 'Islands Salad Optimization', 'calories': 57203, 'id': '10GYtAA7wQcGnO7KrNJn'});

      expect(component.askConfirm).toHaveBeenCalled();
      expect(component.deleteDoc).toHaveBeenCalled();
      expect(component.tempSplice).toHaveBeenCalled();
      expect(component.setLocalStorageDelete).toHaveBeenCalled();
    });
  });
});
