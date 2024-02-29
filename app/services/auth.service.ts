import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AuthService {
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private userRole: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private employeeData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get isLoggedIn() {
    this.loggedIn.next(JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? false : true);
    this.loggedIn.subscribe(data => {
      if(data === false)
        this.router.navigate(['/']);
    });
    return this.loggedIn.asObservable();
  }
  
  get isUserRole() {   
    return this.userRole.asObservable();
  }
  setUserRole(role) {
    this.userRole.next(role);
  }

  get isEmployeeData() {   
    return this.employeeData.asObservable();
  }
  setEmployeeData(emp) {
    this.employeeData.next(emp);
  }

  constructor(
    private router: Router
  ) {}

  authLogin() {
      this.loggedIn.next(true);
  }
  
  authLogout() {    
    localStorage.removeItem('bspmonitor-token');
    //localStorage.clear();
    this.loggedIn.next(false);
    this.userRole.next('');
    this.router.navigate(['/']);
  }

}