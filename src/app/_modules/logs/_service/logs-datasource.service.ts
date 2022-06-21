import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AuditLogResponse,
  ChangeFieldDetail,
  FieldDetail,
  ProcessName,
  ProcessValue,
  TableHeaderConfig,
  WfvsDetails
} from '@modules/logs/_model/logs';
import { LogsService } from '@services/logs.service';
import { orderBy } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class LogsDatasourceService {
  auditData;
  viewChangeData: WfvsDetails;
  constructor(private http: HttpClient, private datePipe: DatePipe, private logsService: LogsService) {}

  getAuditMasaterData() {
    return this.auditData;
  }

  setAuditMasaterData(data): void {
    this.auditData = data;
  }

  setViewChangeData(data: WfvsDetails): void {
    this.viewChangeData = data;
  }

  clearViewChangeData(): void {
    this.viewChangeData = {
      wfvlData: {},
      chngfldData: {
        hyvs: {},
        hdvs: {},
        gvs: {}
      }
    };
  }

  getViewChangeData() {
    return this.viewChangeData;
  }

  getViewChangesTableHeader(): TableHeaderConfig {
    const objectColumns = [
      {
        label: 'Field Name',
        key: 'fieldName'
      },
      {
        label: 'Before Change',
        key: 'beforeChange'
      },
      {
        label: 'After Change',
        key: 'afterChange'
      }
    ];
    const stringColumns = objectColumns.map((c) => c.key);

    return {
      stringColumns,
      objectColumns
    };
  }

  getViewChangesGridTableHeader(columnObj: FieldDetail) {
    const objectColumns = [];
    for (const val in columnObj) {
      if (columnObj.hasOwnProperty(val)) {
        objectColumns.push({
          label: columnObj[val].ls,
          key: val
        });
      }
    }

    objectColumns.push(
      {
        label: 'Action',
        key: 'MSGFN'
      },
      {
        label: 'Details',
        key: 'details'
      }
    );
    const stringColumns = objectColumns.map((c) => c.key);

    return {
      stringColumns,
      objectColumns
    };
  }

  /**
   * decide the header config
   * @param action type string
   * @returns TableHeaderConfig
   */
  getViewChangesDetailsTableHeader(actionType: string): TableHeaderConfig {
    let objectColumns = [
      {
        label: 'Field Name',
        key: 'field_name'
      },
      {
        label: 'Before Change',
        key: 'before_change'
      },
      {
        label: 'After Change',
        key: 'after_change'
      }
    ];

    if (actionType === 'deleted') {
      objectColumns = [
        {
          label: 'Field Name',
          key: 'field_name'
        },
        {
          label: 'Before deletion',
          key: 'before_change'
        },
        {
          label: 'After deletion',
          key: 'after_change'
        }
      ];
    } else if (actionType === 'created') {
      objectColumns = [
        {
          label: 'Field Name',
          key: 'field_name'
        },
        {
          label: 'Before creation',
          key: 'before_change'
        },
        {
          label: 'After creation',
          key: 'after_change'
        }
      ];
    }

    const stringColumns = objectColumns.map((c) => c.key);

    return {
      stringColumns,
      objectColumns
    };
  }

  getAuditTableHeader(): TableHeaderConfig {
    const objectColumns = [
      {
        label: '',
        key: 'action',
        sticky: true
      },
      {
        label: 'Step',
        key: 'STP'
      },
      {
        label: 'Actioned By',
        key: 'USR'
      },
      {
        label: 'Role',
        key: 'role'
      },
      {
        label: 'Requested by',
        key: 'request_by'
      },
      {
        label: 'Request start date',
        key: 'request_start_date'
      },
      {
        label: 'Received on',
        key: 'RCVD_ON'
      },
      {
        label: 'Actioned on',
        key: 'action_on'
      },
      {
        label: 'Time Taken',
        key: 'time_taken'
      },
      {
        label: 'Forwarded to',
        key: 'forward_to'
      },
      {
        label: 'Comments',
        key: 'CHNGLOG_COMMENTS'
      },
      {
        label: 'Status',
        key: 'STATUS'
      }
    ];
    const stringColumns = objectColumns.map((c) => c.key);

    return {
      stringColumns,
      objectColumns
    };
  }

  transformData(data: AuditLogResponse[]) {
    return data.map((obj) => {
      let rowData = {
        wfvs_details: [],
        staticFields_details: {
          eventName: '',
          INITIATER_ROLE: '',
          DATECREATED: ''
        }
      };
      Object.keys(obj).forEach((col) => {
        const cell = obj[col];
        if (!cell) return;

        if (col === 'staticFields') {
          for (const val in cell) {
            if (cell.hasOwnProperty(val)) {
              if (val === 'EVENTID') {
                let eventName = '';
                switch (cell[val].vc[0].c) {
                  case ProcessValue.CREATE:
                    eventName = ProcessName.CREATE;
                    break;
                  case ProcessValue.CHANGE:
                    eventName = ProcessName.CHANGE;
                    break;
                  case ProcessValue.SUMMARY:
                    eventName = ProcessName.SUMMARY;
                    break;
                  case ProcessValue.APPROVE:
                    eventName = ProcessName.APPROVE;
                    break;
                }
                rowData.staticFields_details.eventName = eventName;
              }
              rowData.staticFields_details[val] = cell[val]?.vc?.[0].t || cell[val]?.vc?.[0].c || '';
            }
          }
        } else if (col === 'wfvs') {
          rowData.wfvs_details = cell.map((objDet) => {
            const { wfvl, chfld } = objDet;
            const wfvsData: WfvsDetails = {
              wfvlData: {},
              chngfldData: {
                hyvs: {},
                hdvs: {},
                gvs: {}
              }
            };
            if (chfld) {
              wfvsData.chngfldData = chfld;
            }
            for (const val in wfvl) {
              if (wfvl.hasOwnProperty(val)) {
                if (val === 'RCVD_ON') {
                  const recvDate = new Date(+wfvl[val].vc[0].c);
                  const isValidDate = recvDate instanceof Date && !isNaN(recvDate.valueOf());
                  wfvsData.wfvlData[val] = isValidDate ? recvDate : '';
                } else {
                  wfvsData.wfvlData[val] = '';
                  const wfvlData = wfvl[val].vc;
                  if (wfvlData) {
                    wfvsData.wfvlData[val] = wfvlData.map((m) => m.t).toString() || wfvlData.map((m) => m.c).toString();
                  }
                }
              }
            }
            return wfvsData;
          });
        }
      });
      const orderedDetails = orderBy(rowData.wfvs_details, ['wfvlData.RCVD_ON'], ['desc']);
      rowData.wfvs_details = orderedDetails;
      // Set the initiator role as of the first user who initiated this flow.
      rowData.staticFields_details.INITIATER_ROLE =
        rowData.wfvs_details[rowData.wfvs_details.length - 1].wfvlData.USR_ROLE;
      return rowData;
    });
  }

  transformHdvsData(hdvs): ChangeFieldDetail[] {
    const retData = [];
    if (hdvs) {
      const chngfld_hdvs = hdvs;
      for (const hdvsval in chngfld_hdvs) {
        if (chngfld_hdvs.hasOwnProperty(hdvsval)) {
          if (chngfld_hdvs[hdvsval]) {
            // && chngfld_hdvs[hdvsval].ls
            const hdvsObj = chngfld_hdvs[hdvsval];
            retData.push({
              fieldName: hdvsObj.ls || hdvsObj.fId,
              beforeChange: hdvsObj.oc && hdvsObj.oc[0] ? hdvsObj.oc[0].c : '',
              afterChange: hdvsObj.vc[0].c ? hdvsObj.vc[0].c : ''
            });
          }
        }
      }
    }
    return retData;
  }

  transformHyvsRowData(nodeObj, rows): ChangeFieldDetail[] {
    const retDataObj = rows.find((obj) => {
      let isMatched = false;
      for (const val in obj) {
        if (obj.hasOwnProperty(val)) {
          if (obj[val].fId === nodeObj.id && obj[val].vc[0].c === nodeObj.vcc) {
            isMatched = true;
            break;
          }
        }
      }
      return isMatched;
    });

    if (retDataObj) {
      const tableData = [];
      for (const dataVal in retDataObj) {
        if (retDataObj.hasOwnProperty(dataVal)) {
          tableData.push({
            fieldName: retDataObj[dataVal].ls || retDataObj[dataVal].fId,
            beforeChange: retDataObj[dataVal].oc && retDataObj[dataVal].oc[0] ? retDataObj[dataVal].oc[0].c : '',
            afterChange: retDataObj[dataVal].vc[0].c ? retDataObj[dataVal].vc[0].c : ''
          });
        }
      }
      return tableData;
    }

    return [];
  }

  getHiererchyGridNames(gvsObj) {
    const retData = [];
    for (const gvsVal in gvsObj) {
      if (gvsObj.hasOwnProperty(gvsVal)) {
        retData.push({
          id: gvsVal,
          label: gvsObj[gvsVal].ls,
          nodeType: 'grid'
        });
      }
    }
    return retData;
  }

  transformGvsColumnWiseData(rows) {
    return rows.map((objDet) => {
      const retObj = {
        rows: objDet
      };
      for (const objName in objDet) {
        if (objDet.hasOwnProperty(objName)) {
          retObj[objName] = objDet[objName].vc[0].c;
        }
      }

      return retObj;
    });
  }

  transformGvsRowWiseData(rowObj) {
    const retData = [];
    for (const objName in rowObj) {
      if (rowObj.hasOwnProperty(objName)) {
        retData.push({
          field_name: rowObj[objName].ls,
          before_change: rowObj[objName].bc[0].c ? rowObj[objName].bc[0].c : '',
          after_change: rowObj[objName].vc[0].c ? rowObj[objName].vc[0].c : ''
          // isCorrected: true
        });
      }
    }

    return retData;
  }
}
