import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface User {
  login: string;
  password: string;
  transactions: Transaction[];
}

interface Transaction {
  date: string | Date;
  amount: number;
  description: string;
  type: 'credit' | 'debit';
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://localhost:3000/data';
  private addTransactionUrl = 'http://localhost:3000/add-transaction';
  private deleteTransactionUrl = 'http://localhost:3000/delete-transaction';
  private currentUser: User | null = null;
  private transactionsSubject: BehaviorSubject<Transaction[]> =
    new BehaviorSubject<Transaction[]>([]);
  public transactions$ = this.transactionsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private loadUsers(): Observable<User[]> {
    return this.http
      .get<{ users: User[] }>(this.apiUrl)
      .pipe(map((data) => data.users));
  }

  login(login: string, password: string): Observable<boolean> {
    return this.loadUsers().pipe(
      map((users) => {
        const user = users.find(
          (u) => u.login === login && u.password === password,
        );
        if (user) {
          this.currentUser = user;
          this.transactionsSubject.next(user.transactions);
          return true;
        }
        return false;
      }),
    );
  }

  register(login: string, password: string): Observable<boolean> {
    return this.loadUsers().pipe(
      switchMap((users) => {
        if (users.find((u) => u.login === login)) {
          return of(false); // User already exists
        }
        const newUser: User = { login, password, transactions: [] };
        users.push(newUser);
        return this.saveUsers(users).pipe(map(() => true));
      }),
    );
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
  }

  getData(): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(this.apiUrl);
  }

  addTransaction(transaction: Transaction): Observable<void> {
    if (this.currentUser) {
      return this.http
        .post(this.addTransactionUrl, {
          login: this.currentUser.login,
          transaction,
        })
        .pipe(
          map(() => {
            this.currentUser!.transactions.push(transaction);
            this.transactionsSubject.next(this.currentUser!.transactions);
          }),
        );
    }
    return of();
  }

  deleteTransaction(transaction: Transaction): Observable<void> {
    if (this.currentUser) {
      return this.http
        .post(this.deleteTransactionUrl, {
          login: this.currentUser.login,
          transaction,
        })
        .pipe(
          map(() => {
            this.currentUser!.transactions =
              this.currentUser!.transactions.filter((t) => t !== transaction);
            this.transactionsSubject.next(this.currentUser!.transactions);
          }),
        );
    }
    return of();
  }

  private saveUsers(users: User[] = [this.currentUser!]): Observable<void> {
    return this.http.post(this.apiUrl, { users }).pipe(
      map(() => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
      }),
    );
  }

  updateUser(updatedUser: User): Observable<void> {
    if (this.currentUser) {
      this.currentUser.login = updatedUser.login;
      this.currentUser.password = updatedUser.password;
      return this.saveUsers();
    }
    return of();
  }
}
