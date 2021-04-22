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
import {MatButtonHarness} from '@angular/material/button/testing';
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
      quantityReserved: 0,
    },
    {
      isComplete: false,
      itemName: 'Blueberry',
      quantity: 5,
      unit: 'lb',
      quantityReserved: 0,
    },
    {
      isComplete: false,
      itemName: 'Steak',
      quantity: 2,
      unit: 'ct',
      quantityReserved: 0,
    },
    {
      isComplete: false,
      itemName: 'ApplesbutBetter',
      quantity: 4,
      unit: 'oz',
      quantityReserved: 0,
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
  let debugOnClickCheck;


  beforeEach(() => {
    const formBuilderStub = () => ({

      group: (object) => ({}),

      array: (array) => ({}),

    });

    const angularFirestoreStub = () => ({collection: (arg) => ({})});

    const modalServiceStub = () => ({open: (id) => ({}), close: (id) => ({})});

    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});

    const platformStub = () => ({});

    const shopListStub = () => ({addToShoppingList: () =>({}), compareNameUnit: () =>({})});

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
      debugOnClickCheck = fixture.nativeElement.querySelector('mat-button[text=\"edit\"]');
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
        quantityReserved: 0,
      };
      const itemt = {
        isComplete: true,
        itemName: 'Apples',
        quantity: 3,
        unit: 'oz',
        quantityReserved: 0,
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
          quantityReserved: 0,
        },
        {
          isComplete: false,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
          quantityReserved: 0,
        },
        {
          isComplete: false,
          itemName: 'Steak',
          quantity: 2,
          unit: 'ct',
          quantityReserved: 0,
        },
        {
          isComplete: false,
          itemName: 'ApplesbutBetter',
          quantity: 4,
          unit: 'oz',
          quantityReserved: 0,
        },
      ];
      // Set up the item list for testing
      component.sortedList = itemList;

      // Set spies on the functions to check for
      spyOn(component, 'updateDocument');

      // Run the function being tested
      component.completionAll();

      // Check that the function worked properly
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
          quantityReserved: 0,
        },
        {
          isComplete: true,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
          quantityReserved: 0,
        },
        {
          isComplete: true,
          itemName: 'Steak',
          quantity: 2,
          unit: 'ct',
          quantityReserved: 0,
        },
        {
          isComplete: true,
          itemName: 'ApplesbutBetter',
          quantity: 4,
          unit: 'oz',
          quantityReserved: 0,
        },
      ];
      // set the sortedlist to the item list
      component.sortedList = itemList;
      // initalize the sortedStorageList
      component.sortedStorageList = [];

      // set the spys
      spyOn(component.sortedStorageList, 'push');
      spyOn(component.sortedList, 'splice').and.callThrough();
      spyOn(component, 'updateStorageDocument');
      spyOn(component, 'updateDocument');
      const timesCalled = component.sortedList.length;
      // call the function
      component.toStorage();
      // test the functions are called
      expect(component.sortedStorageList.push).toHaveBeenCalledTimes(timesCalled);
      expect(component.sortedList.splice).toHaveBeenCalledTimes(timesCalled);
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
        quantityReserved: 0,
      },
      {
        isComplete: false,
        itemName: 'Blueberry',
        quantity: 5,
        unit: 'lb',
        quantityReserved: 0,
      },
      {
        isComplete: false,
        itemName: 'Steak',
        quantity: 2,
        unit: 'ct',
        quantityReserved: 0,
      },
      {
        isComplete: false,
        itemName: 'ApplesbutBetter',
        quantity: 4,
        unit: 'oz',
        quantityReserved: 0,
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
    it('addToItemList should call addToShoppingList when it has valid class variables', async () => {
    // initializing an item to test mocks to compare
      component.newItem='Peaches';
      component.newQuantity = 4;
      component.newUnit = 'ct';
      // declaring a spy on addToShoppingList
      spyOn(component.shopList, 'addToShoppingList');
      await component.addToItemList();
      // console.log(component.sortedList);
      expect(component.shopList.addToShoppingList).toHaveBeenCalledWith('Peaches', 4, 'ct', false);
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
            quantityReserved: 0,
          },
          {
            isComplete: false,
            itemName: 'Steak',
            quantity: 2,
            unit: 'ct',
            quantityReserved: 0,
          },
          {
            isComplete: false,
            itemName: 'ApplesbutBetter',
            quantity: 4,
            unit: 'oz',
            quantityReserved: 0,
          },
        ];
        // delcaring a spy to check that updateDocument is called
        spyOn(component, 'updateDocument');
        // spy on confirm action
        spyOn(component, 'confirmAction').and.callFake(function() {
          return true;
        });

        expect(component.sortedList).toEqual(mockSortedList);
        component.onCheckBoxChange(component.sortedList[0]);
        expect(component.confirmAction).toHaveBeenCalled();
        expect(component.confirmAction).toHaveBeenCalled();
        expect(component.sortedList).toEqual(noItemList);
        expect(component.updateDocument).toHaveBeenCalled();
      });

      /**
      * Tests that the mat checkbox will initialize and show up on the page
      */
      it('check for confirmation', async () => {
        spyOn(component, 'confirmAction');
        component.confirmAction('Test Message');
        expect(component.confirmAction).toHaveBeenCalledWith('Test Message');
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
      it('mat checkBox should call call onCheckBoxChange on change', async () => {
        spyOn(component, 'onCheckBoxChange');
        spyOn(component, 'confirmAction').and.callFake(function() {
          return true;
        });
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
          quantityReserved: 0,
        },
        {
          isComplete: false,
          itemName: 'Blueberry',
          quantity: 5,
          unit: 'lb',
          quantityReserved: 0,
        },
        {
          isComplete: false,
          itemName: 'Steak',
          quantity: 2,
          unit: 'ct',
          quantityReserved: 0,
        },
        {
          isComplete: false,
          itemName: 'ApplesbutBetter',
          quantity: 4,
          unit: 'oz',
          quantityReserved: 0,
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
      it('addToItemList should call addToShoppingList when it has valid class variables', async () => {
        // initializing an item to test mocks to compare
        component.newItem='Peaches';
        component.newQuantity = 4;
        component.newUnit = 'ct';
        // declaring a spy on addToShoppingList
        spyOn(component.shopList, 'addToShoppingList');
        await component.addToItemList();
        // console.log(component.sortedList);
        expect(component.shopList.addToShoppingList).toHaveBeenCalledWith('Peaches', 4, 'ct', false);
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
              quantityReserved: 0,
            },
            {
              isComplete: false,
              itemName: 'Steak',
              quantity: 2,
              unit: 'ct',
              quantityReserved: 0,
            },
            {
              isComplete: false,
              itemName: 'ApplesbutBetter',
              quantity: 4,
              unit: 'oz',
              quantityReserved: 0,
            },
          ];
            // delcaring a spy to check that updateDocument is called
          spyOn(component, 'updateDocument');
          spyOn(component, 'confirmAction').and.callFake(function() {
            return true;
          });
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
        it('mat checkBox should call call onCheckBoxChange on change', async () => {
          spyOn(component, 'onCheckBoxChange');
          spyOn(component, 'confirmAction').and.callFake(function() {
            return true;
          });
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
      describe('food Storage Consolidation tests', () => {
      /**
      * Tests that addToStorage calls consolidateStorage
      */
        it('addToStorage should call consolidateStorage', () =>{
          const item = {
            isComplete: false,
            itemName: 'Apples',
            quantity: 3,
            unit: 'oz',
            quantityReserved: 0,
          };
          spyOn(component, 'consolidateStorage');
          component.addToStorage(item);
          expect(component.consolidateStorage).toHaveBeenCalled();
        });
        /**
      * Tests that the consolidateStorage is making the proper calls when true
      */
        it('consolidateStorage should call the service compareNameUnit when thats true, return true and call updateDocument ', () => {
        // Defining mocks to compare
          const itemProposed = {
            isComplete: false,
            itemName: 'Apples',
            quantity: 2,
            unit: 'oz',
            quantityReserved: 2,
          };
          component.sortedStorageList = mockSortedList;

          // delcaring a spy to check if compareNameUnit is called
          spyOn(component.shopList, 'compareNameUnit').and.returnValue(true);
          spyOn(component, 'updateDocument');
          component.consolidateStorage(itemProposed);
          expect(component.shopList.compareNameUnit).toHaveBeenCalled();
          expect(component.updateDocument).toHaveBeenCalled;
          // expect return true
          expect(component.consolidateStorage(itemProposed)).toEqual(true);
        });
        /**
      * Tests that the consolidateStorage is making the proper calls when false
      */
        it('consolidateStorage should call the service compareNameUnit when thats false, return false and dont call updateDocument ', () => {
        // Defining mocks to compare
          const itemProposed = {
            isComplete: false,
            itemName: 'Apples',
            quantity: 2,
            unit: 'oz',
            quantityReserved: 2,
          };
          component.sortedStorageList = mockSortedList;
          // delcaring a spy to check if compareNameUnit is called
          spyOn(component.shopList, 'compareNameUnit').and.returnValue(false);
          spyOn(component, 'updateDocument');
          component.consolidateStorage(itemProposed);
          expect(component.shopList.compareNameUnit).toHaveBeenCalled();
          expect(component.updateDocument).not.toHaveBeenCalled;
          // expect return true
          expect(component.consolidateStorage(itemProposed)).toEqual(false);
        });
      });
      describe('editQuantity Tests', () => {
        /**
        * Tests that setEditIndex can properly set the correct variable
        */
        it('setEditIndex should set indexEdit to the parameter', () =>{
          spyOn(component, 'setEditIndex').and.callThrough();
          component.setEditIndex(1);
          expect(component.indexEdit).toEqual(1);
        });
        /**
        * Tests that setQuantityEdit can properly set the correct variable to the appropriate value
        */
        it('setQuantityEdit should set quantityEdit to an ingredients quantity', () =>{
          const mockSortedListEditQuantityTest = [
            {
              isComplete: false,
              itemName: 'Apples',
              quantity: 3,
              unit: 'oz',
              quantityReserved: 2,
            },
            {
              isComplete: false,
              itemName: 'Blueberry',
              quantity: 5,
              unit: 'lb',
              quantityReserved: 0,
            },
          ];
          component.sortedList=mockSortedListEditQuantityTest;
          spyOn(component, 'setQuantityEdit').and.callThrough();
          component.setQuantityEdit(0);
          expect(component.quantityEdit).toEqual(3);
        });
        /**
        * Tests that the material buttons calls setQuantityEdit and setEditIndex on click
        */
        it('edit button should call call its two functions on click', async () => {
          spyOn(component, 'setQuantityEdit');
          spyOn(component, 'setEditIndex');
          const button = await loader.getHarness(MatButtonHarness.with({text: 'edit'}));
          await button.click();
          expect(await button.getText()).toBe('edit');
          expect(component.setQuantityEdit).toHaveBeenCalled();
          expect(component.setEditIndex).toHaveBeenCalled();
        });
        /**
        * Tests that confirmEdit successfully updates the list and makes expectedCalls
        */
        it('setQuantityEdit should set quantityEdit to an ingredients quantity', () =>{
          const mockSortedListConfirmTest = [
            {
              isComplete: false,
              itemName: 'Apples',
              quantity: 3,
              unit: 'oz',
              quantityReserved: 2,
            },
            {
              isComplete: false,
              itemName: 'Blueberry',
              quantity: 5,
              unit: 'lb',
              quantityReserved: 0,
            },
          ];
          const updatedConfirmTest = [
            {
              isComplete: false,
              itemName: 'Apples',
              quantity: 3,
              unit: 'oz',
              quantityReserved: 2,
            },
            {
              isComplete: false,
              itemName: 'Blueberry',
              quantity: 2,
              unit: 'lb',
              quantityReserved: 0,
            },
          ];
          component.sortedList=mockSortedListConfirmTest;
          component.quantityEdit =2;
          spyOn(component, 'setEditIndex');
          spyOn(component, 'confirmEdit').and.callThrough();
          spyOn(component, 'updateDocument');
          component.confirmEdit(1);
          expect(component.sortedList).toEqual(updatedConfirmTest);
          expect(component.updateDocument).toHaveBeenCalled();
          expect(component.setEditIndex).toHaveBeenCalled();
          expect(component.quantityEdit).toEqual(undefined);
          expect(component.indexEdit).toEqual(-1);
        });
      });
    });
  });
});
