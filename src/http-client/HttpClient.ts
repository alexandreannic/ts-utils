import * as rp from 'request-promise';
import {Headers} from 'request';

export interface RequestOption {
  qs?: any;
  headers?: Headers;
  body?: any;
  timeout?: number;
}

interface HttpClientParams {
  baseUrl: string,
  headers?: any,
  proxy?: string,
  mapData?: (_: any) => any
  mapError?: (_: any) => never
}

export class HttpClient {

  constructor({
    baseUrl,
    headers,
    proxy,
    mapData,
    mapError,
  }: HttpClientParams) {
    this.http = rp.defaults({
      baseUrl,
      headers: {Connection: 'keep-alive', ...headers,},
      json: true,
      proxy,
    });

    this.mapError = mapError ?? (_ => Promise.reject(_));
    this.mapData = mapData ?? (_ => _);
  }

  private readonly http: any;
  private readonly mapError: (_: any) => any;
  private readonly mapData: (_: any) => any;

  readonly get = <T = any>(uri: string, options?: RequestOption): Promise<T> => {
    return this.http.get(uri, options)
      .then(this.mapData)
      .catch(this.mapError);
  };

  readonly post = <T = any>(uri: string, options?: RequestOption): Promise<T> => {
    return this.http.post(uri, options)
      .then(this.mapData)
      .catch(this.mapError);
  };

  readonly delete = <T = any>(uri: string, options?: RequestOption): Promise<T> => {
    return this.http.delete(uri, options)
      .then(this.mapData)
      .catch(this.mapError);
  };

  readonly put = <T = any>(uri: string, options?: RequestOption): Promise<T> => {
    return this.http.post(uri, options)
      .then(this.mapData)
      .catch(this.mapError);
  };
}
