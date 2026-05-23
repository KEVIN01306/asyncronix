CREATE TRIGGER descontar_stock_lote
BEFORE INSERT ON venta_detalles
FOR EACH ROW
BEGIN
    DECLARE stock_actual INT;

    IF NEW.lote_id IS NOT NULL THEN

        SELECT cantidad_actual
        INTO stock_actual
        FROM lotes
        WHERE id = NEW.lote_id;

        IF stock_actual IS NULL THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El lote no existe';
        END IF;

        IF stock_actual < NEW.cantidad THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Stock insuficiente en el lote';
        END IF;

        UPDATE lotes
        SET 
        	cantidad_actual = cantidad_actual - NEW.cantidad,
        	activo = CASE 
		        		WHEN (cantidad_actual - NEW.cantidad) <= 0
		        		THEN FALSE
		        		ELSE TRUE
		        	END 		
        WHERE id = NEW.lote_id;

    END IF;

END