import { Mapping, MdoField, MdoFieldlistItem, MdoMappings, SegmentMappings } from '../../../_models/mapping';
import { filter, merge, cloneDeep } from 'lodash';

export default abstract class MappingUtility {
  /**
   * search filter method to filter results based on search term
   * @param searchTerm search text
   * @param filterFrom array of items to filter from
   * @returns MdoField[]
   */
   filterSource(searchTerm: string, filterFrom: MdoField[]): MdoField[] {
    const filterFromClone = cloneDeep(filterFrom);
    const filterValue = searchTerm?.toLowerCase() || '';

    return filterFromClone.filter((option) => {
      if (!filterValue) { return option; }
      return option.description.toLowerCase().includes(filterValue) ||
        this.hasMatchingSourceField(searchTerm, option.fieldlist);
    });
  }

  /**
   * filter the target fields based on search term
   * @param searchTerm pass the search term
   * @param filterFrom pass the array to filter from
   * @returns SegmentMappings[]
   */
  filterTarget(searchTerm: string, filterFrom: SegmentMappings[]): SegmentMappings[] {
    const filterFromClone = cloneDeep(filterFrom);
    const filterValue = searchTerm?.toLowerCase() || '';
    if (!filterValue) { return filterFrom; }

    return filterFromClone.filter((option) => {
      let condition = false;
      const matchedFields = this.hasMatchingTargetField(searchTerm, option.mdoMappings, true) as MdoMappings[];
      if(matchedFields?.length) {
        option.mdoMappings = merge([], [...matchedFields]);
        condition = true;
      }
      if(option.segmentName.toLowerCase().includes(filterValue)) {
        condition = true;
      }
      if(this.hasMatchingTargetSegmentOrField(searchTerm, option.segmentMappings)) {
        condition = true;
      }

      return condition;
    });
  }

  /**
   * search matching child in MdoFieldlistItem[]
   */
   hasMatchingSourceField(searchTerm: string, fieldlist: MdoFieldlistItem[]): boolean {
    searchTerm = searchTerm?.toLowerCase() || '';

    return fieldlist.some((item) => {
      let hasChild: boolean;
      const hasDescription = item.description.toLowerCase().includes(searchTerm)

      if (item.childfields?.length) {
        hasChild = this.hasMatchingSourceField(searchTerm, item.childfields);
      }

      return hasDescription || hasChild;
    });
  }

  /**
   * filter source field based on selected mapping filter
   * @param filterValue mapping filter value
   * @param filterFrom array to filter from
   * @param existingMapping pass the existing mapping info
   * @returns MdoField[]
   */
  filterSourceFields(filterValue: string, filterFrom: MdoField[], existingMapping: Mapping[]): MdoField[] {
    const sourceArray = cloneDeep(filterFrom);

    if(filterValue === 'mapped') {
      const mapped = [...this.findMappedSourceFields([...sourceArray], existingMapping)];
      console.log('mapped source field: ', mapped);

      return mapped;
    }

    if(filterValue === 'unmapped') {
      const unmapped = [...this.findUnmappedSourceFields([...sourceArray], existingMapping)];
      console.log('unmapped source field: ', unmapped);

      return unmapped;
    }
  }

  /**
   * filter target field based on selected mapping filter
   * @param filterValue mapping filter value
   * @param filterFrom array to filter from
   * @param existingMapping pass the existing mapping info
   * @returns SegmentMappings[]
   */
  filterTargetFields(filterValue: string, filterFrom: SegmentMappings[], existingMapping: Mapping[]): SegmentMappings[] {
    const targetArray = merge([], [...filterFrom]);

    if(filterValue === 'mapped') {
      const mapped = [...this.filterMappedTargetFields([...targetArray], existingMapping)];
      console.log('mapped target field: ', mapped);
      return mapped;
    }

    if(filterValue === 'unmapped') {
      const unmapped = [...this.filterUnmappedTargetFields([...targetArray], existingMapping)];
      console.log('unmapped target field: ', unmapped);
      return unmapped;
    }
  }

  /**
   * find mapped fields from source array
   * @param filterFrom source array
   * @param existingMapping pass the mapping info
   * @returns MdoField[]
   */
  findMappedSourceFields(filterFrom: MdoField[], existingMapping: Mapping[]): MdoField[] {
    const final = [];
    filterFrom.forEach((item: MdoField) => {
      if(item.fieldlist?.length) {
        const matching = [];
        item.fieldlist.forEach((field: MdoFieldlistItem) => {
          const exists = existingMapping.find((mapping: Mapping) => {
            const matchingFields = mapping.source.fieldId === field.fieldId;
            let matchingChildFields = null;

            if(field?.childfields?.length) {
              const fields = this.getFilteredChildFields(mapping.source.fieldId, field.childfields);

              matchingChildFields = fields?.length;
              if(matchingChildFields) {
                field.childfields = fields;
              }
            }

            return matchingFields || matchingChildFields;
          });
          if(exists) {
            matching.push(field);
          }
        });

        if(matching?.length) {
          item.fieldlist = matching;
          final.push(item);
        }
      }
    });

    return final;
  }

  /**
   * Recursively get all the matching child fields
   */
  getFilteredChildFields(fieldId: string, fields: MdoFieldlistItem[]) {
    const filtered = [];

    fields.forEach((field: MdoFieldlistItem) => {
      if(field?.fieldId === fieldId) {
        filtered.push(field);
      } else {
        if(field?.childfields?.length) {
          const fields = this.getFilteredChildFields(fieldId, field.childfields);

          if(fields?.length) {
            field.childfields = fields;
            filtered.push(field);
          }
        }
      }
    });

    return filtered;
  }

  /**
   * find unmapped fields from source array
   * @param filterFrom source array
   * @param existingMapping mapping info
   * @returns MdoField[]
   */
  findUnmappedSourceFields(filterFrom: MdoField[], existingMapping: Mapping[]): MdoField[] {
    const final = [];
    filterFrom.forEach((item: MdoField) => {
      if(item.fieldlist?.length) {
        const matching = [];
        item.fieldlist.forEach((field: MdoFieldlistItem) => {
          const exists = existingMapping.find((mapping: Mapping) => mapping.source.fieldId === field.fieldId);
          if(!exists) {
            if(field?.childfields?.length) {
              field.childfields = field.childfields.filter((childField: MdoFieldlistItem) => {
                const exists = existingMapping.find((mapping: Mapping) => mapping.source.fieldId === childField.fieldId);
                return !exists;
              });
            }
            matching.push(field);
          }
        });

        if(matching?.length) {
          item.fieldlist = matching;
          final.push(item);
        }
      }
    });

    return final;
  }

  /**
   * Find the mapped field from target array
   * @param filterFrom target array
   * @param existingMapping mapping info
   * @returns SegmentMapping[]
   */
  filterMappedTargetFields(filterFrom: SegmentMappings[], existingMapping: Mapping[]): SegmentMappings[] {
    if(!filterFrom?.length) { return [];}

    return filterFrom.filter((item) => {
      if(item.mdoMappings?.length) {
        item.mdoMappings = [...this.getMappedTargetFields(item.mdoMappings, existingMapping)];
      }

      if(item.segmentMappings?.length) {
        item.segmentMappings = this.filterMappedTargetFields(item.segmentMappings, existingMapping);
      }

      return item.mdoMappings?.length || item.segmentMappings?.length;
    });
  }

  /**
   * Find the mapped target fields from mdo mappings
   * @param mdoMappings target array
   * @param existingMapping mapping info
   * @returns MdoMappings[]
   */
  getMappedTargetFields(mdoMappings: MdoMappings[], existingMapping: Mapping[]): MdoMappings[] {
    return filter(mdoMappings, (mapping: MdoMappings) => !!existingMapping.find((extMap) => extMap.target.uuid === mapping.uuid));
  }

  /**
   * find unmapped target fields from target array
   * @param filterFrom pass the target array
   * @param existingMapping pass the mapping info
   * @returns SegmentMappings[]
   */
  filterUnmappedTargetFields(filterFrom: SegmentMappings[], existingMapping: Mapping[]): SegmentMappings[] {
    if(!filterFrom?.length) { return [];}
    const final = [];

    filterFrom.forEach((item) => {
      if(item.mdoMappings?.length) {
        item.mdoMappings = merge([], [...this.getUnmappedTargetFields(item.mdoMappings, existingMapping)]);
      }

      if(item.segmentMappings?.length) {
        item.segmentMappings = this.filterUnmappedTargetFields(item.segmentMappings, existingMapping);
      }

      if(item.mdoMappings?.length || item.segmentMappings?.length) {
        final.push(item);
      }
    });

    return final;
  }

  /**
   * return the unmapped target field
   * @param mdoMappings pass the array of MdoMappings
   * @param existingMapping pass the mapping info
   * @returns MdoMappings[]
   */
  getUnmappedTargetFields(mdoMappings: MdoMappings[], existingMapping: Mapping[]): MdoMappings[] {
    return filter(mdoMappings, (mapping: MdoMappings) => !existingMapping.find((extMap) => extMap.target.uuid === mapping.uuid));
  }

  /**
   * search matching segment or field in SegmentMappings[]
   */
   hasMatchingTargetSegmentOrField(searchTerm: string, segmentMapping: SegmentMappings[]): boolean {
    searchTerm = searchTerm?.toLowerCase() || '';
    if(!segmentMapping || !segmentMapping?.length) { return false; }

    return segmentMapping.some((item) => {
      return item.segmentName.toLowerCase().includes(searchTerm)
      || this.hasMatchingTargetField(searchTerm, item.mdoMappings)
      || this.hasMatchingTargetSegmentOrField(searchTerm, item?.segmentMappings);
    });
  }

  /**
   * search matching child in SegmentMappings[]
   */
   hasMatchingTargetField(searchTerm: string, fieldlist: MdoMappings[], getFields: boolean = false): boolean | MdoMappings[] {
    searchTerm = searchTerm?.toLowerCase() || '';
    if(!fieldlist?.length) { return false; }

    if(getFields) {
      return fieldlist.filter((item) => {
        if(!item?.externalFieldDesc) {
          return item.externalFieldId.toLowerCase().includes(searchTerm);
        }

        return item.externalFieldDesc.toLowerCase().includes(searchTerm);
      });
    }

    return fieldlist.some((item) => {
      return this.isFieldMatching(searchTerm, item);
    });
  }

  isFieldMatching(searchTerm: string, field: MdoMappings): boolean {
    searchTerm = searchTerm?.toLowerCase() || '';
    if(!field?.externalFieldDesc) {
      return field.externalFieldId.toLowerCase().includes(searchTerm);
    }

    return field.externalFieldDesc.toLowerCase().includes(searchTerm);
  }

  // find the denter of an HTML Element
  findCenter = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  // Find middle coordinates of the source and target element's position
  findCenterByStartEndCoordinates = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const x = (start.x + end.x) / 2;
    const y = (start.y + end.y) / 2;
    return { x, y };
  }
}

export class MdoFieldClass implements MdoField {
  constructor(options?: Partial<MdoField>) {
    if(options && Object.keys(options)?.length) {
      Object.keys(options).forEach((key) => {
        this[key] = options[key];
      });
    }
  }
  structureid = '';
  description = '';
  fieldlist = [];
}

export class DescriptionMapping implements MdoFieldlistItem {
  constructor(options?: Partial<MdoFieldlistItem>) {
    if(options && Object.keys(options)?.length) {
      Object.keys(options).forEach((key) => {
        this[key] = options[key];
      });
    }
  }
  fieldId = '';
  dataType = '';
  pickList = '';
  maxChar = null;
  isKeyField = false;
  isCriteriaField = false;
  isWorkFlow = false;
  isGridColumn = false;
  isDescription = false;
  textCase = '';
  attachmentSize = '';
  fileTypes = '';
  isFutureDate = false;
  isPastDate = false;
  outputLen = '';
  structureId = '1';
  pickService = '';
  moduleId = null;
  parentField = '';
  isReference = false;
  isDefault = false;
  isHeirarchy = false;
  isWorkFlowCriteria = false;
  isNumSettingCriteria = false;
  isCheckList = false;
  isCompBased = false;
  dateModified = null;
  decimalValue = '';
  isTransient = false;
  isSearchEngine = false;
  isPermission = false;
  isDraft? = false;
  isPersisted? = false;
  isRejection = false;
  isRequest = false;
  childfields? = [];
  isSubGrid = false;
  isNoun = false;
  optionsLimit = '';
  description = '';
  helpText = '';
  longText = '';
  language = '';
}

export interface ControlData {
  recordNumber:           string;
  moduleId:               string;
  tenantId:               string;
  crId:                   string;
  parentCrId:             string;
  processId:              string;
  eventId:                string;
  massId:                 string;
  taskId:                 string;
  referenceId:            string;
  layoutId:               string;
  userId:                 string;
  roleId:                 string;
  language:               string;
  processFlowContainerId: string;
  processFlowId:          string;
  draft:                  boolean;
}

export const controlDataBlock = () => {
  const controlData: ControlData = {
    recordNumber: null,
    moduleId: '487809',
    tenantId: null,
    crId: null,
    parentCrId: null,
    processId: null,
    eventId: null,
    massId: null,
    taskId: null,
    referenceId: null,
    layoutId: null,
    userId: null,
    roleId: null,
    language: null,
    processFlowContainerId: null,
    processFlowId: null,
    draft: false
  };
  const structure = Object.keys(controlData).map((key) => {
    return    {
      fieldId: key.toUpperCase(),
      description: key,
      structureId: 'CTRL_DATA',
      childfields: []
    }
  })

  const struct = populateStructure(structure);
  const field = new MdoFieldClass({
    description: 'Control data',
    structureid: 'CTRL_DATA',
    fieldlist: struct
  });

  return field;
};

export const descriptionMappingBlock = (): MdoField => {
  const structure = [
    {
      fieldId: 'classType',
      description: 'Class type',
      structureId: 'descriptions',
      childfields: []
    },
    {
      fieldId: 'classId',
      description: 'Class id',
      structureId: 'descriptions',
      childfields: []
    },
    {
      fieldId: 'attributes',
      description: 'Attributes',
      childfields: [
        {
          fieldId: 'lang',
          description: 'Language',
          childfields: [
            {
              fieldId: 'shortDesc',
              description: 'Short description',
              structureId: 'attributes',
              childfields: []
            },
            {
              fieldId: 'longDesc',
              description: 'Long description',
              structureId: 'attributes',
              childfields: []
            },
            {
              fieldId: 'attrs',
              description: 'Attribute data',
              childfields: [
                {
                  fieldId: 'fId',
                  description: 'Field id',
                  structureId: 'attrs',
                  childfields: []
                },
                {
                  fieldId: 'vc',
                  description: 'Value',
                  structureId: 'attrs',
                  childfields: []
                },
                {
                  fieldId: 'uom',
                  description: 'Unit of measure(UOM)',
                  structureId: 'attrs',
                  childfields: []
                },
              ]
            },
          ]
        }
      ]
    }
  ];

  const struct = populateStructure(structure);
  const field = new MdoFieldClass({
    structureid: 'descriptions',
    description: 'Descriptions',
    fieldlist: struct
  });

  return field;
};

const populateStructure = (structure: any) => {
  const data = [];
  structure.forEach((item: any) => {
    if(item?.childfields?.length) {
      item.childfields = populateStructure(item.childfields);
    }
    data.push(new DescriptionMapping(item));
  });

  return data;
}

export const  DESCRIPTION_MAPPING = descriptionMappingBlock();
export const  CONTROL_DATA = controlDataBlock();