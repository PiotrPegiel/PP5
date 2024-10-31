import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TransactionFormComponent } from './transaction-form/transaction-form.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transaction/:type', component: TransactionFormComponent },
  { path: 'user', component: UserComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirect unknown paths to login
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
