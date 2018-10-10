

import { Component, OnInit, NgZone } from '@angular/core';
import {spawn, ChildProcess} from "child_process";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

const remote = require('electron').remote;

const electronFs = remote.require('fs');
const electronDialog = remote.dialog;


@Component({
  moduleId : module.id.split('\\').join('/'), 
  selector: 'App',
  templateUrl:'./app.component.html'
})
export class AppComponent implements OnInit {
  public readonly name = 'electron-forge';

  stdin:string="";
  outputLog:string = "";
  inputLog:string = "";
  activeChild:ChildProcess|any = null;
  activeCmd = "";

  cwd:string;
  cwd$:BehaviorSubject<string>;

  outputLog$:BehaviorSubject<string>;
  inputLog$:BehaviorSubject<string>;

  
  constructor(private ngZone:NgZone){
    console.log("AppComponent constructed!");
    this.outputLog$ = new BehaviorSubject<string>(this.outputLog);
    this.inputLog$ = new BehaviorSubject<string>(this.inputLog);
    this.cwd = process.cwd();
    this.cwd$ = new BehaviorSubject<string>(this.cwd);
  }

  ngOnInit(): void {
    console.log('component initialized',this.activeChild);
    

  }

  selectDirectory(){
    electronDialog.showOpenDialog( {
      properties: ['openDirectory']
    },(filePaths)=>{
      this.ngZone.run(()=>{
        console.log(filePaths, " is choosen");
        if(filePaths){
          process.chdir(filePaths[0]);
          this.cwd = process.cwd();
          this.cwd$.next(this.cwd);
          console.log("Current Working Directory is changed to ",this.cwd);
        }
      });
      

    });
  }

  saveLog(log:string, ioFlag:string){
    electronDialog.showSaveDialog({
      defaultPath: this.cwd+`/${ioFlag}.log`
    },(filename)=>{

      if(filename === undefined){
        return;
      }
      electronFs.writeFile(filename,log, (err:any)=>{
        if(err){
          alert("An error ocurred creating the file "+ err.message);
        }
        // alert(`${filename} is saved`);
        console.log(`${filename} is saved`);
      })
      


    })
  }
  /* * * * * * * * * * * * * * * * * * * * * * 
   * Process input from simulated command line
   * */
  processInput(stdin:string){
    let self = this;
    if(this.activeChild == null){
      console.log("Executing command:"+stdin);
      this.inputLog += '-----------------------------------------------------\n';
      this.inputLog += stdin +'\n';
      this.inputLog$.next(this.inputLog);


      let cmd = stdin.split(/\s+/);
      console.log("Parse commands:",cmd);
      this.activeCmd = cmd[0];
      console.log("Run command with parameters:",cmd[0],cmd.splice(0,1));
      this.activeChild = spawn(this.activeCmd, cmd.splice(0,1)).on('error', 
      function( err:any ){ 
        console.log(err); 
        self.outputLog +="Invalid command:" + err.message + '\n';
        self.outputLog += '-----------------------------------------------------\n';
        self.outputLog$.next(self.outputLog);
        self.activeChild = null;
      });

      
      this.activeChild.stdout.on('data', (data:any) => {
        this.ngZone.run(
          ()=>{
            console.log(`child stdout:\n${data}`);
            this.outputLog += data.toString();
            this.outputLog$.next(this.outputLog);
          });
      });
    
      
 
        this.activeChild.stderr.on('data', (data:any) => {
          this.ngZone.run(
            ()=>{
              console.error(`child stderr:\n${data}`);
              this.outputLog += data.toString();
              this.outputLog$.next(this.outputLog);
            });
          
        });
  
        this.activeChild.on('exit',  (code:any, signal:any) =>{
          this.ngZone.run(
            ()=>{
              console.log('child process exited with ' +
                      `code ${code} and signal ${signal}`); 

              self.outputLog += '-----------------------------------------------------\n';
              this.outputLog$.next(this.outputLog);
              self.activeChild = null;
            });
          
        });
    }
    else{//stream input to child

     console.log("stream input to child stdin",stdin, stdin.length);
      this.inputLog += stdin +'\n';
      this.inputLog$.next(this.inputLog);
      this.activeChild.stdin.write(stdin+'\n',()=>{
        console.log(stdin +" is written into activechild.stdin");
      });
     
    }

    this.stdin = "";//clear stdin

  }
  

  
  clearInput(){
    this.inputLog = "";
    this.inputLog$.next(this.inputLog);
  }

  clearOutput(){
    this.outputLog = "";
    this.outputLog$.next(this.outputLog);
  }
}

