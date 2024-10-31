import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: [
    './user.component.scss',
    '../app.component.scss',
    '../../styles.scss',
  ],
})
export class UserComponent implements OnInit {
  userForm!: FormGroup;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.dataService.getCurrentUser();
    if (user) {
      this.userForm = this.fb.group({
        login: [{ value: user.login, disabled: true }],
        password: [{ value: user.password, disabled: true }],
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.userForm.get('login')?.enable();
      this.userForm.get('password')?.enable();
    } else {
      this.userForm.get('login')?.disable();
      this.userForm.get('password')?.disable();
      this.saveChanges();
    }
  }

  saveChanges(): void {
    const updatedUser = this.userForm.getRawValue();
    this.dataService.updateUser(updatedUser).subscribe(() => {
      this.snackBar.open('User details updated successfully!', 'Close', {
        duration: 3000,
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
