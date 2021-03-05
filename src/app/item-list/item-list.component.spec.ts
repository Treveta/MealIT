/* eslint-disable require-jsdoc */
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatCheckboxHarness} from '@angular/material/checkbox/testing';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MatSelectHarness} from '@angular/material/select/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {ModalService} from '../modal-functionality';
import {AuthService} from '../services/auth.service';
import {Platform} from '@angular/cdk/platform';
import {ItemListComponent} from './item-list.component';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {By} from '@angular/platform-browser';
import {MaterialModule} from 'app/material-module/material-module.module';


describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
  let loader: HarnessLoader;
  /**
   * Mock of sortedList, used by several functions in item-list.component.ts
   */
  const mockSortedList = [
    {
      isComplete: false,
      itemName: 'Apples',
      quantity: 3,
      unit: 'oz',
    },
    {
      isComplete: false,
      itemName: 'blueberry',
      quantity: 5,
      unit: 'lb',
    },
    {
      isComplete: false,
      itemName: 'steak',
      quantity: 2,
      unit: 'ct',
    },
    {
      isComplete: false,
      itemName: 'ApplesbutBetter',
      quantity: 4,
      unit: 'oz',
    },
  ];
  let debugCompletionCheck;
  let inputCompletionCheck;
  let labelCompletionCheck;

  beforeEach(() => {
    const formBuilderStub = () => ({
      group: (object) => ({}),
      array: (array) => ({}),
    });
    const angularFirestoreStub = () => ({
      collection: (collectionPath) => ({
        add: () => ({id: {}}),
        doc: () => ({update: () => ({})}),
        get: () => ({toPromise: () => ({forEach: () => ({})})}),
      }),
    });
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
        // {provide: NG_VALUE_ACCESSOR, useValue: {}},
      ],
      imports: [
        NoopAnimationsModule,
        MaterialModule,
        FormsModule,
        DragDropModule,
        ReactiveFormsModule,
      ],
    });
  });
  /**
   * Initializes Test Bed and test component
   */
  beforeEach(() => {
    fixture = TestBed.createComponent(ItemListComponent);
    component = fixture.componentInstance;
    component.sortedList=mockSortedList;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.whenStable().then(() => {
      // after something in the component changes, detects changes
      fixture.detectChanges();
      debugCompletionCheck = fixture.nativeElement.querySelector('mat-checkbox[name=\"completionCheck\"]');
    });
  });
  /**
   * Tests that the instance can load
   */
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
  /**
   * Tests that displayedColumns has correct default values
   */
  it(`displayedColumns has default value`, () => {
    expect(component.displayedColumns).toEqual([`name`, `quantity`, `unit`]);
  });
  /**
   * tests that editToggle starts as false
   */
  it(`editToggle has default value`, () => {
    expect(component.editToggle).toEqual(false);
  });
  /**
   * Tests that isLarge starts as either true or false (depending on the size of the karma window)
   */
  it(`isLarge has default value`, () => {
    expect(component.isLarge===true || component.isLarge===false).toEqual(true);
  });
  /**
   * Tests that screenWidth gets initialized
   */
  it(`screenWidth has default value`, () => {
    expect(component.screenWidth).toEqual(window.innerWidth);
  });
  /**
   * Tests that unitGroups has a default value as defined
   */
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
  });
  /**
   * Tests that completionToggle can change an item isComplete boolean opposite to what it was and
   * calls updateList
   */
  it('completionToggle successfully edits an items boolean and calls updateList', () => {
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
    const docName: string = 'List';
    const data: any = {Items: component.sortedList};
    // delcaring a spy to check that updateList is called
    spyOn(component, 'updateDocument');

    component.completionToggle(item);
    expect(item.isComplete).toEqual(true);
    expect(component.updateDocument).toHaveBeenCalledWith(docName, data );

    component.completionToggle(item);
    expect(item.isComplete).toEqual(false);
    expect(component.updateDocument).toHaveBeenCalledWith(docName, data );

    // what if it starts as true?

    component.completionToggle(itemt);
    expect(itemt.isComplete).toEqual(false);
    expect(component.updateDocument).toHaveBeenCalledWith(docName, data );

    component.completionToggle(itemt);
    expect(itemt.isComplete).toEqual(true);
    expect(component.updateDocument).toHaveBeenCalledWith(docName, data);
  });
  /**
   * Tests that onCheckBoxChange successfully removes a designated item from sortedlList
   */
  it('onCheckBoxChange successfully removes an item from sortedList', () => {
    const noItemList = [
      {
        isComplete: false,
        itemName: 'blueberry',
        quantity: 5,
        unit: 'lb',
      },
      {
        isComplete: false,
        itemName: 'steak',
        quantity: 2,
        unit: 'ct',
      },
      {
        isComplete: false,
        itemName: 'ApplesbutBetter',
        quantity: 4,
        unit: 'oz',
      },
    ];
    // delcaring a spy to check that updateList is called
    spyOn(component, 'updateDocument');

    component.onCheckBoxChange(component.sortedList[0]);
    expect(component.sortedList).toEqual(noItemList);
    expect(component.updateDocument).toHaveBeenCalled();
  });

  describe('Material Tests', () => {
    beforeEach(() => {

    });

    it('mat checkBox should appear on the page', async () => {
      const checkbox = await loader.getHarness(MatCheckboxHarness.with({name: 'completionCheck'}));
      expect(checkbox).toBeTruthy();
    });

    it('mat checkBox should call call completionToggle on change', async () => {
      spyOn(component, 'completionToggle');
      console.log(debugCompletionCheck);
      const checkbox = await loader.getHarness(MatCheckboxHarness.with({name: 'completionCheck'}));
      console.log(checkbox);
      expect(await checkbox.isChecked()).toBe(false);
      await checkbox.check();
      expect(await checkbox.isChecked()).toBe(true);
      expect(await checkbox.getName()).toBe('completionCheck');
      expect(component.completionToggle).toHaveBeenCalled();
    });
  });
});
