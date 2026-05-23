# Guía de Implementación - API de Clientes en Ventas

## Descripción

Esta guía proporciona ejemplos prácticos de cómo usar los nuevos endpoints para buscar y crear clientes desde el módulo de ventas.

## Endpoint 1: Buscar cliente por NIT

### Información
- **Método:** GET
- **URL:** `/api/ventas/clientes/buscar-por-nit`
- **Autenticación:** Token requerido
- **Permiso:** CREAR_VENTAS

### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| nit | string | Sí | NIT del cliente a buscar |

### Ejemplos de Uso

#### JavaScript/Fetch
```javascript
async function buscarClientePorNit(nit) {
  const response = await fetch('/api/ventas/clientes/buscar-por-nit?nit=' + encodeURIComponent(nit), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// Uso
try {
  const resultado = await buscarClientePorNit('1234567890');
  console.log('Cliente encontrado:', resultado.data);
} catch (error) {
  console.error('Error:', error);
}
```

#### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

async function buscarClientePorNit(nit) {
  try {
    const response = await api.get('/ventas/clientes/buscar-por-nit', {
      params: { nit }
    });
    return response.data;
  } catch (error) {
    console.error('Error buscando cliente:', error);
    throw error;
  }
}
```

#### React Hook
```typescript
import { useState, useEffect } from 'react';

function useBuscarClientePorNit(nit: string | null) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!nit) return;

    const buscar = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ventas/clientes/buscar-por-nit?nit=${encodeURIComponent(nit)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setCliente(data.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    buscar();
  }, [nit]);

  return { cliente, loading, error };
}

// Uso
function BuscadorClientes() {
  const [nit, setNit] = useState('');
  const { cliente, loading, error } = useBuscarClientePorNit(nit);

  return (
    <div>
      <input 
        value={nit}
        onChange={(e) => setNit(e.target.value)}
        placeholder="Ingrese NIT"
      />
      
      {loading && <p>Buscando...</p>}
      {error && <p>Error: {error.message}</p>}
      {cliente && (
        <div>
          <p>Nombre: {cliente.nombre}</p>
          <p>NIT: {cliente.nit}</p>
          <p>Teléfono: {cliente.telefono}</p>
        </div>
      )}
    </div>
  );
}
```

### Respuesta Exitosa

**Cuando el cliente existe:**
```json
{
  "success": true,
  "message": "Búsqueda de cliente completada",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "nombre": "Juan Carlos Pérez",
    "apellido": null,
    "telefono": "71234567",
    "email": "juan@example.com",
    "nit": "1234567890",
    "dpi": "1234567890123",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Cuando el cliente NO existe:**
```json
{
  "success": true,
  "message": "Búsqueda de cliente completada",
  "data": null
}
```

### Manejo de Errores

```javascript
async function buscarClienteConErrorHandling(nit) {
  try {
    const response = await fetch(`/api/ventas/clientes/buscar-por-nit?nit=${encodeURIComponent(nit)}`);
    
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('NIT requerido y válido');
      }
      throw new Error('Error en la búsqueda');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message);
    }

    return data.data; // null si no existe, o el objeto cliente
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
```

---

## Endpoint 2: Crear cliente desde ventas

### Información
- **Método:** POST
- **URL:** `/api/ventas/clientes`
- **Autenticación:** Token requerido
- **Permiso:** CREAR_VENTAS
- **Content-Type:** application/json

### Parámetros

| Parámetro | Tipo | Obligatorio | Descripción | Ejemplo |
|-----------|------|-------------|-------------|---------|
| nombre | string | Sí | Nombre del cliente | "Juan Pérez" |
| nit | string | Sí | NIT del cliente | "1234567890" |

### Validaciones

- `nombre`: Mínimo 1 carácter, máximo 100 caracteres
- `nit`: Mínimo 1 carácter, máximo 50 caracteres
- **Restricción de unicidad:** El cliente no puede existir ya en el negocio

### Ejemplos de Uso

#### JavaScript/Fetch
```javascript
async function crearClienteVenta(nombre, nit) {
  const response = await fetch('/api/ventas/clientes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, nit })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Uso
try {
  const resultado = await crearClienteVenta('Juan Pérez', '1234567890');
  console.log('Cliente creado:', resultado.data);
} catch (error) {
  console.error('Error:', error.message);
}
```

#### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

async function crearClienteVenta(nombre, nit) {
  try {
    const response = await api.post('/ventas/clientes', {
      nombre,
      nit
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('El cliente ya existe');
    }
    throw error;
  }
}
```

#### React Hook
```typescript
import { useState } from 'react';

function useCreaClienteVenta() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearCliente = async (nombre: string, nit: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ventas/clientes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, nit })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { crearCliente, loading, error };
}

// Uso
function FormularioClienteVenta() {
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const { crearCliente, loading, error } = useCreaClienteVenta();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cliente = await crearCliente(nombre, nit);
      console.log('Cliente creado:', cliente);
      // Resetear formulario
      setNombre('');
      setNit('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre completo"
        required
      />
      <input
        value={nit}
        onChange={(e) => setNit(e.target.value)}
        placeholder="NIT"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Cliente'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Cliente creado con éxito",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "nombre": "Juan Pérez",
    "apellido": null,
    "telefono": "",
    "email": null,
    "nit": "1234567890",
    "dpi": null,
    "created_at": "2024-01-15T14:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
}
```

### Respuesta de Error - Cliente Duplicado

```json
{
  "success": false,
  "message": "El cliente ya existe en este negocio",
  "code": "DATA_ALREADY_EXISTS",
  "statusCode": 409
}
```

### Respuesta de Error - Validación

```json
{
  "success": false,
  "message": "El nombre es obligatorio",
  "code": "VALIDATION_ERROR",
  "statusCode": 400
}
```

---

## Flujo de Ejemplo Completo - Crear Venta con Cliente Nuevo

```typescript
import { useState } from 'react';

interface Cliente {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
}

function CrearVentaConCliente() {
  const [paso, setPaso] = useState<'buscar' | 'crear' | 'seleccionar'>('buscar');
  const [nit, setNit] = useState('');
  const [nombre, setNombre] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso 1: Buscar cliente por NIT
  const handleBuscar = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/ventas/clientes/buscar-por-nit?nit=${encodeURIComponent(nit)}`);
      const data = await response.json();

      if (data.data) {
        // Cliente existe
        setClienteSeleccionado(data.data);
        setPaso('seleccionar');
      } else {
        // Cliente no existe, ofrecer crear
        setPaso('crear');
        setNombre(''); // Limpiar nombre
      }
    } catch (err) {
      setError('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Crear cliente nuevo
  const handleCrear = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ventas/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre, nit })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      const data = await response.json();
      setClienteSeleccionado(data.data);
      setPaso('seleccionar');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Proceder con la venta
  const handleProcederConVenta = async () => {
    if (!clienteSeleccionado) return;
    // Aquí se llamaría al flujo de creación de venta con el cliente seleccionado
    console.log('Crear venta con cliente:', clienteSeleccionado.id);
  };

  return (
    <div>
      {paso === 'buscar' && (
        <div>
          <h2>Buscar cliente</h2>
          <input
            value={nit}
            onChange={(e) => setNit(e.target.value)}
            placeholder="Ingrese NIT"
          />
          <button onClick={handleBuscar} disabled={loading || !nit}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}

      {paso === 'crear' && (
        <div>
          <h2>Crear cliente nuevo</h2>
          <p>El cliente con NIT {nit} no existe. ¿Desea crearlo?</p>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre completo"
          />
          <button onClick={handleCrear} disabled={loading || !nombre}>
            {loading ? 'Creando...' : 'Crear Cliente'}
          </button>
          <button onClick={() => setPaso('buscar')}>Volver</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}

      {paso === 'seleccionar' && clienteSeleccionado && (
        <div>
          <h2>Cliente seleccionado</h2>
          <p>Nombre: {clienteSeleccionado.nombre}</p>
          <p>NIT: {clienteSeleccionado.nit}</p>
          <button onClick={handleProcederConVenta}>Proceder con venta</button>
          <button onClick={() => { setPaso('buscar'); setNit(''); }}>Buscar otro</button>
        </div>
      )}
    </div>
  );
}

export default CrearVentaConCliente;
```

---

## Consideraciones de Implementación

### Validación en el lado del cliente

```typescript
function validarFormulario(nombre: string, nit: string): string[] {
  const errores: string[] = [];

  if (!nombre || nombre.trim().length === 0) {
    errores.push('El nombre es obligatorio');
  }
  if (nombre.length > 100) {
    errores.push('El nombre no puede exceder 100 caracteres');
  }

  if (!nit || nit.trim().length === 0) {
    errores.push('El NIT es obligatorio');
  }
  if (nit.length > 50) {
    errores.push('El NIT no puede exceder 50 caracteres');
  }

  return errores;
}
```

### Manejo de errores HTTP comunes

```typescript
async function manejarRespuesta(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    switch (response.status) {
      case 400:
        throw new Error(`Validación: ${data.message}`);
      case 401:
        throw new Error('No autorizado. Por favor, inicie sesión');
      case 403:
        throw new Error('No tiene permiso para realizar esta acción');
      case 409:
        throw new Error(data.message || 'Conflicto: El cliente ya existe');
      case 500:
        throw new Error('Error del servidor. Intente más tarde');
      default:
        throw new Error(data.message || 'Error desconocido');
    }
  }

  return data;
}
```

### Caché local (opcional)

```typescript
const clienteCache = new Map<string, Cliente>();

async function buscarClienteConCache(nit: string): Promise<Cliente | null> {
  // Verificar caché
  if (clienteCache.has(nit)) {
    return clienteCache.get(nit) || null;
  }

  // Buscar en servidor
  const response = await fetch(`/api/ventas/clientes/buscar-por-nit?nit=${encodeURIComponent(nit)}`);
  const data = await response.json();

  if (data.data) {
    clienteCache.set(nit, data.data);
  }

  return data.data || null;
}
```

---

## Notas Importantes

1. **Token de autenticación:** Todos los endpoints requieren un token válido en el header `Authorization`.

2. **Permisos:** El usuario debe tener el permiso `CREAR_VENTAS` para acceder a estos endpoints.

3. **Campos editables:** En ventas solo se pueden crear clientes con nombre y NIT. Para editar otros campos (email, teléfono, DPI), use el módulo de clientes.

4. **Telefonía:** Cuando se crea un cliente desde ventas, el campo teléfono se establece como vacío. Esto puede editarse después desde el módulo de clientes.

5. **DPI:** El campo DPI se mantiene NULL cuando se crea desde ventas. Puede añadirse después si es necesario.
