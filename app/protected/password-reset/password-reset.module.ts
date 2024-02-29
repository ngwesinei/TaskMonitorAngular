import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, DialogService} from "../../services";
import { PasswordResetRoutingModule } from './password-reset-routing.module';
import { PasswordResetComponent } from'./password-reset.component';
import { ReactiveFormsModule} from '@angular/forms';
import { FormsModule }   from '@angular/forms';

@NgModule({
  declarations: [PasswordResetComponent],
  imports: [
    CommonModule,
    PasswordResetRoutingModule,
    ReactiveFormsModule
  ],
  providers: [ApiService, DialogService],
  bootstrap: [PasswordResetComponent],
})
export class PasswordResetModule { }
