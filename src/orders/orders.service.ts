import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
	createOrder(createOrderDto: CreateOrderDto) {
		return 'This action adds a new order';
	}

	getOrders() {
		return `This action returns all orders`;
	}

	getOrder(id: number) {
		return `This action returns a #${id} order`;
	}

	updateOrderStatus(id: number, UpdateOrderDto: UpdateOrderDto) {
		return `This action changes the order status of order #${id}`;
	}

}
