import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../../shared/components/ui/table';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../shared/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../shared/components/ui/select';
import movimientoRepository from '../../infrastructure/movimiento.repository';
import { format } from 'date-fns';
import type { Transaccion } from '../../domain/interfaces/movimiento.interface';
import api from '../../../core/api/api';

export default function MovimientoListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [movimientos, setMovimientos] = useState<Transaccion[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [showFilters, setShowFilters] = useState(false);
    const [categorias, setCategorias] = useState<any[]>([]);
    const [cajas, setCajas] = useState<any[]>([]);
    const [cuentas, setCuentas] = useState<any[]>([]);

    // Filters
    const [filtros, setFiltros] = useState({
        tipo_movimiento: searchParams.get('tipo_movimiento') || '',
        categoria_id: searchParams.get('categoria_id') || '',
        entidad_tipo: searchParams.get('entidad_tipo') || '',
        entidad_id: searchParams.get('entidad_id') || '',
        fecha_inicio: searchParams.get('fecha_inicio') || '',
        fecha_fin: searchParams.get('fecha_fin') || '',
    });

    // Load movimientos
    useEffect(() => {
        const loadMovimientos = async () => {
            try {
                setLoading(true);
                const offset = (page - 1) * limit;
                const result = await movimientoRepository.listar({
                    limit,
                    offset,
                    q: searchTerm || undefined,
                    tipo_movimiento: (filtros.tipo_movimiento || undefined) as any,
                    categoria_id: filtros.categoria_id || undefined,
                    entidad_tipo: (filtros.entidad_tipo || undefined) as any,
                    entidad_id: filtros.entidad_id || undefined,
                    fecha_inicio: filtros.fecha_inicio || undefined,
                    fecha_fin: filtros.fecha_fin || undefined,
                });
                setMovimientos(result.data || []);
                setTotal(result.total || 0);
            } catch (error) {
                console.error('Error loading movimientos:', error);
            } finally {
                setLoading(false);
            }
        };
        loadMovimientos();
    }, [page, searchTerm, filtros]);

    // Load filter options
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [catRes, cajasRes, cuentasRes] = await Promise.all([
                    api.get('/categoria-transaccion', { params: { limit: 999, offset: 0 } }),
                    api.get('/cajas', { params: { limit: 999, offset: 0 } }),
                    api.get('/cuentas-bancarias', { params: { limit: 999, offset: 0 } }),
                ]);
                setCategorias(catRes.data || []);
                setCajas(cajasRes.data || []);
                setCuentas(cuentasRes.data || []);
            } catch (error) {
                console.error('Error loading options:', error);
            }
        };
        loadOptions();
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFiltros((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const clearFilters = () => {
        setFiltros({
            tipo_movimiento: '',
            categoria_id: '',
            entidad_tipo: '',
            entidad_id: '',
            fecha_inicio: '',
            fecha_fin: '',
        });
        setSearchTerm('');
        setPage(1);
    };

    const getTipoLabel = (tipo: string) => (tipo === 'INGRESO' ? '+ Ingreso' : '- Egreso');
    const getTipoColor = (tipo: string) =>
        tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600';

    const pageCount = Math.ceil(total / limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Movimientos</h1>
                    <p className="text-gray-500">Gestiona ingresos y egresos de tu negocio</p>
                </div>
                <Button onClick={() => navigate('/finanzas/movimientos/nuevo')}>
                    + Nuevo Movimiento
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        placeholder="Buscar movimientos..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        Más filtros
                    </Button>
                </div>

                {/* Filter Modal */}
                <Dialog open={showFilters} onOpenChange={setShowFilters}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Filtros Avanzados</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Tipo de Movimiento</label>
                                <Select
                                    value={filtros.tipo_movimiento}
                                    onValueChange={(val) =>
                                        handleFilterChange('tipo_movimiento', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todos</SelectItem>
                                        <SelectItem value="INGRESO">Ingreso</SelectItem>
                                        <SelectItem value="EGRESO">Egreso</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Categoría</label>
                                <Select
                                    value={filtros.categoria_id}
                                    onValueChange={(val) =>
                                        handleFilterChange('categoria_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas</SelectItem>
                                        {categorias.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Tipo de Entidad</label>
                                <Select
                                    value={filtros.entidad_tipo}
                                    onValueChange={(val) =>
                                        handleFilterChange('entidad_tipo', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas</SelectItem>
                                        <SelectItem value="CAJA">Caja</SelectItem>
                                        <SelectItem value="CUENTA">Cuenta</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Fecha Inicio</label>
                                <Input
                                    type="date"
                                    value={filtros.fecha_inicio}
                                    onChange={(e) =>
                                        handleFilterChange('fecha_inicio', e.target.value)
                                    }
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Fecha Fin</label>
                                <Input
                                    type="date"
                                    value={filtros.fecha_fin}
                                    onChange={(e) =>
                                        handleFilterChange('fecha_fin', e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="flex-1"
                                >
                                    Limpiar
                                </Button>
                                <Button onClick={() => setShowFilters(false)} className="flex-1">
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Entidad</TableHead>
                            <TableHead>Moneda</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : movimientos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8">
                                    No hay movimientos
                                </TableCell>
                            </TableRow>
                        ) : (
                            movimientos.map((mov) => (
                                <TableRow
                                    key={mov.id}
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() =>
                                        navigate(`/finanzas/movimientos/${mov.id}`)
                                    }
                                >
                                    <TableCell>
                                        {format(
                                            new Date(mov.fecha_transaccion),
                                            'dd/MM/yyyy'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={getTipoColor(mov.tipo_movimiento)}>
                                            {getTipoLabel(mov.tipo_movimiento)}
                                        </span>
                                    </TableCell>
                                    <TableCell>{mov.categoria_nombre}</TableCell>
                                    <TableCell>{mov.entidad_nombre}</TableCell>
                                    <TableCell>{mov.moneda_codigo}</TableCell>
                                    <TableCell className="text-right">
                                        {mov.monto_original.toFixed(2)}
                                    </TableCell>
                                    <TableCell>{mov.usuario_nombre}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/finanzas/movimientos/${mov.id}`);
                                            }}
                                        >
                                            Ver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Anterior
                    </Button>
                    <span>
                        Página {page} de {pageCount}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page === pageCount}
                        onClick={() => setPage(page + 1)}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    );
}
