import { Component, Input } from '@angular/core';

@Component({
  selector: 'pros-admin-tile',
  templateUrl: './admin-tile.component.html',
  styleUrls: ['./admin-tile.component.scss']
})
export class AdminTileComponent {

  @Input()
  icon: string;
  @Input()
  title: string;
  @Input()
  color: string;
  @Input()
  text: string;
  @Input()
  help: string;
  @Input()
  info: string;
  @Input()
  count: number;
  @Input()
  chip: string;
  @Input()
  image: string;
  @Input()
  link: string;
  @Input()
  iconColor: string;
  @Input()
  link2: string;

  linker() {
    if (this.count <= 0 || this.link2 == null) {
      return this.link;
    } else {
      return this.link2;
    }
  }

}
