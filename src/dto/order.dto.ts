export class OrderVNPostDto {
  orderCreationStatus: number = 0;
  type: string = "GUI";
  customerCode: string = "";
  contractCode: string = "HĐ118_HĐBC_BĐTPH_HĐB";
  informationOrder: {
    senderName: string;
    senderPhone: string;
    senderMail: string;
    senderAddress: string;
    senderProvinceCode: string;
    senderProvinceName: string;
    senderDistrictCode: string;
    senderDistrictName: string;
    senderCommuneCode: string;
    senderCommuneName: string;
    receiverName: string; // Đảm bảo kiểu dữ liệu của receiverName là string
    receiverAddress: string;
    receiverProvinceCode: string;
    receiverProvinceName: string;
    receiverDistrictCode: string;
    receiverDistrictName: string;
    receiverCommuneCode: string;
    receiverCommuneName: string;
    receiverPhone: string;
    receiverEmail: string | null;
    serviceCode: string;
    addonService: any[];
    additionRequest: any[];
    orgCodeCollect: number | null;
    orgCodeAccept: number | null;
    saleOrderCode: number | null;
    contentNote: string;
    weight: string;
    width: string | null;
    length: string | null;
    height: string | null;
    vehicle: string;
    sendType: string;
    isBroken: string;
    deliveryTime: string;
    deliveryRequire: string;
    deliveryInstruction: string;
  } = {
    senderName: "Hoa Đồ Bộ",
    senderPhone: "0837315718",
    senderMail: "",
    senderAddress: "số 3 kiệt 8 Dương Văn An",
    senderProvinceCode: "49",
    senderProvinceName: "Tỉnh Thừa Thiên Huế",
    senderDistrictCode: "4910",
    senderDistrictName: "TP. Huế",
    senderCommuneCode: "49106",
    senderCommuneName: "P. Xuân Phú",
    receiverName: "", // Đây là kiểu dữ liệu string
    receiverAddress: "",
    receiverProvinceCode: "",
    receiverProvinceName: "",
    receiverDistrictCode: "",
    receiverDistrictName: "",
    receiverCommuneCode: "",
    receiverCommuneName: "",
    receiverPhone: "",
    receiverEmail: null,
    serviceCode: "CTN009",
    addonService: [],
    additionRequest: [],
    orgCodeCollect: null,
    orgCodeAccept: null,
    saleOrderCode: null,
    contentNote: "",
    weight: "",
    width: null,
    length: null,
    height: null,
    vehicle: "BO",
    sendType: "1",
    isBroken: "0",
    deliveryTime: "N",
    deliveryRequire: "2",
    deliveryInstruction: "",
  };
}

export class SearchOrderDto {
  page?: number; //số trang đang chọn
  pageSize?: number; //số sản phẩm trên 1 trang
  searchValue?: string
  startDay?: Date; // chọn theo danh mục category
  endDay?: Date; //chọn sản phẩn đang sale
  status?: number // mảng lưu màu sắc người dùng chọn
}

export class DataProductOrderDto{
  _id?: string
  number?: number
  _idColor?: string
  color?: string
  image?: string
  _idSize?: string
  size?: string
  _idSizeold?: string
  amount?: number
}
