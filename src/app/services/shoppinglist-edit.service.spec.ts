import {TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from './auth.service';
import {ShoppinglistEditService} from './shoppinglist-edit.service';

describe('ShoppinglistEditService', () => {
  let service: ShoppinglistEditService;

  beforeEach(() => {
    const angularFirestoreStub = () => ({collection: (arg) => ({})});
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    TestBed.configureTestingModule({
      providers: [
        ShoppinglistEditService,
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: AuthService, useFactory: authServiceStub},
      ],
    });
    service = TestBed.inject(ShoppinglistEditService);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

  describe('addToShoppingList Tests', () => {
    /**
    * Mock of sortedList, used by several functions in item-list.service.ts
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
      service.sortedList=mockSortedList;
    });
    /**
    * Tests that addToShoppingList doesn't do anything when it's passed empty strings and that
    * @function updateDocument and @function consolidateQuantity are not called
    */
    it('addToShoppingList should do nothing when parameters are empty', async () => {
      expect(service.sortedList).toEqual(mockSortedList);
      const proposedIngredient='';
      const proposedQuantity='';
      const proposedUnit ='';
      // delcaring a spy to check if consolidateQuantity is called
      spyOn(service, 'consolidateQuantity').and.callThrough();
      // delcaring a spy to check that updateDocument is called
      spyOn(service, 'updateDocument');
      await service.addToShoppingList(proposedIngredient, proposedQuantity, proposedUnit, false);
      expect(service.consolidateQuantity).not.toHaveBeenCalled();
      expect(service.updateDocument).not.toHaveBeenCalled();
      // expect the list to equal the initial list and return false
      expect(service.sortedList).toEqual(mockSortedList);
    });
    /**
    * Tests that addToShoppingList adds an item to the list when it should and also that
    * @function updateDocument and @function consolidateQuantity are called
    */
    it('addToShoppingList should add an item to the list', async () => {
      // initializing an item to test mocks to compare
      const proposedIngredient='Peaches';
      const proposedQuantity = 4;
      const proposedUnit = 'ct';
      // initializing a control array to test with and setting sortedList to it
      const mockSortedList1 = [
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
      service.sortedList=mockSortedList1;
      // initializing a mock updated list to compare to
      const updatedList = [
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
        {
          isComplete: false,
          itemName: 'Peaches',
          quantity: 4,
          unit: 'ct',
          quantityReserved: 0,
        },
      ];
      expect(service.sortedList).toEqual(mockSortedList1);
      // delcaring a spy to check if consolidateQuantity is called
      spyOn(service, 'consolidateQuantity').and.callThrough();
      // delcaring a spy to check that updateDocument is called
      spyOn(service, 'updateDocument');
      // call the function
      await service.addToShoppingList(proposedIngredient, proposedQuantity, proposedUnit, false);
      expect(service.consolidateQuantity).toHaveBeenCalled();
      expect(service.updateDocument).toHaveBeenCalled();
      // expect the list to equal the updated list
      expect(service.sortedList).toEqual(updatedList);
    });
    /**
    * Tests that addToShoppingList adds an item to the list correctly when an item is from a service
    * @function updateDocument and @function consolidateQuantity are called
    */
    it('From a recipe, addToShoppingList should add an item to the list', async () => {
      // initializing an item to test mocks to compare
      const proposedIngredient='Peaches';
      const proposedQuantity = 4;
      const proposedUnit = 'ct';
      // initializing a control array to test with and setting sortedList to it
      const mockSortedList2 = [
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
      service.sortedList=mockSortedList2;
      // initializing a mock updated list to compare to
      const updatedList = [
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
        {
          isComplete: false,
          itemName: 'Peaches',
          quantity: 4,
          unit: 'ct',
          quantityReserved: 4,
        },
      ];
      expect(service.sortedList).toEqual(mockSortedList2);
      // delcaring a spy to check if consolidateQuantity is called
      spyOn(service, 'consolidateQuantity').and.callThrough();
      // delcaring a spy to check that updateDocument is called
      spyOn(service, 'updateDocument');
      // call the function
      await service.addToShoppingList(proposedIngredient, proposedQuantity, proposedUnit, true);
      expect(service.consolidateQuantity).toHaveBeenCalled();
      expect(service.updateDocument).toHaveBeenCalled();
      // expect the list to equal the updated list
      expect(service.sortedList).toEqual(updatedList);
    });
    /**
    * Tests that addToShoppingList adds doesn't add an item, but does consolidate it successfuly
    * @function updateDocument and @function consolidateQuantity are called
    */
    it('addToShoppingList should not add an item to the list, but should update it', async () => {
      // initializing an item to test mocks to compare
      const proposedIngredient ='Apples';
      const proposedQuantity = 2;
      const proposedUnit = 'oz';
      // initializing a control array to test with and setting sortedList to it
      const mockSortedList3 = [
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
      service.sortedList=mockSortedList3;
      const updatedList = [
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
      expect(service.sortedList).toEqual(mockSortedList3);
      // delcaring a spy to check if consolidateQuantity is called
      spyOn(service, 'consolidateQuantity').and.callThrough();
      // delcaring a spy to check that updateDocument is called
      spyOn(service, 'updateDocument');
      await service.addToShoppingList(proposedIngredient, proposedQuantity, proposedUnit, false);
      expect(service.consolidateQuantity).toHaveBeenCalled();
      expect(service.updateDocument).toHaveBeenCalled();
      // expect the list to equal the updated list and return false
      expect(service.sortedList).toEqual(updatedList);
    });
  });
  describe('Consolidation Tests', () => {
    /**
    * Mock of sortedList, used by several functions in item-list.service.ts
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
      service.sortedList=mockSortedList;
    });

    /**
      * Tests that sumQuantity successfully adds the quantity of two items
      */
    it('sumQuantity should add two items quantity values', () => {
      // Defining mock items to add, and one that is the expected result
      const itemExist = {
        isComplete: false,
        itemName: 'Apples',
        quantity: 3,
        unit: 'oz',
        quantityReserved: 1,
      };
      const itemProposed = {
        isComplete: false,
        itemName: 'Apples',
        quantity: 2,
        unit: 'oz',
        quantityReserved: 2,
      };
      const itemResult= {
        isComplete: false,
        itemName: 'Apples',
        quantity: 5,
        unit: 'oz',
        quantityReserved: 3,
      };

      service.sumQuantity(itemExist, itemProposed);
      expect(itemExist).toEqual(itemResult);
    });
    /**
      * Tests that compareNameUnit will call sumQuantity when the Name and Unit values match exactly
      */
    it('compareNameUnit should call sumQuantity on exact matching values', () => {
      // Defining mock items to compare
      const itemExist = {
        isComplete: false,
        itemName: 'Apples',
        quantity: 3,
        unit: 'oz',
        quantityReserved: 0,
      };
      const itemProposed = {
        isComplete: false,
        itemName: 'Apples',
        quantity: 2,
        unit: 'oz',
        quantityReserved: 0,
      };

      // delcaring a spy to check that sumQuantity is called
      spyOn(service, 'sumQuantity');
      service.compareNameUnit(itemExist, itemProposed);
      expect(service.sumQuantity).toHaveBeenCalledWith(itemExist, itemProposed);
      // also, we are expecting this successful match to return true
      expect(service.compareNameUnit(itemExist, itemProposed)).toEqual(true);
    });
    /**
      * Tests that compareNameUnit will call sumQuantity when the Name and Unit values match but not exactly
      */
    it('compareNameUnit should call sumQuantity on inexact matching values', () => {
      // Defining mock items to compare
      const itemExist = {
        isComplete: false,
        itemName: 'Apples ',
        quantity: 3,
        unit: 'oz',
        quantityReserved: 0,
      };
      const itemProposed = {
        isComplete: false,
        itemName: ' apples',
        quantity: 2,
        unit: 'oz',
        quantityReserved: 0,
      };

      // delcaring a spy to check that sumQuantity is called
      spyOn(service, 'sumQuantity');
      service.compareNameUnit(itemExist, itemProposed);
      expect(service.sumQuantity).toHaveBeenCalledWith(itemExist, itemProposed);
      // also, we are expecting this successful match to return true
      expect(service.compareNameUnit(itemExist, itemProposed)).toEqual(true);
    });
    /**
      * Tests that compareNameUnit will not call sumQuantity when neither the Name nor Unit values match at all
      */
    it('compareNameUnit should not call sumQuantity on completely mismatching values', () => {
      // Defining mock items to compare
      const itemExist = {
        isComplete: false,
        itemName: 'Apples ',
        quantity: 3,
        unit: 'oz',
        quantityReserved: 0,
      };
      const itemProposed = {
        isComplete: false,
        itemName: 'Oranges',
        quantity: 2,
        unit: 'tsp',
        quantityReserved: 0,
      };

      // delcaring a spy to check if sumQuantity is called
      spyOn(service, 'sumQuantity');
      service.compareNameUnit(itemExist, itemProposed);
      expect(service.sumQuantity).not.toHaveBeenCalled();
      // also, we are expecting this failed match to return false
      expect(service.compareNameUnit(itemExist, itemProposed)).toEqual(false);
    });
    /**
      * Tests that compareNameUnit will not call sumQuantity when the Name matches, but the Unit values don't
      */
    it('compareNameUnit should not call sumQuantity when the unit does not match', () => {
      // Defining mock items to compare
      const itemExist = {
        isComplete: false,
        itemName: 'Apples ',
        quantity: 3,
        unit: 'oz',
        quantityReserved: 0,
      };
      const itemProposed = {
        isComplete: false,
        itemName: 'Apples',
        quantity: 2,
        unit: 'tsp',
        quantityReserved: 0,
      };

      // delcaring a spy to check if sumQuantity is called
      spyOn(service, 'sumQuantity');
      service.compareNameUnit(itemExist, itemProposed);
      expect(service.sumQuantity).not.toHaveBeenCalled();
      // also, we are expecting this failed match to return false
      expect(service.compareNameUnit(itemExist, itemProposed)).toEqual(false);
    });
    /**
      * Tests that compareNameUnit will not call sumQuantity when the Unit matches, but the Name values don't
      */
    it('compareNameUnit should not call sumQuantity when the name does not match', () => {
      // Defining mock items to compare
      const itemExist = {
        isComplete: false,
        itemName: 'Apples ',
        quantity: 3,
        unit: 'oz',
        quantityReserved: 0,
      };
      const itemProposed = {
        isComplete: false,
        itemName: 'Oranges',
        quantity: 2,
        unit: 'oz',
        quantityReserved: 0,
      };

      // delcaring a spy to check if sumQuantity is called
      spyOn(service, 'sumQuantity');
      service.compareNameUnit(itemExist, itemProposed);
      expect(service.sumQuantity).not.toHaveBeenCalled();
      // also, we are expecting this failed match to return false
      expect(service.compareNameUnit(itemExist, itemProposed)).toEqual(false);
    });

    /**
       * Tests that consolidateQuantity will call the correct helper functions when it finds a match
       * We also want to check that it updates sortedList and returns true
       */
    it('consolidateQuantity should call compareNameUnit and then updateDocument on a succesful match', () => {
      // Defining mocks to compare
      const itemProposed = {
        isComplete: false,
        itemName: 'Apples',
        quantity: 2,
        unit: 'oz',
        quantityReserved: 2,
      };
      const updatedList = [
        {
          isComplete: false,
          itemName: 'Apples',
          quantity: 5,
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
      expect(service.sortedList).toEqual(mockSortedList);
      // delcaring a spy to check if compareNameUnit is called
      spyOn(service, 'compareNameUnit').and.callThrough();
      // delcaring a spy to check that updateDocument is called
      spyOn(service, 'updateDocument');
      service.consolidateQuantity(itemProposed);
      expect(service.compareNameUnit).toHaveBeenCalled();
      expect(service.updateDocument).toHaveBeenCalled();
      // expect the list to equal the updated list and return true
      expect(service.sortedList).toEqual(updatedList);
      expect(service.consolidateQuantity(itemProposed)).toEqual(true);
    });

    /**
       * Tests that consolidateQuantity will call compareNameUnit but not call updateDocument when there is no match
       * We also want to check that it doesn't touch the list and returns false
       */
    it('consolidateQuantity should call compareNameUnit and return false when no matches are found', () => {
      // Defining mocks to compare
      const itemProposed = {
        isComplete: false,
        itemName: 'Funnel Cakes',
        quantity: 2,
        unit: 'L',
        quantityReserved: 0,
      };

      expect(service.sortedList).toEqual(mockSortedList);
      // delcaring a spy to check if compareNameUnit is called
      spyOn(service, 'compareNameUnit').and.callThrough();
      // delcaring a spy to check that updateDocument is called
      spyOn(service, 'updateDocument');
      service.consolidateQuantity(itemProposed);
      expect(service.compareNameUnit).toHaveBeenCalled();
      expect(service.updateDocument).not.toHaveBeenCalled();
      // expect the list to equal the initial list and return false
      expect(service.sortedList).toEqual(mockSortedList);
      expect(service.consolidateQuantity(itemProposed)).toEqual(false);
    });
  });
});
