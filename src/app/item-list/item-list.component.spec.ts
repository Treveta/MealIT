/* eslint-disable require-jsdoc */
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {ModalService} from '../modal-functionality';
import {AuthService} from '../services/auth.service';
// import {CdkDragDrop} from '@angular/cdk/drag-drop'; //not testing this
import {Platform} from '@angular/cdk/platform';
import {ItemListComponent} from './item-list.component';


describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;

  beforeEach(() => {
    const formBuilderStub = () => ({
      group: (object) => ({}),
      array: (array) => ({}),
    });
    const angularFirestoreStub = () => ({collection: (arg) => ({})});
    const modalServiceStub = () => ({open: (id) => ({}), close: (id) => ({})});
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    const platformStub = () => ({ANDROID: {}, IOS: {}});

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ItemListComponent],
      providers: [
        {provide: FormBuilder, useFactory: formBuilderStub},
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: ModalService, useFactory: modalServiceStub},
        {provide: AuthService, useFactory: authServiceStub},
        {provide: Platform, useFactory: platformStub},
      ],
    });
    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
  });

  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

  it(`displayedColumns has default value`, () => {
    expect(component.displayedColumns).toEqual([`name`, `quantity`, `unit`]);
  });

  it(`editToggle has default value`, () => {
    expect(component.editToggle).toEqual(false);
  });

  it(`isLarge has default value`, () => {
    expect(component.isLarge).toEqual(true);
  });

  it(`screenWidth has default value`, () => {
    expect(component.screenWidth).toEqual(window.innerWidth);
  });

  it(`unitGroups has default value`, () => {
    expect(component.unitGroups).toEqual([{
      name: 'US Units',
      unit: [
        {value: 'lb', viewValue: 'lb(s)'},
        {value: 'cup', viewValue: 'cup(s)'},
        {value: 'oz', viewValue: 'ounce(s)'},
        {value: 'tsp', viewValue: 'teaspoon(s)'},
        {value: 'tbsp', viewValue: 'tablespoon(s)'},
      ],
    },
    {
      name: 'Metric Units',
      unit: [
        {value: 'g', viewValue: 'gram(s)'},
        {value: 'mL', viewValue: 'milliliter(s)'},
        {value: 'L', viewValue: 'Liter(s)'},
      ],
    },
    {
      name: 'Other Units',
      unit: [
        {value: 'ct', viewValue: 'count(s)'},
        {value: 'pinch', viewValue: 'pinch(es)'},
      ],
    }]);
    // create a mock array
  });
  it('completionToggle successfully edits an items boolean', () => {
    const item = {
      isComplete: false,
      itemName: 'Apples',
      quantity: 3,
      unit: 'oz',
    };
    const itemt = {
      isComplete: true,
      itemName: 'Apples',
      quantity: 3,
      unit: 'oz',
    };
    class MockItemListComponent extends ItemListComponent {
      static completionToggle(item: any):void {
        item.isComplete=!item.isComplete;
      }
    }
    MockItemListComponent.completionToggle(item);
    expect(item.isComplete).toEqual(true);
    MockItemListComponent.completionToggle(item);
    expect(item.isComplete).toEqual(false);
    // what if it starts as true?
    MockItemListComponent.completionToggle(itemt);
    expect(itemt.isComplete).toEqual(false);
    MockItemListComponent.completionToggle(itemt);
    expect(itemt.isComplete).toEqual(true);
  });
});
