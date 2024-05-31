/* eslint-disable prettier/prettier */
export class CreatePostDTO {
  title: string;
  category: string;
  description: string;
  thumbnail: string;
}

export class UpdatePostDTO {
  title?: string;
  category?: string;
  description?: string;
  thumbnail?: string;
  status?: number;
  createDate: Date;
}
