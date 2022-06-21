import { Pipe, PipeTransform } from '@angular/core';

const dataUOMRegExp = new RegExp('(Bytes|KB|MB|GB|TB|PB|EB)', 'gi');
const dataUOMs = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
const findUOMIndex = (queryUOM: string): number => dataUOMs.findIndex(uom => uom.toLowerCase() === queryUOM.toLowerCase());
@Pipe({
  name: 'dataSize'
})
export class DataSizePipe implements PipeTransform {
  /**
   * Transforms string or number of Bytes into appropriate data unit of measurement string
   */
  transform(size: string, reference: string = ''): string {
    const sizeAsNumber = Number.parseInt(size.match(/(\d+)/)[0], 10);
    const currentUOM = size ? size.match(dataUOMRegExp)[0] : 'Bytes';
    const refUOM = reference ? reference.match(dataUOMRegExp)[0] : '';
    return this.reduce(sizeAsNumber, findUOMIndex(currentUOM), findUOMIndex(refUOM))
  }


  private reduce(size: number, currentUOMIndex: number, referenceUOMIndex: number): string {
    if (size < 0 || currentUOMIndex < 0 || referenceUOMIndex < 0) throw new RangeError('Invalid size or Unit of Measurement')
    else {
      if (size > 1000) {
        return this.reduce(size / 1000, ++currentUOMIndex, referenceUOMIndex);
      }
      else if (referenceUOMIndex > -1 && currentUOMIndex < referenceUOMIndex) {
        return this.reduce(size / 1000, ++currentUOMIndex, referenceUOMIndex);
      }
      else {
        const returnValue = `${size < 1 && size > 0 ? '< ' : '  '}${size > 0 && size < 1 ? Math.ceil(size) : Number.parseFloat(size.toFixed(2))} ${dataUOMs[currentUOMIndex]}`;
        return returnValue;
      }
    }
  }
}
