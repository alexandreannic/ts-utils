import * as fs from 'fs-extra';
import stringify from 'csv-stringify/lib/sync';
import parse from 'csv-parse/lib/sync';
import { expect } from 'chai';

import { History, DefaultRecord } from './History';


interface CustomRecord extends DefaultRecord {
    custom: any;
}

const currentDate = new Date();
const specFilePath = 'history_spec/history.csv';
const record: CustomRecord = { key: 'test', date: currentDate, custom: 1 };
const record2: CustomRecord = { key: 'test2', date: new Date(currentDate.getTime() - 1000 ), custom: 2 };

describe('History (as a service)', () => {

    describe('from an existing file without records', () => {

        let history: History<CustomRecord> | undefined;

        before(() => {
            fs.ensureFileSync(specFilePath);
        });

        after(() => {
            fs.unlinkSync(specFilePath);
            fs.rmdirSync(specFilePath.split('/')[0]);
        });

        it('should instanciate an history', () => {
            history = new History(specFilePath);
            expect(history.getHistory()).to.be.an('array');
            expect(history.getHistory().length).to.equal(0);
        });

        it('should add a record', () => {
            history!.addRecord(record);
            expect(history!.getHistory().length).to.equal(1);
            expect(parse(fs.readFileSync(specFilePath), { columns : true }).length).to.eq(1);
        });

        it('should get this record', () => {
            const r = history!.getRecordByKey(record.key);
            expect(r).not.to.be.undefined;
            expect(r!.key).to.equal(record.key);
        });

        it('should get a last record', () => {
            const r = history!.getLastRecord();
            expect(r).not.to.be.undefined;
            expect(r!.key).to.equal(record.key); 
        });
    
    });


    describe('from an existing file with records', () => {

        let history: History<CustomRecord> | undefined;

        before(() => {
            fs.ensureFileSync(specFilePath);
            fs.writeFileSync(specFilePath, stringify([record], { header: true }));
        });

        after(() => {
            fs.unlinkSync(specFilePath);
            fs.rmdirSync(specFilePath.split('/')[0]);
        });

        it('should instanciate an history', () => {
            history = new History(specFilePath);
            expect(history.getHistory()).to.be.an('array');
            expect(history.getHistory().length).to.equal(1);
        });

        it('should add a record', () => {
            history!.addRecord(record2);
            expect(history!.getHistory().length).to.equal(2);
            expect(parse(fs.readFileSync(specFilePath), { columns : true }).length).to.eq(2);
        });

        it('should get this record', () => {
            const r = history!.getRecordByKey(record2.key);
            expect(r).not.to.be.undefined;
            expect(r!.key).to.equal(record2.key);
        });

        it('should get a last record', () => {
            const r = history!.getLastRecord();
            expect(r).not.to.be.undefined;
            expect(r!.key).to.equal(record.key); 
        });
    
    });

    describe('from an non existing file', () => {

        let history: History<CustomRecord> | undefined;

        after(() => {
            fs.unlinkSync(specFilePath);
            fs.rmdirSync(specFilePath.split('/')[0]);
        });

        it('should instanciate an history', () => {
            history = new History(specFilePath);
            expect(history.getHistory()).to.be.an('array');
            expect(history.getHistory().length).to.equal(0);
        });

        it('should add a record', () => {
            history!.addRecord(record);
            expect(history!.getHistory().length).to.equal(1);
            expect(parse(fs.readFileSync(specFilePath), { columns : true }).length).to.eq(1);
        });

        it('should get this record', () => {
            const r = history!.getRecordByKey(record.key);
            expect(r).not.to.be.undefined;
            expect(r!.key).to.equal(record.key);
        });

        it('should get a last record', () => {
            const r = history!.getLastRecord();
            expect(r).not.to.be.undefined;
            expect(r!.key).to.equal(record.key); 
        });
    
    });


});