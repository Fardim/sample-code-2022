import { take } from 'rxjs/operators';
import { NotifService } from '@services/notif/notif.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TemplateModel } from '@models/notif/notif.model';
import { EditorService, DeltaParserService } from 'mdo-ui-library';

@Component({
  selector: 'pros-email-template-preview',
  templateUrl: './email-template-preview.component.html',
  styleUrls: ['./email-template-preview.component.scss'],
  providers: [
    EditorService
  ],
})
export class EmailTemplatePreviewComponent implements OnInit {
  showSkeleton = true;
  emailTemplate: TemplateModel = null;
  editorConfig: any = {
    modules: {
      toolbar: [],
      mention: {}
    },
    placeholder: 'Compose an epic...',
    theme: 'snow',
  };
  editorInstance: any;

  constructor(private router: Router, private notifService: NotifService, private editorService: EditorService, private deltaParserService: DeltaParserService) { }

  ngOnInit(): void {
    this.notifService.emailTemplate$.pipe(take(1)).subscribe(resp => {
      this.showSkeleton = false;
      // const data = JSON.parse(resp.data);
      // resp.data = this.deltaParserService.unparse(data);
      this.emailTemplate = resp;
      this.initEditor();
    });
  }

  initEditor() {
    const modules = this.editorService.getModules();
    this.editorService.loadModules(modules, true).then(() => {
      this.editorInstance = this.editorService.initiate(`#quill-editor-preview`, this.editorConfig);
      this.editorService.setData(this.emailTemplate.data.ops);
      this.editorInstance.disable();
    });
  }

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve' });
  }
}
