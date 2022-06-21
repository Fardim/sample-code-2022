import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Userdetails } from '@models/userdetails';

@Component({
  selector: 'pros-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit, OnChanges {

  @Input() tileKey: string;
  @Input() userDetail: Userdetails;
  @Input() disableClose: boolean = false;

  @Output() emitRedirectPath: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {}

  redirectToSubPage(redirectTo: string){
    this.emitRedirectPath.emit(redirectTo);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.userDetail && changes.userDetail.currentValue){
      this.userDetail = changes.userDetail.currentValue;
    }
    if(changes?.tileKey?.currentValue){
      this.tileKey = changes.tileKey.currentValue;
    }
  }
}
