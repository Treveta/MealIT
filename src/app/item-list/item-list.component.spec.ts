/* eslint-disable require-jsdoc */
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {ModalService} from '../modal-functionality';
import {AuthService} from '../services/auth.service';
import {Platform} from '@angular/cdk/platform';
import {ItemListComponent} from './item-list.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {By} from '@angular/platform-browser';


describe('ItemListComponent', () => {
  let component: ItemListComponent;
  let fixture: ComponentFixture<ItemListComponent>;
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
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatCheckboxModule,
        MatButtonModule,
        MatChipsModule,
        DragDropModule,
        MatIconModule,
        ReactiveFormsModule,
        MatSelectModule,
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

    fixture.whenStable().then(() => {
      // after something in the component changes, detects changes
      fixture.detectChanges();
      debugCompletionCheck = fixture.debugElement.queryAll(By.css('mat-checkbox[name=\'completionCheck\']'));
      inputCompletionCheck = <HTMLInputElement>debugCompletionCheck[0].nativeElement.querySelector('input');
      labelCompletionCheck = <HTMLInputElement>debugCompletionCheck[0].nativeElement.querySelector('label');
    });
    console.log(labelCompletionCheck);
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


  it('mat checkBox should appear on the page', () => {
    expect(debugCompletionCheck.length).toBeGreaterThan(0);
  });

  it('mat checkBox should call call completionToggle on change', fakeAsync( () => {
 // TODO
  }));
});
