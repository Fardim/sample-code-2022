import { Component, EventEmitter,  OnInit, Output } from '@angular/core';
import { languages } from '@modules/classifications/_models/classifications';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'pros-class-language-list',
  templateUrl: './class-language-list.component.html',
  styleUrls: ['./class-language-list.component.scss']
})
export class ClassLanguageListComponent implements OnInit {
  @Output() selectedLanguage = new EventEmitter<string[]>();
  searchLanguageList = languages;
  allLanguageList = [];

  searchLanguageSub: Subject<string> = new Subject();

  constructor() { }

  ngOnInit(): void {
    Object.assign(this.allLanguageList, this.searchLanguageList);
    this.checkForLanguageChanges();
  }

  addLanguage(lang: string[]) {
    this.selectedLanguage.emit(lang);
  }

  checkForLanguageChanges() {
    this.searchLanguageSub.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((searchString) => {
      this.searchLanguageList = searchString ? this._filter(searchString) : this.allLanguageList;

    });
  }

  _filter(value: any) {
    let availableLanguages = this.allLanguageList;
    if (value) {
      const filterValue = value.toLowerCase();
      availableLanguages = this.allLanguageList.filter(options => options.name.toLowerCase().includes(filterValue));
    }
    return availableLanguages;
  }
}
