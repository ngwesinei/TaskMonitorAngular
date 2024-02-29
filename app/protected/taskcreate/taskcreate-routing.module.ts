import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskcreateComponent } from './taskcreate.component';

import { AuthGuard } from '../../services';

const routes: Routes = [
  {
    path: '',
    component: TaskcreateComponent, canActivate: [AuthGuard]
  },
 
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskcreateRoutingModule { }
