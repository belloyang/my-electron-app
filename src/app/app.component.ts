

import { Component, OnInit } from '@angular/core';
import {spawn, ChildProcess} from "child_process";
import { PassThrough} from 'stream';



@Component({
  moduleId : module.id.split('\\').join('/'), 
  selector: 'App',
  templateUrl:'./app.component.html'
})
export class AppComponent implements OnInit {
  public readonly name = 'electron-forge';

  stdin:string="";
  stdout:string = "";
  inputLog:string = "";
  activeChild:ChildProcess = null;
  activeCmd = "";
  constructor(){
    console.log("AppComponent constructed!");
  }

  ngOnInit(): void {
    console.log('component initialized',this.activeChild);
    

  }

  processInput(stdin:string){
    if(this.activeChild == null){
      console.log("Executing command:"+stdin);
      this.activeCmd = stdin;
      this.activeChild = spawn(stdin).on('error', 
      function( err:any ){ 
        console.log(err); 
      });

      let self = this;
      this.activeChild.stdout.on('data', (data:any) => {
        console.log(`child stdout:\n${data}`);
        this.stdout += data.toString();
      });
    
      
      this.activeChild.stdin.on('data', (data:any) => {
          console.log(`child stdin:\n${data}`);
          this.inputLog += data.toString();
        });
  
        this.activeChild.stderr.on('data', (data:any) => {
          console.error(`child stderr:\n${data}`);
          this.stdout += data.toString();
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
      this.activeChild.stdin.write(stdin+'\n',()=>{
        console.log(stdin +" is written into activechild.stdin");
      });
     
    }

    this.stdin = "";//clear stdin

  }
  

}

