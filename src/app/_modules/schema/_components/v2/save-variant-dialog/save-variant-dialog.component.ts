import { Component, OnInit, Inject } from '@angular/core';
import { SchemaDetailsComponent } from '../schema-details/schema-details.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SchemaVariantService } from '@services/home/schema/schema-variant.service';
import { SchemaVariantsModel, VarinatType } from '@models/schema/schemalist';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'pros-save-variant-dialog',
  templateUrl: './save-variant-dialog.component.html',
  styleUrls: ['./save-variant-dialog.component.scss']
})
export class SaveVariantDialogComponent implements OnInit {

  schemaVarInfo: SchemaVariantsModel;

  constructor(
    public dialogRef: MatDialogRef<SchemaDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private schemaVariantService: SchemaVariantService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    if(this.data && this.data.schemaInfo.schemaId) {
      this.schemaVarInfo = {schemaId:this.data.schemaInfo.schemaId,filterCriteria:this.data.filterData,isDefault:false,variantType: VarinatType.DATA_FILTER} as SchemaVariantsModel;

    }
  }

  /**
   * After changed variant name ..
   * @param name changed variant name
   */
  variantNameChange(name: string) {
    this.schemaVarInfo.variantName = name;
  }

  /**
   * Save update variants ..
   */
  saveUpdateSchemaVariant() {
    this.schemaVariantService.saveUpdateSchemaVariant([this.schemaVarInfo]).subscribe(res=>{
      if(res) {
        this.matSnackBar.open(`Successfully saved `,`Close`,{duration:5000});
        this.dialogRef.close(res);
      }
    }, error=>{
      this.matSnackBar.open(`Something went wrong`,`Close`,{duration:5000});
    });
  }

}
