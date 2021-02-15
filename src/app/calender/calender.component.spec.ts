import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CalenderComponent} from './calender.component';

describe('Get a week', function() {
  let a: CalenderComponent;
  let b: string[] = [];
  const c = 'Sunday 2/14/2021';
  const d = new Date(2021, 2, 14);

  b = a.getWeek(d);

  expect(c).toBe(b[0]);
});

describe('CalenderComponent', () => {
  let component: CalenderComponent;
  let fixture: ComponentFixture<CalenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalenderComponent],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
