import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileAttachment } from '@modules/chat/_common/chat';


@Component({
  selector: 'pros-attachment-section',
  templateUrl: './attachment-section.component.html',
  styleUrls: ['./attachment-section.component.scss']
})
export class AttachmentSectionComponent implements OnInit {

  @Input() attachments: FileAttachment[] = [];
  @Input() removable = false;
  @Input() downloadable = false;

  @Output() valueChange: EventEmitter<FileAttachment[]> = new EventEmitter<FileAttachment[]>();
  constructor() { }

  ngOnInit(): void {
    console.log(this.attachments);
  }

  removeAttachment(attachmentIndex: number): void {
    this.attachments.splice(attachmentIndex, 1);
    this.valueChange.emit(this.attachments);
  }
}
