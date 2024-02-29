import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveApplyComponent } from './leaveapply.component';
import { LeaveRoutingModule } from './leave-routing.module';
import { ApiService, DialogService} from "../../services";
import { ReactiveFormsModule} from '@angular/forms';
import { FormsModule }   from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { MatTableModule } from '@angular/material';

import { DataTablesModule } from 'angular-datatables';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { LeaveDialogComponent } from '../../util/dialog/leave-dialog.component';

@NgModule({
  declarations: [LeaveApplyComponent, LeaveDialogComponent
  ],
  imports: [
    CommonModule,
    LeaveRoutingModule,
    ReactiveFormsModule,
    FormsModule,
   OwlDateTimeModule, OwlNativeDateTimeModule,
   MatTableModule,
   DataTablesModule,
   BsDatepickerModule.forRoot()
  ],
  providers: [ApiService, DialogService, BsLocaleService],
  bootstrap: [LeaveApplyComponent],
})
export class LeaveModule { }
