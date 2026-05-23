CREATE TRIGGER devolver_stock_venta_anulada
BEFORE UPDATE
ON ventas
FOR EACH ROW
BEGIN

    IF OLD.estado <> 'ANULADA'
       AND NEW.estado = 'ANULADA' THEN

        UPDATE lotes l
        INNER JOIN venta_detalles vd
            ON l.id = vd.lote_id
        SET 
        	l.cantidad_actual = l.cantidad_actual + vd.cantidad,
        	 l.activo = CASE
                            WHEN (l.cantidad_actual + vd.cantidad) > 0
                            THEN TRUE
                            ELSE FALSE
                        END
        WHERE vd.venta_id = OLD.id
        AND vd.lote_id IS NOT NULL;

    END IF;

END;