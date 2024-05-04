import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { PRODUCTS_MICROSERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

	private readonly logger = new Logger('OrderService');

	constructor(
		@Inject(PRODUCTS_MICROSERVICE) private readonly client: ClientProxy
	) {
		super();
	}
	async onModuleInit() {
		await this.$connect();
		this.logger.log(`Database connected`)
	}

	async createOrder(createOrderDto: CreateOrderDto) {

		try {

			// Confirmar id's de los productos
			const producIds = createOrderDto.items.map(item => item.productId)

			const products: any[] = await firstValueFrom(
				this.client.send({ cmd: 'validate_products' }, producIds)
			);

			// Calcular el total de la orden
			const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
				const price = products.find(product => product.id === orderItem.productId).price;

				return acc + (price * orderItem.quantity);
			}, 0);

			const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
				return acc + orderItem.quantity;
			}, 0)

			// Crear transaccion de la orden en la base de datos
			const order = await this.orders.create({
				data: {
					totalAmount,
					totalItems,
					OrderItem: {
						createMany: {
							data: createOrderDto.items.map(orderItem => ({
								productId: orderItem.productId,
								price: products.find(product => product.id === orderItem.productId).price,
								quantity: orderItem.quantity,
							}))
						}
					}
				},
				include: {
					OrderItem: {
						select: {
							productId: true,
							price: true,
							quantity: true
						}
					}
				}
			})

			return {
				...order,
				OrderItem: order.OrderItem.map(orderItem => ({
					name: products.find(product => product.id === orderItem.productId).name,
					...orderItem
				}))
			};


		} catch (error) {
			throw new RpcException({
				status: HttpStatus.BAD_REQUEST,
				message: `Check logs for more details`
			})
		}
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
			},
			include: {
				OrderItem: {
					select: {
						productId: true,
						price: true,
						quantity: true
					}
				}
			}
		});

		if (!order) {
			throw new RpcException({
				message: `Order with id ${id} not found`,
				status: HttpStatus.NOT_FOUND
			});
		}

		const productIds = order.OrderItem.map(orderItem => orderItem.productId);
		const products: any[] = await firstValueFrom(
			this.client.send({ cmd: 'validate_products' }, productIds)
		);

		return {
			...order,
			OrderItem: order.OrderItem.map(orderItem => ({
				name: products.find(product => product.id === orderItem.productId).name,
				...orderItem
			}))
		}
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

