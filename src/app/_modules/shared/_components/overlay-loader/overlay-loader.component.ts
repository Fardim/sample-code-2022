import { OnInit, Component } from '@angular/core';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';

@Component({
  selector: 'pros-overlay-loader',
  templateUrl: './overlay-loader.component.html',
  styleUrls: ['./overlay-loader.component.scss']
})
export class OverlayLoaderComponent implements OnInit {

  /**
   * hold the loader state as a boolean
   */
  loading: boolean;

  constructor(private shared: SharedServiceService) { }

  ngOnInit() {
    this.shared.loader.subscribe((val: boolean) => {
      this.loading = val;
    })
  }
}
