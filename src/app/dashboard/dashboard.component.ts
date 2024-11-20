import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  HostListener,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { DataService } from '../data.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

interface Transaction {
  date: string | Date;
  amount: number;
  description: string;
  type: 'credit' | 'debit'; // Corrected type definition
}

interface User {
  login: string;
  password: string;
  transactions: Transaction[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.scss',
    '../app.component.scss',
    '../../styles.scss',
  ],
  providers: [DatePipe],
})
export class DashboardComponent implements OnInit, OnDestroy {
  transactions: Transaction[] = [];
  balance = 0;
  currentUser!: User;
  private transactionsSubscription!: Subscription;
  private globalClickListener!: () => void;

  constructor(
    private dataService: DataService,
    private router: Router,
    private datePipe: DatePipe,
    private renderer: Renderer2,
  ) {
    // Subscribe to router events to reload transactions on navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadTransactions();
      });
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.transactionsSubscription = this.dataService.transactions$.subscribe(
      (transactions: Transaction[]) => {
        this.transactions = transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        this.calculateBalance();
      },
    );
    this.currentUser = this.dataService.getCurrentUser() as User;
  }

  ngOnDestroy(): void {
    if (this.transactionsSubscription) {
      this.transactionsSubscription.unsubscribe();
    }
    if (this.globalClickListener) {
      this.globalClickListener();
    }
  }

  loadTransactions(): void {
    const user = this.dataService.getCurrentUser() as User;
    if (user) {
      this.transactions = user.transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      this.calculateBalance();
    } else {
      this.router.navigate(['/']);
    }
  }

  calculateBalance(): void {
    this.balance = this.transactions.reduce((acc, transaction) => {
      return transaction.type === 'credit'
        ? acc - transaction.amount
        : acc + transaction.amount;
    }, 0);
  }

  logout(): void {
    this.dataService.logout();
    this.router.navigate(['/']);
  }

  navigateTo(type: string): void {
    this.router.navigate([`/transaction/${type}`]);
  }

  navigateToUser(): void {
    this.router.navigate(['/user']);
  }

  deleteTransaction(transaction: Transaction): void {
    this.dataService.deleteTransaction(transaction).subscribe(() => {
      this.loadTransactions();
    });
  }

  formatDate(date: string | Date, format: string): string {
    return this.datePipe.transform(date, format) || '';
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const target = event.target as HTMLElement;
      target.click();
    }
  }
}
