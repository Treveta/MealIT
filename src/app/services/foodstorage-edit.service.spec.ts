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
    const mockQuantityReserved = 3;
    const mockQuantity = 5;
    /**
     * Tests that positive integers are correctly added to the quantityReserved
     */
    it('editReserved should add to quantityReserved'), async () => {
      const changeQuantity = 1;
      service.editReserved(mockQuantity, changeQuantity, mockQuantityReserved);
      expect(mockQuantityReserved).toEqual(4);
    };
    /**
     * Tests that negative integers are correctly added to the quantityReserved
     */
    it('editReserved should subtract from quantityReserved'), async () => {
      const changeQuantity = -1;
      service.editReserved(mockQuantity, changeQuantity, mockQuantityReserved);
      expect(mockQuantityReserved).toEqual(2);
    };
    /**
     * Tests that positive integers too large are not added to the quantityReserved
     */
    it('editReserved should not add to quantityReserved'), async () => {
      const changeQuantity = 31;
      service.editReserved(mockQuantity, changeQuantity, mockQuantityReserved);
      expect(mockQuantityReserved).toEqual(3);
    };
    /**
     * Tests that negative integers too large are not added to the quantityReserved
     */
    it('editReserved should not subtract from quantityReserved'), async () => {
      const changeQuantity = -31;
      service.editReserved(mockQuantity, changeQuantity, mockQuantityReserved);
      expect(mockQuantityReserved).toEqual(3);
    };
  });
});
