import { TestBed } from '@angular/core/testing';

import { TtsManagerService } from './tts-manager.service';

describe('TtsManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TtsManagerService = TestBed.get(TtsManagerService);
    expect(service).toBeTruthy();
  });
});
