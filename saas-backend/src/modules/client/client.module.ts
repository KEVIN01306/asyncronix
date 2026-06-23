import { PrismaClientRepository } from "./infrastructure/prisma-client.repository.js";
import { ClientController } from "./presentation/client.controller.js";
import prisma from "@infrastructure/config/prisma.js";
import { GetClientUseCase } from "./application/get-client.usecase.js";
import { GetClientsUseCase } from "./application/get-clients.usecase.js";
import { RegisterClientUseCase } from "./application/register-client.usecase.js";
import { UpdateClientUseCase } from "./application/update-client.usecase.js";
import { DeleteClientUseCase } from "./application/delete-client.usecase.js";
import { FindClientByDocumentUseCase } from "./application/find-client-by-document.usecase.js";

const clientRepository = new PrismaClientRepository(prisma);

const getClientUseCase = new GetClientUseCase(clientRepository);
const getClientsUseCase = new GetClientsUseCase(clientRepository);
const registerClientUseCase = new RegisterClientUseCase(clientRepository);
const updateClientUseCase = new UpdateClientUseCase(clientRepository);
const deleteClientUseCase = new DeleteClientUseCase(clientRepository);
const findClientByDocumentUseCase = new FindClientByDocumentUseCase(clientRepository);

export const clientController = new ClientController(
    getClientUseCase,
    getClientsUseCase,
    registerClientUseCase,
    updateClientUseCase,
    deleteClientUseCase,
    findClientByDocumentUseCase
);