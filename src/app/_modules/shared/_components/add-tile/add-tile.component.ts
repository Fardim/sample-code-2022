import { Component, Input } from '@angular/core';

@Component({
  selector: 'pros-add-tile',
  templateUrl: './add-tile.component.html',
  styleUrls: ['./add-tile.component.scss']
})
export class AddTileComponent {

  @Input()
  text: string;

  constructor() { }

}
