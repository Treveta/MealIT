/* eslint-disable import/no-unresolved */
/* global describe, beforeEach, it, expect */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRecipeComponent } from './create-recipe.component';

describe('CreateRecipeComponent', () => {
  let component: CreateRecipeComponent;
  let fixture: ComponentFixture<CreateRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateRecipeComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
