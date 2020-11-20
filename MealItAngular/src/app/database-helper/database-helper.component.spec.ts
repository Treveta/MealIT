import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DatabaseHelperComponent} from './database-helper.component';

describe('DatabaseHelperComponent', () => {
  let component: DatabaseHelperComponent;
  let fixture: ComponentFixture<DatabaseHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DatabaseHelperComponent],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
