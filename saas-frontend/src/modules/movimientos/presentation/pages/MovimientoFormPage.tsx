import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Label } from '../../../shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../shared/components/ui/select';
import { format } from 'date-fns';
import api from '../../../core/api/api';
import movimientoRepository from '../../infrastructure/movimiento.repository';
import type { MovimientoFormValues } from '../../domain/interfaces/movimiento.interface';

const movimientoSchema = z.object({
    categoria_id: z.string().min(1, 'Categoría requerida'),
    tipo_movimiento: z.enum(['INGRESO', 'EGRESO'], {
        errorMap: () => ({ message: 'Tipo de movimiento requerido' }),
    }),
    entidad_tipo: z.enum(['CAJA', 'CUENTA'], {
        errorMap: () => ({ message: 'Tipo de entidad requerida' }),
    }),
    entidad_id: z.string().min(1, 'Entidad requerida'),
    moneda_id: z.string().optional(),
    monto_original: z.number().positive('Monto debe ser positivo').optional(),
    monto_moneda_base: z.number().positive('Monto debe ser positivo').optional(),
    tipo_cambio: z.number().positive().optional(),
    descripcion: z.string().optional(),
    fecha_transaccion: z.string().optional(),
});

interface CajaOption {
    id: string;
    nombre: string;
}

interface CuentaOption {
    id: string;
    numero_cuenta: string;
    nombre_titular: string;
    banco: {
        nombre_comercial: string;
    };
    moneda_id: string | null;
    moneda?: {
        codigo: string;
    };
}

interface CategoriaOption {
    id: string;
    nombre: string;
    tipo: 'INGRESO' | 'EGRESO';
}

interface NegocioData {
    moneda_id: string;
    moneda?: {
        codigo: string;
    };
}

export default function MovimientoFormPage() {
    const navigate = useNavigate();
    const [cajas, setCajas] = useState<CajaOption[]>([]);
    const [cuentas, setCuentas] = useState<CuentaOption[]>([]);
    const [categorias, setCategorias] = useState<CategoriaOption[]>([]);
    const [negocio, setNegocio] = useState<NegocioData | null>(null);
    const [selectedCuenta, setSelectedCuenta] = useState<CuentaOption | null>(null);
    const [monedaSeleccionada, setMonedaSeleccionada] = useState<'base' | 'cuenta' | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exchangeRate, setExchangeRate] = useState<number | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<MovimientoFormValues>({
        resolver: zodResolver(movimientoSchema),
        defaultValues: {
            tipo_movimiento: undefined,
            entidad_tipo: undefined,
            fecha_transaccion: format(new Date(), 'yyyy-MM-dd'),
        },
    });

    const tipoMovimiento = watch('tipo_movimiento');
    const entidadTipo = watch('entidad_tipo');
    const entidadId = watch('entidad_id');

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [cajasRes, cuentasRes, negocioRes] = await Promise.all([
                    api.get('/cajas', { params: { limit: 999, offset: 0 } }),
                    api.get('/cuentas-bancarias', { params: { limit: 999, offset: 0 } }),
                    api.get('/negocios/actual'),
                ]);
                setCajas(cajasRes.data || []);
                setCuentas(cuentasRes.data || []);
                setNegocio(negocioRes.data || null);
            } catch (err) {
                setError('Error cargando datos iniciales');
            }
        };
        loadData();
    }, []);

    // Load categorias based on tipo_movimiento
    useEffect(() => {
        const loadCategorias = async () => {
            if (!tipoMovimiento) {
                setCategorias([]);
                return;
            }
            try {
                const res = await api.get('/categoria-transaccion', {
                    params: {
                        limit: 999,
                        offset: 0,
                        tipo: tipoMovimiento,
                    },
                });
                setCategorias(res.data || []);
            } catch (err) {
                setError('Error cargando categorías');
            }
        };
        loadCategorias();
    }, [tipoMovimiento]);

    // Fetch exchange rate when cuenta changes
    useEffect(() => {
        const fetchExchangeRate = async () => {
            if (
                entidadTipo === 'CUENTA' &&
                entidadId &&
                selectedCuenta &&
                selectedCuenta.moneda_id &&
                negocio?.moneda?.codigo &&
                selectedCuenta.moneda?.codigo
            ) {
                if (selectedCuenta.moneda_id === negocio.moneda_id) {
                    setExchangeRate(1.0);
                    setMonedaSeleccionada(null);
                } else {
                    try {
                        const res = await api.get(
                            `https://api.frankfurter.dev/v2/rate/${negocio.moneda.codigo}/${selectedCuenta.moneda.codigo}`
                        );
                        setExchangeRate(res.rate);
                        setMonedaSeleccionada(null);
                    } catch (err) {
                        setError('Error obteniendo tipo de cambio');
                    }
                }
            }
        };
        fetchExchangeRate();
    }, [entidadTipo, entidadId, selectedCuenta, negocio]);

    // Update selected cuenta
    useEffect(() => {
        if (entidadTipo === 'CUENTA' && entidadId) {
            const cuenta = cuentas.find((c) => c.id === entidadId);
            setSelectedCuenta(cuenta || null);
        }
    }, [entidadTipo, entidadId, cuentas]);

    const onSubmit = async (data: MovimientoFormValues) => {
        try {
            setLoading(true);
            setError(null);
            await movimientoRepository.crear(data);
            navigate('/finanzas/movimientos');
        } catch (err: any) {
            setError(err.message || 'Error creando movimiento');
        } finally {
            setLoading(false);
        }
    };

    const isCuentaDiferentMoneda =
        entidadTipo === 'CUENTA' &&
        selectedCuenta &&
        exchangeRate &&
        exchangeRate !== 1.0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Nuevo Movimiento</h1>
                <p className="text-gray-500">Registra ingresos o egresos de tu negocio</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
                {/* 1. Tipo de Movimiento */}
                <div className="space-y-2">
                    <Label htmlFor="tipo_movimiento">Tipo de Movimiento</Label>
                    <Controller
                        name="tipo_movimiento"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger id="tipo_movimiento">
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INGRESO">Ingreso</SelectItem>
                                    <SelectItem value="EGRESO">Egreso</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.tipo_movimiento && (
                        <span className="text-red-500">{errors.tipo_movimiento.message}</span>
                    )}
                </div>

                {/* 2. Categoría */}
                {tipoMovimiento && (
                    <div className="space-y-2">
                        <Label htmlFor="categoria_id">Categoría</Label>
                        <Controller
                            name="categoria_id"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="categoria_id">
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.categoria_id && (
                            <span className="text-red-500">{errors.categoria_id.message}</span>
                        )}
                    </div>
                )}

                {/* 3. Tipo de Entidad Financiera */}
                {tipoMovimiento && (
                    <div className="space-y-2">
                        <Label htmlFor="entidad_tipo">Entidad Financiera</Label>
                        <Controller
                            name="entidad_tipo"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="entidad_tipo">
                                        <SelectValue placeholder="Selecciona tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CAJA">Caja</SelectItem>
                                        <SelectItem value="CUENTA">Cuenta Bancaria</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.entidad_tipo && (
                            <span className="text-red-500">{errors.entidad_tipo.message}</span>
                        )}
                    </div>
                )}

                {/* 4. Entidad (Caja o Cuenta) */}
                {entidadTipo && (
                    <div className="space-y-2">
                        <Label htmlFor="entidad_id">
                            {entidadTipo === 'CAJA' ? 'Caja' : 'Cuenta Bancaria'}
                        </Label>
                        <Controller
                            name="entidad_id"
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id="entidad_id">
                                        <SelectValue
                                            placeholder={`Selecciona una ${
                                                entidadTipo === 'CAJA' ? 'caja' : 'cuenta'
                                            }`}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {entidadTipo === 'CAJA'
                                            ? cajas.map((caja) => (
                                                  <SelectItem key={caja.id} value={caja.id}>
                                                      {caja.nombre}
                                                  </SelectItem>
                                              ))
                                            : cuentas.map((cuenta) => (
                                                  <SelectItem key={cuenta.id} value={cuenta.id}>
                                                      <div className="flex flex-col">
                                                          <span>
                                                              {cuenta.numero_cuenta} -{' '}
                                                              {cuenta.banco.nombre_comercial}{' '}
                                                              {cuenta.moneda?.codigo}
                                                          </span>
                                                          <span className="text-xs text-gray-500">
                                                              Titular: {cuenta.nombre_titular}
                                                          </span>
                                                      </div>
                                                  </SelectItem>
                                              ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.entidad_id && (
                            <span className="text-red-500">{errors.entidad_id.message}</span>
                        )}
                    </div>
                )}

                {/* 5. Selección de Moneda (si aplica) */}
                {isCuentaDiferentMoneda && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm font-semibold">
                            Moneda de la cuenta diferente a la del negocio
                        </p>
                        <p className="text-xs text-gray-600">
                            Tipo de cambio: 1 {negocio?.moneda?.codigo} = {exchangeRate}{' '}
                            {selectedCuenta?.moneda?.codigo}
                        </p>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="moneda_entrada"
                                    value="base"
                                    checked={monedaSeleccionada === 'base'}
                                    onChange={() => setMonedaSeleccionada('base')}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">
                                    Ingresar monto en {negocio?.moneda?.codigo}
                                </span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="moneda_entrada"
                                    value="cuenta"
                                    checked={monedaSeleccionada === 'cuenta'}
                                    onChange={() => setMonedaSeleccionada('cuenta')}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">
                                    Ingresar monto en {selectedCuenta?.moneda?.codigo}
                                </span>
                            </label>
                        </div>
                    </div>
                )}

                {/* 6. Monto */}
                {entidadId && (
                    <div className="space-y-2">
                        <Label htmlFor="monto">
                            Monto{' '}
                            {monedaSeleccionada === 'cuenta'
                                ? `(${selectedCuenta?.moneda?.codigo})`
                                : monedaSeleccionada === 'base'
                                  ? `(${negocio?.moneda?.codigo})`
                                  : ''}
                        </Label>
                        <Controller
                            name={
                                monedaSeleccionada === 'cuenta'
                                    ? 'monto_original'
                                    : 'monto_moneda_base'
                            }
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    id="monto"
                                    type="number"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    onChange={(e) =>
                                        field.onChange(parseFloat(e.target.value) || 0)
                                    }
                                />
                            )}
                        />
                    </div>
                )}

                {/* 7. Fecha */}
                <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Controller
                        name="fecha_transaccion"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="fecha"
                                type="date"
                                defaultValue={format(new Date(), 'yyyy-MM-dd')}
                            />
                        )}
                    />
                </div>

                {/* 8. Descripción */}
                <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                    <Controller
                        name="descripcion"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                id="descripcion"
                                placeholder="Describe el movimiento"
                                maxLength={500}
                            />
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/finanzas/movimientos')}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Movimiento'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
