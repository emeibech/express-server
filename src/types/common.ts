export interface GetIdFromIp {
  table: 'registered' | 'unregistered';
  value: string;
}

export interface QueryParams {
  text: string;
  values: unknown[];
}
