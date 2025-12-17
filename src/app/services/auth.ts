import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://rfxrzgdfiehcqhfqxxlz.supabase.co/functions/v1/hyper-responder';
  private tokenKey = 'auth_token';

  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUser());
  public currentUser = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) { }

  private getStoredUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private getStoredToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private storeUser(user: any, token: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem(this.tokenKey, token);
    this.currentUserSubject.next(user);
  }

  private clearUser() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
  }

  private getHeaders() {
    const token = this.getStoredToken();
    const headersConfig: any = {};
    if (token) headersConfig['X-Auth-Token'] = token;
    headersConfig['Authorization'] = `Bearer ${environment.supabase.key}`;
    return new HttpHeaders(headersConfig);
  }

  cadastro(tipo: 'psicologo' | 'paciente', data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cadastro`, { tipo, ...data }, { headers: this.getHeaders() })
      .pipe(
        map(res => {
          if (!res.success) {
            throw new Error(res.error || 'Erro no cadastro');
          }
          return res;
        }),
        catchError(err => {
          console.error('Erro no cadastro:', err);
          return throwError(() => err);
        })
      );
  }

  login(tipo: 'psicologo' | 'paciente', email: string, senha: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, { tipo, email, senha }, { headers: this.getHeaders() })
      .pipe(
        map(res => {
          if (!res.success) {
            throw new Error(res.error || 'Erro no login');
          }
          this.storeUser(res.user, res.token);
          return res;
        }),
        catchError(err => {
          console.error('Erro no login:', err);
          return throwError(() => err);
        })
      );
  }

  me(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/me`, { headers: this.getHeaders() })
      .pipe(
        map(res => {
          if (!res.success) {
            throw new Error(res.error || 'Erro ao buscar usuário');
          }
          this.currentUserSubject.next(res.user);
          return res;
        }),
        catchError(err => {
          console.error('Erro no me:', err);
          return throwError(() => err);
        })
      );
  }

  logout() {
    this.clearUser();
  }

  isAuthenticated(): boolean {
    return !!this.getStoredUser();
  }

  update(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/editar`, data, {
      headers: this.getHeaders()
    }).pipe(
      map(res => {
        if (!res.success) throw new Error(res.error);

        this.currentUserSubject.next(res.user);
        localStorage.setItem('currentUser', JSON.stringify(res.user));

        return res;
      }),
      catchError(err => throwError(() => err))
    );
  }

  forgotPassword(email: string) {
    return this.http.post<any>(
      `${this.baseUrl}/forgot-password`,
      { email },
      { headers: this.getHeaders() }
    );
  }

  verifyCode(email: string, code: string) {
    return this.http.post<any>(
      `${this.baseUrl}/verify-code`,
      { email, code },
      { headers: this.getHeaders() }
    );
  }

  resetPassword(reset_token: string, novaSenha: string) {
    return this.http.post<any>(
      `${this.baseUrl}/reset-password`,
      { reset_token, novaSenha },
      { headers: this.getHeaders() }
    );
  }

}