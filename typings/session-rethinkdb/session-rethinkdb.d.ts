/// <reference path="../express-session/express-session.d.ts" />

interface Store {
  get: (sid: string, callback: (err: any, session: Express.Session) => void) => void;
  set: (sid: string, session: Express.Session, callback: (err: any) => void) => void;
  destroy: (sid: string, callback: (err: any) => void) => void;
  length?: (callback: (err: any, length: number) => void) => void;
  clear?: (callback: (err: any) => void) => void;
}

declare module 'session-rethinkdb' {
  
  
  interface  RDBStore {
    (options?:any): Store
  }
  
  function config(session): RDBStore;
  
  module config {
    
  }

  export = config;
}