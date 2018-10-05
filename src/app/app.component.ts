

import { Component, OnInit } from '@angular/core';
import {spawn, ChildProcess} from "child_process";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';



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

  outputLog$:BehaviorSubject<string>;
  inputLog$:BehaviorSubject<string>;


  constructor(){
    console.log("AppComponent constructed!");
    this.outputLog$ = new BehaviorSubject<string>(this.outputLog);
    this.inputLog$ = new BehaviorSubject<string>(this.inputLog);
  }

  ngOnInit(): void {
    console.log('component initialized',this.activeChild);
    

  }

  processInput(stdin:string){
    let self = this;
    if(this.activeChild == null){
      console.log("Executing command:"+stdin);
      this.activeCmd = stdin;
      this.activeChild = spawn(stdin).on('error', 
      function( err:any ){ 
        console.log(err); 
        self.activeChild = null;
      });

      
      this.activeChild.stdout.on('data', (data:any) => {
        console.log(`child stdout:\n${data}`);
        this.outputLog += data.toString();
        this.outputLog$.next(this.outputLog);
      });
    
      
 
        this.activeChild.stderr.on('data', (data:any) => {
          console.error(`child stderr:\n${data}`);
          this.outputLog += data.toString();
          this.outputLog$.next(this.outputLog);
        });
  
        this.activeChild.on('exit', function (code:any, signal:any) {
          console.log('child process exited with ' +
                      `code ${code} and signal ${signal}`); 
          self.activeChild = null;
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
  

}

