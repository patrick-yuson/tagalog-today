import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Word } from '../models/word';

@Injectable({
  providedIn: 'root'
})
export class WordService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getAllWords(): Observable<Word[]> {
    return this.http.get<Word[]>(`${this.apiUrl}/words`);
  }

  getWordById(id: number): Observable<Word> {
    return this.http.get<Word>(`${this.apiUrl}/words/${id}`);
  }

  getWordsByLetter(letter: string): Observable<Word[]> {
    return this.http.get<Word[]>(`${this.apiUrl}/words/letter/${letter}`);
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload-xlsx`, formData);
  }
}
