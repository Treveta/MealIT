import {TestBed} from '@angular/core/testing';

import {ShoppinglistEditService} from './shoppinglist-edit.service';


describe('ShoppinglistEditService', () => {
  let service: ShoppinglistEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppinglistEditService);
  });
});
