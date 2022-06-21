
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { EditorService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'pros-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  providers: [
    EditorService
  ],
})
export class RichTextEditorComponent implements OnInit,AfterViewInit, OnDestroy {
  @Input() tabFieldId: any;

  @Input() control;

  @Input() isReadOnly = false;

  @Input() value: string;

  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();
  editorInstance: any;
  hideToolbar = true;
  @ViewChild('editorContainer') editorContainer: ElementRef<HTMLInputElement>;
  toolbar: Element;

  constructor(private editorService: EditorService,
    private renderer: Renderer2) { }
  ngAfterViewInit(): void {
    this.initiateEditor();

    if (this.control) {
      this.setEditorData(this.control.value);
      this.control.valueChanges.pipe(takeUntil(this.unsubscribeAll$)).subscribe((val) => {
        this.setEditorData(val);
      });
    } else if (this.value) {
      this.setEditorData(this.value);
    }

    this.editorInstance.on('text-change', () => {
      const currentValue = this.editorInstance?.root?.innerHTML;
      const updatedValue = {
        editorId: this.tabFieldId,
        newValue: currentValue
      };
      this.valueChange.emit(updatedValue);
    });

    // this.editorInstance.focus();

    document.getElementById(this.tabFieldId).addEventListener('click', () => {
      this.editorInstance.focus();
    });

  }

  ngOnInit(): void {
  }

  clickEditor(event: any, tabFieldId: any) {
  }

  setEditorData(data: string) {
    this.editorService.setData(this.editorService.convertToDelta(data));
  }

  toggleToolbar() {
    this.hideToolbar = !this.hideToolbar;
    this.isReadOnly ? this.editorInstance.disable() : this.editorInstance.enable();
    if(this.hideToolbar) {
      this.renderer.addClass(this.toolbar, 'ql-hidden-toolbar');
    } else {
      this.renderer.removeClass(this.toolbar, 'ql-hidden-toolbar');
      this.editorInstance.focus();
    }
  }

  initiateEditor() {

    this.editorInstance = this.editorService.initiate('#' + this.tabFieldId, {
      theme: 'snow',
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'], // toggle buttons
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
        [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
        [{ direction: 'rtl' }], // text direction
        [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }],
        ['clean']
      ]
    });

    if(this.isReadOnly) {
      this.editorInstance.disable();
    }

    setTimeout(() => {

    try{
      this.toolbar = this.editorContainer.nativeElement.querySelector('.ql-toolbar');

      const icon = this.renderer.createElement('i');
      this.renderer.addClass(icon, 'mdo-icons-light');
      const iconName = this.renderer.createText('pencil');
      this.renderer.appendChild(icon, iconName);

      const editButton = this.renderer.createElement('button');
      this.renderer.appendChild(editButton, icon);
      this.renderer.listen(editButton, 'click', () => {
        this.toggleToolbar();
      });

      const span = this.renderer.createElement('span');
      this.renderer.addClass(span, 'ql-formats');
      this.renderer.appendChild(span, editButton);

      this.renderer.insertBefore( this.toolbar, span, this.toolbar.firstChild);
      this.renderer.addClass(this.toolbar, 'ql-hidden-toolbar');
    } catch(error) {
      console.log(error);
    }
    }, 30);
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }

}
