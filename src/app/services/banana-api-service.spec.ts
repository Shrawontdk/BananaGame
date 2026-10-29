import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BananaApiService } from './banana-api-service';
describe('BananaApiService', () => {
  it('keeps the Banana dev-proxy endpoint and JSON puzzle integration', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    let solution = -1;
    TestBed.inject(BananaApiService)
      .getQuestion()
      .subscribe((question) => (solution = question.solution));
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne('/api/api.php?out=json&base64=no');
    request.flush({ question: 'https://example.com/puzzle.png', solution: 7 });
    expect(solution).toBe(7);
    http.verify();
  });
});
