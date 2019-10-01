import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveRecipesPage } from './active-recipes.page';

describe('ActiveRecipesPage', () => {
  let component: ActiveRecipesPage;
  let fixture: ComponentFixture<ActiveRecipesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveRecipesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveRecipesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
