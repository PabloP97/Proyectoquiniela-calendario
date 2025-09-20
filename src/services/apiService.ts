/**
 * Servicio API Mock para desarrollo frontend
 * Simula las respuestas del backend sin hacer llamadas HTTP reales
 * En producción, reemplazar con llamadas HTTP reales al backend Node.js
 */

import { LoginCredentials, RegisterData, PasswordRecoveryData, User } from '../types';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

// Mock data para desarrollo
const mockUsers = new Map<string, any>([
  ['admin@demo.com', {
    id: 1,
    nombre: 'Usuario Demo',
    email: 'admin@demo.com',
    numeroQuiniela: '12345',
    password: 'demo123', // En producción esto sería hasheado
    preguntaSeguridad: '¿Cuál es tu color favorito?',
    respuestaSeguridad: 'azul'
  }],
  ['test@test.com', {
    id: 2,
    nombre: 'Usuario Test',
    email: 'test@test.com',
    numeroQuiniela: '67890',
    password: 'test123',
    preguntaSeguridad: '¿Cuál es tu mascota favorita?',
    respuestaSeguridad: 'perro'
  }]
]);

// Mock storage para simular base de datos
const mockStorage = {
  gastos: new Map<string, any[]>(),
  transaccionesQuiniela: new Map<string, any[]>(),
  diasFinalizados: new Set<string>(),
  saldosDiarios: new Map<string, number>(), // fecha -> saldo final del día
  sessions: new Map<string, any>()
};

class ApiService {
  private token: string | null;
  private currentUser: User | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    
    // Inicializar datos mock si no existen
    this.initMockData();
  }

  private initMockData() {
    // Datos de ejemplo para hoy
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Gastos mock
    if (!mockStorage.gastos.has(today)) {
      mockStorage.gastos.set(today, []);
    }
    if (!mockStorage.gastos.has(yesterday)) {
      mockStorage.gastos.set(yesterday, [
        {
          id: 1,
          monto: 1500,
          categoria: 'Servicios',
          subcategoria: 'Luz',
          descripcion: 'Pago de electricidad',
          fecha: yesterday
        }
      ]);
    }
    
    // Transacciones mock
    if (!mockStorage.transaccionesQuiniela.has(today)) {
      mockStorage.transaccionesQuiniela.set(today, []);
    }
    if (!mockStorage.transaccionesQuiniela.has(yesterday)) {
      mockStorage.transaccionesQuiniela.set(yesterday, [
        {
          id: 1,
          tipo: 'ingreso',
          categoria: 'Primera',
          monto: 5000,
          descripcion: 'Recaudación Primera',
          fecha: yesterday,
          fuente: 'Quiniela Nacional'
        }
      ]);
    }

    // Marcar ayer como finalizado y agregar saldo del día anterior
    mockStorage.diasFinalizados.add(yesterday);
    
    // Calcular saldo del día anterior y guardarlo
    const gastosAyer = mockStorage.gastos.get(yesterday) || [];
    const transaccionesAyer = mockStorage.transaccionesQuiniela.get(yesterday) || [];
    
    const totalIngresosAyer = transaccionesAyer
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);
    const totalEgresosAyer = [...gastosAyer, ...transaccionesAyer.filter(t => t.tipo === 'egreso')]
      .reduce((sum, t) => sum + t.monto, 0);
    
    const saldoFinalAyer = totalIngresosAyer - totalEgresosAyer;
    mockStorage.saldosDiarios.set(yesterday, saldoFinalAyer);
  }

  // Simular delay de red
  private async mockDelay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generar token mock
  private generateMockToken(): string {
    return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Mock: Validar credenciales (reemplaza SP_ValidateUserCredentials)
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await this.mockDelay();

    // Buscar usuario en mock data
    const userData = mockUsers.get(credentials.email);
    
    if (!userData || userData.password !== credentials.password) {
      throw new Error('Email o contraseña incorrectos');
    }

    // Generar token y datos de respuesta
    const token = this.generateMockToken();
    const user: User = {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      numeroQuiniela: userData.numeroQuiniela,
      ultimo_acceso: new Date().toISOString(),
      fecha_creacion: '2024-01-01T00:00:00.000Z'
    };

    // Guardar sesión
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('auth_token', token);
    mockStorage.sessions.set(token, { user, timestamp: Date.now() });

    if (credentials.rememberMe) {
      localStorage.setItem('remembered_session', JSON.stringify({
        userId: user.id,
        nombre: user.nombre,
        email: user.email,
        timestamp: Date.now()
      }));
    }

    return { user, token };
  }

  /**
   * Mock: Crear nuevo usuario (reemplaza SP_CreateUser)
   */
  async register(registerData: RegisterData): Promise<{ user: User; token: string }> {
    await this.mockDelay();

    // Verificar si ya existe el email
    const existingUserByEmail = Array.from(mockUsers.values()).find(u => u.email === registerData.numeroQuiniela + '@quiniela.com');
    if (existingUserByEmail) {
      throw new Error('Ya existe un usuario con ese número de quiniela');
    }

    // Crear nuevo usuario
    const newId = Math.max(...Array.from(mockUsers.values()).map(u => u.id), 0) + 1;
    const email = `${registerData.numeroQuiniela}@quiniela.com`;
    
    const newUserData = {
      id: newId,
      nombre: registerData.nombreQuiniela,
      email: email,
      numeroQuiniela: registerData.numeroQuiniela,
      password: registerData.password,
      preguntaSeguridad: registerData.preguntaSeguridad,
      respuestaSeguridad: registerData.respuestaSeguridad
    };

    // Guardar en mock storage
    mockUsers.set(email, newUserData);

    // Crear sesión
    const token = this.generateMockToken();
    const user: User = {
      id: newUserData.id,
      nombre: newUserData.nombre,
      email: newUserData.email,
      numeroQuiniela: newUserData.numeroQuiniela,
      ultimo_acceso: new Date().toISOString(),
      fecha_creacion: new Date().toISOString()
    };

    this.token = token;
    this.currentUser = user;
    localStorage.setItem('auth_token', token);
    mockStorage.sessions.set(token, { user, timestamp: Date.now() });

    return { user, token };
  }

  /**
   * Mock: Verificar sesión válida (reemplaza SP_ValidateSession)
   */
  async validateSession(): Promise<User | null> {
    if (!this.token) return null;

    await this.mockDelay(200);

    try {
      const sessionData = mockStorage.sessions.get(this.token);
      
      if (!sessionData) {
        this.logout();
        return null;
      }

      // Verificar que la sesión no haya expirado (24 horas)
      const now = Date.now();
      const sessionAge = now - sessionData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      if (sessionAge > maxAge) {
        this.logout();
        return null;
      }

      this.currentUser = sessionData.user;
      return sessionData.user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  /**
   * Mock: Recuperación de contraseña (reemplaza SP_ValidateEmailForRecovery)
   */
  async sendPasswordRecovery(recoveryData: PasswordRecoveryData): Promise<boolean> {
    await this.mockDelay();

    // Buscar si existe el email
    const userExists = Array.from(mockUsers.values()).some(u => u.email === recoveryData.email);
    
    if (!userExists) {
      return false; // Email no encontrado
    }

    // En una implementación real, aquí se enviaría el email
    console.log(`Mock: Email de recuperación enviado a ${recoveryData.email}`);
    return true;
  }

  /**
   * Mock: Cerrar sesión (reemplaza SP_InvalidateSession)
   */
  async logout(): Promise<void> {
    await this.mockDelay(200);

    try {
      if (this.token) {
        // Eliminar sesión del mock storage
        mockStorage.sessions.delete(this.token);
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      this.token = null;
      this.currentUser = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('remembered_session');
    }
  }

  // ==================== GASTOS ====================

  /**
   * Mock: Registrar gasto (reemplaza SP_INSERT_GASTO_DIARIO)
   */
  async registrarGasto(gasto: {
    fecha: string;
    categoria: string;
    subcategoria?: string;
    monto: number;
    descripcion: string;
  }): Promise<any> {
    await this.mockDelay();

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Crear nuevo gasto
    const gastos = mockStorage.gastos.get(gasto.fecha) || [];
    const newId = Math.max(...gastos.map(g => g.id || 0), 0) + 1;
    
    const nuevoGasto = {
      id: newId,
      ...gasto,
      usuarioId: this.currentUser.id
    };

    gastos.push(nuevoGasto);
    mockStorage.gastos.set(gasto.fecha, gastos);

    return nuevoGasto;
  }

  /**
   * Mock: Obtener gastos por fecha (reemplaza SP_SELECT_GASTOS_POR_FECHA)
   */
  async obtenerGastosPorFecha(fecha: string): Promise<any[]> {
    await this.mockDelay(300);

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const gastos = mockStorage.gastos.get(fecha) || [];
    return gastos.filter(g => g.usuarioId === this.currentUser?.id);
  }

  /**
   * Mock: Obtener días finalizados (reemplaza SP_GetDiasFinalizados)
   */
  async obtenerDiasFinalizados(): Promise<string[]> {
    await this.mockDelay(200);

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    return Array.from(mockStorage.diasFinalizados);
  }

  /**
   * Mock: Finalizar día (reemplaza SP_FinalizarDia)
   */
  async finalizarDia(fecha: string): Promise<boolean> {
    await this.mockDelay();

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Calcular el saldo final del día antes de finalizarlo
    const gastos = await this.obtenerGastosPorFecha(fecha);
    const transaccionesQuiniela = await this.obtenerTransaccionesQuinielaPorFecha(fecha);
    const saldoAnterior = await this.obtenerSaldoAnterior(fecha);
    
    const totalIngresos = transaccionesQuiniela
      .filter(t => t.tipo === 'ingreso')
      .reduce((sum, t) => sum + t.monto, 0);
    
    const totalEgresos = [...gastos, ...transaccionesQuiniela.filter(t => t.tipo === 'egreso')]
      .reduce((sum, t) => sum + t.monto, 0);
    
    const saldoFinal = saldoAnterior + totalIngresos - totalEgresos;
    
    // Guardar el saldo final del día
    await this.guardarSaldoFinalDia(fecha, saldoFinal);
    
    // Marcar el día como finalizado
    mockStorage.diasFinalizados.add(fecha);
    return true;
  }

  /**
   * Mock: Eliminar gasto
   */
  async eliminarGasto(id: number, fecha: string): Promise<void> {
    await this.mockDelay();

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const gastos = mockStorage.gastos.get(fecha) || [];
    const filteredGastos = gastos.filter(g => g.id !== id);
    mockStorage.gastos.set(fecha, filteredGastos);
  }

  /**
   * Mock: Editar gasto
   */
  async editarGasto(gastoEditado: any): Promise<any> {
    await this.mockDelay();

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const gastos = mockStorage.gastos.get(gastoEditado.fecha) || [];
    const index = gastos.findIndex(g => g.id === gastoEditado.id);
    
    if (index !== -1) {
      gastos[index] = { ...gastos[index], ...gastoEditado };
      mockStorage.gastos.set(gastoEditado.fecha, gastos);
      return gastos[index];
    }

    throw new Error('Gasto no encontrado');
  }

  // ==================== QUINIELAS ====================

  /**
   * Mock: Registrar transacción quiniela (reemplaza SP_INSERT_TRANSACCION_QUINIELA)
   */
  async registrarTransaccionQuiniela(transaccion: {
    fecha: string;
    juego: string;
    monto: number;
    tipo: 'ingreso' | 'egreso';
    descripcion?: string;
  }): Promise<any> {
    await this.mockDelay();

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Crear nueva transacción
    const transacciones = mockStorage.transaccionesQuiniela.get(transaccion.fecha) || [];
    const newId = Math.max(...transacciones.map(t => t.id || 0), 0) + 1;
    
    const nuevaTransaccion = {
      id: newId,
      tipo: transaccion.tipo,
      categoria: transaccion.juego,
      monto: transaccion.monto,
      descripcion: transaccion.descripcion || '',
      fecha: transaccion.fecha,
      fuente: transaccion.juego,
      usuarioId: this.currentUser.id
    };

    transacciones.push(nuevaTransaccion);
    mockStorage.transaccionesQuiniela.set(transaccion.fecha, transacciones);

    return nuevaTransaccion;
  }

  /**
   * Mock: Obtener transacciones quiniela por fecha (reemplaza SP_SELECT_TRANSACCIONES_QUINIELA)
   */
  async obtenerTransaccionesQuinielaPorFecha(fecha: string): Promise<any[]> {
    await this.mockDelay(300);

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const transacciones = mockStorage.transaccionesQuiniela.get(fecha) || [];
    return transacciones.filter(t => t.usuarioId === this.currentUser?.id);
  }

  // ==================== DATOS GENERALES ====================

  /**
   * Mock: Eliminar transacción quiniela
   */
  async eliminarTransaccionQuiniela(id: number, fecha: string): Promise<void> {
    await this.mockDelay();

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const transacciones = mockStorage.transaccionesQuiniela.get(fecha) || [];
    const filteredTransacciones = transacciones.filter(t => t.id !== id);
    mockStorage.transaccionesQuiniela.set(fecha, filteredTransacciones);
  }

  /**
   * Mock: Editar transacción quiniela
   */
  async editarTransaccionQuiniela(transaccionEditada: any): Promise<any> {
    await this.mockDelay();

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const transacciones = mockStorage.transaccionesQuiniela.get(transaccionEditada.fecha) || [];
    const index = transacciones.findIndex(t => t.id === transaccionEditada.id);
    
    if (index !== -1) {
      transacciones[index] = { ...transacciones[index], ...transaccionEditada };
      mockStorage.transaccionesQuiniela.set(transaccionEditada.fecha, transacciones);
      return transacciones[index];
    }

    throw new Error('Transacción no encontrada');
  }

  // ==================== SALDOS DIARIOS ====================

  /**
   * Mock: Obtener el saldo final del día anterior (reemplaza SP_GetSaldoAnterior)
   */
  async obtenerSaldoAnterior(fecha: string): Promise<number> {
    await this.mockDelay(200);

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Calcular la fecha del día anterior
    const fechaActual = new Date(fecha);
    const fechaAnterior = new Date(fechaActual);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);
    const fechaAnteriorStr = fechaAnterior.toISOString().split('T')[0];

    // Buscar el saldo guardado del día anterior
    const saldoAnterior = mockStorage.saldosDiarios.get(fechaAnteriorStr);
    
    if (saldoAnterior !== undefined) {
      return saldoAnterior;
    }

    // Si no hay saldo guardado del día anterior, calcularlo desde el principio del mes
    return await this.calcularSaldoAcumulado(fecha);
  }

  /**
   * Mock: Calcular saldo acumulado desde el inicio del mes hasta el día anterior
   */
  private async calcularSaldoAcumulado(fechaHasta: string): Promise<number> {
    const fechaActual = new Date(fechaHasta);
    const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const fechaAnterior = new Date(fechaActual);
    fechaAnterior.setDate(fechaAnterior.getDate() - 1);

    let saldoAcumulado = 0;
    const fechaIteracion = new Date(primerDiaMes);

    // Iterar desde el primer día del mes hasta el día anterior
    while (fechaIteracion <= fechaAnterior) {
      const fechaStr = fechaIteracion.toISOString().split('T')[0];
      
      // Obtener gastos y transacciones del día
      const gastosDelDia = mockStorage.gastos.get(fechaStr) || [];
      const transaccionesDelDia = mockStorage.transaccionesQuiniela.get(fechaStr) || [];
      
      // Filtrar por usuario actual
      const gastosUsuario = gastosDelDia.filter(g => g.usuarioId === this.currentUser?.id);
      const transaccionesUsuario = transaccionesDelDia.filter(t => t.usuarioId === this.currentUser?.id);
      
      // Calcular ingresos y egresos del día
      const ingresosDelDia = transaccionesUsuario
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);
      
      const egresosDelDia = [
        ...gastosUsuario,
        ...transaccionesUsuario.filter(t => t.tipo === 'egreso')
      ].reduce((sum, t) => sum + t.monto, 0);
      
      // Acumular saldo
      saldoAcumulado += (ingresosDelDia - egresosDelDia);
      
      // Avanzar al siguiente día
      fechaIteracion.setDate(fechaIteracion.getDate() + 1);
    }

    return saldoAcumulado;
  }

  /**
   * Mock: Guardar el saldo final del día (reemplaza SP_SaveSaldoFinalDia)
   */
  async guardarSaldoFinalDia(fecha: string, saldoFinal: number): Promise<void> {
    await this.mockDelay(200);

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    mockStorage.saldosDiarios.set(fecha, saldoFinal);
  }

  // ==================== DATOS GENERALES ====================

  /**
   * Mock: Obtener todos los datos del día con saldo anterior (reemplaza SP_GetDayData)
   */
  async obtenerDatosDia(fecha: string): Promise<{
    gastos: any[];
    transaccionesQuiniela: any[];
    saldoAnterior: number;
    estaFinalizado: boolean;
  }> {
    await this.mockDelay(400);

    if (!this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    const gastos = await this.obtenerGastosPorFecha(fecha);
    const transaccionesQuiniela = await this.obtenerTransaccionesQuinielaPorFecha(fecha);
    const saldoAnterior = await this.obtenerSaldoAnterior(fecha);
    const estaFinalizado = mockStorage.diasFinalizados.has(fecha);

    return {
      gastos,
      transaccionesQuiniela,
      saldoAnterior,
      estaFinalizado
    };
  }
}

// Singleton instance
const apiService = new ApiService();
export default apiService;

/**
 * INSTRUCCIONES PARA PRODUCCIÓN:
 * 
 * Para convertir este mock service a un service real para producción:
 * 
 * 1. Reemplazar todos los métodos mock con llamadas fetch() reales al backend
 * 2. Configurar la baseURL correcta en el constructor
 * 3. Implementar el manejo real de errores HTTP
 * 4. Agregar la lógica de headers y autenticación JWT
 * 5. Eliminar mockStorage, mockUsers y todos los datos mock
 * 6. Implementar timeouts y retry logic para las llamadas HTTP
 * 7. Agregar validación de respuestas del servidor
 * 
 * Ejemplo de método real:
 * 
 * async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
 *   const response = await fetch(`${this.baseURL}/auth/login`, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(credentials),
 *   });
 *   
 *   if (!response.ok) {
 *     throw new Error(`HTTP error! status: ${response.status}`);
 *   }
 *   
 *   const result = await response.json();
 *   this.token = result.token;
 *   localStorage.setItem('auth_token', result.token);
 *   
 *   return result;
 * }
 * 
 * CREDENCIALES DEMO DISPONIBLES:
 * - Email: admin@demo.com | Password: demo123
 * - Email: test@test.com   | Password: test123
 */