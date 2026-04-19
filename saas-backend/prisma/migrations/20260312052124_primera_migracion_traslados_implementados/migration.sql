-- CreateTable
CREATE TABLE `categorias` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NULL,

    INDEX `negocio_id`(`negocio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(100) NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `direccion_entrega` TEXT NULL,
    `fecha_registro` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `negocio_id`(`negocio_id`, `telefono`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `codigos_verificacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` CHAR(36) NOT NULL,
    `codigo` VARCHAR(6) NOT NULL,
    `expiracion` DATETIME(0) NOT NULL,
    `usado` BOOLEAN NULL DEFAULT false,

    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compras` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `sucursal_id` CHAR(36) NOT NULL,
    `proveedor_id` CHAR(36) NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `fecha` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `negocio_id`(`negocio_id`),
    INDEX `proveedor_id`(`proveedor_id`),
    INDEX `sucursal_id`(`sucursal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_compras` (
    `id` CHAR(36) NOT NULL,
    `compra_id` CHAR(36) NOT NULL,
    `sku_id` CHAR(36) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `costo_unitario` DECIMAL(12, 2) NOT NULL,

    INDEX `compra_id`(`compra_id`),
    INDEX `sku_id`(`sku_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detalle_ventas` (
    `id` CHAR(36) NOT NULL,
    `venta_id` CHAR(36) NOT NULL,
    `sku_id` CHAR(36) NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `precio_aplicado` DECIMAL(12, 2) NOT NULL,
    `descuento_aplicado` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `costo_momento_venta` DECIMAL(12, 2) NOT NULL,

    INDEX `sku_id`(`sku_id`),
    INDEX `venta_id`(`venta_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gastos` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `sucursal_id` CHAR(36) NOT NULL,
    `monto` DECIMAL(12, 2) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `categoria_gasto` ENUM('ALQUILER', 'SERVICIOS', 'NOMINA', 'MARKETING', 'OTROS') NULL,
    `fecha` DATE NOT NULL,

    INDEX `negocio_id`(`negocio_id`),
    INDEX `sucursal_id`(`sucursal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventario_stock` (
    `id` CHAR(36) NOT NULL,
    `sku_id` CHAR(36) NOT NULL,
    `sucursal_id` CHAR(36) NOT NULL,
    `cantidad_disponible` INTEGER NULL DEFAULT 0,
    `cantidad_reservada` INTEGER NULL DEFAULT 0,

    INDEX `sku_id`(`sku_id`, `sucursal_id`),
    INDEX `sucursal_id`(`sucursal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `negocios` (
    `id` CHAR(36) NOT NULL,
    `nombre_comercial` VARCHAR(100) NOT NULL,
    `wa_id` VARCHAR(20) NOT NULL,
    `nit_rut` VARCHAR(20) NULL,
    `logo_url` TEXT NULL,
    `slogan` VARCHAR(255) NULL,
    `datos_facturacion_json` JSON NULL,
    `fecha_registro` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `giro_negocio` ENUM('ZAPATERIA', 'ROPA', 'ABARROTERIA', 'FARMACIA', 'COSMETICOS', 'ELECTRODOMESTICOS', 'OTRO') NOT NULL DEFAULT 'OTRO',
    `modelo_venta` ENUM('MENUDEO', 'MAYOREO', 'HIBRIDO') NULL DEFAULT 'MENUDEO',
    `instagram_id` VARCHAR(100) NULL,
    `facebook_id` VARCHAR(100) NULL,

    UNIQUE INDEX `wa_id`(`wa_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `producto_imagenes` (
    `id` CHAR(36) NOT NULL,
    `producto_id` CHAR(36) NOT NULL,
    `sku_id` CHAR(36) NULL,
    `url_imagen` TEXT NOT NULL,
    `es_principal` BOOLEAN NULL DEFAULT false,

    INDEX `producto_id`(`producto_id`),
    INDEX `sku_id`(`sku_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `categoria_id` CHAR(36) NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,

    INDEX `categoria_id`(`categoria_id`),
    INDEX `negocio_id`(`negocio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promocion_skus` (
    `promocion_id` CHAR(36) NOT NULL,
    `sku_id` CHAR(36) NOT NULL,

    INDEX `sku_id`(`sku_id`),
    PRIMARY KEY (`promocion_id`, `sku_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `promociones` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(100) NULL,
    `tipo` ENUM('PORCENTAJE', 'MONTO_FIJO') NOT NULL,
    `valor` DECIMAL(12, 2) NOT NULL,
    `fecha_inicio` DATETIME(0) NOT NULL,
    `fecha_fin` DATETIME(0) NOT NULL,
    `activa` BOOLEAN NULL DEFAULT true,
    `sucursal_id` CHAR(36) NOT NULL,

    INDEX `fk_promociones_sucursal`(`sucursal_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proveedores` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NULL,

    INDEX `negocio_id`(`negocio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sku_variantes` (
    `id` CHAR(36) NOT NULL,
    `sku_id` CHAR(36) NOT NULL,
    `nombre_atributo` VARCHAR(50) NOT NULL,
    `valor_atributo` VARCHAR(50) NOT NULL,

    INDEX `sku_id`(`sku_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skus` (
    `id` CHAR(36) NOT NULL,
    `producto_id` CHAR(36) NOT NULL,
    `codigo_barras` VARCHAR(50) NULL,
    `precio_venta` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `precio_costo_promedio` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `precio_mayoreo` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `cantidad_minima_mayoreo` INTEGER NULL DEFAULT 12,
    `unidad_medida` VARCHAR(20) NULL DEFAULT 'UNIDAD',
    `solo_mayoreo` BOOLEAN NULL DEFAULT false,

    INDEX `producto_id`(`producto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sucursales` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `es_principal` BOOLEAN NULL DEFAULT true,
    `direccion` TEXT NULL,

    INDEX `negocio_id`(`negocio_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `telefono` VARCHAR(20) NOT NULL,
    `password_hash` TEXT NULL,
    `rol` ENUM('ADMIN', 'VENDEDOR') NOT NULL,
    `verificado` BOOLEAN NULL DEFAULT false,
    `activo` BOOLEAN NULL DEFAULT true,
    `sucursalesId` CHAR(36) NULL,

    UNIQUE INDEX `telefono`(`telefono`),
    INDEX `negocio_id`(`negocio_id`),
    INDEX `sucursalesId`(`sucursalesId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` CHAR(36) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `usuario_id` CHAR(36) NOT NULL,
    `fecha_creacion` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `fecha_expiracion` TIMESTAMP(0) NOT NULL,

    UNIQUE INDEX `token`(`token`),
    UNIQUE INDEX `session_usuario_id_key`(`usuario_id`),
    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ventas` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `sucursal_id` CHAR(36) NOT NULL,
    `usuario_id` CHAR(36) NULL,
    `canal` ENUM('WHATSAPP', 'LOCAL', 'ECOMMERCE') NOT NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `descuento_total` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `fecha` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `cliente_id` CHAR(36) NULL,

    INDEX `fk_ventas_cliente`(`cliente_id`),
    INDEX `negocio_id`(`negocio_id`),
    INDEX `sucursal_id`(`sucursal_id`),
    INDEX `usuario_id`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `traslado_detalles` (
    `id` CHAR(36) NOT NULL,
    `traslado_id` CHAR(36) NOT NULL,
    `sku_id` CHAR(36) NOT NULL,
    `cantidad` INTEGER NOT NULL,

    INDEX `fk_det_tras`(`traslado_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `traslados` (
    `id` CHAR(36) NOT NULL,
    `negocio_id` CHAR(36) NOT NULL,
    `sucursal_origen_id` CHAR(36) NOT NULL,
    `sucursal_destino_id` CHAR(36) NOT NULL,
    `estado` ENUM('PENDIENTE', 'EN_TRANSITO', 'RECIBIDO', 'CANCELADO') NULL DEFAULT 'PENDIENTE',
    `fecha_envio` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_tras_des`(`sucursal_destino_id`),
    INDEX `fk_tras_neg`(`negocio_id`),
    INDEX `fk_tras_ori`(`sucursal_origen_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categorias` ADD CONSTRAINT `categorias_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `codigos_verificacion` ADD CONSTRAINT `codigos_verificacion_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `compras` ADD CONSTRAINT `compras_ibfk_3` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `detalle_compras` ADD CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `detalle_compras` ADD CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`sku_id`) REFERENCES `skus`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `detalle_ventas` ADD CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `detalle_ventas` ADD CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`sku_id`) REFERENCES `skus`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `gastos` ADD CONSTRAINT `gastos_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventario_stock` ADD CONSTRAINT `inventario_stock_ibfk_1` FOREIGN KEY (`sku_id`) REFERENCES `skus`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inventario_stock` ADD CONSTRAINT `inventario_stock_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `producto_imagenes` ADD CONSTRAINT `producto_imagenes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `producto_imagenes` ADD CONSTRAINT `producto_imagenes_ibfk_2` FOREIGN KEY (`sku_id`) REFERENCES `skus`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `promocion_skus` ADD CONSTRAINT `promocion_skus_ibfk_1` FOREIGN KEY (`promocion_id`) REFERENCES `promociones`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `promocion_skus` ADD CONSTRAINT `promocion_skus_ibfk_2` FOREIGN KEY (`sku_id`) REFERENCES `skus`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `promociones` ADD CONSTRAINT `fk_promociones_sucursal` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proveedores` ADD CONSTRAINT `proveedores_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sku_variantes` ADD CONSTRAINT `sku_variantes_ibfk_1` FOREIGN KEY (`sku_id`) REFERENCES `skus`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `skus` ADD CONSTRAINT `skus_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `sucursales` ADD CONSTRAINT `sucursales_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_sucursalesId_fkey` FOREIGN KEY (`sucursalesId`) REFERENCES `sucursales`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `session` ADD CONSTRAINT `session_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `fk_ventas_cliente` FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`sucursal_id`) REFERENCES `sucursales`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `ventas` ADD CONSTRAINT `ventas_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `traslado_detalles` ADD CONSTRAINT `fk_det_tras` FOREIGN KEY (`traslado_id`) REFERENCES `traslados`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `traslados` ADD CONSTRAINT `fk_tras_des` FOREIGN KEY (`sucursal_destino_id`) REFERENCES `sucursales`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `traslados` ADD CONSTRAINT `fk_tras_neg` FOREIGN KEY (`negocio_id`) REFERENCES `negocios`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `traslados` ADD CONSTRAINT `fk_tras_ori` FOREIGN KEY (`sucursal_origen_id`) REFERENCES `sucursales`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
