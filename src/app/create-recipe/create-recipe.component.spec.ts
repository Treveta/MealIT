import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../services/auth.service';
import {ModalService} from '../modal-functionality';
import {DatabaseHelperComponent} from 'app/database-helper/database-helper.component';
import {SearchRecipesComponent} from '../search-recipes/search-recipes.component';
import {FormsModule} from '@angular/forms';
import {CreateRecipeComponent} from './create-recipe.component';

describe('CreateRecipeComponent', () => {
  let component: CreateRecipeComponent;
  let fixture: ComponentFixture<CreateRecipeComponent>;

  beforeEach(() => {
    const angularFirestoreStub = () => ({
      collection: (arg) => ({add: () => ({})}),
    });
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    const modalServiceStub = () => ({open: (id) => ({}), close: (id) => ({})});
    const databaseHelperComponentStub = () => ({
      deleteDocWhere: (arg, query) => ({}),
    });
    const searchRecipesComponentStub = () => ({
      fetchCache: () => ({}),
      searchService: (searchTerm) => ({}),
    });
    TestBed.configureTestingModule({
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [CreateRecipeComponent],
      providers: [
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: AuthService, useFactory: authServiceStub},
        {provide: ModalService, useFactory: modalServiceStub},
        {
          provide: DatabaseHelperComponent,
          useFactory: databaseHelperComponentStub,
        },
        {
          provide: SearchRecipesComponent,
          useFactory: searchRecipesComponentStub,
        },
      ],
    });
    fixture = TestBed.createComponent(CreateRecipeComponent);
    component = fixture.componentInstance;
  });

  /**
   * Check the compoment works
   */
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Check the ingredents have a value
   */
  it(`Ingredients has default value`, () => {
    expect(component.Ingredients).toEqual([]);
  });

  /**
   * Check the amounts have a value
   */
  it(`amount has default value`, () => {
    expect(component.amount).toEqual([]);
  });

  /**
   * Check the units have a value
   */
  it(`units has default value`, () => {
    expect(component.units).toEqual([]);
  });

  /**
   * Add ingredients, units, and amount to a list
   */
  it('add something to a list', () => {
    // Test variables
    component.newIngredient = 'corn';
    component.newUnit = 'kg';
    component.newAmount = 100;

    // Check variables
    const ingredient = 'corn';
    const unit = 'kg';
    const amount = 100;

    // Spys for the push functions
    spyOn(component.Ingredients, 'push');

    // Run the function
    component.addToList();

    // Checking the results
    expect(component.Ingredients.push).toHaveBeenCalledWith({ingredientName: ingredient, quantity: amount, unit: unit});
    expect(component.newIngredient).toBe('');
    expect(component.newUnit).toBe('');
    expect(component.newAmount).toBe('');
  });

  /**
   * Remove ingredients, units, and amounts from a list
   */
  it('remove from a list', () => {
    // Check variable
    const index = 0;

    // Spys for the splice functions
    spyOn(component.Ingredients, 'splice');
    spyOn(component.amount, 'splice');
    spyOn(component.units, 'splice');

    // Run the function
    component.deleteIngredient(index);

    // Check the results
    expect(component.Ingredients.splice).toHaveBeenCalledWith(index, 1);
    expect(component.amount.splice).toHaveBeenCalledWith(index, 1);
    expect(component.units.splice).toHaveBeenCalledWith(index, 1);
  });

  /**
   * Check the submit recipe function in case of a failure
   */
  it(`submit a reciepe: failure`, () => {
    // Spys for the windows alert
    spyOn(window, 'alert');
    // Run the function
    component.submitRecipe();
    // Check the results
    expect(window.alert).toHaveBeenCalledWith('Please fill in all fields and have at least one ingredient');
  });

  /**
   * Check the submit recipe works properly
   */
  it(`submit a recipe`, async () => {
    // Test variables
    component.Ingredients.length = 1;
    component.servings = '2 people';
    component.calories = '300 cl';
    component.recipeName = 'Fruit Salad';

    // Spy on the break out functions
    spyOn(component, 'docAndUpdate');
    spyOn(component, 'setLocalStorage');
    spyOn(component, 'addDocumentRC');
    spyOn(component, 'searchUpdate');

    // Run the async functions
    await component.submitRecipe();

    // Check the results
    expect(component.docAndUpdate).toHaveBeenCalled();
    expect(component.setLocalStorage).toHaveBeenCalled();
    expect(component.searchUpdate).toHaveBeenCalled();
    expect(component.Ingredients).toEqual([]);
    expect(component.amount).toEqual([]);
    expect(component.units).toEqual([]);
    expect(component.servings).toBe('');
    expect(component.calories).toBe('');
    expect(component.recipeName).toBe('');
  });

  /**
   * Check the modal is opened
   */
  it('Open a modal', () => {
    // Spy on the modal services open method
    spyOn(component.modalService, 'open');
    // The test id
    const id: string = '1234abcd';

    component.openModal(id);

    // Check the modal service open method was called with id
    expect(component.modalService.open).toHaveBeenCalledWith(id);
  });

  /**
   * Check the modal is closed
   */
  it('Close a modal', () => {
    // Spy on the modal service close method
    spyOn(component.modalService, 'close');
    // The test id
    const id: string = '1234abcd';

    component.closeModal(id);

    // Check the modal service close method was called with id
    expect(component.modalService.close).toHaveBeenCalledWith(id);
  });

  /**
   * Check that a selected meal is put into the debug log
   */
  it('Log the selected meal', () => {
    // Spy on the colsole's log method
    spyOn(console, 'log');

    component.logResults();

    // Check the console's log method was called with meal
    expect(console.log).toHaveBeenCalled();
  });

  /**
   * Check a recipe is deleted
   */
  it(`delete a recipe`, () => {
    // Spys for the breakout functions
    spyOn(component, 'deleteDoc');
    spyOn(component, 'tempSplice');
    spyOn(component, 'setLocalStorageDelete');
    spyOn(component, 'askConfirm').and.returnValue(true);

    // Run the function
    component.deleteRecipe({'servings': 96608, 'uid': '10GYtAA7wQcGnO7KrNJn', 'recipeName': 'Islands Salad Optimization', 'calories': 57203, 'id': '10GYtAA7wQcGnO7KrNJn'});

    // Check the results
    expect(component.askConfirm).toHaveBeenCalled();
    expect(component.deleteDoc).toHaveBeenCalled();
    expect(component.tempSplice).toHaveBeenCalled();
    expect(component.setLocalStorageDelete).toHaveBeenCalled();
  });
});
