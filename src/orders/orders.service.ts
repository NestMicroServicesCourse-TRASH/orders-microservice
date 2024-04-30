import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

	private readonly logger = new Logger('OrderService');

	async onModuleInit() {
		await this.$connect();
		this.logger.log(`Database connected`)
	}

	createOrder(createOrderDto: CreateOrderDto) {
		return this.orders.create({
			data: createOrderDto
		});
	}

	async getOrders(orderPaginationDto: OrderPaginationDto) {
		const { status, page, limit } = orderPaginationDto

		const totalItems = await this.orders.count({
			where: {
				status: orderPaginationDto.status
			}
		});
		const lastPage = Math.ceil(totalItems / limit);

		return {
			data: await this.orders.findMany({
				take: limit,
				skip: (page - 1) * limit,
				where: {
					status
				}
			}),
			meta: {
				totalItems,
				page,
				lastPage
			}
		}
	}

	async getOrder(id: string) {
		const order = await this.orders.findFirst({
			where: {
				id,
			}
		});

		if (!order) {
			throw new RpcException({
				message: `Order with id ${id} not found`,
				status: HttpStatus.NOT_FOUND
			});
		}
		return order;
	}

	async updateOrderStatus(updateOrderStatusDto: UpdateOrderStatusDto) {
		const { id, status } = updateOrderStatusDto;

		const order = await this.getOrder(id);

		if (order.status === status) {
			return order;
		}

		return this.orders.update({
			where: {
				id
			},
			data: {
				status
			}
		})
	}
}

