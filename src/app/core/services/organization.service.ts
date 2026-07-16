import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { OrganizationNode } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/organization-nodes`;

  getNodes(): Observable<OrganizationNode[]> {
    return this.http.get<OrganizationNode[]>(this.baseUrl);
  }

  getNode(id: number): Observable<OrganizationNode> {
    return this.http.get<OrganizationNode>(`${this.baseUrl}/${id}`);
  }

  createNode(node: Partial<OrganizationNode>): Observable<OrganizationNode> {
    return this.http.post<OrganizationNode>(this.baseUrl, node);
  }

  updateNode(id: number, node: Partial<OrganizationNode>): Observable<OrganizationNode> {
    return this.http.put<OrganizationNode>(`${this.baseUrl}/${id}`, node);
  }

  deleteNode(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/posts/upload-image`, formData);
  }
}
