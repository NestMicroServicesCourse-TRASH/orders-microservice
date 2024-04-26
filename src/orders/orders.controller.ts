import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) { }

	@MessagePattern('createOrder')
	createOrder(@Payload() createOrderDto: CreateOrderDto) {
		return this.ordersService.createOrder(createOrderDto);
	}

	@MessagePattern('getOrders')
	getOrders() {
		return this.ordersService.getOrders();
	}

	@MessagePattern('getOrder')
	getOrder(@Payload() id: number) {
		return this.ordersService.getOrder(id);
	}

	@MessagePattern('updateOrderStatus')
	updateOrderStatus(@Payload() id: number, updateOrderDto: UpdateOrderDto) {
		return this.ordersService.updateOrderStatus(id, updateOrderDto);
		// throw new NotImplementedException();
	}
}
