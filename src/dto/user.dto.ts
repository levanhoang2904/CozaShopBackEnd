/* eslint-disable prettier/prettier */
export class UserDto {
  _id: any;
  name: string;
  email: string;
  password: string;
  oldPass: string = '';
  phone: string;
  date: string;
  role: string = 'user';
}
export class AddressDto {
  idAddress: any;
  idUser: any;
  name: string;
  phone: string;
  detailAddress: string;
  city: string;
  district: string;
  ward: string;
  note: string;
}

export class UserSearchDto {
  page?: number;
  pageSize?: number;
  searchValue?: string;
}
