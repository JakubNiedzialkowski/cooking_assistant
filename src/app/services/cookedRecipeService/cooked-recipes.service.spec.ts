import { TestBed } from '@angular/core/testing';

import { CookedRecipesService } from './cooked-recipes.service';

describe('CookedRecipesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CookedRecipesService = TestBed.get(CookedRecipesService);
    expect(service).toBeTruthy();
  });
});
