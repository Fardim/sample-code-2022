import { Subject, BehaviorSubject } from 'rxjs';
import { MultiSortTableDataSource } from './multi-sort-data-source';
import { SortDirection } from '@angular/material/sort';
import { Settings } from './utils';

export class TableData<T> {
    private _dataSource: MultiSortTableDataSource<T>;
    private readonly _columns: BehaviorSubject<{ id: string, name: string, isActive?: boolean }[]>;
    private _displayedColumns: string[];
    pageSize: number;
    pageIndex: number;
    private _sortParams: string[];
    private _sortDirs: string[];
    private _key: string;
    private _sortObservable: Subject<void> = new Subject<void>();

    // TODO refactor
    constructor(columns: { id: string, name: string, isActive?: boolean }[],
        options?: {
            defaultSortParams?: string[],
            defaultSortDirs?: string[],
            pageSizeOptions?: number[],
            totalElements?: number,
            localStorageKey?: string
        }) {
        this._columns = new BehaviorSubject(columns.map(c => { if (c.isActive === undefined) { c.isActive = true; } return c; }));
        this._displayedColumns = this._columns.value.filter(c => c.isActive).map(c => c.id);

        if (options) {
            if (options.pageSizeOptions && options.pageSizeOptions.length < 1) {
                throw Error('Array of pageSizeOptions must contain at least one entry');
            }

            if (options.defaultSortParams) {
                options.defaultSortParams.map(s => {
                    if (!this._displayedColumns.includes(s)) {
                        throw Error(`Provided sort parameter "${s}" is not a column.`);
                    }
                });
            }

            this._sortParams = options.defaultSortParams || [];
            this._sortDirs = options.defaultSortDirs || [];

            if (this._sortParams.length !== this._sortDirs.length) {
                this._sortDirs = this._sortParams.map(() => 'asc');
            }
            this._key = options.localStorageKey;
        } else {
            this._sortParams = [];
            this._sortDirs = [];
        }
        this.init();
    }

    public onSortEvent() {
        const actives = 'actives';
        const directions = 'directions'
        this._sortParams = this._dataSource.sort[actives];
        this._sortDirs = this._dataSource.sort[directions];
        this._sortObservable.next();
        this.storeTableSettings();
    }

    public updateSortHeaders(): void {
        // Dirty hack to display default sort column(s)
        const temp = Object.assign([], this._displayedColumns);
        this._displayedColumns = [];
        setTimeout(() => this._displayedColumns = temp, 0);
        this._sortObservable.next();
        this.storeTableSettings();
    }

    private init() {
        if (this._key) {
            const settings = new Settings(this._key);
            settings.load();
            if (this._isLocalStorageSettingsValid(settings)) {
                this.columns = settings.columns;
                this._sortDirs = settings.sortDirs;
                this._sortParams = settings.sortParams;
            } else {
                console.warn('Stored tableSettings are invalid. Using default');
            }
        }
    }

    private _isLocalStorageSettingsValid(settings: Settings): boolean {
        // check if number of columns matching
        if (settings.columns.length !== this._columns.value.length) {
            return false;
        }

        // check if columns are the same
        for (const column of settings.columns) {
            const match = this._columns.value.filter(c => c.id === column.id && c.name === column.name);
            if (match === undefined) {
                return false;
            }
        }
        return true;
    }

    public storeTableSettings(): void {
        if (this._key) {
            const settings: Settings = new Settings(this._key);
            settings.columns = this._columns.value;
            settings.sortParams = this._sortParams;
            settings.sortDirs = this._sortDirs;
            settings.save();
        }
    }

    public set displayedColumns(displayedColumns: string[]) {
        this._displayedColumns = displayedColumns;
    }

    public get displayedColumns(): string[] {
        return this._displayedColumns;
    }

    public set dataSource(dataSource: MultiSortTableDataSource<T>) {
        this._dataSource = dataSource;
        if (this._sortParams.length > 0) {
            this._dataSource.sort.actives = this._sortParams;
            this._dataSource.sort.directions = this._sortDirs.map(v => v as SortDirection);
            this.updateSortHeaders();
        }
    }

    public get dataSource(): MultiSortTableDataSource<T> {
        return this._dataSource;
    }



    public onColumnsChange(): BehaviorSubject<{ id: string, name: string, isActive?: boolean }[]> {
        return this._columns;
    }

    public updateColumnNames(v: { id: string, name: string }[]) {
        const dict = {};
        v.forEach(c => dict[c.id] = c.name);
        this._columns.next(this._columns.value.map(c => { c.name = dict[c.id] || c.name; return c; }));
    }

    public get sortObservable(): Subject<any> {
        return this._sortObservable;
    }

    public get sortParams(): string[] {
        return this._sortParams;
    }
    public set sortParams(v: string[]) {
      this._sortParams = v;
      this._dataSource.sort.actives = this._sortParams;
    }

    public get sortDirs(): string[] {
        return this._sortDirs;
    }
    public set sortDirs(v: string[]) {
      this._sortDirs = v;
      this._dataSource.sort.directions = this._sortDirs.map(elem => elem as SortDirection);
    }

    public get columns(): { id: string, name: string, isActive?: boolean }[] {
        return this._columns.value;
    }
    public set columns(v: { id: string, name: string, isActive?: boolean }[]) {
      this._columns.next(v.map(c => { if (c.isActive === undefined) { c.isActive = true; } return c; }));
    }



}
