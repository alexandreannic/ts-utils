import * as fs from 'fs-extra';
import parse from 'csv-parse/lib/sync';
import stringify from 'csv-stringify/lib/sync';


export interface DefaultRecord {
    key: string;
    date: Date;
}

export class History<T extends DefaultRecord> {

    private history: T[] = [];

    constructor(private filePath: string) {
        fs.ensureFileSync(this.filePath);
        this.history = parse(fs.readFileSync(this.filePath), { columns: true }).map((a: any) => ({ ...a , date: new Date(a.date) }))
        this.sortHistoryByDate();
    }

    private flushHistory = () => {
        this.sortHistoryByDate();
        fs.writeFileSync(this.filePath, Buffer.from(stringify(this.history, { header: true })));
    }

    private sortHistoryByDate = () => {
        this.history.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    addRecord = (record: T) => {
        this.history.push(record);
        this.flushHistory();
    }

    getLastRecord = (): T | undefined => {
        return this.history[0];
    }

    getRecordByKey = (key: string): T | undefined => {
        return this.history.find(a => a.key === key);
    }

    getHistory = () => {
        return [...this.history];
    }
 }