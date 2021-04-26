import {TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../auth.service';
import {FoodstorageEditService} from '../foodstorage-edit.service';
import {ShoppinglistEditService} from '../shoppinglist-edit.service';
import {ArbiterService} from './arbiter.service';

describe('ArbiterService', () => {
  let service: ArbiterService;

  const mockStorageList = [
    {
      isComplete: false,
      itemName: 'Apple',
      quantity: 2,
      unit: 'lb',
      quantityReserved: 1,
    },
    {
      isComplete: false,
      itemName: 'Orange',
      quantity: 2,
      unit: 'lb',
      quantityReserved: 2,
    },
  ];

  const mockStorageList2 = [
    {
      isComplete: false,
      ingredientName: 'Apple',
      quantity: 2,
      unit: 'lb',
      quantityReserved: 1,
    },
    {
      isComplete: false,
      ingredientName: 'Orange',
      quantity: 2,
      unit: 'lb',
      quantityReserved: 2,
    },
  ];

  const mockIngredient = {
    isComplete: false,
    ingredientName: 'Apple',
    quantity: 2,
    unit: 'lb',
    quantityReserved: 1,
  };

  const mockIngredientStatus = {
    amountToAdd: 1,
    amountRequested: 2,
    currentUnreserved: 1,
    currentReserved: 2,
  };

  const mockIngredientStatusShopping = {
    amountToUnreserve: -1,
    amountToRemove: 2,
    currentUnreserved: 1,
    currentReserved: 2,
  };

  beforeEach(() => {
    const angularFirestoreStub = () => ({collection: (arg) => ({})});
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    const shoppinglistEditServiceStub = () => ({
      addToShoppingList: (itemName, amountToAdd, unit, arg) => ({}),
    });
    const FoodstorageEditServiceStub = () => ({
      editReserved: (currentUnreserved, currentReserved, ingredient) => ({}),
    });
    TestBed.configureTestingModule({
      providers: [
        ArbiterService,
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: AuthService, useFactory: authServiceStub},
        {
          provide: ShoppinglistEditService,
          useFactory: shoppinglistEditServiceStub,
        },
        {
          provide: FoodstorageEditService,
          useFactory: FoodstorageEditServiceStub,
        },
      ],
    });
    service = TestBed.inject(ArbiterService);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

  describe('determineStorage Tests', () => {
    it('Determines storage values correctly when not all reserved', async () => {
      spyOn(service, 'listStorage').and.returnValue(Promise.resolve(mockStorageList));
      spyOn(service, 'determineStorage').and.callThrough();
      let ingredientStatusToExpect;
      await service.determineStorage('Apple', 'lb', 2).then((ingredientStatus) => {
        ingredientStatusToExpect = ingredientStatus;
      });
      expect(service.determineStorage).toHaveBeenCalledWith('Apple', 'lb', 2);
      expect(ingredientStatusToExpect.amountToAdd).toBe(1);
      expect(ingredientStatusToExpect.amountRequested).toBe(2);
      expect(ingredientStatusToExpect.currentReserved).toBe(1);
      expect(ingredientStatusToExpect.currentUnreserved).toBe(1);
      expect(ingredientStatusToExpect.amountToAdd).not.toBe(2);
    });

    it('Determines storage values correctly when all reserved', async () => {
      spyOn(service, 'listStorage').and.returnValue(Promise.resolve(mockStorageList));
      spyOn(service, 'determineStorage').and.callThrough();
      let ingredientStatusToExpect;
      await service.determineStorage('Orange', 'lb', 3).then((ingredientStatus) => {
        ingredientStatusToExpect = ingredientStatus;
      });
      expect(service.determineStorage).toHaveBeenCalledWith('Orange', 'lb', 3);
      expect(ingredientStatusToExpect.amountToAdd).toBe(3);
      expect(ingredientStatusToExpect.amountRequested).toBe(3);
      expect(ingredientStatusToExpect.currentReserved).toBe(2);
      expect(ingredientStatusToExpect.currentUnreserved).toBe(0);
      expect(ingredientStatusToExpect.amountToAdd).not.toBe(1);
    });

    it('Determines storage values correctly when no item in list', async () => {
      spyOn(service, 'listStorage').and.returnValue(Promise.resolve(mockStorageList));
      spyOn(service, 'determineStorage').and.callThrough();
      let ingredientStatusToExpect;
      await service.determineStorage('Bananna', 'lb', 3).then((ingredientStatus) => {
        ingredientStatusToExpect = ingredientStatus;
      });
      expect(service.determineStorage).toHaveBeenCalledWith('Bananna', 'lb', 3);
      expect(ingredientStatusToExpect.amountToAdd).toBe(3);
      expect(ingredientStatusToExpect.amountRequested).toBe(3);
      expect(ingredientStatusToExpect.currentReserved).toBe(0);
      expect(ingredientStatusToExpect.currentUnreserved).toBe(0);
      expect(ingredientStatusToExpect.amountToAdd).not.toBe(1);
    });
  });

  describe('determineStorageShopping Tests', () => {
    it('Determines storage values correctly when not all reserved', async () => {
      spyOn(service, 'listItems').and.returnValue(Promise.resolve(mockStorageList));
      spyOn(service, 'determineStorageShopping').and.callThrough();
      let ingredientStatusToExpect;
      await service.determineStorageShopping('Apple', 'lb', -2).then((ingredientStatus) => {
        ingredientStatusToExpect = ingredientStatus;
      });
      expect(service.determineStorageShopping).toHaveBeenCalledWith('Apple', 'lb', -2);
      expect(ingredientStatusToExpect.amountToUnreserve).toBe(-1);
      expect(ingredientStatusToExpect.amountToRemove).toBe(-2);
      expect(ingredientStatusToExpect.currentReserved).toBe(1);
      expect(ingredientStatusToExpect.currentUnreserved).toBe(1);
      expect(ingredientStatusToExpect.amountToUnreserve).not.toBe(1);
    });

    it('Determines storage values correctly when all reserved', async () => {
      spyOn(service, 'listItems').and.returnValue(Promise.resolve(mockStorageList));
      spyOn(service, 'determineStorageShopping').and.callThrough();
      let ingredientStatusToExpect;
      await service.determineStorageShopping('Orange', 'lb', -3).then((ingredientStatus) => {
        ingredientStatusToExpect = ingredientStatus;
      });
      expect(service.determineStorageShopping).toHaveBeenCalledWith('Orange', 'lb', -3);
      expect(ingredientStatusToExpect.amountToUnreserve).toBe(-1);
      expect(ingredientStatusToExpect.amountToRemove).toBe(-3);
      expect(ingredientStatusToExpect.currentReserved).toBe(2);
      expect(ingredientStatusToExpect.currentUnreserved).toBe(0);
      expect(ingredientStatusToExpect.amountToUnreserve).not.toBe(1);
    });

    it('Determines storage values correctly when no item in list', async () => {
      spyOn(service, 'listItems').and.returnValue(Promise.resolve(mockStorageList));
      spyOn(service, 'determineStorageShopping').and.callThrough();
      let ingredientStatusToExpect;
      await service.determineStorageShopping('Bananna', 'lb', -3).then((ingredientStatus) => {
        ingredientStatusToExpect = ingredientStatus;
      });
      expect(service.determineStorageShopping).toHaveBeenCalledWith('Bananna', 'lb', -3);
      expect(ingredientStatusToExpect.amountToUnreserve).toBe(-3);
      expect(ingredientStatusToExpect.amountToRemove).toBe(-3);
      expect(ingredientStatusToExpect.currentReserved).toBe(0);
      expect(ingredientStatusToExpect.currentUnreserved).toBe(0);
      expect(ingredientStatusToExpect.amountToUnreserve).not.toBe(1);
    });
  });

  describe('addOrReserve Tests', () => {
    it('calls correctly when amountToAdd > 0 AND amountToAdd != amountRequested', () => {
      spyOn(service.shopList, 'addToShoppingList');
      spyOn(service.storageList, 'editReserved');
      service.addOrReserve(1, 2, 1, 2, mockIngredient);
      expect(service.shopList.addToShoppingList).toHaveBeenCalledOnceWith(mockIngredient.ingredientName, 1, mockIngredient.unit, true);
      expect(service.storageList.editReserved).toHaveBeenCalledOnceWith(1, 2, mockIngredient);
    });

    it('calls correctly when amountToAdd > 0 AND amountToAdd == amountRequested', () => {
      spyOn(service.shopList, 'addToShoppingList');
      spyOn(service.storageList, 'editReserved');
      service.addOrReserve(2, 2, 0, 2, mockIngredient);
      expect(service.shopList.addToShoppingList).toHaveBeenCalledOnceWith(mockIngredient.ingredientName, 2, mockIngredient.unit, true);
      expect(service.storageList.editReserved).not.toHaveBeenCalled();
    });

    it('calls correctly when amountToAdd <= 0', () => {
      spyOn(service.shopList, 'addToShoppingList');
      spyOn(service.storageList, 'editReserved');
      service.addOrReserve(0, 2, 2, 2, mockIngredient);
      expect(service.shopList.addToShoppingList).not.toHaveBeenCalled();
      expect(service.storageList.editReserved).toHaveBeenCalledOnceWith(2, 2, mockIngredient);
    });
  });

  describe('subtractOrUnreserve Tests', () => {
    it('calls correctly when amountToUnreserve < 0 AND amountToUnreserve != amountToRemove', () => {
      spyOn(service.shopList, 'addToShoppingList');
      spyOn(service.storageList, 'editReserved');
      service.subtractOrUnreserve(-1, -2, 1, 2, mockIngredient);
      expect(service.shopList.addToShoppingList).toHaveBeenCalledOnceWith(mockIngredient.ingredientName, -1, mockIngredient.unit, true);
      expect(service.storageList.editReserved).toHaveBeenCalledOnceWith(-1, 2, mockIngredient);
    });

    it('calls correctly when amountToAdd < 0 AND amountToAdd == amountRequested', () => {
      spyOn(service.shopList, 'addToShoppingList');
      spyOn(service.storageList, 'editReserved');
      service.subtractOrUnreserve(-2, -2, 0, 2, mockIngredient);
      expect(service.storageList.editReserved).toHaveBeenCalledOnceWith(-2, 2, mockIngredient);
      expect(service.shopList.addToShoppingList).not.toHaveBeenCalled();
    });

    it('calls correctly when amountToAdd >= 0', () => {
      spyOn(service.shopList, 'addToShoppingList');
      spyOn(service.storageList, 'editReserved');
      service.subtractOrUnreserve(0, -2, 2, 2, mockIngredient);
      expect(service.shopList.addToShoppingList).toHaveBeenCalledOnceWith(mockIngredient.ingredientName, -2, mockIngredient.unit, true);
      expect(service.storageList.editReserved).not.toHaveBeenCalled();
    });
  });

  describe('arbiter tests', () => {
    it('calls with correct values', async () => {
      spyOn(service, 'determineStorage').and.returnValue(Promise.resolve(mockIngredientStatus));
      spyOn(service, 'addOrReserve');
      service.arbiter(mockIngredient);
      await expect(service.determineStorage).toHaveBeenCalledOnceWith(mockIngredient.ingredientName, mockIngredient.unit, mockIngredient.quantity);
      expect(service.addOrReserve).toHaveBeenCalled();
    });
  });

  describe('reverse arbiter tests', () => {
    it('call correctly', async () => {
      spyOn(service, 'findRecipeIngredients').and.returnValue(Promise.resolve(mockStorageList2));
      spyOn(service, 'determineStorageShopping').and.returnValue(Promise.resolve(mockIngredientStatusShopping));
      spyOn(service, 'determineStorage').and.returnValue(Promise.resolve(mockIngredientStatus));
      spyOn(service, 'subtractOrUnreserve');
      service.reverseArbiter('1234');
      await expect(service.findRecipeIngredients).toHaveBeenCalled();
      await expect(service.determineStorageShopping).toHaveBeenCalledWith(mockIngredient.ingredientName, mockIngredient.unit, -mockIngredient.quantity);
      await expect(service.determineStorage).toHaveBeenCalled();
      expect(service.subtractOrUnreserve).toHaveBeenCalled();
    });
  });
});
