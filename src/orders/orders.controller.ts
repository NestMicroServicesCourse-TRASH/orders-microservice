import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderPaginationDto, UpdateOrderStatusDto } from './dto';

@Controller()
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) { }

	@MessagePattern('createOrder')
	createOrder(@Payload() createOrderDto: CreateOrderDto) {
		return this.ordersService.createOrder(createOrderDto);
	}

	@MessagePattern('getOrders')
	getOrders(@Payload() orderPaginationDto: OrderPaginationDto) {
		return this.ordersService.getOrders(orderPaginationDto);
	}

	@MessagePattern('getOrder')
	getOrder(@Payload(ParseUUIDPipe) id: string) {
		return this.ordersService.getOrder(id);
	}

	@MessagePattern('updateOrderStatus')
	updateOrderStatus(@Payload() updateOrderStatusDto: UpdateOrderStatusDto) {
		return this.ordersService.updateOrderStatus(updateOrderStatusDto);
	}
}
