import { jsonb } from 'drizzle-orm/pg-core';
import type { PgJsonbBuilder } from 'drizzle-orm/pg-core';

export type CustomMySqlJsonBuilderInitial<TName extends string, DataType = unknown> = PgJsonbBuilder<{
    name: TName;
    dataType: 'json';
    columnType: 'PgJsonb';
    data: DataType;
    driverParam: unknown;
    enumValues: undefined;
}>;

export const json = jsonb as <TName extends string, DataType = unknown>(name: TName) => CustomMySqlJsonBuilderInitial<TName, DataType>;
