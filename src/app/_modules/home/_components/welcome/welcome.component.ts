import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateUpdateSchema } from '@modules/admin/_components/module/business-rules/business-rules.modal';
import { SchemaService } from '@services/home/schema.service';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { Observable, Subscriber, Subscription, throwError } from 'rxjs';
import { SearchInputComponent } from '@modules/shared/_components/search-input/search-input.component';
import { UploadDatasetComponent } from '@modules/schema/_components/upload-dataset/upload-dataset.component';
import { SchemaListModuleList } from '@models/schema/schemalist';
import { UserService } from '@services/user/userservice.service';
import { licensingInformation, Userdetails } from '@models/userdetails';
import { TransientService } from 'mdo-ui-library';
import { catchError } from 'rxjs/operators';
import { UserLicenseDialogComponent } from '../user-license-dialog/user-license-dialog.component';

@Component({
  selector: 'pros-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit , OnDestroy {
  selectedModuleId: string;

  /**
   * Reference to the search input component for schema
   */
   @ViewChild('searchInput') searchInput: SearchInputComponent;

   /**
    * Reference to the search input component for schema
    */
   @ViewChild('moduleSearchInput') moduleSearchInput: SearchInputComponent;

   /**
    * Modules list to pre-populate
    */
   modulesList = [];

   /**
    * Filtered Modules list to pre-populate
    */
   filteredModulesList = [];

   /**
    * Schema list to pre-populate
    */
   schemaLists = [];

   /**
    * Filtered Schema list to pre-populate
    */
   filteredSchemaList = [];

   /**
    * save required data for upload-dataset
    */
   data: any = {};

   /**
    * All the http or normal subscription will store in this array
    */
   subscriptions: Subscription[] = [];

   /**
    * loading state for module
    */
   loader: boolean;

   /**
    * all schemas
    */
   schemas: SchemaListModuleList[] = [];

   /**
    * constructor of class
    * @param matDialog Instance of MatDialog
    * @param schemaListService Instance the Schema List service class
    */
   constructor(
     public matDialog: MatDialog,
     private schemaListService: SchemalistService,
     private router: Router,
     private schemaService: SchemaService,
     private userService: UserService,
     private transientService: TransientService
   ) { }

   /**
    * Unsubscribe from Observables, services and DOM events
    */
   ngOnDestroy(): void {
     this.subscriptions.forEach(sub => {
       sub.unsubscribe();
     });
   }

   /**
    * load pre loaded function
    */
   ngOnInit(): void {
     this.getObjectTypes();
     this.getUserDetails();
   }

   /**
    * return all the modules with their schemas
    */
   getObjectTypes() {
     this.loader = true;
     const sub = this.schemaService.getDatasetsAlongWithSchemas().subscribe(res=>{
      if(res.datasetsHttp !== undefined) {
        this.modulesList = res.datasetsHttp;
        this.filteredModulesList = res.datasetsHttp;
      }
      if(res.schemaHttp !== undefined) {
        this.schemas = res.schemaHttp;
      }
    }, err=>{console.error(`Exception : ${err.message}`)});
    this.subscriptions.push(sub);
   }

   getUserDetails() {
    this.userService.getUserDetails().subscribe(
      (response: Userdetails) => {
        this.getLicenseValidateInfo(response.orgId);
      },
      (error) => console.error(`Error : ${error.message}`)
    );
   }

   getLicenseValidateInfo(orgId) {
    if (!orgId) {
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
      return;
    }
    this.userService.getLicenseValidateInfo(orgId)
    .pipe(
      catchError((err) => {
        console.log(err);
        return throwError(err);
      }),
    )
    .subscribe((response: licensingInformation) => {
      if (response && response?.status === 'EXPIRED') {
        const dialogRef = this.matDialog.open(UserLicenseDialogComponent, {
          data: '',
          width: '400px',
          disableClose: true,
          autoFocus: false
        });
      }
    }, error => {
      this.transientService.open('Something went wrong!', null, { duration: 2000, verticalPosition: 'bottom' });
    })
  }

   /**
    * open Upload data dialog
    */
   openUploadScreen() {
     const dialogRef = this.matDialog.open(UploadDatasetComponent, {
       height: '800px',
       width: '800px',
       data: { selecteddata: this.data },
       disableClose: true,
     });
     dialogRef.afterClosed().subscribe(result => {
       this.data = {};
       console.log('The dialog was closed');
     });
   }

   /**
    * Open schemalist by using that objectId
    * @param objectId value selected oject
    */
   schemaList(objectId) {
     this.searchInput.clearSearch();
     const mm =  this.modulesList.find(f=> f.moduleId === objectId);
     const schms = this.schemas.filter(f=> f.moduleId === objectId)[0];
     if(mm) {
      this.data.objectid = mm.moduleId;
      this.data.objectdesc = mm.moduleDesc;
      this.schemaLists = schms ? schms.schemaLists : [];
      this.filteredSchemaList = schms ? schms.schemaLists : [];
     }
   }

   /**
    * Open Upload data of selected schemaId or for new schema
    * @param schema value when existing schema selected
    */
   selectschema(schema?) {
     this.data.schemaId = schema ? schema.schemaId : null;
     this.data.schemadesc = schema ? schema.schemaDescription : null;
     if (this.data.objectid) {
       const schemaId = schema ? schema.schemaId : null;
       const moduleId = this.data.objectid;
       if (schemaId) {
         this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${moduleId}/${schemaId}` } }],{
           queryParams: {isCheckData: false}
         })
       } else {
         const schemaReq: CreateUpdateSchema = new CreateUpdateSchema();
         schemaReq.moduleId = moduleId;
         schemaReq.discription = 'New schema';
         this.schemaService.createUpdateSchema(schemaReq).subscribe((response) => {
           const receivedSchemaId = response;
           this.router.navigate([{ outlets: { sb: `sb/schema/check-data/${moduleId}/${receivedSchemaId}` } }],{
            queryParams: {isCheckData: false, updateschema: true}
          })
         }, (error) => {
           console.log('Something went wrong while creating schema', error.message);
         })
       }
     } else {
       this.openUploadScreen();
     }
   }

  /**
   * save currently selected module id
   * @param moduleId module Id
   */
  selected(moduleId: string) {
    this.selectedModuleId = moduleId;
    }

   /**
    * filter modules based on searchTerm
    * @param searchTerm pass the search text
    */
   searchModule(searchTerm: string) {
     if (this.modulesList && this.modulesList.length > 0) {
       this.searchFilter(this.modulesList, searchTerm, 'moduleDesc')
       .subscribe((filteredresult) => {
         this.filteredModulesList = filteredresult;
       });
     }
   }

   /**
    * filter schemas based on searchTerm
    * @param searchTerm pass the search text
    */
   searchSchema(searchTerm: string) {
     if (this.schemaLists && this.schemaLists.length > 0) {
       this.searchFilter(this.schemaLists, searchTerm, 'schemaDescription')
       .subscribe((filteredresult) => {
         this.filteredSchemaList = filteredresult;
       });
     }
   }

   /**
    * Track items in a list while rendering
    * @param index pass the index of the item
    * @param itemId optionally pass the item id
    */
   schemaTrackBy(index: any, itemId: any) {
     return index;
   }

   /**
    * Track items in a list while rendering
    * @param index pass the index of the item
    * @param itemId optionally pass the item id
    */
   moduleTrackBy(index: any, itemId: any) {
     return index;
   }

   /**
    * Method to filter results from an object array
    * based on search string
    * @param values array of available values
    * @param searchTerm text to search
    * @param key property name to map the search string to
    */
   searchFilter(values: any[], searchTerm: string, key: string): Observable<any[]> {
     let returnValues = null;
     return new Observable((subscriber: Subscriber<any[]>) => {
       if (!values || values.length === 0 || !searchTerm) {
         returnValues = values;
       }
       if (key !== null && typeof key !== 'undefined') {
         returnValues = values.filter((val) => {
           return val && val[key]? val[key].toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
             : false;
         });
       }
       subscriber.next(returnValues);
     })
   }

}
