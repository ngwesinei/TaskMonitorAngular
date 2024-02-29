import { Component,Input, OnInit,HostListener } from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import {HttpParams, HttpHeaders} from '@angular/common/http';
import { ApiService,DialogService } from '../../services';
import { AuthGuard } from '../../services/auth.guard';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { status } from '../../enum/status';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-taskboard , [mouse]',
  templateUrl: './taskboard.component.html',
  styleUrls: ['./taskboard.component.scss','../../util/dialog/content/app.less', '../../util/dialog/content/model.less']
})

export class TaskboardComponent implements OnInit {

  public taskType :any;public status : any=[]; public application:any=[]; 
  public type : any;  public priority : any;  public app : any;
  currentUser: any;
  currentRole: any;
  public taskList$:any = []; public taskClosed:any = [];public taskPending:any = [];
  public tempList$:any=[]; public taskProgress:any = [];public pendingUser:any = [];public pendingDisc:any = [];
  public tempRow:any=[];
  public tType: any={taskType:'', userRole:''};

  constructor( private apiService: ApiService, private toastr: ToastrService,private dialogService: DialogService) { 
    this.apiService.getLOV('code/task_type').subscribe( data => {
      this.taskType=data;
    });
    this.apiService.getLOV('code/priority').subscribe( data => {
      this.priority=data;
  });
    this.apiService.getLOV('code/application').subscribe( data => {
      this.application=data;
      this.app='';
    });
    this.apiService.getLOV('code/status').subscribe( data => {
     let tempstatus:any = data;
     for(var i=0;i<tempstatus.length; i++){
      this.status.push(tempstatus[i].tableName);
     }
    });
  }

  ngOnInit() {
    this.apiService.getLOV('user/login').subscribe( data => {
      let usr: any = data; 
      this.currentUser = usr.userName;
        this.currentRole = usr.role;
      this.apiService.getLOV('code/task_type').subscribe( data => {
          this.taskType=data;
          this.type=this.taskType[0].tableValue;   
          this.searchByTask(this.type);
      });         
    });
  }

  searchByTask(type){

    this.tempRow=[];
    this.taskList$ =null;
      this.tType.taskType= type;
      this.tType.userRole= this.currentRole;
      //console.log(JSON.stringify(this.tType.userRole)+"Role before search:"+JSON.stringify(this.tType));
      this.apiService.PostApi('tasks/key/', this.tType ).subscribe(data => {
      this.tempList$ =data;
      this.tempRow=data;
       this.taskList$ = []; this.taskClosed=[]; this.taskPending=[]; this.pendingDisc=[];this.pendingUser=[];this.taskProgress=[];
        if(this.tempList$.length >0){
          for (var i=0; i<this.tempList$.length; i++) {
            this.tempList$[i].sortData = (this.tempList$[i].internalId);
                if (this.taskType && this.taskType.length>0){ 
                  for (var j=0; j<this.taskType.length; j++){
                    if(this.taskType[j].tableValue === this.tempList$[i].taskType){  
                      this.tempList$[i].taskTypeDesc = this.taskType[j].tableName; 
                    } 
                  }
                }
                if (this.priority && this.priority.length>0){ 
                  for (var k=0; k<this.priority.length; k++){
                    if(this.priority[k].tableValue === this.tempList$[i].priority){  
                      this.tempList$[i].priorityDesc = this.priority[k].tableName; 
                    } 
                  }
                } 
                if(this.app===this.tempList$[i].application) {
                  //console.log(this.tempList$[i]);
                  if(this.tempList$[i].status=== this.status[0]){
                    this.taskClosed.push(this.tempList$[i]);  
                  }else if(this.tempList$[i].status=== this.status[1]){
                    this.taskPending.push(this.tempList$[i]);
                  }else if(this.tempList$[i].status=== this.status[2]){
                    this.pendingDisc.push(this.tempList$[i]);
                  }else if(this.tempList$[i].status=== this.status[3]){
                    this.pendingUser.push(this.tempList$[i]);
                  }else if(this.tempList$[i].status=== this.status[4]){
                    this.taskProgress.push(this.tempList$[i]);
                  }

                }
          }    //console.log("Search:"+JSON.stringify(this.tempList$));
        }else {
          console.log("No Data List!");
        }  
      
      }, err => {
        this.taskList$ = [];
      });
  }
  fullname:any; interId:number;
  taskover(param,i){this.fullname="By: "+param;this.interId=i;
  //console.log(i+param);
  }
  taskleave(){this.fullname="";}

  drop(event: CdkDragDrop<string[]>, status:string){
    if (event.previousContainer === event.container){
   
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }else{
      
      if(status==="Closed"){
        let temp= []; let saverec=[];
        temp=event.previousContainer.data;
        if(temp.length>0){
        for(var i=0; i<temp.length;i++){ 
          if(i===event.previousIndex){ 
            saverec.push(temp[i]); 
          }
        } 
        saverec.forEach(e=>{ 
          if((e.dtl_start_date===undefined && e.dtl_end_date===undefined)||(e.dtl_start_date==='null' && e.dtl_end_date==='null')){
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
            this.toastr.error('The task can not be closed since it is not started yet!');
          }else if (e.dtl_start_date!='null' && e.dtl_end_date==='null' ){
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex); 
            this.toastr.error('The task can not be closed since it has not been stopped!');
          }else{
            transferArrayItem(event.previousContainer.data,event.container.data,event.previousIndex,event.currentIndex);
            this.savingStatus(event.container.data,event.currentIndex,status); 
          }
        });
       }
      }else {          
        transferArrayItem(event.previousContainer.data,event.container.data,event.previousIndex,event.currentIndex);
        this.savingStatus(event.container.data,event.currentIndex,status); 
      }
    }
  }

  savingStatus(data : any[],index:number,status){

  let existingdata=[]; let newdata =[]; let savedata = []; let extStatus="";
    if(data.length>0){
      for(var i=0;i<data.length;i++){
        if(i===index){ savedata.push(data[i]);}else{
          existingdata.push(data[i]); 
      
        }
      }
      savedata.forEach(e => {
        e.status=status;
      });
      if(savedata.length>0 && status!=""){
          this.apiService.PostApi('submittask', savedata).subscribe( data => {
            this.toastr.success('Status has been changed!'); 
       
          }, er => {
             console.log(er.error); 
          });
      }
     
    }
  }

  @Input() id: string;
  closeModal(modelId: string) {
    this.dialogService.remove(this.id);
    this.dialogService.close(modelId);

  }
taskdetail:any=[];
  taskDetail(modelId: string,obj:any){
    this.taskdetail=[];
    this.dialogService.open(modelId);
    this.taskdetail.push(obj);
    //console.log("Task Detail:"+JSON.stringify( this.taskdetail));
    

  }

}
