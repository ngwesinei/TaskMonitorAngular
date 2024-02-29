import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login-routing.module';
import { ReactiveFormsModule} from '@angular/forms';
import { ApiService } from '../../services/api.service';

// import { ApiService, InterceptService, AuthService } from '../../services';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRoutingModule,
    ReactiveFormsModule
  ],
  providers: [ApiService],
  bootstrap: [LoginComponent]
})
export class LoginModule { }
