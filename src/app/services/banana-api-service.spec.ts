import { TestBed } from '@angular/core/testing';

import { BananaApiService } from './banana-api-service';

describe('BananaApiService', () => {
  let service: BananaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BananaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
