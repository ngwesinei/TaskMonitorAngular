import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Router } from '@angular/router';
import { retry, catchError, retryWhen, map, tap, delay, delayWhen, take, flatMap  } from 'rxjs/operators';
import { EMPTY, timer, interval, throwError, of, pipe } from 'rxjs';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { mcsConfig } from "../../web_config";

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private router: Router) { }


  login(loginBody) {    
    const headers = {
      'Authorization': 'Basic ' + btoa('ZLbGiq3lQ6c7UsSLx9NSIw==:wEPaUwAE/aCoKz0UOUR1OvOTsUy8sT/3SAaXULU2Za0='),
      'Content-type': 'application/x-www-form-urlencoded'
    };
    
    return this.http.post( `${environment.basename}` + "loginBean", loginBody, {headers});    
    // return this.http.post( `${environment.basename}` + "oauth/token", loginBody, {headers});    
  }

 /*getuser(){
    const tkn: string = JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? null : JSON.parse(localStorage.getItem('bspmonitor-token')).access_token;            
    const headers = {
      'Authorization': 'Bearer ' + tkn,
      'Content-type': 'application/json'
    }; 
  return this.http.get(`${environment.basename}` + 'user/login' ).pipe(
      retryWhen(errors => errors.pipe(
        flatMap((error, index) => {
          return error.status != 401 ? throwError(error) : of(errors).pipe(delay(3000));
        }),
        take(2)
      ))
    );
} */

  logout(path: string) {
    return this.http.get(`${environment.basename}` + path ).pipe(
      retryWhen(errors => errors.pipe(
        flatMap((error, index) => {
          return error.status != 401 ? throwError(error) : of(errors).pipe(delay(3000));
        }),take(2)
      ))
    );
  }

  getLOV(path: string) {
   /* const tkn: string = JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? null : JSON.parse(localStorage.getItem('bspmonitor-token')).access_token;            
    const headers = {
      'Authorization': 'Bearer ' + tkn,
      'Content-type': 'application/json'
    }; */
    return this.http.get(`${environment.basename}` + path).pipe(
      retryWhen(errors => errors.pipe(
        flatMap((error, index) => {
          return error.status != 401 ? throwError(error) : of(errors).pipe(delay(3000));
        }),
        take(2)
      ))
    );
  } 

  getApi(path: string) {
    return this.http.get(`${environment.basename}` + path).pipe(
      retryWhen(errors => errors.pipe(
        flatMap((error, index) => {
          return error.status != 401 ? throwError(error) : of(errors).pipe(delay(3000));
        }),
        take(2)
      ))
    );
  }
  
  PostApi(path: string, obj: any) {
    return this.http.post(`${environment.basename}`+path,obj).pipe(
      retryWhen(errors => errors.pipe(
        flatMap((error, index) => {
          return error.status != 401 ? throwError(error) : of(errors).pipe(delay(3000));
        }),
        take(2)
      ))
    );
  }
  
  passwordReset(path: string, obj: any) {
    const headers = { 'Content-type': 'application/x-www-form-urlencoded' };
    return this.http.post(`${environment.basename}` + path , obj, {headers}).pipe(
      retryWhen(errors => errors.pipe(
        flatMap((error, index) => {
          return error.status != 401 ? throwError(error) : of(errors).pipe(delay(3000));
        }),
        take(2)
      ))
    );
  }

  downloadPDF(path: string): any {
    return this.http.get(`${environment.basename}`+ path, { responseType: 'blob'}).pipe(
      //return new Blob([data.blob()], { type: 'application/pdf' });
    retryWhen(errors => errors.pipe(
      flatMap((error, index) => {
        return error.status != 401 ? throwError(error) : of(errors).pipe(delay(3000));
      }),
      take(2)
    ))
    );
    }
  
  
}
