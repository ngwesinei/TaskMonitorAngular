import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskboardComponent} from './taskboard.component';
import { AuthGuard } from '../../services';

const routes: Routes = [
  {
    path: '',
    component: TaskboardComponent, canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskboardRoutingModule { }
