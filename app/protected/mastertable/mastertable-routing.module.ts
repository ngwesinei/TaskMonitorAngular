import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MastertableComponent} from './mastertable.component';
import { AuthGuard } from '../../services';


const routes: Routes = [
  {
    path: '',
    component: MastertableComponent, canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MastertableRoutingModule { }
