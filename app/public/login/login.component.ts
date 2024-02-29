import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpParams, HttpHeaders} from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthGuard } from '../../services/auth.guard';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import * as CryptoJS from 'crypto-js';
import {constInput} from '../../enum/constInput';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  
})
export class LoginComponent implements OnInit {
  submitted: boolean = false;
  svrErr: string;
  loginForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private router: Router,
    private apiService: ApiService, private authService: AuthService,
    private toastr: ToastrService ) {}

  ngOnInit() {
    localStorage.removeItem('bspmonitor-token');
    this.authService.authLogout();
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.compose([Validators.required])],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    this.submitted = true;
   
    // const body = new HttpParams()
    //   .set('username', this.loginForm.controls.username.value)
    //   .set('password', this.loginForm.controls.password.value)
    //   .set('grant_type', 'password');


      const body = new HttpParams()
      .set('username', this.loginForm.controls.username.value)
      .set('password', CryptoJS.AES.encrypt(this.loginForm.controls.password.value, constInput.passencrypt))
      .set('grant_type', 'password');
      
    this.apiService.login(body.toString()).subscribe(data => {
      localStorage.setItem('bspmonitor-token', JSON.stringify(data));
      this.apiService.getLOV('user/login').subscribe( data1 => {
        let user: any = data1;
        });
      this.router.navigate(['createtask']);
      this.authService.authLogin();
    }, error => {
        console.log('err'+ JSON.stringify(error))
        if(error && error.status == 400){
          this.svrErr = 'Invalid Username or Password';
        }else{
          this.toastr.error('Server Connect Error'); 
        }
    }); 
  }

}
