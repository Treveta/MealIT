import {TestBed} from '@angular/core/testing';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../auth.service';
import {ShoppinglistEditService} from '../shoppinglist-edit.service';
import {ArbiterService} from './arbiter.service';

describe('ArbiterService', () => {
  let service: ArbiterService;

  beforeEach(() => {
    const angularFirestoreStub = () => ({collection: (arg) => ({})});
    const authServiceStub = () => ({getUid: () => ({then: () => ({})})});
    const shoppinglistEditServiceStub = () => ({
      addToShoppingList: (itemName, amountToAdd, unit, arg) => ({}),
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
      ],
    });
    service = TestBed.inject(ArbiterService);
  });

  it('can load instance', () => {
    expect(service).toBeTruthy();
  });
});
