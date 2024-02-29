import { Component,ViewChild, TemplateRef, ElementRef, AfterViewInit } from '@angular/core';
import { Title} from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { interval, Observable, Subscription } from 'rxjs'
import {Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import { AuthService, ApiService } from "../app/services";
import { BsModalService, BsModalRef,ModalDirective  } from 'ngx-bootstrap/modal';
import { environment } from '../environments/environment';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpHandler,
    HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  public modalRef: BsModalRef;
  isLoggedIn$: Observable<boolean>;
  @ViewChild('childModal', { static: false }) childModal: ModalDirective;

  constructor(private appTitle: Title, private router: Router,
    private idle: Idle, private keepalive: Keepalive, private http: HttpClient,
    private apiService: ApiService, private authService : AuthService, 
   private toastr: ToastrService, 
    private modalService: BsModalService){
  this.appTitle.setTitle('Bespoke Monitoring'); 
  let expiry= JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? null : JSON.parse(localStorage.getItem('bspmonitor-token')).expires_in;
   //console.log("Token expiry check:"+expiry);

    idle.setIdle(2600);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(60);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => { 
      this.idleState = 'No longer idle.';
      //console.log(this.idleState);
      this.reset();
    });
    
    idle.onTimeout.subscribe(() => {
      this.childModal.hide();
      this.idleState = 'Timed out!';
      this.timedOut = true;
      //console.log(this.idleState);
      this.router.navigate(['/']);
    });
    
    idle.onIdleStart.subscribe(() => {
        this.idleState = 'You\'ve gone idle!'
        //console.log(this.idleState);
        this.childModal.show();
        
    });
    
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!'
      //console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    keepalive.interval(20);
    keepalive.onPing.subscribe(() => this.lastPing = new Date());
    
    this.isLoggedIn$ = this.authService.isLoggedIn;
    this.isLoggedIn$.subscribe(userLoggedIn => {
      if (userLoggedIn) {
        idle.watch()
        this.timedOut = false;
      } else {
        idle.stop();
      }
    })

  }
  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  logout(){
    this.apiService.logout('user/logout').subscribe( data =>{
      this.authService.authLogout();
    });
    this.hideChildModal();
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  stay() {
    this.childModal.hide();
    this.reset();
    this.refreshTk();

  }
  refreshTk(){
    const ref_tkn: string = JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? null : JSON.parse(localStorage.getItem('bspmonitor-token')).refresh_token;
    console.log("Refresh:"+JSON.stringify(ref_tkn));
    if ( ref_tkn != null) {        
        const headers = {
            'Authorization': 'Basic ' + btoa('ZLbGiq3lQ6c7UsSLx9NSIw==:wEPaUwAE/aCoKz0UOUR1OvOTsUy8sT/3SAaXULU2Za0='),
            'Content-type': 'application/x-www-form-urlencoded'
        };       
        this.http.post( `${environment.basename}`+'oauth/token?grant_type=refresh_token&refresh_token='+ref_tkn,
            {}, {headers}).subscribe(d1 => {
                localStorage.setItem('bspmonitor-token', JSON.stringify(d1));
                console.log("bspmonitor:"+localStorage.getItem('bspmonitor-token'));
        }, e => {                       
                localStorage.removeItem('bspmonitor-token');
                this.router.navigate(['/']);
                location.reload(true);
        });        
                   
    }else{
      console.log('not Blob');
    }
  }

}
