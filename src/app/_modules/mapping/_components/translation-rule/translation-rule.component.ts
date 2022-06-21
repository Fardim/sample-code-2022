import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pros-translation-rule',
  templateUrl: './translation-rule.component.html',
  styleUrls: ['./translation-rule.component.scss'],
})
export class TranslationRuleComponent implements OnInit {
  saving = false;
  constructor(private router: Router) {}

  ngOnInit(): void {}

  close() {
    this.router.navigate([{ outlets: { outer: null } }], { queryParamsHandling: 'preserve', preserveFragment: true });
  }
}
