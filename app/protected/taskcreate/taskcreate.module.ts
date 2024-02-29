import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TaskcreateComponent } from './taskcreate.component';
import { TaskcreateRoutingModule } from './taskcreate-routing.module';
import { ApiService, DialogService} from "../../services";
import { ReactiveFormsModule} from '@angular/forms';
import { FormsModule }   from '@angular/forms';
import { TextareaAutosizeModule } from 'ngx-textarea-autosize';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DataTablesModule } from 'angular-datatables';
import { TaskDialogComponent } from '../../util/dialog/task-dialog.component';
import { MatTableModule } from '@angular/material';


@NgModule({
  declarations: [TaskcreateComponent,TaskDialogComponent
  ],
  imports: [
    CommonModule,
    TaskcreateRoutingModule,
    ReactiveFormsModule,
    FormsModule, DataTablesModule,
    TextareaAutosizeModule,
   OwlDateTimeModule, OwlNativeDateTimeModule,
   MatTableModule,

  ],
  providers: [ApiService, DialogService,DatePipe],
  bootstrap: [TaskcreateComponent],
})
export class TaskcreateModule { }
