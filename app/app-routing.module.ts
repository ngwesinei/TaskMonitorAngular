import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import{LoginComponent} from './public/login/login.component';
import{TaskcreateComponent} from './protected/taskcreate/taskcreate.component';

const routes: Routes = [
  { path: '',
    loadChildren: () => import('./public/login/login.module').then(mod => mod.LoginModule)
  },
  { path: 'createtask',
    loadChildren: () => import('./protected/taskcreate/taskcreate.module').then(mod => mod.TaskcreateModule)
  },
  { path: 'leave',
    loadChildren: () => import('./protected/leaveapply/leave.module').then(mod => mod.LeaveModule)
  },
  { path: 'passwordreset',
    loadChildren: () => import('./protected/password-reset/password-reset.module').then(mod => mod.PasswordResetModule)
  },
  { path: 'mastertable',
    loadChildren: () => import('./protected/mastertable/mastertable.module').then(mod => mod.MastertableModule)
  },
  { path: 'taskboard',
    loadChildren: () => import('./protected/taskboard/taskboard.module').then(mod => mod.TaskboardModule)
  },
  { path: '**',   redirectTo: '', pathMatch: 'full' }, // redirect to `LoginComponent`
  
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
