import { Component,Input, OnInit,ChangeDetectorRef,ViewChild, ElementRef,AfterViewInit,OnDestroy } from '@angular/core';
import { FormBuilder,FormControl,FormGroup, Validators } from '@angular/forms';
import { DatePipe,DOCUMENT } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ApiService,DialogService } from '../../services';
import { interval, Observable, Subscription } from 'rxjs';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule }   from '@angular/forms';
import { AuthService } from "../../services/auth.service";
import { TaskActivity } from '../../model/taskActivity';
import { TaskList } from '../../model/tasklist';
import { TaskType } from '../../model/taskType';
import { searchtask } from '../../model/searchtask';
import { Type } from '@angular/compiler';
import { constInput} from '../../enum/constInput';
import { TouchSequence } from 'selenium-webdriver';
import { throwMatDialogContentAlreadyAttachedError, MatGridTileHeaderCssMatStyler } from '@angular/material';
import { DataTableDirective } from 'angular-datatables';
import { trigger } from '@angular/animations';
import { Subject } from 'rxjs';
declare var JQuery: any;

@Component({
  selector: 'app-taskcreate',
  templateUrl: './taskcreate.component.html',
  styleUrls: ['./taskcreate.component.scss',  '../../util/dialog/content/app.less', '../../util/dialog/content/model.less']

})

export class TaskcreateComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild(DataTableDirective,{static:false})
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
 
  //FormControl: FormGroup;
  currentUser: any;
  currentRole: any;
  enableEdit = false;
  adminAccess = false;
  enableEditIndex = null;
  taskEnable = false;
  adminTaskEnable= false;
  public taskList$:any = []; public tempList$:any=[]; public tempRow:any=[];public tempSort : any[];
  public history:any=[];
  public taskType :any; public priority : any;  public status : any; 
  public difficulty:any; public application:any; 
  public employeeno:any; public employeeinfo:any;public employeename:any;
  public type : any;  public lovTask :any=[];  
  public taskActivity:TaskActivity; public TaskList:TaskList; public searchtask:searchtask;
  addNewItemList: any = []; // for data merge
  public tType: any={taskType:'', userRole:'',status:'', fromCreateDate:'', toCreateDate:''};
  public startTask: any={ internalId:'', startDate:''};
  globalInternalId: number;
  globalRemark : string ;
  stopDateRemark: string; startDateRemark:string;
  percentage : number;
 /**For Start&Stop Task */
 stpTime=false;
 strDate:any;stpDate:any;
 revStrDate:any;revEndDate:any;
 stpTimeIndex =null;  
 cmnTicketId: number;
 temp_index: number;
/** For search by Date  */
fromDate:any; toDate:any;
searchForm : FormGroup;

  constructor(private router: Router, private apiService: ApiService,  private datePipe: DatePipe,
    private formBuilder: FormBuilder,private authService : AuthService, 
    private toastr: ToastrService, private el: ElementRef, private dialogService: DialogService,
    ) {
      
      this.apiService.getLOV('code/task_type').subscribe( data => {
        this.taskType=data;
        for(var i=1;i< this.taskType.length;i++ )
        this.lovTask.push(this.taskType[i]);
      });
        
      this.apiService.getLOV('code/priority').subscribe( data => {
          this.priority=data;
      });
      this.apiService.getLOV('code/status').subscribe( data => {
        this.status=data;
      });
      this.apiService.getLOV('code/difficulty').subscribe( data => {
        this.difficulty=data;
      });
      this.apiService.getLOV('code/application').subscribe( data => {
        this.application=data;
      });
      this.authService.isEmployeeData.subscribe(data => {
          this.employeeno = data;
          //console.log("  this.employeeno"+  JSON.stringify(this.employeeno));
          if(this.employeeno){
            this.apiService.getLOV('user/employeeinfo/'+this.employeeno).subscribe( data => {
                this.employeeinfo=data;              
                this.employeename=  this.employeeinfo && this.employeeinfo.fullName;
            });
          }
      }); 
      
     }

  ngOnInit() { 
    this.taskEnable=false;
    this.searchtask={};
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
      order:[0, 'desc'],
    };
    this.searchForm = this.formBuilder.group({
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required], 
      status: ['', Validators.required], 
  });
   /*   this.authService.isUserRole.subscribe(data => {
        console.log("data"+JSON.stringify(data));
        if(JSON.stringify(data)===""){
          this.ngOnInit();
        }else { 
          this.currentRole= data;  
        }
        console.log( " this.currentRole"+this.currentRole);
        this.adminAccess = this.currentRole && this.currentRole != 'cms_user' && true;  
      });  */
      this.apiService.getLOV('user/login').subscribe( data => {
        let usr: any = data; 
        this.currentUser = usr.userName;
          this.currentRole = usr.role;
          if(this.currentRole != 'cms_user'){
            this.adminAccess=true;
          }
        this.apiService.getLOV('code/task_type').subscribe( data => {
            this.taskType=data;
            this.type=this.taskType[0].tableValue; 
            let dur = constInput.days*(1000 * 3600 * 24); 
            this.fromDate =(new Date().getTime()-dur);
            this.toDate= new Date().getTime()+(1000 * 3600 * 24);
            this.searchByTask(this.type);
        });         
      });  
 
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }
enableTicket = false;
  changeTaskType(ls){
    if(ls.taskType=='ticket'){this.enableTicket=true;}else{this.enableTicket=false; }
    this.taskType.forEach(tType =>{
      if(tType.tableValue == ls.taskType)
        ls.taskTypeDesc = tType.tableName;
    });
  }
  changePriority(ls){
    this.priority.forEach(pri =>{
      if(pri.tableValue == ls.priority)
        ls.priorityDesc = pri.tableName;
    });
  }

searchByTask(type){
 
    this.tempRow=[];
    this.taskList$ =null;
    this.tType.taskType= type;
    this.tType.userRole= this.currentRole;
    this.tType.status=this.searchForm.get('status').value;
    this.tType.toCreateDate= this.datePipe.transform(this.toDate,'dd/MM/yyyy');
    this.tType.fromCreateDate=this.datePipe.transform(this.fromDate,'dd/MM/yyyy');
    //console.log(" this.tType:"+ JSON.stringify(this.tType));
    //console.log(JSON.stringify(this.tType.userRole)+"Role before search:"+JSON.stringify(this.tType));
    this.apiService.PostApi('tasks/v3/key/', this.tType ).subscribe(data => {
    this.tempList$ =data;
   // console.log(" this.tempList$"+ JSON.stringify(this.tempList$));
    this.tempRow=data;
     this.taskList$ = []; 
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
          
          if(this.tempList$[i].ticketId===null || this.tempList$[i].ticketId==='null')
            this.tempList$[i].ticketId = "";
          if(this.tempList$[i].application===null || this.tempList$[i].application==='null')
            this.tempList$[i].application = "";
          if(this.tempList$[i].duration===null || this.tempList$[i].duration==='null')
            this.tempList$[i].duration = "";
          if(this.tempList$[i].difficulty===null || this.tempList$[i].difficulty==='null')
            this.tempList$[i].difficulty = "";
          if(this.tempList$[i].status===null || this.tempList$[i].status==='null')
            this.tempList$[i].status = "";
       
          if (this.adminAccess){
            //this.employeeno='10033627';
            console.log("emp:"+this.employeeno);
            if(this.employeeno===this.tempList$[i].employeeNo){
                this.adminTaskEnable=true;
                if(this.tempList$[i].dtl_start_date!='null' && this.tempList$[i].dtl_end_date==='null'){
                this.taskEnable =true;
                }
            }
          }else {  
            if(this.tempList$[i].dtl_start_date!='null' && this.tempList$[i].dtl_end_date==='null'){
             
              this.taskEnable =true;
             }

          }
              this.taskList$.push(this.tempList$[i]);  
              //this.dtTrigger.unsubscribe();
              //this.dtTrigger.next();
        }  

      }else {
        console.log("No Data List!");
    }  
     //console.log("search data:"+JSON.stringify(this.taskList$));
     // console.log("adminAccess:"+this.adminAccess+"_stpTimeIndex:"+this.stpTimeIndex+"_stpTime"+this.stpTime+"_taskEnable"+this.taskEnable);
    }, err => {
      this.taskList$ = [];
    });
}

saveSegment(selectedData) {
  this.enableEditIndex = null; 
}
//editedRowList:any =[];
enableEditMethod(e, i, selectedData: any) {
 
  this.enableEdit = true;
  this.enableEditIndex = i;
  let updateFlag = false;
  selectedData.updateFlag = true;
  if(selectedData.taskType==='ticket') this.enableTicket=true; else{this.enableTicket=false;}
  //this.editedRowList.push(selectedData);
  //let addNewList = [];
  //this.reload(addNewList,selectedData);
  //console.log( JSON.stringify(selectedData)+ "Enable State:"+this.enableEdit + this.enableEditIndex);
}

checkAllLt(event: any){
  let table:any = document.getElementById('task-tbl');
  this.taskList$.forEach(u =>{            
      for (var i = 1, row; row = table.rows[i]; i++) {
          if(row.cells[0].innerHTML == u.taskType){
              u.checkFlag = event.currentTarget.checked;
          }
      }            
  });
}

  reloadTaskList(addNewList) {
    this.taskList$ = null;
    this.addNewItemList = [];
    this.enableEditIndex = null;
   // console.log("this.tType:"+this.tType);
    this.apiService.PostApi('tasks/v3/key/', this.tType ).subscribe(data => {
       this.taskList$ = data;
       addNewList.forEach(n => {
        this.taskList$.push(n);
      })
      this.taskList$.forEach(task => {
        task.sortData = (task.internalId);
        this.taskType.forEach(taskType => {
          if(taskType.tableValue === task.taskType)
            task.taskTypeDesc = taskType.tableName;
        });
        this.priority.forEach(p => {
          if(p.tableValue === task.priority)
            task.priorityDesc = p.tableName; 
        });
        if(task.ticketId===null || task.ticketId==='null')
            task.ticketId = "";
          if(task.application===null || task.application==='null')
            task.application = "";
          if(task.duration===null || task.duration==='null')
            task.duration = "";
          if(task.difficulty===null || task.difficulty==='null')
            task.difficulty = "";
          if(task.status===null || task.status==='null')
            task.status = "";
      });
    });    
  }

  deleteTaskData() {
    Swal.fire({
      title: "Confirmation!",
      text: "Are you sure to delete data?",
      confirmButtonText: 'Confirm',
      showConfirmButton: true,
      showCancelButton: true     
    }).then((willSave) => {
      if(willSave.value){
        let updateList = [];
        let addNewList = [];
        let deleteNewList = [];
        this.taskList$.forEach(e =>{
          if(e.checkFlag && e.internalId)
            updateList.push({"internalId":e.internalId});
          if(!e.internalId && !e.checkFlag)
            addNewList.push(e);
          if(!e.internalId && e.checkFlag)
            deleteNewList.push(e);
        });
        if(!updateList || updateList.length ==0 && deleteNewList.length == 0){
          this.toastr.error('Please select row(s) to delete');
          return;
        } 
        this.apiService.PostApi('deletetask', updateList)
            .subscribe( data => {
              this.reloadTaskList(addNewList);
              this.toastr.success('Successfully Deleted!');              
        });       
      }
    });
  }
  deleteRow(e, i, selectedData: any){
    Swal.fire({
        title: "Confirmation!",text: "Are you sure to delete record?", confirmButtonText: 'Delete',
        showConfirmButton: true, showCancelButton: true     
      }).then((willSave) => {
        if(willSave.value){
          let deleteList = [];
          deleteList.push(selectedData);
            this.apiService.PostApi('deletetask', deleteList).subscribe( data => {  
                this.toastr.success('Successfully Deleted!') ;
                this.searchByTask(this.tType.taskType);
            });
        }
    });
  }

  saveTaskData(){
    Swal.fire({
      title: "Confirmation!",
      text: "Are you sure to save data?",
      confirmButtonText: 'Confirm',
      showConfirmButton: true,
      showCancelButton: true     
    }).then((willSave) => {
      if(willSave.value){
        let validFlag = true;
        let saveList = [];
        this.taskList$.forEach(e => {
          
          if(!e.taskType){
            this.toastr.error('Task Type is empty!'); 
            validFlag = false;
            return;
          }else if(e.err){
            this.toastr.error(e.err ); 
            validFlag = false;
            return;
          }else if(!e.internalId && !e.err && e.taskType ){ // for valid new data
              e.employeeNo=this.employeeno;
              saveList.push(e);
          }else if(e.internalId && !e.err && e.updateFlag ){ // for valid update data (check update flag)
              saveList.push(e);
          }
        }); 
        if(saveList.length>0){
         // console.log("saveList:"+JSON.stringify(saveList)); 
          saveList.forEach(chkSt => {
            if(!chkSt.application){
              this.toastr.error('Application is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.ticket && chkSt.taskType!='ticket'){
              this.toastr.error('Ticket is empty!'); 
              validFlag = false;
              return;
            }else if(chkSt.taskType==='ticket'){
              if(!chkSt.ticketId){
                this.toastr.error('TicketId is empty!'); 
                validFlag = false;
                return;
               }else{ 
                  let sr= "";
                 if(chkSt.ticketId.startsWith('SR')||chkSt.ticketId.startsWith('INC')) sr=chkSt.ticketId;
                 if(!sr){
                  this.toastr.error('TicketId should start with SR or INC!');
                  validFlag = false;
                  return; }
              }
              if(!chkSt.priority){
                this.toastr.error('Prioty is empty!'); 
                validFlag = false; return;
              }else if(!chkSt.difficulty){
                this.toastr.error('Difficulty is empty!'); 
                validFlag = false; return;
              }else if(!chkSt.status){
                this.toastr.error('Status is empty!'); 
                validFlag = false; return;
              }
            }else if(!chkSt.startDate){
              this.toastr.error('Start Date is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.endDate){
              this.toastr.error('End Date is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.duration){
              this.toastr.error('Duration is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.priority){
              this.toastr.error('Prioty is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.difficulty){
              this.toastr.error('Difficulty is empty!'); 
              validFlag = false;
              return;
            }else if(!chkSt.status){
              this.toastr.error('Status is empty!'); 
              validFlag = false;
              return;
            }
           
            if(chkSt.status === 'Closed' && ((chkSt.dtl_start_date===undefined && chkSt.dtl_end_date===undefined)||(chkSt.dtl_start_date==='null' && chkSt.dtl_end_date==='null' && chkSt.stopped===undefined)) ){
              this.toastr.error('The task can not be closed since it is not started yet!'); 
              //console.log(chkSt.status+"task check:"+ chkSt.dtl_start_date +"EndDate:"+ chkSt.dtl_end_date+"stopped"+chkSt.stopped);
              validFlag = false;
              return;   
            }else if(chkSt.status === 'Closed' && ((chkSt.dtl_start_date!='null' && chkSt.dtl_end_date==='null' && (chkSt.stopped===1 || chkSt.stopped===undefined)) || (chkSt.dtl_end_date==='null' && chkSt.stopped===1) ||
                       (chkSt.internalId && chkSt.stopped===1))){
              this.toastr.error('The task has not been stopped!'); 
             //console.log(chkSt.status+"task check:"+ chkSt.dtl_start_date +"EndDate:"+chkSt.dtl_end_date+"stopped"+chkSt.stopped);
              validFlag = false;
              return; 
            }else if(chkSt.remark==="null" || chkSt.remark===null || chkSt.remark===""){
              chkSt.remark =null;
            }
          });
        }
        if(validFlag){
          //console.log("saveList:"+JSON.stringify(saveList));
          this.apiService.PostApi('submittask', saveList)
            .subscribe( data => {
              this.searchByTask(this.tType.taskType);
              this.toastr.success('Save Success');
              this.enableEditIndex = null;
             // this.stpTime=false;
             // this.taskEnable=false;
          }, er => {
             this.toastr.error(er.error); 
          });   
        }
      }
    });
  }
 
  addNewTask(){
    let list = {
        "sortData" : "null",
        "internalId": null,
        "taskType": "",
        "application": "",
        "ticketId":"",
        "ticket": "",
        "startDate": "",
        "endDate": "",
        "priority": "",
        "status":"",
        "duration":"",
        "difficulty":null,
        "remark":"", 
        "employeeNo":"", 
    }
   let tempList = this.taskList$;
   this.taskList$ = null;

  setTimeout(() => {
    this.taskList$ = [];    
    this.taskList$ = tempList;
    this.taskList$.push(list)
    this.enableEdit = true;
    this.enableTicket=false;
    this.enableEditIndex = this.taskList$.length-1;
  },200);

  }

  checkOnels(selectedData: any, event: any){
    selectedData.checkFlag = event.currentTarget.checked;
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;    
    return true;
  }
  keyPress(event: KeyboardEvent) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode((event).charCode);
    if (!pattern.test(inputChar)) {    
        // invalid character, prevent input
        event.preventDefault();
    }
}
  valuechange(event,internal_id){
    let validFlag = true;
    this.taskList$.forEach(e => {
      if(!e.startDate && (this.enableEditIndex != null) && (this.enableEdit==true) && (e.internalId===internal_id)){
        this.toastr.error('No Start Date'); 
        validFlag = false;
        return;
      }else if((this.enableEditIndex != null) && (this.enableEdit==true)){
        let sDate = new Date(e.startDate);
        let dur = e.duration*(1000 * 3600 * 24); 
        let eDate =(sDate.getTime()+dur);
        e.endDate= new Date(eDate);
      }else{
        validFlag = false;
      }      
    });

    let sDate = new Date(this.taskList$.startDate);
    let dur = event.duration*(1000 * 3600 * 24); 
    let eDate =(sDate.getTime()+dur);
    this.taskList$.endDate= new Date(eDate); 
  }

  startTime(modelId: string, ls,i){
    this.dialogService.open(modelId);
    this.taskActivity={};
    this.temp_index=i;
    this.taskActivity.cmnTicketId=ls.internalId;
    
  }
  saveStartDate(modelId: string){
    Swal.fire({
      title: "Confirmation!",
      text: "Are you sure to start the task?",
      confirmButtonText: 'Start',
      showConfirmButton: true,
      showCancelButton: true     
    }).then((willSave) => {
      if(willSave.value){
   //this.taskActivity={};
    let saveTimeList=[];
    this.strDate=new Date();
    this.taskActivity.startDate=this.strDate;
    this.taskActivity.endDate="";
    this.taskActivity.percentage=null;
    if(!this.startDateRemark){
      this.toastr.error('Description is empty!'); 
      return;
    }else {
      this.taskActivity.startRemark=this.startDateRemark;
    }
 
    saveTimeList.push(this.taskActivity);
    this.taskList$.forEach(element => {
      if(element.internalId===this.taskActivity.cmnTicketId){
        if( element.stopped ===undefined || element.stopped===0){ 
          element.stopped=1;
        }
      }
    });
    this.stpTime=true;
    this.stpTimeIndex=this.temp_index;
   // console.log("stpTime:"+ this.stpTime + "stpTimeIndex:"+ this.stpTimeIndex);
      this.apiService.PostApi('submitautotask', saveTimeList).subscribe( data => {
          this.toastr.success('Your activity has been successfully saved.');
          this.startDateRemark="";
      },er=>{
          this.toastr.error(er.error); 
      });  
    this.dialogService.remove(this.id);
    this.dialogService.close(modelId);    
      }
    });
  }

  stopTime(modelId: string, ls, i){
    this.taskActivity={};
    if(this.strDate==null || this.strDate==null){
      if(ls.dtl_start_date!='null' || ls.dtl_start_date!=''){
        this.strDate=ls.dtl_start_date;
      }
    }
    
    this.stpDate=new Date();
    this.taskActivity.cmnTicketId = ls.internalId;
    this.dialogService.open(modelId);
  }

  saveStopDate(modelId: string){
    Swal.fire({
      title: "Confirmation!",
      text: "Are you sure to stop the task?",
      confirmButtonText: 'Stop',
      showConfirmButton: true,
      showCancelButton: true     
    }).then((willSave) => {
      if(willSave.value){
        let saveTimeList=[];

        this.stpTimeIndex=null;
            this.taskActivity.endDate =this.stpDate;
            if(!this.percentage){ 
              this.toastr.error('Percentage is empty!'); 
              return;
            }else { 
            this.taskActivity.percentage =this.percentage;
            }
            
            if(this.revStrDate!=""||this.revStrDate!=null ){
              this.taskActivity.revStartDate= this.revStrDate;
            }
            if(this.revEndDate!=""||this.revEndDate!=null ){
              this.taskActivity.revEndDate= this.revEndDate;
            }
            if(!this.stopDateRemark){
              this.toastr.error('Remark is empty!'); 
              return;
            }else {
              this.taskActivity.remark= this.stopDateRemark;
            }
           /* Added for check point of Task activity while saving. */
              this.taskList$.forEach(element => {
                if(element.internalId===this.taskActivity.cmnTicketId){
                  if( element.stopped ===undefined || element.stopped===1){ 
                    element.stopped=0;
                  }
                }
              });  
        
            //console.log("this.taskList$"+JSON.stringify(this.taskList$));
            saveTimeList.push(this.taskActivity);
            this.stpTime=false;
            this.taskEnable=false;
            this.adminTaskEnable=false;
           // console.log("stpTime0:"+ this.stpTime + "stpTimeIndex0:"+ this.stpTimeIndex);
            this.apiService.PostApi('submitautotask',  saveTimeList).subscribe( data => {
              //this.searchByTask(this.tType.taskType);
              this.toastr.success('Your activity has been successfully saved.');
              this.revStrDate="";
              this.revEndDate="";
              this.percentage=null;
              this.stopDateRemark="";
          },er=>{
             this.toastr.error(er.error); 
          });  
            this.dialogService.remove(this.id);
            this.dialogService.close(modelId); 
      }
    });
    //console.log( this.taskEnable+"Stop:"+this.stpTimeIndex+this.stpTime);
  }
  
  getComment(modelId: string, ls, i){
    
    this.globalInternalId = ls.internalId;
    this.dialogService.open(modelId);
    this.taskList$.forEach(element => {
      if(element.internalId === this.globalInternalId){
        if(element.remark==="null" ){
          this.globalRemark =null;
        }else{ 
        this.globalRemark = element.remark;
        }
      }
    });
    
  }

  saveComment(modelId: string){
    this.taskList$.forEach(element => {
      if(element.internalId === this.globalInternalId){
        element.remark = this.globalRemark;
       
      }
      
    });
    this.dialogService.remove(this.id);
    this.dialogService.close(modelId);
  }

  taskHistory(modelId: string, ls,i){
    this.history=[];
    this.dialogService.open(modelId);
    this.apiService.getLOV('autotask/'+ls.internalId).subscribe( data => {
    this.history=data;
      //console.log("Task List:"+JSON.stringify(data));
    });
    
  }

  @Input() id: string;
  closeModal(modelId: string) {
    this.dialogService.remove(this.id);
    this.dialogService.close(modelId);
    this.globalRemark = '';
  }


/** For PDF download */
downloadPDF(){
   this.apiService.downloadPDF('todaysubmittedrpt')
   .subscribe( data =>  {
     this.saveToFileSystem(data);
   });

 }
  saveToFileSystem(response) {
 
    let binaryData = [];
    binaryData.push(response.body);
    if(!window.navigator.msSaveOrOpenBlob){
      let downloadLink: any;
      downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: 'application/pdf'}));
     // downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
     downloadLink.setAttribute('download', 'application/pdf');
      document.body.appendChild(downloadLink);
      downloadLink.click();
    }else{ //IE & Edge  //msSaveBlob only available for IE & Edge
   //   window.navigator.msSaveBlob(new Blob(binaryData, {type: dataType}), response.headers.get(`Content-Type`).split(";", 3)[1].substr(10));
    }  
}

searchData(event:any,colname:any){
 //console.log(event.target.value+"col:"+colname);
 if(!event.target.value){this.searchtask.startDt="";this.searchtask.endDt="";}
 let searchkey ="";
 let searchList=[]; this.tempRow=[]; 
 searchkey=event.target.value;
 //console.log(JSON.stringify(this.tType)+"event:"+searchkey);
 searchkey=searchkey.toLowerCase();
 this.tempRow=[];
  this.taskList$ =null;
    this.tType.taskType= this.type;
    this.tType.userRole= this.currentRole;
    this.tType.fromDate= this.fromDate;
    this.tType.status=this.searchForm.get('status').value;
    this.tType.toDate= new Date(this.toDate).getTime()+(1000 * 3600 * 24);
    //console.log(" this.tType:"+ JSON.stringify(this.tType));
    this.apiService.PostApi('tasks/v3/key/', this.tType ).subscribe(data => {
    this.tempList$ =data;
    this.tempRow=data;
    this.taskList$ = [];
 
   this.tempRow.forEach(task => {
   task.sortData = (task.internalId);
   this.taskType.forEach(taskType => {
     if(taskType.tableValue === task.taskType)
       task.taskTypeDesc = taskType.tableName;
   });
   this.priority.forEach(p => {
     if(p.tableValue === task.priority){ 
       task.priorityDesc = p.tableName; }else if(task.priority===null || task.priority==="null"){task.priorityDesc =""; }
       //console.log("Task:"+JSON.stringify(task)+"priority:"+JSON.stringify(task.priority));
   });
   if(task.application===null || task.application==='null'){task.application=""; }
   if(task.ticketId===null || task.ticketId==='null'){task.ticketId=""; }
   if(task.ticket===null || task.ticket==='null'){task.ticket=""; }
   if(task.startDate===null || task.startDate==='null'){task.startDate=""; }
   if(task.endDate===null || task.endDate==='null'){task.endDate=""; }
   if(task.duration===null || task.duration==='null'){task.duration=""; }
   if(task.difficulty===null || task.difficulty==='null'){task.difficulty=""; }
   if(task.status===null || task.status==='null'){task.status=""; }
   if(task.full_NAME===null || task.full_NAME==='null'){task.full_NAME=""; }
 });
 
   if(colname==='tasktyp'){ 
    this.tempRow.forEach(element => {
      let taskTy= element.taskType.toLowerCase();
      if(taskTy.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='app'){
    this.tempRow.forEach(element => {
      let apps= element.application.toLowerCase();
      if(apps.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='ticketid'){
    this.tempRow.forEach(element => {
      let ticketid= element.ticketId.toLowerCase();
      if(ticketid.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='ticket'){
   
    this.tempRow.forEach(element => {
      let ticket= element.ticket.toLowerCase();
      if(ticket.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='startdt'){
   let sDate =searchkey.split(' ')[0];
   let sDate2=sDate.split("/").reverse().join("-");
    this.tempRow.forEach(element => {
      let ticket= element.startDate.toLowerCase();
      if(ticket.startsWith(sDate2)){
        searchList.push(element); 
      }
    });
  }else if(colname==='enddt'){
    let eDate =searchkey.split(' ')[0];
    let eDate2=eDate.split("/").reverse().join("-");
    this.tempRow.forEach(element => {
      let ticket= element.endDate.toLowerCase();
      if(ticket.startsWith(eDate2)){
        searchList.push(element); 
      }
    });
  }else if(colname==='duration'){
    this.tempRow.forEach(element => {
      let ticket= element.duration.toLowerCase();
      if(ticket.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='priority'){
    this.tempRow.forEach(element => {
      let priority= element.priorityDesc.toLowerCase();
      if(priority.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='difficulty'){
    this.tempRow.forEach(element => {
      let difficulty= element.difficulty.toLowerCase();
      if(difficulty.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='status'){
    this.tempRow.forEach(element => {
      let status= element.status.toLowerCase();
      if(status.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else if(colname==='fullname'){
    this.tempRow.forEach(element => {
      let fullname= element.full_NAME.toLowerCase();
      if(fullname.search(searchkey)!=-1){
        searchList.push(element); 
      }
    });
  }else{ 
    this.taskList$=searchList; 
  }
  this.taskList$=searchList;
  //console.log("searchList:"+JSON.stringify(this.taskList$));

}); 
}
searchByDate(){
  let frmDate=""; frmDate= this.searchForm.get('fromDate').value;
  let toDate=""; toDate= this.searchForm.get('toDate').value;
  //console.log(" this.fromDate"+ frmDate +"this.toDate"+toDate);
  if( frmDate===undefined || frmDate==='' || toDate===undefined || toDate==='' ){
    this.toastr.error("Search Date is empty!");
    return false;
  }else {
    this.fromDate=frmDate;
    this.toDate= new Date(toDate).getTime()+(1000 * 3600 * 24);
   // console.log(" this.fromDate"+ this.fromDate+"this.toDate"+this.toDate);
    this.searchByTask(this.type);
  }

}
 

}
