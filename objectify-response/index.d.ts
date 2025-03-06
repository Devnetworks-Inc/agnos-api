declare module 'objectify-response' {
  function resp(res: {}, message: any, status?: number) : any;
  export = resp
}