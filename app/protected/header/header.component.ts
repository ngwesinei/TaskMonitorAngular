import { Component, OnInit , Renderer2, ViewChild} from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService, ApiService } from "../../services";
import { Location } from "@angular/common";



@Component({
  selector: 'app-aso-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  currentUser: any;
  currentRole: any;
  currentProj: string;
  users: any;
  isLoggedIn$: Observable<boolean>;
  isSetteredIn$: Observable<boolean>;
  isUserRole$: Observable<string>;

  reportMenu = false;
  passMenu = false;

  constructor(private renderer: Renderer2, private apiService: ApiService, private authService : AuthService, private router: Router, private location: Location )  {
    this.passMenu = false;
  }

   ngOnInit() {
    this.passMenu = false;
    this.isLoggedIn$ = this.authService.isLoggedIn;
        this.isLoggedIn$.subscribe(data => {
          if(data == true){        
            this.apiService.getLOV('user/login').subscribe( data => {
                let usr: any = data;
                this.currentUser = usr.userName;
                this.currentRole = usr.role;
               if(this.currentRole != 'cms_user'){
                  this.reportMenu=true;
                }
                if(usr.bspUserId !=null){ 
                 this.passMenu=true;
                }                
                this.authService.setUserRole(this.currentRole);
            });
            this.apiService.getLOV('user/employeeno').subscribe( data => {
                let employeeNo:any = data;
                this.authService.setEmployeeData(employeeNo.employeeNo);
            });
          }
        });
  }
  passwordreset(){
    this.router.navigate(['passwordreset']);
  }
  applyLeave(){
    this.router.navigate(['leave']);
  }
  createTask(){
    this.router.navigate(['createtask']);
  }
  mastertable(){
    this.router.navigate(['mastertable']);
  }
  taskboard(){
    this.router.navigate(['taskboard']);
  }
  openPDF(report) {
    let tab = window.open();
    this.apiService.downloadPDF(report).subscribe(data => {
       const fileUrl = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
        tab.location.href = fileUrl;
        window.open(tab.location.href );
      });
  }

  onLogout() {
    this.apiService.logout('user/logout')
    .subscribe( data =>  {
      this.authService.authLogout();
      this.passMenu=false;
      this.reportMenu = false;
      this.router.navigate(['']);

    });
  }

}
