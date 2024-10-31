import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../data.service';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: [
    './auth.component.scss',
    '../app.component.scss',
    '../../styles.scss',
  ],
})
export class AuthComponent implements OnInit {
  authForm!: FormGroup;
  isRegistering = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authForm = this.fb.group({
      login: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  toggleMode(): void {
    this.isRegistering = !this.isRegistering;
    this.authForm.reset();
  }

  onSubmit(): void {
    const { login, password } = this.authForm.value;
    if (this.isRegistering) {
      this.dataService.register(login, password).subscribe((success) => {
        if (success) {
          this.snackBar.open('Account created successfully!', 'Close', {
            duration: 3000,
          });
          this.isRegistering = false;
          this.authForm.reset();
        } else {
          this.snackBar.open('User already exists', 'Close', {
            duration: 3000,
          });
        }
      });
    } else {
      this.dataService.login(login, password).subscribe((success) => {
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.snackBar.open('Invalid login or password', 'Close', {
            duration: 3000,
          });
        }
      });
    }
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
