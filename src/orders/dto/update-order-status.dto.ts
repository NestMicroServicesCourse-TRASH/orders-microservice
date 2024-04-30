import { OrderStatus } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";

export class UpdateOrderStatusDto {

    @IsUUID(4)
    id: string;

    @IsEnum(OrderStatusList, {
        message: `status must be one of the following values: ${OrderStatusList}`
    })
    status: OrderStatus;
}