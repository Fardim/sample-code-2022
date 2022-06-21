import { Fieldlist, FieldControlType } from '@models/list-page/listpage';
import { picklistValues } from './field-service/field.service';

export class FieldControl {
  type = '';
  icon = '';
  iconType = '';

  constructor(field: Fieldlist) {
    if (field) {
      this.type = this.getDataType(field.pickList, field.dataType);
      this.icon = this.getIcon(field.pickList, field.dataType);
      this.iconType = this.getIconType(field.pickList, field.dataType);
    }
  }

  getIcon(pickList: string, dataType: string) {
    const iconObj = picklistValues.find((p) => p.dataType === dataType && p.pickList === pickList);
    return iconObj?.icon ? iconObj.icon : 'Text';
  }

  getIconType(pickList: string, dataType: string) {
    const iconObj = picklistValues.find((p) => p.dataType === dataType && p.pickList === pickList);
    return iconObj?.icon ? iconObj.iconType : 'Material';
  }

  getDataType(pickList: string, dataType: string) {
    if(pickList === '0') {
      if (dataType === 'CHAR') {
        return FieldControlType.TEXT;
      }

      if (dataType === 'PASS') {
        return FieldControlType.PASSWORD;
      }

      if (dataType === 'EMAIL') {
        return FieldControlType.EMAIL;
      }

      if (dataType === 'NUMC') {
        return FieldControlType.NUMBER;
      }

      if (dataType === 'STATUS') {
        return FieldControlType.LIST; // FieldControlType.STATUS
      }

      if (dataType === 'DEC') {
        return FieldControlType.DECIMAL;
      }
      if (dataType === 'ALTN') {
        return FieldControlType.ALTN;
      }
    }
    if (pickList === '1' && dataType === 'CHAR') {
      return FieldControlType.LIST;
    }
    if (pickList === '2' && dataType === 'CHAR') {
      return FieldControlType.CHECKBOX;
    }
    if (pickList === '4' && dataType === 'CHAR') {
      return FieldControlType.RADIO;
    }

    if (pickList === '22' && dataType === 'CHAR') {
      return FieldControlType.TEXT_AREA;
    }
    if (pickList === '31' && dataType === 'CHAR') {
      return FieldControlType.HTML;
    }
    if (pickList === '37' && dataType === 'CHAR') {
      return FieldControlType.LIST; // FieldControlType.USERSELECTION
    }
    if (pickList === '38' && dataType === 'CHAR') {
      return FieldControlType.ATTACHMENT;
    }
    if (pickList === '40' && dataType === 'CHAR') {
      return FieldControlType.GEOLOCATION;
    }
    if (pickList === '44' && dataType === 'CHAR') {
      return FieldControlType.DIGITALSIGNATURE;
    }

    if (pickList === '51' && dataType === 'CHAR') {
      return FieldControlType.RADIO;
    }
    if (pickList === '55' && dataType === 'CHAR') {
      return FieldControlType.URL;
    }
    if (pickList === '52' && dataType === 'NUMC') {
      return FieldControlType.DATE;
    }
    if (pickList === '53' && dataType === 'NUMC') {
      return FieldControlType.DATE_TIME;
    }
    if (pickList === '54' && dataType === 'TIMS') {
      return FieldControlType.TIME;
    }
    if (pickList === '15' && dataType === 'CHAR') {
      return FieldControlType.GRID;
    }
    if (pickList === '36' && dataType === 'CHAR') {
      return FieldControlType.ACTIVATE_DEACTIVATE;
    }
    if (pickList === '30' && dataType === 'CHAR') {
      return FieldControlType.DATASET_REFERENCE;
    }
  }
}