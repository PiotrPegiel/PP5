import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3000/data';
  private addTransactionUrl = 'http://localhost:3000/add-transaction';
  private deleteTransactionUrl = 'http://localhost:3000/delete-transaction';
  private currentUser: any = null;
  private transactionsSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private loadUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(map((data) => data.users));
  }

  login(login: string, password: string): Observable<boolean> {
    return this.loadUsers().pipe(
      map((users) => {
        const user = users.find(
          (u: any) => u.login === login && u.password === password
        );
        if (user) {
          this.currentUser = user;
          this.transactionsSubject.next(user.transactions);
          return true;
        }
        return false;
      })
    );
  }

  register(login: string, password: string): Observable<boolean> {
    return this.loadUsers().pipe(
      switchMap((users) => {
        if (users.find((u: any) => u.login === login)) {
          return of(false); // User already exists
        }
        const newUser = { login, password, transactions: [] };
        users.push(newUser);
        return this.saveUsers(users).pipe(map(() => true));
      })
    );
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
  }

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addTransaction(transaction: any): Observable<void> {
    if (this.currentUser) {
      return this.http
        .post<void>(this.addTransactionUrl, {
          login: this.currentUser.login,
          transaction,
        })
        .pipe(
          map(() => {
            this.currentUser.transactions.push(transaction);
            this.transactionsSubject.next(this.currentUser.transactions);
          })
        );
    }
    return of();
  }

  deleteTransaction(transaction: any): Observable<void> {
    if (this.currentUser) {
      return this.http
        .post<void>(this.deleteTransactionUrl, {
          login: this.currentUser.login,
          transaction,
        })
        .pipe(
          map(() => {
            this.currentUser.transactions =
              this.currentUser.transactions.filter(
                (t: any) => t !== transaction
              );
            this.transactionsSubject.next(this.currentUser.transactions);
          })
        );
    }
    return of();
  }

  private saveUsers(users?: any[]): Observable<void> {
    if (!users) {
      users = [this.currentUser];
    }
    return this.http.post<void>(this.apiUrl, { users }).pipe(map(() => {}));
  }

  updateUser(updatedUser: any): Observable<void> {
    if (this.currentUser) {
      this.currentUser.login = updatedUser.login;
      this.currentUser.password = updatedUser.password;
      return this.saveUsers();
    }
    return of();
  }
}
