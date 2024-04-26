import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {

	const logger = new Logger('Main-OrdersMicroservice');

	const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
		transport: Transport.TCP,
		options: {
			port: envs.port,
		}
	});

	await app.listen();
	logger.log(`Orders microservice is running on port ${envs.port}`);

}
bootstrap();
