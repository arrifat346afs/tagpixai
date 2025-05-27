declare module 'node-fetch' {
  export default function fetch(
    url: string | Request,
    init?: RequestInit
  ): Promise<Response>;
  
  export class Request extends globalThis.Request {
    constructor(input: string | Request, init?: RequestInit);
  }
  
  export class Response extends globalThis.Response {
    constructor(body?: BodyInit | null, init?: ResponseInit);
  }
  
  export type RequestInfo = string | Request;
  
  export interface RequestInit extends globalThis.RequestInit {}
  export interface ResponseInit extends globalThis.ResponseInit {}
  export interface Headers extends globalThis.Headers {}
  export interface Body extends globalThis.Body {}
}
