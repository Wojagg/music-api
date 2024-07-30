import { Request } from 'express';

type JwtUserInfo = {
  username: string;
  sub: string;
};

export interface RequestWithJwtUserInfo extends Request {
  user: JwtUserInfo;
}
