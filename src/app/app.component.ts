

import { Component, OnInit } from '@angular/core';

@Component({
  moduleId : module.id.split('\\').join('/'), 
  selector: 'App',
  templateUrl:'./app.component.html'
})
export class AppComponent implements OnInit {
  public readonly name = 'electron-forge';

  ngOnInit(): void {
    console.log('component initialized');
  }
}

