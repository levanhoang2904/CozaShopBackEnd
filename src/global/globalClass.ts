/* eslint-disable prettier/prettier */
export class ResponseData<D> {
  data: D | D[];
  message: string;
  statusCode: number;

  constructor(data: D | D[], message: string, statusCode: number) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    return this;
  }
}
