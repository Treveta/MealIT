import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DisplayRecipesComponent} from './display-recipes.component';

describe('DisplayRecipesComponent', () => {
  let component: DisplayRecipesComponent;
  let fixture: ComponentFixture<DisplayRecipesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisplayRecipesComponent],
    })
        .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Checks the component works
   */
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
});
