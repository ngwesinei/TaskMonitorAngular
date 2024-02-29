import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaveApplyComponent } from './leaveapply.component';
import { AuthGuard } from '../../services';

const routes: Routes = [
  {
    path: '',
    component: LeaveApplyComponent, canActivate: [AuthGuard]
  }  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRoutingModule { }
