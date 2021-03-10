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

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it(`Ingredients has default value`, () => {
    expect(component.Ingredients).toEqual([]);
  });

  it(`amount has default value`, () => {
    expect(component.amount).toEqual([]);
  });

  it(`units has default value`, () => {
    expect(component.units).toEqual([]);
  });

  it('add something to a list', () => {
    component.newIngredient = 'corn';
    component.newUnit = 'kg';
    component.newAmount = 100;

    const ingredient = 'corn';
    const unit = 'kg';
    const amount = 100;

    spyOn(component.Ingredients, 'push');
    spyOn(component.amount, 'push');
    spyOn(component.units, 'push');

    component.addToList();

    expect(component.Ingredients.push).toHaveBeenCalledWith(ingredient);
    expect(component.amount.push).toHaveBeenCalledWith(amount);
    expect(component.units.push).toHaveBeenCalledWith(unit);
    expect(component.newIngredient).toBe('');
    expect(component.newUnit).toBe('');
    expect(component.newAmount).toBe('');
  });

  it('remove from a list', () => {
    const index = 0;

    spyOn(component.Ingredients, 'splice');
    spyOn(component.amount, 'splice');
    spyOn(component.units, 'splice');

    component.deleteIngredient(index);

    expect(component.Ingredients.splice).toHaveBeenCalledWith(index, 1);
    expect(component.amount.splice).toHaveBeenCalledWith(index, 1);
    expect(component.units.splice).toHaveBeenCalledWith(index, 1);
  });

  it(`submit a reciepe: failure`, () => {
    spyOn(window, 'alert');
    component.submitRecipe();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all fields and have at least one ingredient');
  });

  it(`submit a recipe`, async () => {
    component.Ingredients.length = 1;

    component.servings = '2 people';

    component.calories = '300 cl';

    component.recipeName = 'Fruit Salad';

    spyOn(component, 'docAndUpdate');
    spyOn(component, 'setLocalStorage');
    spyOn(component, 'ingredientAdd');
    spyOn(component, 'addDocumentRC');

    await component.submitRecipe();

    expect(component.docAndUpdate).toHaveBeenCalled();
    expect(component.setLocalStorage).toHaveBeenCalled();
    expect(component.ingredientAdd).toHaveBeenCalled();
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
});
