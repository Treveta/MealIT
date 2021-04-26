import {TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from './auth.service';
import {FoodstorageEditService} from '../services/foodstorage-edit.service';

describe('FoodstorageEditService', () => {
  let service: FoodstorageEditService;

  beforeEach(() => {
    const angularFirestoreStub = () => ({collection: (arg) => ({})});
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    TestBed.configureTestingModule({
      providers: [
        FoodstorageEditService,
        {provide: AngularFirestore, useFactory: angularFirestoreStub},
        {provide: AuthService, useFactory: authServiceStub},
      ],
    });
    service = TestBed.inject(FoodstorageEditService);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

  describe('editReserved Tests', () => {
    /**
     * Mock data to run test input catches
     */
    const mockSortedList = [
      {
        ingredient: 'Apples',
        quantityReserved: 3,
        changeQuantity: 2,
      },
      {
        ingredient: 'Bananas',
        quantityReserved: 5,
        changeQuantity: -3,
      },
      {
        ingredient: 'Pineapples',
        quantityReserved: 3,
        changeQuantity: -4,
      },
    ];
    beforeEach(() => {
      service.sortedList=mockSortedList;
    });
    /**
     * Tests edit reserved functions properly
     */
    it('Should correctly add the changed amount', async () => {
      const mockfoundIngredient = {
        index: 0,
        info: mockSortedList[0],
      };
      const proposedIngredient = 'Apples';
      const proposedReserve = 3;
      const proposedChange = 2;
      expect(service.sortedList).toEqual(mockSortedList);
      // creates a spy to check if findIngredientInStorage is called
      spyOn(service, 'findIngredientInStorage').and.returnValue(mockfoundIngredient);
      // creates a spy to check if updateDocument is called
      spyOn(service, 'updateDocument');
      await service.editReserved(proposedChange, proposedReserve, proposedIngredient);
      expect(service.findIngredientInStorage).toHaveBeenCalled();
      expect(service.updateDocument).toHaveBeenCalled();
      expect(service.sortedList[0].quantityReserved).toEqual(5);
    });
    it('Should correctly remove the changed amount', async () => {
      const mockfoundIngredient = {
        index: 1,
        info: mockSortedList[1],
      };
      const proposedIngredient = 'Bananas';
      const proposedReserve = 5;
      const proposedChange = -3;
      expect(service.sortedList).toEqual(mockSortedList);
      // creates a spy to check if findIngredientInStorage is called
      spyOn(service, 'findIngredientInStorage').and.returnValue(mockfoundIngredient);
      // creates a spy to check if updateDocument is called
      spyOn(service, 'updateDocument');
      await service.editReserved(proposedChange, proposedReserve, proposedIngredient);
      expect(service.findIngredientInStorage).toHaveBeenCalled();
      expect(service.updateDocument).toHaveBeenCalled();
      expect(service.sortedList[1].quantityReserved).toEqual(2);
    });
    it('Should not remove the changed amount', async () => {
      const mockfoundIngredient = {
        index: 2,
        info: mockSortedList[2],
      };
      const proposedIngredient = 'Pineapples';
      const proposedReserve = 3;
      const proposedChange = -4;
      expect(service.sortedList).toEqual(mockSortedList);
      // creates a spy to check if findIngredientInStorage is called
      spyOn(service, 'findIngredientInStorage').and.returnValue(mockfoundIngredient);
      // creates a spy to check if updateDocument is called
      spyOn(service, 'updateDocument');
      await service.editReserved(proposedChange, proposedReserve, proposedIngredient);
      expect(service.findIngredientInStorage).toHaveBeenCalled();
      expect(service.updateDocument).toHaveBeenCalled();
      expect(service.sortedList[2].quantityReserved).toEqual(3);
    });
  });
});
