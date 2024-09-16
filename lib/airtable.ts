// lib/airtable.ts

import Airtable from "airtable";

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID);

export const table = base(process.env.AIRTABLE_TABLE_NAME);

export const getMinifiedRecord = (record) => {
  return {
    id: record.id,
    fields: record.fields,
  };
};

export const getMinifiedRecords = (records) => {
  return records.map((record) => getMinifiedRecord(record));
};
