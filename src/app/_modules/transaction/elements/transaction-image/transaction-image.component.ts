import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FieldResponse } from '@modules/transaction/model/transaction';
import { DmsService } from '@services/dms/dms.service';

@Component({
  selector: 'pros-transaction-image',
  templateUrl: './transaction-image.component.html',
  styleUrls: ['./transaction-image.component.scss']
})
export class TransactionImageComponent implements OnInit {
  /**
   * Feild response ...
   */
  @Input() fieldObj: FieldResponse;

  imgSrc = null;

  constructor(
    private dmsService: DmsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getImage(this.fieldObj?.url || this.fieldObj?.fieldCtrl?.url);
  }

  getImage(fielId) {
    if(fielId)
      this.dmsService.downloadFile(fielId).subscribe((resp) => {
        const reader = new FileReader();
        reader.readAsDataURL(resp);
        const that = this;
        reader.onloadend = function() {
          that.imgSrc = reader.result;
          that.imgSrc = that.sanitizer.bypassSecurityTrustResourceUrl(that.imgSrc);
        }
      });
  }
}
