/*
  Warnings:

  - You are about to drop the column `sucursalesId` on the `usuarios` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_sucursalesId_fkey`;

-- DropIndex
DROP INDEX `sucursalesId` ON `usuarios`;

-- AlterTable
ALTER TABLE `usuarios` DROP COLUMN `sucursalesId`,
    ADD COLUMN `sucursal_id` CHAR(36) NULL;

-- CreateIndex
CREATE INDEX `sucursal_id` ON `usuarios`(`sucursal_id`);

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_sucursal_id_fkey` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
