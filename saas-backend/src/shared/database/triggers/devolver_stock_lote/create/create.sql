CREATE TRIGGER devolver_stock_lote
BEFORE DELETE
ON venta_detalles
FOR EACH ROW
BEGIN

    IF OLD.lote_id IS NOT NULL THEN

        UPDATE lotes
        SET 
        	cantidad_actual = cantidad_actual + OLD.cantidad,
        	activo = CASE
                        WHEN (cantidad_actual + OLD.cantidad) > 0
                        THEN TRUE
                        ELSE FALSE
                      END
        WHERE id = OLD.lote_id;

    END IF;

END;