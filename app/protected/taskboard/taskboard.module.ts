import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, DialogService} from "../../services";
import { TaskboardComponent } from'./taskboard.component';
import { ReactiveFormsModule} from '@angular/forms';
import { FormsModule }   from '@angular/forms';
import { TaskboardRoutingModule } from './taskboard-routing.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { DetailDialogComponent } from '../../util/dialog/detail-dialog.component';

@NgModule({
  declarations: [TaskboardComponent, DetailDialogComponent],
  imports: [
    CommonModule,
    TaskboardRoutingModule,
    ReactiveFormsModule, FormsModule,
    DragDropModule
  ],
  providers: [ApiService, DialogService],
  bootstrap: [TaskboardComponent],
})
export class TaskboardModule { }
