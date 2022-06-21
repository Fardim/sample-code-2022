import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskListService } from '@services/task-list.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'pros-instance-diagram',
  templateUrl: './instance-diagram.component.html',
  styleUrls: ['./instance-diagram.component.scss']
})
export class InstanceDiagramComponent implements OnInit {


  containerId: string;

  processId: string;

  svg: SafeHtml;

  loader: boolean = true;

  constructor(
    private taskListService: TaskListService,
    private router: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private r: Router
  ) { }

  ngOnInit(): void {

    this.router.params.subscribe(p=>{
      this.containerId = p.containerId || '';
      this.processId = p.processId || '';
    });

    this.getDiagram();
  }


  getDiagram() {
    this.taskListService.getProcessDiagram(this.containerId, this.processId).pipe(finalize(()=> this.loader = false)).subscribe(svg => {
      this.svg = this.sanitizer.bypassSecurityTrustHtml(svg);
    });
  }

  close() {
    this.r.navigate([{ outlets: { sb3: null } }], { queryParamsHandling: 'merge' });
  }
}
