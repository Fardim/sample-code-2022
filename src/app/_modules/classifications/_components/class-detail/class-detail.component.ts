import { Component, Inject, Input, LOCALE_ID, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Class, languages } from '@modules/classifications/_models/classifications';
import { RuleService } from '@services/rule/rule.service';
import { UserService } from '@services/user/userservice.service';
import * as moment from 'moment';
import { takeWhile } from 'rxjs/operators';

export const ELEMENT_DATA_ISNOUN = [
  { header: 'Class type', field: 'classType', type: 'object' },
  { header: 'Noun short', field: 'code', type: 'lang' },
  { header: 'Noun long', field: 'codeLong', type: 'lang' },
  { header: 'Modifier short', field: 'mod', type: 'lang' },
  { header: 'Modifier long', field: 'modLong', type: 'lang' },
  { header: 'Noun numeric code', field: 'numCod', type: 'text' },
  { header: 'Modifier numeric code', field: 'numMod', type: 'text' },
  { header: 'Description', field: 'description', type: 'text' },
  { header: 'Colloquial name', field: 'colloquialNames', type: 'list' },
  { header: 'Image', field: 'imageUrl', type: 'image' },
  { header: 'Valid from', field: 'validFrom', type: 'date' },
  { header: 'Enable description generator', field: 'isNoun', type: 'check' },
  { header: 'Noun to be part of short description', field: 'isCodePartOfDesc', type: 'check' },
  { header: 'Modifier to be the part of short description', field: 'isModPartOfDesc', type: 'check' },
  { header: 'Inherit characteristics', field: 'inheritAttributes', type: 'check' },
  { header: 'Reference type', field: 'referenceType', type: 'text' },
  { header: 'Reference code', field: 'referenceCode', type: 'text' },
  { header: 'SAP class', field: 'sapClass', type: 'text' },
  { header: 'Languages', field: 'classLabels', type: 'list' },
];

export const ELEMENT_DATA = [
  { header: 'Class type', field: 'classType', type: 'object' },
  { header: 'Class name', field: 'code', type: 'text' },
  { header: 'Description', field: 'code', type: 'lang' },
  { header: 'Colloquial name', field: 'colloquialNames', type: 'list' },
  { header: 'Valid from', field: 'validFrom', type: 'date' },
  { header: 'Inherit characteristics', field: 'inheritAttributes', type: 'check' },
];
@Component({
  selector: 'pros-class-detail',
  templateUrl: './class-detail.component.html',
  styleUrls: ['./class-detail.component.scss']
})
export class ClassDetailComponent implements OnInit, OnChanges {
  @Input() class: Class;

  subscriptionEnabled = true;
  displayedColumns: string[] = ['header', 'cell'];
  dataSource;
  limit = 2;
  selectedLanguage;
  hasMoreLanguages = false;
  langList = languages;
  dateformat = 'DD.MM.YYYY';
  colloquialNames = [];

  constructor(
    private userService: UserService,
    private ruleService: RuleService,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.locale = this.locale.split('-')[0].toLowerCase();
  }

  ngOnInit(): void {
    this.setDatasource();
    this.setDefaultLangaugue();
    this.getColloquialNames();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.class?.currentValue !== changes.class?.previousValue) {
      this.getColloquialNames();
      this.languageChanged(this.locale);
    }
  }

  get classLanguages() {
    return this.class?.classLabels?.map(classLabel => {
      const cl = (classLabel.language as string)?.toLowerCase();
      const l = languages.find(lang => lang.id === cl);

      return l?.name || cl;
    });
  }

  getColloquialNames(){
    if(this.class.uuid){
      this.ruleService.getColloquialNames(this.class.uuid).pipe(takeWhile(()=>this.subscriptionEnabled)).subscribe((data) => {
        if(data?.response?.colloquialNames?.length){
          this.class.colloquialNames = data.response.colloquialNames;
        }
      })
    }
  }

  getColloquialNameList(fieldId: string) {
    if (fieldId === 'colloquialNames') {
      const colloquialNames = this.class?.colloquialNames?.filter(x => x.language?.toLowerCase() === this.selectedLanguage?.language?.toLowerCase());
      this.colloquialNames = colloquialNames;
      return colloquialNames;
    }
  }

  getLanguageList(fieldId: string) {
    if (fieldId === 'classLabels') {
      const cls = this.class?.classLabels?.map(x => (x.language as string)?.toLowerCase());
      const selectedLanguages = this.langList.filter((language) => cls.includes(language.id));

      return selectedLanguages;
    }
  }

  setDatasource() {
    this.dataSource = this.class?.isNoun ? ELEMENT_DATA_ISNOUN : ELEMENT_DATA;
  }

  setDefaultLangaugue() {
    this.languageChanged(this.locale);
    this.userService.getUserDetails().subscribe((user) => {
      this.dateformat = user.dateformat || 'DD.MM.YYYY';
    });
  }

  getDate(timestamp) {
    if(timestamp && timestamp !== '0'){
      return moment(parseInt(timestamp, 10)).format(this.dateformat);
    }
    return '';
  }

  hasLimit(arr): boolean {
    return arr?.length > this.limit;
  }

  getLanguaugeLabel(code){
    if (code) {
      return this.langList.find((lang) => lang.id === code.toLowerCase())?.name;
    }
    return '';
  }

  languageChanged(langCode) {
    if(!this.class) { return; }

    this.selectedLanguage = this.class?.classLabels?.find((label) => (label.language as string)?.toLowerCase() === langCode.toLowerCase())
  }
}
