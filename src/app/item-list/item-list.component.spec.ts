/* eslint-disable no-unused-vars */
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {ModalService} from '../modal-functionality';
import {AuthService} from '../services/auth.service';
import {CdkDragDrop, DragDropModule} from '@angular/cdk/drag-drop';
import {Platform} from '@angular/cdk/platform';
import {ItemListComponent} from './item-list.component';
import {MaterialModule} from 'app/material-module/material-module.module';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatCheckboxHarness} from '@angular/material/checkbox/testing';
import {ShoppinglistEditService} from 'app/services/shoppinglist-edit.service';

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
      itemName: 'Blueberry',
      quantity: 5,
      unit: 'lb',
    },
    {
      isComplete: false,
      itemName: 'Steak',
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

  const mockSortedListProvider = [
    ({isComplete: false, itemName: 'Apples', quantity: 3, unit: 'oz'}),
    ({isComplete: false, itemName: 'Blueberry', quantity: 5, unit: 'lb'}),
    ({isComplete: false, itemName: 'Steak', quantity: 2, unit: 'ct'}),
    ({isComplete: false, itemName: 'ApplesbutBetter', quantity: 4, unit: 'oz'}),
  ];
  let debugCompletionCheck;
  let debugOnChangeCheck;


  beforeEach(() => {
    const formBuilderStub = () => ({

      group: (object) => ({}),

      array: (array) => ({}),

    });

    const angularFirestoreStub = () => ({collection: (arg) => ({})});

    const modalServiceStub = () => ({open: (id) => ({}), close: (id) => ({})});

    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});

    const platformStub = () => ({});

    const shopListStub = () => ({addToShoppingList: (proposedIngredient, proposedQuantity, proposedUnit) => ({})});

    TestBed.configureTestingModule({

      schemas: [NO_ERRORS_SCHEMA],

      declarations: [ItemListComponent],

      providers: [

        {provide: FormBuilder, useFactory: formBuilderStub},

        {provide: AngularFirestore, useFactory: angularFirestoreStub},

        {provide: ModalService, useFactory: modalServiceStub},

        {provide: AuthService, useFactory: authServiceStub},

        {provide: Platform, useFactory: platformStub},

        {provide: ShoppinglistEditService, useFactory: shopListStub},


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
      debugOnChangeCheck = fixture.nativeElement.querySelector('mat-checkbox[name=\"completionCheck\"]');
    });
  });
  describe('Initial Tests', () => {
    beforeEach(() => {

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
  });


  describe('Material Tests', () => {
    beforeEach(() => {

    });
    /**
    * Tests that the mat checkbox will initialize and show up on the page
    */
    it('mat checkBox should appear on the page', async () => {
      const checkbox = await loader.getHarness(MatCheckboxHarness.with({name: 'completionCheck'}));
      expect(checkbox).toBeTruthy();
    });
    /**
    * Tests that the material checkbox should call completionToggle upon change
    */
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

  describe('completionAll tests', () => {
  /**
   * Tests that completionToggle can change an item isComplete boolean opposite to what it was and
   * calls updateDocument
   */
    it('completionToggle successfully edits an items boolean and calls updateDocument', () => {
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
      // delcaring a spy to check that updateDocument is called
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
  });

  describe('completionAll and storage tests', () => {
    /**
     * Tests that all items on a list are set to complete
     */
    it(`set all items to complete`, () => {
      const itemList = [
        {
          isComplete: false,
          itemName: 'Apples',
          quantity: 5,
          unit: 'oz',
        },
        {
          isComplete: false,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
        },
        {
          isComplete: false,
          itemName: 'Steak',
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
      component.sortedList = itemList;

      spyOn(component, 'updateDocument');

      component.completionAll();

      for (let i = 0; i < component.sortedList.length; i++) {
        expect(component.sortedList[i].isComplete).toEqual(true);
      }
      expect(component.updateDocument).toHaveBeenCalled();
    });

    /**
    * Tests that screenWidth gets initialized
    */
    it(`Send complete items to food storage`, () => {
      // set test item list
      const itemList = [
        {
          isComplete: true,
          itemName: 'Apples',
          quantity: 5,
          unit: 'oz',
        },
        {
          isComplete: true,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
        },
        {
          isComplete: true,
          itemName: 'Steak',
          quantity: 2,
          unit: 'ct',
        },
        {
          isComplete: true,
          itemName: 'ApplesbutBetter',
          quantity: 4,
          unit: 'oz',
        },
      ];
      // set the sortedlist to the item list
      component.sortedList = itemList;
      // initalize the sortedStorageList
      component.sortedStorageList = [];

      // set the spys
      spyOn(component.sortedStorageList, 'push');
      spyOn(component.sortedList, 'splice');
      spyOn(component, 'updateStorageDocument');
      spyOn(component, 'updateDocument');

      // call the function
      component.toStorage();

      // test the functions are called
      for (let i = 0; i < component.sortedList.length; i++) {
        expect(component.sortedStorageList.push).toHaveBeenCalled();
        expect(component.sortedList.splice).toHaveBeenCalled();
      }
      expect(component.updateStorageDocument).toHaveBeenCalled();
      expect(component.updateDocument).toHaveBeenCalled();
    });
  });


  describe('addToItemList Tests', () => {
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
        itemName: 'Blueberry',
        quantity: 5,
        unit: 'lb',
      },
      {
        isComplete: false,
        itemName: 'Steak',
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

    beforeEach(() => {
      component.sortedList=mockSortedList;
      component.shopList.sortedList=mockSortedList;
      component.newItem='';
      component.newQuantity ='';
      component.newUnit = '';
    });
    /**
    * Tests that addToItemList doesn't call addToShoppingList when the class variables are empty
    * @function updateDocument and @function consolidateQuantity are not called
    */
    it('addToItemList should do nothing when class variables are empty', async () => {
      spyOn(component.shopList, 'addToShoppingList');
      expect(component.shopList.addToShoppingList).not.toHaveBeenCalled();
    });
    /**
    * Tests that addToItemList adds an item to the list when it should
    */
    it('addToItemList should add an item to the list', async () => {
    // initializing an item to test mocks to compare
      component.newItem='Peaches';
      component.newQuantity = 4;
      component.newUnit = 'ct';
      // initializing a control array to test with and setting sortedList to it
      const mockSortedList1 = [
        {
          isComplete: false,
          itemName: 'Apples',
          quantity: 3,
          unit: 'oz',
        },
        {
          isComplete: false,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
        },
        {
          isComplete: false,
          itemName: 'Steak',
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
      component.sortedList=mockSortedList1;
      component.shopList.sortedList=mockSortedList1;
      // initializing a mock updated list to compare to
      const updatedList = [
        {
          isComplete: false,
          itemName: 'Apples',
          quantity: 3,
          unit: 'oz',
        },
        {
          isComplete: false,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
        },
        {
          isComplete: false,
          itemName: 'Steak',
          quantity: 2,
          unit: 'ct',
        },
        {
          isComplete: false,
          itemName: 'ApplesbutBetter',
          quantity: 4,
          unit: 'oz',
        },
        {
          isComplete: false,
          itemName: 'Peaches',
          quantity: 4,
          unit: 'ct',
        },
      ];
      // declaring a spy on addToShoppingList
      spyOn(component.shopList, 'addToShoppingList');
      expect(component.sortedList).toEqual(mockSortedList1);
      await component.addToItemList();
      // expect the list to equal the updated list
      // console.log(component.sortedList);
      expect(component.shopList.updateDocument).toHaveBeenCalled;
      expect(component.sortedList).toEqual(updatedList);
      // expecting the class variables to be reset to empty
      expect(component.newItem).toEqual('');
      expect(component.newQuantity).toEqual('');
      expect(component.newUnit).toEqual('');
    });
    /**
    * Tests that addToItemList adds doesn't add an item, but does consolidate it successfuly
    * @function updateDocument and @function consolidateQuantity are called
    */
    it('addToItemList should not add an item to the list, but should update it', async () => {
    // initializing an item to test mocks to compare
      component.newItem='Apples';
      component.newQuantity = 2;
      component.newUnit = 'oz';
      // initializing a control array to test with and setting sortedList to it
      const mockSortedList2 = [
        {
          isComplete: false,
          itemName: 'Apples',
          quantity: 3,
          unit: 'oz',
        },
        {
          isComplete: false,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
        },
        {
          isComplete: false,
          itemName: 'Steak',
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
      component.sortedList=mockSortedList2;
      component.shopList.sortedList=mockSortedList2;
      const updatedList = [
        {
          isComplete: false,
          itemName: 'Apples',
          quantity: 5,
          unit: 'oz',
        },
        {
          isComplete: false,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
        },
        {
          isComplete: false,
          itemName: 'Steak',
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
      // spyOn(component, 'shopList.sortedList').andCallThrough();
      expect(component.sortedList).toEqual(mockSortedList2);

      await component.addToItemList();
      // console.log(component.sortedList);
      expect(component.shopList.updateDocument).toHaveBeenCalled;
      // expect the list to equal the updated list
      expect(component.sortedList).toEqual(updatedList);
      // expecting the class variables to be reset to empty
      expect(component.newItem).toEqual('');
      expect(component.newQuantity).toEqual('');
      expect(component.newUnit).toEqual('');
    });


    describe('item Removal Tests', () => {
    /**
    * Tests that onCheckBoxChange successfully removes a designated item from sortedlList
    */
      it('onCheckBoxChange successfully removes an item from sortedList', () => {
        const noItemList = [
          {
            isComplete: false,
            itemName: 'Blueberry',
            quantity: 5,
            unit: 'lb',
          },
          {
            isComplete: false,
            itemName: 'Steak',
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
        // delcaring a spy to check that updateDocument is called
        spyOn(component, 'updateDocument');
        expect(component.sortedList).toEqual(mockSortedList);
        component.onCheckBoxChange(component.sortedList[0]);
        expect(component.sortedList).toEqual(noItemList);
        expect(component.updateDocument).toHaveBeenCalled();
      });

      /**
    * Tests that the mat checkbox will initialize and show up on the page
    */
      it('mat checkBox should appear on the page', async () => {
        const checkbox = await loader.getHarness(MatCheckboxHarness.with({name: 'checkboxChange'}));
        expect(checkbox).toBeTruthy();
      });
      /**
    * Tests that the material checkbox should call onCheckBoxChange upon change
    */
      it('mat checkBox should call call completionToggle on change', async () => {
        spyOn(component, 'onCheckBoxChange');
        console.log(debugOnChangeCheck);
        const checkbox = await loader.getHarness(MatCheckboxHarness.with({name: 'checkboxChange'}));
        console.log(checkbox);
        expect(await checkbox.isChecked()).toBe(false);
        await checkbox.check();
        expect(await checkbox.isChecked()).toBe(true);
        expect(await checkbox.getName()).toBe('checkboxChange');
        expect(component.onCheckBoxChange).toHaveBeenCalled();
      });
    });
  });
});
