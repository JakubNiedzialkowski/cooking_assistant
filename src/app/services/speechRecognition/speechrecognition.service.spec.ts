import { TestBed } from '@angular/core/testing';

import { SpeechrecognitionService } from './speechrecognition.service';

describe('SpeechrecognitionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpeechrecognitionService = TestBed.get(SpeechrecognitionService);
    expect(service).toBeTruthy();
  });
});
