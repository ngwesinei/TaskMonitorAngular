import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { InterceptService } from './services/intercept.service';
import { AuthService } from './services/auth.service';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule }   from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { DataTablesModule } from 'angular-datatables';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { MatTableModule,MatSelectModule } from '@angular/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from './protected/header/header.component';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { ModalModule } from 'ngx-bootstrap/modal';
import {DragDropModule} from '@angular/cdk/drag-drop';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule, MatTableModule,
    FormsModule, DataTablesModule, Ng4LoadingSpinnerModule,
    OwlDateTimeModule, OwlNativeDateTimeModule, DragDropModule,
    FontAwesomeModule, NgIdleKeepaliveModule.forRoot(),
    ModalModule.forRoot(),
    ToastrModule.forRoot({
      closeButton: true,
      timeOut: 2500
    }),
  ],
  providers: [ApiService, AuthService, {
     provide: HTTP_INTERCEPTORS, useClass: InterceptService, multi: true }],
  bootstrap: [AppComponent]

})
export class AppModule { }
