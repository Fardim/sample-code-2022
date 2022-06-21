import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '@services/home/schema.service';
import { Subscription } from 'rxjs';
import { DiwListComponent } from './diw-list/diw-list.component';

@Component({
  selector: 'pros-diw-home',
  templateUrl: './diw-home.component.html',
  styleUrls: ['./diw-home.component.scss']
})
export class DiwHomeComponent implements OnInit {

  @ViewChild(DiwListComponent) diwListComponent: DiwListComponent;

  /**
   * This will containt the active tab id | will be the schema id
   */
  activeTab = '0';
  schemaView = {
    view: 'details',
    id: '0'
  };

  /**
   * All subscriptions will be here
   */
  subscriptions: Subscription[] = [];

  constructor(
    private schemaService: SchemaService,
    private activatedRouters: ActivatedRoute,
    private routers: Router
  ) { }

  ngOnInit(): void {

    this.activatedRouters.params.subscribe(p=>{
      this.activeTab = p.id && p.id === '_overview' ? '0': p.id;
    });
  }

  navigateToDetails(schemaId: string) {
    const view = (this.schemaView.id !== '0' && this.schemaView.id === schemaId) ? this.schemaView.view : 'details';
    this.routers.navigate(['home','schema','list',`${schemaId}`], { queryParams: { view } });
    this.schemaView.view = 'details';
  }

  setActiveTab(ev) {
    this.activeTab = ev.schemaId;
    this.schemaView = {
      view: ev.view,
      id: ev.schemaId
    };
  }

}
