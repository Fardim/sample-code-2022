import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AttributeMapData, AttributesMapping } from '@models/schema/classification';
import { AttributesDoc, ClassificationMappingRequest, ClassificationMappingResponse, NounModifier } from '@models/schema/noun-modifier';
import { SharedServiceService } from '@modules/shared/_services/shared-service.service';
import { NounModifierService } from '@services/home/schema/noun-modifier.service';
import { SchemaDetailsService } from '@services/home/schema/schema-details.service';
import { UserService } from '@services/user/userservice.service';
import { TransientService } from 'mdo-ui-library';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface Status {
  text: string;
  code: string;
  count: number;
  isSeleted: boolean;
}

@Component({
  selector: 'pros-library-mapping-sidesheet',
  templateUrl: './library-mapping-sidesheet.component.html',
  styleUrls: ['./library-mapping-sidesheet.component.scss']
})
export class LibraryMappingSidesheetComponent implements OnInit {

  moduleId: string;

  /**
   * Hold current schema id
   */
  schemaId: string;

  libraryNounCode: string;

  libraryModifierCode: string;


  localNounsList: NounModifier[] = [];


  LocalModifiersList: NounModifier[] = [];


  LocalAttributesList: AttributesDoc[] = [];

  /**
   * form to hold mapping data
   */
  mappingForm: FormGroup;

  /**
   * form submission state
   */
  submitted = false;

  /**
   * Get gsn attributes ..
   */
  gsnAttributes: AttributesDoc[] = [];

  preInpVal = '';
  searchString = '';

  /**
   * Store material group info ..
   */
  mgroup: string;
  isMapped = false;

  /**
   * Hold selected noun ctrl
   */
  seletedNounCtrl: NounModifier;

  /**
   * Hold selected modifier ctrl
   */
  seletedModifierCtrl: NounModifier;



  statas: Status[] = [
    {code:'matched', count: 0, text:'Matched', isSeleted: false},
    {code:'suggested', count: 0, text:'Suggested', isSeleted: false},
    {code:'unmatched', count: 0, text:'Unmatched', isSeleted: false},
  ];
  classificationCategory: ClassificationMappingResponse;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private schemaDetailsService: SchemaDetailsService,
    private nounModifierService: NounModifierService,
    private snackBar: TransientService,
    private sharedServices: SharedServiceService,
    private userDetails: UserService
    ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.moduleId = params.moduleId;
      this.libraryNounCode = params.nounCode;
      this.libraryModifierCode = params.modCode;
      this.schemaId = params.schemaId;
      this.activatedRoute.queryParams.subscribe((queryParams) => {
        this.isMapped = Boolean(queryParams.isMapped === 'true');
        this.buildMappingForm();
      });
    });

    this.getLocalNouns();

  }

  /**
   * fetch already saved mappings
   */
  getAttributesMapping() {

    const data = this.mappingForm.value;
    const request: ClassificationMappingRequest = {
      nounCode: data.libraryNounCode,
      modCode: data.libraryModCode,
      nounDesc: '',
      modDesc: '',
      attrList: this.gsnAttributes.map((att) => {
        const attr = {
          attrCode: att.ATTR_CODE,
          attrDesc: att.ATTR_DESC
        };
        return attr;
      })
    };
    if(this.isMapped) {
      this.gsnAttributes.forEach((row) => {
        row.status = 'matched';
        this.addAttributeMappingRow(row);
      });
      this.nounModifierService.getAttributesMapping(this.libraryNounCode, this.libraryModifierCode)
      .subscribe(resp => {
        this.patchMappingForm(resp);
      });
    } else {
      this.nounModifierService.getClassificationMappingData(request).subscribe((resp: any) => {
        this.classificationCategory = resp;

        // set selected noun ctrl
        this.seletedNounCtrl = {NOUN_CODE: this.classificationCategory.noun.targetCtrl, NSNO: this.classificationCategory.noun.targetNounSno} as NounModifier;

        if(this.mappingForm) {
         const frmAray = this.mappingForm.get('attributeMapData') as FormArray;
         frmAray.clear();
        }
        this.gsnAttributes.forEach((row) => {
          const status = this.isMapped? 'matched' : 'unmatched';
          row.status = this.classificationCategory.attrLists.find(x => x.targetCtrl?.ATTR_CODE === row.ATTR_CODE)?.status.toLowerCase() || status;
          this.addAttributeMappingRow(row);
        });
        this.statas.forEach((stat) => {
          stat.count = this.attributeMapData.value.filter(row => row.status === stat.code).length
          + [resp.modifier.status, resp.noun.status].filter(status => status.toLowerCase() === stat.code).length;
        });
        this.nounModifierService.getAttributesMapping(this.libraryNounCode, this.libraryModifierCode)
        .subscribe(response => {
          this.patchMappingForm(response);
        });
      });
    }
  }

  getStatus(fieldname: string) {
    const status = this.isMapped? 'matched' : 'unmatched';
    return this.classificationCategory
    ? this.classificationCategory[fieldname]?.status?.toLowerCase()
      || this.classificationCategory.attrLists.find(row => row.targetCtrl?.ATTR_CODE === fieldname)?.status.toLowerCase()
      || status
    : status;
  }

  canDisplayField(fieldname: string) {
    const status = this.getStatus(fieldname);
    const selectedStatus = this.statas.filter(row => row.isSeleted).map(row => row.code);
    return !selectedStatus.length || selectedStatus.includes(status);
  }

  canDisplayAttribute(value) {
    const searchStr = this.searchString.toLowerCase();
    return (!searchStr || (value.libraryAttributeText || value.libraryAttributeCode).toLowerCase().includes(searchStr)) && this.canDisplayField(value.libraryAttributeCode);
  }
  /**
   * Build attribute mapping form
   */
  buildMappingForm() {
    this.mappingForm = this.formBuilder.group({
      libraryNounCode: [this.libraryNounCode || ''],
      localNounCode: [''],
      libraryModCode: [this.libraryModifierCode || ''],
      localModCode: [''],
      attributeMapData: this.formBuilder.array([])
    });

    this.mappingForm.get('localNounCode').valueChanges.subscribe(nounCode => {
      const loadForThisNn = typeof nounCode === 'string' ? nounCode : nounCode?.NOUN_CODE;
      this.getLocalModifiers(loadForThisNn);
      this.mappingForm.get('localModCode').setValue('');
    });

    this.mappingForm.get('localModCode').valueChanges.subscribe(modCode => {
      const nnCode = this.mappingForm.get('localNounCode').value;
      const loadForThisNn = typeof nnCode === 'string' ? nnCode : '';
      const modeCode =  typeof modCode === 'string' ? modCode : '';
      this.getLocalAttributes(loadForThisNn, modeCode);
    });

    (this.mappingForm.get('attributeMapData') as FormArray).valueChanges.subscribe(values => {
      values.forEach(v=>{
        let exAttr = this.gsnAttributes.filter(fil => fil.ATTRIBUTE_ID === v.libraryAttributeCode)[0];
        exAttr = exAttr ? exAttr : new AttributesDoc();
        exAttr.localAttributeCode = v.localAttributeCode ? v.localAttributeCode.ATTRIBUTE_ID : '';
        exAttr.localAttributeText = v.localAttributeCode ? v.localAttributeCode.ATTR_CODE : '';
      });
    });
  }

  patchMappingForm(attributesMapping: AttributesMapping) {

   // set the selected noun ctrl
   if(attributesMapping.localNounCode) {
    this.seletedNounCtrl = {NOUN_CODE: attributesMapping.localNounCode, NSNO: attributesMapping.localNounSno} as NounModifier;
   }
   if(this.classificationCategory) {
     const {noun, modifier} = this.classificationCategory;
     if(modifier.status?.toLowerCase() === 'suggested' || modifier.status?.toLowerCase() === 'matched') {
       attributesMapping.localModCode = modifier.targetCtrl;
     }
     if(noun.status?.toLowerCase() === 'suggested' || noun.status?.toLowerCase() === 'matched') {
       attributesMapping.localNounCode = noun.targetCtrl;
     }
     const attribute = this.classificationCategory.attrLists ? this.classificationCategory.attrLists : [];
     if (attribute.length>0) {
      attribute.forEach(mapData => {
        const index = this.attributeMapData.value.findIndex(v => v.libraryAttributeCode === mapData.targetCtrl?.ATTR_CODE);

        if (index !== -1) {
          const suggestedObj = this.classificationCategory && this.classificationCategory.attrLists.find(row => row.source === mapData.targetCtrl?.ATTR_CODE && (row.status?.toLowerCase() === 'suggested' || row.status?.toLowerCase() === 'matched'));
          this.attributeMapData.at(index).patchValue({localAttributeCode: suggestedObj ? suggestedObj.targetCtrl : mapData.targetCtrl?.ATTR_CODE});
        }
      })
    }
   }

   const {localNounCode, localModCode} = attributesMapping;
   this.mappingForm.patchValue({localNounCode, localModCode});
  if (attributesMapping.attributeMapData) {
      attributesMapping.attributeMapData.forEach(mapData => {
        const index = this.attributeMapData.value.findIndex(v => v.libraryAttributeCode === mapData.libraryAttributeCode);

        if (index !== -1) {
          const suggestedObj = this.classificationCategory && this.classificationCategory.attrLists.find(row => row.source === mapData.libraryAttributeCode && (row.status?.toLowerCase() === 'suggested' || row.status?.toLowerCase() === 'matched'));
          this.attributeMapData.at(index).patchValue({localAttributeCode: suggestedObj ? suggestedObj.targetCtrl : mapData.localAttributeCode});
        }
      })
    }
  }

  getLocalNouns() {
    const plantCode = '0';
    this.nounModifierService.getLocalNouns(plantCode, '')
      .subscribe(nouns => {
        this.localNounsList = nouns;
        this.getAttributesFromGsn(this.libraryNounCode, this.libraryModifierCode);
      })
  }

  getLocalModifiers(nounCode) {
    this.nounModifierService.getLocalModifier('0', nounCode, '')
      .subscribe(modifiers => {
        this.LocalModifiersList = modifiers;
        console.log(this.LocalModifiersList);
      })
  }

  getLocalAttributes(nounCode, modifierCode) {
    // const params = {plantCode: '0', nounCode, modifierCode: '', searchString: ''};
    if(nounCode||modifierCode)
    this.nounModifierService.getLocalAttribute(nounCode, modifierCode, '0')
      .subscribe(attributes => {
        this.LocalAttributesList = attributes;
      },error=>{
        console.error('Error loading Local Attributes', error);
      })
  }

  getAttributesFromGsn(nounCode: string , modCode: string) {
    this.userDetails.getUserDetails().subscribe(user=>{
      this.nounModifierService.getConnecthukLibAttroibuteLib(nounCode, modCode, user.plantCode, this.schemaId, '').subscribe(res=>{
        this.gsnAttributes = res.ATTRIBUTES ? res.ATTRIBUTES : [];
        this.mgroup = res.MGROUP ? res.MGROUP : '';
        this.getAttributesMapping();
      }, error => {
        console.log('Error occured while loading the attributes', error);
      });
    });
  }

  /**
   * Add attribute mapping row
   */
  addAttributeMappingRow(attr: AttributesDoc) {
    const status = this.isMapped? 'matched' : 'unmatched';
    this.attributeMapData.push(
      this.formBuilder.group({
        libraryAttributeCode: [attr && attr.ATTR_CODE ? attr.ATTR_CODE : ''],
        libraryAttributeText: [attr && (attr.ATTR_DESC ? attr.ATTR_DESC :  attr.ATTR_CODE) ? attr.ATTR_CODE : ''],
        localAttributeCode: [attr && attr.localAttributeCode ? attr.localAttributeCode : ''],
        localAttributeText: [attr && attr.localAttributeText ? attr.localAttributeText : ''],
        status: [attr && attr.status ? attr.status : status]
      })
    );
  }

  save() {

    this.submitted = true;

    if (this.mappingForm.invalid) {
      this.snackBar.open('Please enter the missing fields !', 'close', { duration: 3000 });
      return;
    }

    const mappings = this.mappingForm.value;
    const attrMapRequest: AttributesMapping = {} as AttributesMapping;
    attrMapRequest.localNounCode = mappings.localNounCode ?  mappings.localNounCode : '';
    attrMapRequest.localModCode = mappings.localModCode ? mappings.localModCode : '';
    attrMapRequest.libraryNounCode = this.libraryNounCode ? this.libraryNounCode : '';
    attrMapRequest.libraryModCode = this.libraryModifierCode ? this.libraryModifierCode : '';
    attrMapRequest.localNounSno = this.seletedNounCtrl && this.seletedNounCtrl.NSNO ? this.seletedNounCtrl.NSNO : '';

    attrMapRequest.attributeMapData = [];

    mappings.attributeMapData.forEach(mm=>{
      const attr:AttributeMapData = {} as AttributeMapData;
      attr.libraryAttributeCode = mm.libraryAttributeCode;
      attr.localAttributeCode = typeof mm.localAttributeCode === 'string' ? mm.localAttributeCode : mm.localAttributeCode.ATTRIBUTE_ID;
      attrMapRequest.attributeMapData.push(attr);
    });

    console.log(attrMapRequest);

    this.nounModifierService.saveAttributesMapping(attrMapRequest, this.schemaId)
      .subscribe(resp => {
        this.snackBar.open('Successfully created!', 'close', { duration: 3000 });
        this.sharedServices.setAfterMappingSaved(true);
        this.close();
      },
        error => {
          this.snackBar.open('Something went wrong!', 'close', { duration: 3000 });
        });

  }

  get attributeMapData() {
    return this.mappingForm.get('attributeMapData') as FormArray;
  }

  setFormControlValue(controlName, value) {
    this.mappingForm.get(controlName).setValue(value);
  }

  /* nounSelected(nounCode) {
    this.getMasterLibraryModifiers(nounCode);
    this.setFormControlValue('localNounCode', nounCode);
    console.log(nounCode);
  }

  modifierSelected(modifier) {
    this.setFormControlValue('localModCode', modifier.NOUN_CODE);
    this.getMasterLibraryAttributes(this.mappingForm.value.localNounCode, modifier.MODE_CODE );
    console.log(modifier.MODE_CODE);
  }

  attributeSelected(libraryAttributeCode, localAttributeCode) {
    const index = this.attributeMapData.value.findIndex(mapData => mapData.libraryAttributeCode === libraryAttributeCode);
    if (index !== -1) {
      this.attributeMapData.at(index).patchValue({localAttributeCode});
    } else {
      const mapData = {libraryAttributeCode, localAttributeCode}
      this.addAttributeMappingRow(mapData);
    }
  } */

  get selectedNounCode() {
    return this.mappingForm.get('localNounCode').value ? this.mappingForm.get('localNounCode').value : '';
  }

  get selectedModifierCode() {
    return this.mappingForm.get('localModCode').value ? this.mappingForm.get('localModCode').value : '';
  }

  openNounSidesheet() {
    // need material group
    this.router.navigate(['', { outlets: {sb:`sb/schema/attribute-mapping/${this.moduleId}/${this.schemaId}/${this.libraryNounCode}/${this.libraryModifierCode}`,
    outer: `outer/schema/noun/${this.moduleId}/${this.mgroup}` }}], {
      queryParamsHandling: 'preserve'
    });
  }

  openModifierSidesheet() {
    this.router.navigate(['', { outlets: {sb:`sb/schema/attribute-mapping/${this.moduleId}/${this.schemaId}/${this.libraryNounCode}/${this.libraryModifierCode}`,
    outer: `outer/schema/modifier/${this.moduleId}/${this.mgroup}/${this.seletedNounCtrl && this.seletedNounCtrl.NSNO ? this.seletedNounCtrl.NSNO : this.selectedNounCode }` }}], {
      queryParamsHandling: 'preserve'
    });
  }

  openAttributeSidesheet() {
    const routerCommand = ['', { outlets: {sb:`sb/schema/attribute-mapping/${this.moduleId}/${this.schemaId}/${this.libraryNounCode}/${this.libraryModifierCode}`,
    outer: `outer/schema/attribute/${this.seletedNounCtrl && this.seletedNounCtrl.NSNO ? this.seletedNounCtrl.NSNO : this.selectedNounCode }/${this.selectedModifierCode}` }}];
    this.nounModifierService.attributeSheetRoute = routerCommand;
    this.router.navigate(routerCommand, {
      queryParamsHandling: 'preserve'
    });
    this.nounModifierService.attributeSaved= new Subject();
    return this.nounModifierService.attributeSaved;
  }

  close() {
    this.router.navigate([{ outlets: { sb: null } }]);
  }

  /**
   * Filte attributes based on status or serach ..
   * @param sta status ..
   */
  filterAsStatus(status: Status) {
    status.isSeleted = !status.isSeleted;
  }

  /**
   * Search attribute from global serach ...
   * @param val text for search attributes ..
   */
  searchAttributeVal(val: string) {
    debounceTime(1000);
    this.searchString = val;
  }

  /**
   *
   * @param gsnNounCode gdnNounCode ...
   */
  nounSuggestion(gsnNounCode: string): NounModifier {
    const nnn = this.localNounsList.filter(f=> f.NOUN_ID.toLocaleLowerCase().indexOf(gsnNounCode.toLocaleLowerCase()) !== -1)[0];
    return nnn;
  }


  modifierSuggestion(gsnModeCode: string): NounModifier{
    const nnn = this.LocalModifiersList.filter(f=> f.MODE_CODE.toLocaleLowerCase().indexOf(gsnModeCode.toLocaleLowerCase()) !== -1)[0];
    return nnn;
  }


  attributeSuggestion(gsnAttributeCode: string): AttributesDoc {
    const nnn = this.LocalAttributesList.filter(f=> f.ATTR_CODE.toLocaleLowerCase().indexOf(gsnAttributeCode.toLocaleLowerCase()) !== -1)[0];
    return nnn;
  }



  createNewWidgetFor(f: string) {
    if(f === 'noun') {
      this.openNounSidesheet();
    } else if(f === 'modifier') {
      this.openModifierSidesheet();
    }
  }

  createNewAttributeWidget(ind: number) {
    this.openAttributeSidesheet().subscribe((res) => {
      const row = res[0];
      this.attributeMapData.at(ind).patchValue({localAttributeCode: row.attrCode, localAttributeText: row.attrDesc});
    });
  }

}
