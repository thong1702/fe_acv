import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { DocumentInfo, Page } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/documents`;

  getDocuments(params: {
    page?: number;
    size?: number;
    search?: string;
  }): Observable<Page<DocumentInfo>> {
    let httpParams = new HttpParams();
    
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<Page<DocumentInfo>>(this.baseUrl, { params: httpParams });
  }

  uploadDocument(formData: FormData): Observable<DocumentInfo> {
    // Note: Do not manually set Content-Type header when uploading FormData. 
    // HttpClient will set it automatically with boundary details.
    return this.http.post<DocumentInfo>(this.baseUrl, formData);
  }

  updateDocument(id: number, formData: FormData): Observable<DocumentInfo> {
    return this.http.put<DocumentInfo>(`${this.baseUrl}/${id}/multipart`, formData);
  }

  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getDownloadUrl(id: number): string {
    return `${this.baseUrl}/download/${id}`;
  }

  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/download/${id}`, { responseType: 'blob' });
  }
}
