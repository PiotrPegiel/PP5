import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../data.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: [
    './transaction-form.component.scss',
    '../app.component.scss',
    '../../styles.scss',
  ],
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  transactionType!: string;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.transactionType = this.route.snapshot.paramMap.get('type')!;
    this.transactionForm = this.fb.group({
      amount: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onSubmit(): void {
    const transaction = {
      ...this.transactionForm.value,
      type: this.transactionType,
      date: new Date().toISOString(),
    };
    this.dataService.addTransaction(transaction).subscribe(() => {
      this.router.navigate(['/dashboard']).then(() => {
        this.cdr.detectChanges(); // Manually trigger change detection
      });
    });
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
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
