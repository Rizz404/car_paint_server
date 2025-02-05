import { Decimal } from "@prisma/client/runtime/library";

export interface LocationCoordinates {
  latitude: Decimal | number;
  longitude: Decimal | number;
}
