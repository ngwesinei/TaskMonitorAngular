import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiService, DialogService} from "../../services";
import { ReactiveFormsModule} from '@angular/forms';
import { FormsModule }   from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { TaskDialogComponent } from '../../util/dialog/task-dialog.component';
import { MatTableModule } from '@angular/material';
import { MastertableRoutingModule } from './mastertable-routing.module';
import { MastertableComponent} from'./mastertable.component';


@NgModule({
  declarations: [MastertableComponent],
  imports: [
    CommonModule,
    MastertableRoutingModule,
    ReactiveFormsModule,
    FormsModule, DataTablesModule,
    MatTableModule,
  ],
  providers: [ApiService, DialogService],
  bootstrap: [MastertableComponent],
})
export class MastertableModule { }
