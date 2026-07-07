import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import movimientoRepository from '../../infrastructure/movimiento.repository';
import { format } from 'date-fns';
import type { TransaccionDetalle } from '../../domain/interfaces/movimiento.interface';

export default function MovimientoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movimiento, setMovimiento] = useState<TransaccionDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMovimiento = async () => {
            if (!id) return;
            try {
                const result = await movimientoRepository.obtener(id);
                setMovimiento(result.data);
            } catch (err: any) {
                setError(err.message || 'Error cargando movimiento');
            } finally {
                setLoading(false);
            }
        };
        loadMovimiento();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error || !movimiento) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                    {error || 'Movimiento no encontrado'}
                </div>
            </div>
        );
    }

    const getTipoLabel = (tipo: string) => (tipo === 'INGRESO' ? '+ Ingreso' : '- Egreso');
    const getTipoColor = (tipo: string) =>
        tipo === 'INGRESO'
            ? 'text-green-600 bg-green-50'
            : 'text-red-600 bg-red-50';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Volver
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Detalle del Movimiento</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Información General */}
                    <div className="p-6 border rounded-lg">
                        <h2 className="text-lg font-semibold mb-4">Información General</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipo de Movimiento</span>
                                <span className={`px-3 py-1 rounded font-semibold ${getTipoColor(movimiento.tipo_movimiento)}`}>
                                    {getTipoLabel(movimiento.tipo_movimiento)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Categoría</span>
                                <span className="font-semibold">
                                    {movimiento.categoria?.nombre || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fecha</span>
                                <span className="font-semibold">
                                    {format(new Date(movimiento.fecha_transaccion), 'dd/MM/yyyy HH:mm')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Usuario</span>
                                <span className="font-semibold">
                                    {movimiento.usuario?.nombre || 'N/A'}
                                </span>
                            </div>
                            {movimiento.descripcion && (
                                <div>
                                    <span className="text-gray-600">Descripción</span>
                                    <p className="mt-2 p-3 bg-gray-50 rounded">
                                        {movimiento.descripcion}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información Financiera */}
                    <div className="p-6 border rounded-lg">
                        <h2 className="text-lg font-semibold mb-4">Información Financiera</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    {movimiento.tipo_movimiento === 'INGRESO' ? 'Destino' : 'Origen'}
                                </span>
                                <span className="font-semibold">
                                    {movimiento.tipo_movimiento === 'INGRESO'
                                        ? movimiento.destino_entidad === 'CAJA'
                                            ? 'Caja'
                                            : 'Cuenta Bancaria'
                                        : movimiento.origen_entidad === 'CAJA'
                                          ? 'Caja'
                                          : 'Cuenta Bancaria'}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">
                                    {movimiento.tipo_movimiento === 'INGRESO'
                                        ? movimiento.destino_caja
                                            ? movimiento.destino_caja.nombre
                                            : movimiento.destino_cuenta?.numero_cuenta
                                        : movimiento.origen_caja
                                          ? movimiento.origen_caja.nombre
                                          : movimiento.origen_cuenta?.numero_cuenta}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Moneda Original</span>
                                <span className="font-semibold">{movimiento.moneda?.codigo}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Monto Original</span>
                                <span className="font-semibold">
                                    {movimiento.monto_original.toFixed(2)}{' '}
                                    {movimiento.moneda?.codigo}
                                </span>
                            </div>

                            {movimiento.tipo_cambio !== 1.0 && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tipo de Cambio</span>
                                        <span className="font-semibold">
                                            {movimiento.tipo_cambio.toFixed(6)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monto en Moneda Base</span>
                                        <span className="font-semibold">
                                            {movimiento.monto_moneda_base.toFixed(2)}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Información de Cuenta (si aplica) */}
                    {movimiento.cuenta && (
                        <div className="p-6 border rounded-lg">
                            <h2 className="text-lg font-semibold mb-4">Detalles de la Cuenta</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Banco</span>
                                    <span className="font-semibold">
                                        {movimiento.cuenta.banco?.nombre_comercial || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Número de Cuenta</span>
                                    <span className="font-semibold">{movimiento.cuenta.numero_cuenta}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nombre del Titular</span>
                                    <span className="font-semibold">{movimiento.cuenta.nombre_titular}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Moneda</span>
                                    <span className="font-semibold">
                                        {movimiento.cuenta.moneda?.codigo || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Card */}
                <div className="lg:col-span-1">
                    <div className={`p-6 rounded-lg ${getTipoColor(movimiento.tipo_movimiento)}`}>
                        <h3 className="font-semibold mb-2">Resumen</h3>
                        <div className="text-3xl font-bold mb-2">
                            {movimiento.tipo_movimiento === 'INGRESO' ? '+' : '-'}{' '}
                            {movimiento.monto_original.toFixed(2)}
                        </div>
                        <p className="text-sm opacity-75">{movimiento.moneda?.codigo}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
