import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatButtonModule, 
  MatCheckboxModule, 
  MatCardModule,
  MatIconModule
} from '@angular/material';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule
  ],
  exports:[
    MatButtonModule, 
    MatCheckboxModule, 
    MatCardModule,
    MatIconModule
  ],
  declarations: []
})
export class MaterialModule { }
