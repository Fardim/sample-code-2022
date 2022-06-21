import { Component } from '@angular/core';
import { ErrorStateRes } from '@models/schema/schema';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';

@Component({
  selector: 'pros-schema-view',
  template: ''
})
export class SchemaViewComponent {

   /**
    * Hold the whole error information ...
    */
   errorStateRes: ErrorStateRes;

  constructor(
   public schemaDetailsService: SchemaDetailsService
  ) {
    this.checkGlobalErrorState();
  }

  checkGlobalErrorState() {
    this.schemaDetailsService.schemaErrorStateCheck().subscribe(res=>{
      console.log(`Looks good ... go for next`);
    }, err=>{
      console.log(`Error: ${err?.error?.message}`);
      this.errorStateRes = err?.error;
    });
  }




}
