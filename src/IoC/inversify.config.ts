// /* eslint-disable import/no-cycle */
import '@abraham/reflection';
import { PrismaClient, User } from '@prisma/client';
import { Container } from 'inversify';
import { ImportService } from '../services/ImportService';
import { AuthService } from '../services/AuthService';
import { ContactService } from '../services/ContactService';
import { CURRENT_USER, PRISMA_CLIENT, AUTH_SERVICE, IMPORT_SERVICE, CONTACTS_SERVICE, LOGS_SERVICE } from './types';
import { LogService } from '../services/LogService';


const container = new Container();

container.bind<User>(CURRENT_USER).toConstantValue({} as User);
container.bind<PrismaClient>(PRISMA_CLIENT).to(PrismaClient);
container.bind<AuthService>(AUTH_SERVICE).to(AuthService);
container.bind<ImportService>(IMPORT_SERVICE).to(ImportService);
container.bind<ContactService>(CONTACTS_SERVICE).to(ContactService);
container.bind<LogService>(LOGS_SERVICE).to(LogService);

export default container;
