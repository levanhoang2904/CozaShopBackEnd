/* eslint-disable prettier/prettier */
export class Auth {
  _id: string;
  email: string;
  name: string;
  phone: string;

  constructor(_id: string, email: string, name: string, phone: string) {
    this._id = _id;
    this.email = email;
    this.name = name;
    this.phone = phone;
  }
}
