import { json as postgresqlJson } from 'drizzle-orm/pg-core';
import type { PgJsonBuilder } from 'drizzle-orm/pg-core';

export type CustomMySqlJsonBuilderInitial<TName extends string, DataType = unknown> = PgJsonBuilder<{
    name: TName;
    dataType: 'json';
    columnType: 'PgJson';
    data: DataType;
    driverParam: unknown;
    enumValues: undefined;
}>;

export const json = postgresqlJson as <TName extends string, DataType = unknown>(name: TName) => CustomMySqlJsonBuilderInitial<TName, DataType>;
