import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class Utilities {

    /**
     *
     * @param _snackBar OPTIONAL, this is object to show snackbar
     * This is kept as optional because it gives flexibility to use snackbar
     * directly, if user wants to customise it
     */
    constructor(public _snackBar?: MatSnackBar) { }
    getPickList(id: string) {
        const pickListData = {
            0: {
                type: 'Text',
                useCase: 'Allows users to enter any combination of letters and numbers.'
            },
            1: {
                type: 'Dropdown',
                useCase: 'Allows users to select a value from a list you define.'
            },
            2: {
                type: 'Checkbox',
                useCase: 'Allows users to select a True / On(checked) or False / Off(unchecked) value.'
            },
            4: {
                type: 'Radio',
                useCase: 'Allows users to choose one option from limited option '
            },
            22: {
                type: 'Text Area',
                displayControls: true,
                useCase: ' Allows users to enter multiple lines of any combination of letters and numbers '
            },
            DATS: {
                type: 'Date',
                useCase: 'Allows users to pick a date from a popup calendar.'
            },
            TIMS: {
                type: 'Time',
                useCase: 'Allows users to select a time from a list of time in a day.'
            },
            DTMS: {
                type: 'Date and Time',
                useCase: ' Allows users to pick a date from a popup calendar and select a time from a list of time in a day.'
            },
            14: {
                type: 'Group',
                useCase: 'Allows users to enter multiple segments of data in separate Text fields.e.g.Country Code and Phone Number '
            },
            15: {
                type: 'Grid',
                useCase: 'Allows users to insert multiple rows of data.You can add multiple fields to the grid by navigating to Grid Fields.'
            },
            EMAIL: {
                type: 'Email',
                useCase: 'Allows users to enter an email address, which is validated to ensure proper format.'
            },
            PWD: {
                type: 'Password',
                useCase: ' Allows users to enter any combination of letters and numbers.Data is encrypted and cannot be searched upon.'
            },
            28: {
                type: 'Attachment',
                showControls: true,
                useCase: 'Allows users to upload files.You can restrict upload size and formats e, g csv, xls, doc etc.'
            },
            29: {
                type: 'Location Reference',
                useCase: 'Creates a relationship that links this module to the Locations module.The field allows users to select a value from a list of locations created by your organization.'
            },
            30: {
                type: 'Module Reference ID',
                useCase: 'Creates a relationship that links this module to another module.The reference field allows users to select a value from a list.The other module is the source of the values in the list.'
            },
            31: {
                type: 'HTML',
                showControls: true,
                useCase: ' Allows users to enter any combination of letters and numbers.User is provided with a Rich Text Editor to format the data entry.'
            },
            33: {
                type: 'URL',
                useCase: ' Allows users to enter any valid website address.When users click on the field, the URL will open in a separate browser window.'
            },
            37: {
                type: 'User Selection',
                useCase: ' Allows users to select users of your organization from a list.'
            },
            39: {
                type: 'GeoLocation',
                useCase: 'GeoLocation type of field which will be use for save user location'
            },
            44: {
                type: 'Digital Sign',
                showControls: true,
                useCase: 'Allows users to draw digital signature.'
            }
        }
        return pickListData[id]
    }

    public statusFromShortCode(shortcode: string): string {
        let status;
        switch (shortcode) {
            case 'INP': status = 'In Progress'; break;
            case 'APP': status = 'Approved'; break;
            case 'REJ': status = 'Rejected'; break;
            case 'CNCL': status = 'Cancelled'; break
        }
        return status
    }

    /**
     * This is the common function to show snackbar
     * @param messagetoShow message that needs to be shown
     * @param interactionText the interaction message that needs to be shown
     */
    public showSnackBar(messagetoShow: string, interactionText: string = 'Okay') {
        this._snackBar.open(messagetoShow, interactionText, {
            duration: 5000
        });
    }

    /**
     * Function to generate alpha nmeric string
     * @param len the length of required string
     */
    public getRandomString(len: number) {
        let text = '';
        const charset = 'abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < len; i++)
            text += charset.charAt(Math.floor(Math.random() * charset.length));

        const suffix = (new Date().getMilliseconds() * Math.random()*10).toFixed(0);
        return `${text}${suffix}`;

    }

    public generate_UUID(){
        let dt = new Date().getTime();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            /* eslint-disable no-bitwise */
            const r = (dt + Math.random()*16)%16 | 0;
            dt = Math.floor(dt/16);
            return (c==='x' ? r :(r&0x3 | 0x8)).toString(16);
            /* eslint-enable no-bitwise */
        });
        return uuid;
    }

    public generateFieldId(len: number) {
        const buf = [];
        const chars = '0123456789';
        const charlen = chars.length;
        const length = len || 32;

        for (let i = 0; i < length; i++) {
            buf[i] = chars.charAt(Math.floor(Math.random() * charlen));
        }

        return buf.join('');
    }
}
