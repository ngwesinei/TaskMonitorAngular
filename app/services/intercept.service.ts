import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpInterceptor, HttpRequest, HttpResponse, HttpHandler,
    HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class InterceptService implements HttpInterceptor{
    constructor(private toastr: ToastrService, private router: Router, private http: HttpClient, private spinnerService: Ng4LoadingSpinnerService) { }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.spinnerService.show();        
        if (request.url.search('oauth/token') === -1 ){
            const tkn: string = JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? null : JSON.parse(localStorage.getItem('bspmonitor-token')).access_token;            
            
            if (tkn == null) {
                this.router.navigate(['/']);
            } else if (tkn != null) {
                request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + tkn) });
            }
            if (!request.headers.has('Content-Type') && request.reportProgress == false) {
                request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
            }
            request = request.clone({ headers: request.headers.set('Accept', 'application/json') });
        }
        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) { // will remove in prod
                    this.spinnerService.hide();
                }                       
                return event;
            }),
            catchError((error: HttpErrorResponse) => {                
                const ref_tkn: string = JSON.parse(localStorage.getItem('bspmonitor-token')) == null ? null : JSON.parse(localStorage.getItem('bspmonitor-token')).refresh_token;
                if (error.status === 401 && ref_tkn != null) {        
                    const headers = {
                        'Authorization': 'Basic ' + btoa('ZLbGiq3lQ6c7UsSLx9NSIw==:wEPaUwAE/aCoKz0UOUR1OvOTsUy8sT/3SAaXULU2Za0='),
                        'Content-type': 'application/x-www-form-urlencoded'
                    };       
                    this.http.post( `${environment.basename}`+'oauth/token?grant_type=refresh_token&refresh_token='+ref_tkn,
                        {}, {headers}).subscribe(d1 => {
                            localStorage.setItem('bspmonitor-token', JSON.stringify(d1));
                    }, e => {                       
                        localStorage.removeItem('bspmonitor-token');
                        this.router.navigate(['/']);
                        location.reload(true);
                    });        
                }
                else if(this.isBlobError(error)){
                    console.log('Blob');
                    // this.parseErrorBlob(error);                    
                }else{
                    console.log('not Blob');
                    if(this.router.url != '/'){
                        this.toastr.error( error.error ? error.error.message && !error.error.message.includes('http') ? error.error.message 
                        : error.message && !error.message.includes('http') ? error.message 
                        : error.error && !error.error.includes('http') ? error.error: error : 'Server Error');                          
                    }
                }                
                this.spinnerService.hide();
                return throwError(error);                                   
            })
        );
    } 
    
    isBlobError(err: any) {
        return err instanceof HttpErrorResponse && err.error instanceof Blob && err.error.type === 'application/json';
    }

   
}

    



