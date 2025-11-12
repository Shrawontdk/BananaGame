// INTEROPERABILITY Theme: External API integration
import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BananaApiResponse} from '../models/game-data.model';

@Injectable({
  providedIn: 'root'
})
export class BananaApiService {
  private http = inject(HttpClient);

  // INTEROPERABILITY: External API endpoint
  private readonly API_URL = '/api/api.php';

  getQuestion(format: 'json' | 'csv' = 'json', base64: boolean = false): Observable<BananaApiResponse> {
    // HTTP parameters for API request
    const params = new HttpParams()
      .set('out', format)
      .set('base64', base64 ? 'yes' : 'no');

    // INTEROPERABILITY: HTTP GET request to external service
    console.log('API Request to:', this.API_URL, 'with params:', params.toString());
    return this.http.get<BananaApiResponse>(this.API_URL, {params});
  }


  getQuestionCSV(): Observable<string> {
    const params = new HttpParams().set('out', 'csv');
    return this.http.get(this.API_URL, {
      params,
      responseType: 'text'
    });
  }

  getQuestionBase64(): Observable<BananaApiResponse> {
    return this.getQuestion('json', true);
  }
}
