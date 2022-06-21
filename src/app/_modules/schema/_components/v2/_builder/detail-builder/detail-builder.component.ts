import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailView } from '@models/schema/schemadetailstable';
import { SchemaListDetails } from '@models/schema/schemalist';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { SchemalistService } from '@services/home/schema/schemalist.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'pros-detail-builder',
  templateUrl: './detail-builder.component.html',
  styleUrls: ['./detail-builder.component.scss']
})
export class DetailBuilderComponent implements OnInit, OnDestroy {

  DetailView = DetailView;


  /**
   * Module / dataset id
   */
  moduleId: string;

  /**
   * Schema id
   */
  @Input()
  schemaId: string;

  /**
   * Variant id if have otherwise by default is 0 for all
   */
  variantId = '0';

  activeTab = 'error';

  /**
   * Use this variable for render / draw different view of UI ..
   *
   * DetailView.DATAQUALITY_VIEW is default view ...
   */
  displayFormat : DetailView ;

  /**
   * Store schema informations..
   */
  schemaDetails: SchemaListDetails;

  /**
   * Hold all subscribers ..
   */
  subscribers: Subscription[] = [];


  constructor(
    private activatedRouter: ActivatedRoute,
    private schemaService: SchemalistService,
    private sharedService: SharedServiceService
  ) { }

  ngOnDestroy(): void {
    this.subscribers.forEach(sub=>{
      sub.unsubscribe();
    });
  }

  ngOnInit(): void {
    // get moduel , schema and variant ids from params
    this.activatedRouter.params.subscribe(params=>{
      // only update module id once schema details are loaded
      if(this.schemaId !== params.id) {
        this.schemaId = params.id;
        this.getSchemaDetails(this.schemaId, '0');
      }
      // else if(this.variantId !== params.variantId) {
      //   this.variantId = params.variantId ? params.variantId : '0' ;
      // }
    });

     // get queryParams for status ..
    this.activatedRouter.queryParams.subscribe(queryParams=> {
      this.activeTab = queryParams.status ? queryParams.status: 'error';
    });

    // // Subscribe to schema run notifier
    // const sub = this.sharedService.getSchemaRunNotif().subscribe(info => {
    //   if(info) {
    //     this.getSchemaDetails(this.moduleId, this.schemaId, this.variantId);
    //   }
    // });
    // this.subscribers.push(sub);

    this.getSchemaDetails(this.schemaId, '0');

    // // TODO .. based on schema type ..
    // this.displayFormat = DetailView.CLASSIFICATION_VIEW;

  }

  /**
   * Get schema details / information by schema id
   * @param schemaId append on request as parameter
   */
  getSchemaDetails(schemaId: string, variantId: string) {
    const sub = this.schemaService.getSchemaDetailsBySchemaId(schemaId).subscribe(res=>{
      // update all inputs once schema details gets loaded
      this.moduleId = res?.moduleId;
      this.schemaId = schemaId;
      this.variantId = res?.variantId || variantId || '0';
      this.schemaDetails = res;
      this.displayFormat = (res.schemaCategory || DetailView.DATAQUALITY_VIEW) as DetailView;
      console.log(this.schemaDetails);
      this.updateSchemaState(this.schemaDetails)
    }, err=> console.error(`Error : ${err}`));
    this.subscribers.push(sub);

  }

  runCompleted() {
    this.getSchemaDetails(this.schemaId, this.variantId);
  }

  updateSchemaState(schemaDetails: SchemaListDetails) {
    // Check if the schema is in running state
    this.sharedService.updateSchemaById(schemaDetails?.schemaId, schemaDetails?.isInRunning);
  }

}
