import type {
  KyselyPlugin,
  PluginTransformQueryArgs,
  PluginTransformResultArgs,
  QueryResult,
  RootOperationNode,
  UnknownRow,
} from 'kysely';

/** `timestamptz` as printed by Postgres with the ISO DateStyle, e.g. `2026-11-10 12:00:00.123+00`. */
const PG_TIMESTAMPTZ = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d+)?[+-]\d{2}(:\d{2})?$/;

const parseTimestamp = (key: string, value: unknown): unknown =>
  (key.endsWith('At') || key.endsWith('Until')) &&
  typeof value === 'string' &&
  PG_TIMESTAMPTZ.test(value)
    ? new Date(value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00'))
    : value;

/**
 * The shared MikroORM pool keeps `timestamptz` values as raw strings, while Better Auth expects
 * `Date` objects from a Postgres adapter (it compares `session.expiresAt` with the current time).
 * Converts timestamp columns of Better Auth tables (`…At`, `lockedUntil`) back to `Date` on read.
 */
export class TimestampParsingPlugin implements KyselyPlugin {
  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    return args.node;
  }

  transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
    const rows = args.result.rows.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [key, parseTimestamp(key, value)]),
      ),
    );
    return Promise.resolve({ ...args.result, rows });
  }
}
