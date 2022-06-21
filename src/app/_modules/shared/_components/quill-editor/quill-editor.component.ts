import { GLOBALCONSTANTS } from './../../../../_constants/globals';
import { takeUntil } from 'rxjs/operators';
import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  forwardRef,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { EditorService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { getMentionCharIndex, hasValidMentionCharIndex } from '@modules/chat/_common/chat-utility';
import { MentionItem, MENTION_CHARS } from '@modules/chat/_components/chat-editor/chat-editor.component';

@Component({
  selector: 'pros-quill-editor',
  templateUrl: './quill-editor.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => QuillEditorComponent),
    },
    EditorService
  ],
})
export class QuillEditorComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() editorConfig: any = {
    modules: {
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
        ['clean'],
      ],
      mention: {}
    },
    placeholder: 'Compose an epic...',
    theme: 'snow', // or 'bubble'
  };

  @Input() set value(value: string) {
    this.control.setValue(value);
    this.editorService.setData(this.editorService.convertToDelta(value));
  }

  /**
   * Input to set the disabled value
   */
  @Input() set disabled(value: boolean) {
    this.setDisabledState(value);
  }

  @Input() isRequired = false;

  @Input() denotationChar = '';

  /**
   * Unique id for quil editor
   */
  @Input() fieldid = '';

  @Input() selectedMenuItem: {id: any, value: string} = null;

  @Input() returnDelta = false;

  @Output() afterBlur = new EventEmitter<any>();

  @Output() valueChange = new EventEmitter<string>();

  /**
   * Detect if the form field is active
   */
  isActive: boolean;
  /**
   * store field value
   */
  fieldValues: string;

  control: FormControl = new FormControl('');

  editorInstance: any;

  cursorPosition: number;

  mentionCharPosition: number;

  unsubscribeAll$: Subject<boolean> = new Subject<boolean>();

  constructor(private editorService: EditorService) {}

  /**
   * onChange handler for change event
   * @param value pass the current state(string)
   */
  private onChange = (value: string): void => {};
  /**
   * Register touched event
   */
  private onTouched = (): void => {};

  writeValue(val: any): void {
    this.fieldValues = val;
    this.control.setValue(val);
    if(val && val.ops) {
      this.editorService.setData(val.ops);
      // this.editorService.setData(this.editorService.convertToDelta(val));
    }
  }

  /**
   * Method to clear editor contents
   */
  clearEditorData() {
    this.editorService.setData([]);
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched();
    this.isActive = fn === 'focus';
    if (fn === 'blur') {
      this.afterBlur.emit();
    }
  }
  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }

  ngOnInit(): void {}

  /**
   * Angular hook for detecting any changes
   * @param changes Interface containing all the input parameters
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes[GLOBALCONSTANTS.value] && changes[GLOBALCONSTANTS.value].previousValue !== changes[GLOBALCONSTANTS.value].currentValue) {
      this.control.setValue(changes[GLOBALCONSTANTS.value].currentValue);
      this.valueChange.emit(changes[GLOBALCONSTANTS.value].currentValue);
    }
    if (
      changes[GLOBALCONSTANTS.required] &&
      changes[GLOBALCONSTANTS.required].previousValue !== changes[GLOBALCONSTANTS.required].currentValue
    ) {
      this.isRequired = changes[GLOBALCONSTANTS.required].currentValue;
    }
    if (
      changes &&
      changes.denotationChar &&
      changes.denotationChar.currentValue &&
      changes.denotationChar.previousValue !== changes.denotationChar.currentValue
    ) {
      this.editorInstance.getModule('mention').openMenu(changes.denotationChar.currentValue);
    }
    if (
      changes &&
      changes.editorConfig &&
      changes.editorConfig.currentValue
    ) {
      this.editorConfig = changes.editorConfig.currentValue;
      this.changeEditor();
    }

    if (
      changes &&
      changes.selectedMenuItem &&
      changes.selectedMenuItem.currentValue
    ) {
      this.selectedMenuItem = changes.selectedMenuItem.currentValue;
      this.insertObjectTag(this.selectedMenuItem);
    }
  }

  ngAfterViewInit() {
    // this.changeEditor();
  }

  changeEditor() {
    const modules = this.editorService.getModules();
    this.editorService.loadModules(modules, true).then(() => {
      this.editorInstance = this.editorService.initiate(`#quill-editor-${this.fieldid}`, this.editorConfig);
      this.editorService.setData(this.editorService.convertToDelta(this.fieldValues));
      this.control.valueChanges.pipe(takeUntil(this.unsubscribeAll$)).subscribe((data) => {
        this.onChange(data);
        this.valueChange.emit(data);
      });

      this.editorInstance.on('text-change', (delta: any, oldDelta: any, source: string): void => {
        if(this.returnDelta) {
          this.control.setValue(this.editorService.getData());
          this.valueChange.emit(this.editorService.getData());
        } else {
          this.control.setValue(this.editorService.quillGetHTML(this.editorService.getData()));
          this.valueChange.emit(this.editorService.quillGetHTML(this.editorService.getData()));
        }
      });

      this.editorInstance.root.addEventListener('blur', () => {
        this.afterBlur.emit();
      });
      this.editorInstance.root.addEventListener('input', this.editorChangeEvent.bind(this));
    });
  }

  // change event of text editor box for below purposes
  // 1. to set hint to send message on enter visible
  // 2. to show character length when it exceeds 80%
  // 3. Disable send button when character limit exceeds 1024
  private editorChangeEvent() {
    this.mentionCharPosition = this.getMentionCharPosition();
  }

  /**
   * Get the position of mention char in the text editor
   * Utilize the utility method coming from the mention module
   * @returns Number
   */
   getMentionCharPosition(): number | null {
    const range = this.editorInstance.getSelection();
    if (range) {
      this.cursorPosition = range.index;
      const textBeforeCursor = this.getTextBeforeCursor();
      const { mentionCharIndex } = getMentionCharIndex(textBeforeCursor, MENTION_CHARS);
      if (hasValidMentionCharIndex(mentionCharIndex, textBeforeCursor, false)) {
        return this.cursorPosition - (textBeforeCursor.length - mentionCharIndex);
      }
    }

    return null;
  }

  /**
   * method to return text before the cursor position
   * @returns string
   */
  getTextBeforeCursor(): string {
    const startPosition = Math.max(0, this.cursorPosition - 31);
    const textBeforeCursorPos = this.editorInstance.getText(startPosition, this.cursorPosition - startPosition);
    return textBeforeCursorPos;
  }

  insertObjectTag(selected: any, objectCharPosition = this.mentionCharPosition) {
    const render: MentionItem = this.renderObject(selected, objectCharPosition, '');
    this.editorInstance.deleteText(objectCharPosition, this.cursorPosition - objectCharPosition, 'user');
    const insertAtPos = objectCharPosition;
    this.editorInstance.insertEmbed(insertAtPos, 'ql-object', render, 'user');
    this.editorInstance.insertText(insertAtPos + 1, ' ', 'user');
    this.editorInstance.setSelection(insertAtPos + 2, 'user');
  }

  /**
   * Create a render object to display the object name as a mention item
   * @param userInfo pass the selected object
   * @param index pass the mentionChar's position
   * @returns UserMentionItem
   */
  renderObject(objectData: any, index: number, denotationChar = '/'): MentionItem {
    return {
      denotationChar,
      id: objectData.id,
      index,
      value: objectData.value
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(true);
    this.unsubscribeAll$.unsubscribe();
  }
}
