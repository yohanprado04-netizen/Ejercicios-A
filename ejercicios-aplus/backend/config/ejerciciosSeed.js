/**
 * SEED DE EJERCICIOS - 1000 ejercicios sobre nóminas
 * Categorías: nomina_empresa, tienda, trabajadores, prestaciones, impuestos, seguridad_social
 */

const plantillas = {
  nomina_empresa: [
    {
      titulo: "Nómina Empresa Manufacturera",
      descripcionGeneral: "Calcula la nómina mensual de una empresa manufacturera con 5 empleados",
      nivel: "intermedio",
      generarDatos: (seed) => ({
        empresa: "Manufacturas XYZ S.A.S",
        empleados: [
          { nombre: "Carlos Rodríguez", cargo: "Operario", salarioBase: 1300000 + seed * 50000 },
          { nombre: "María López", cargo: "Supervisora", salarioBase: 2100000 + seed * 70000 },
          { nombre: "Jorge Martínez", cargo: "Técnico", salarioBase: 1700000 + seed * 60000 },
          { nombre: "Ana García", cargo: "Operaria", salarioBase: 1300000 + seed * 45000 },
          { nombre: "Luis Pérez", cargo: "Jefe Producción", salarioBase: 3500000 + seed * 100000 }
        ],
        diasTrabajados: 30,
        horasExtras: [8, 4, 6, 10, 2],
        ausentismos: [0, 0, 1, 2, 0]
      }),
      pistas: (datos) => [
        { numero: 1, descripcion: "Identificar el salario mínimo vigente", pregunta: "¿Cuál es el valor del salario mínimo mensual legal vigente (SMMLV) en Colombia para 2024?", respuestaCorrecta: "1300000", respuestasAlternativas: ["$1.300.000", "1.300.000"], pista: "Es el salario base de referencia para todas las nóminas", tipo: "valor", puntos: 5 },
        { numero: 2, descripcion: "Calcular auxilio de transporte", pregunta: `¿Cuál es la fórmula en Excel para calcular el auxilio de transporte de ${datos.empleados[0].nombre} (salario: $${datos.empleados[0].salarioBase.toLocaleString()})?`, respuestaCorrecta: "=SI(1300000<=2*1300000,162000,0)", respuestasAlternativas: ["=SI(B2<=2600000,162000,0)", "=SI(salario<=2*SMMLV,162000,0)"], pista: "El auxilio de transporte solo aplica para salarios <= 2 SMMLV", tipo: "formula", puntos: 5 },
        { numero: 3, descripcion: "Calcular horas extras diurnas", pregunta: `${datos.empleados[0].nombre} trabajó ${datos.horasExtras[0]} horas extras diurnas. ¿Cuál es la fórmula para calcularlas?`, respuestaCorrecta: "=(1300000/240)*1.25*8", respuestasAlternativas: ["=(salario/240)*1.25*horas", "=valorHora*1.25*horas"], pista: "Hora extra diurna = (salario/240) * 1.25", tipo: "formula", puntos: 5 },
        { numero: 4, descripcion: "Calcular descuento salud empleado", pregunta: "¿Cuál es el porcentaje que descuenta el empleado para salud?", respuestaCorrecta: "4%", respuestasAlternativas: ["4", "0.04"], pista: "La salud del empleado es el 4% del salario base", tipo: "valor", puntos: 5 },
        { numero: 5, descripcion: "Calcular descuento pensión empleado", pregunta: "¿Cuál es la fórmula en Excel para calcular el descuento a pensión del empleado?", respuestaCorrecta: "=salario*4%", respuestasAlternativas: ["=B2*0.04", "=salario*0.04"], pista: "La pensión del empleado es el 4% del salario base", tipo: "formula", puntos: 5 },
        { numero: 6, descripcion: "Calcular total devengado", pregunta: `¿Cuál es la fórmula para calcular el total devengado de ${datos.empleados[1].nombre}? (Salario + Auxilio de transporte + Horas extras)`, respuestaCorrecta: "=salario+auxTransporte+horasExtras", respuestasAlternativas: ["=B2+C2+D2", "=SUMA(salario,auxilio,extras)"], pista: "Total devengado = Salario base + todos los ingresos", tipo: "formula", puntos: 5 },
        { numero: 7, descripcion: "Calcular total deducciones", pregunta: "¿Cuál es la fórmula para calcular el total de deducciones (salud + pensión + otros)?", respuestaCorrecta: "=salud+pension+otrosDes", respuestasAlternativas: ["=E2+F2+G2", "=SUMA(salud,pension)"], pista: "Total deducciones = suma de todos los descuentos", tipo: "formula", puntos: 5 },
        { numero: 8, descripcion: "Calcular neto a pagar", pregunta: "¿Cuál es la fórmula para calcular el neto a pagar al empleado?", respuestaCorrecta: "=totalDevengado-totalDeducciones", respuestasAlternativas: ["=H2-I2", "=devengado-deducciones"], pista: "Neto = Total devengado - Total deducciones", tipo: "formula", puntos: 5 },
        { numero: 9, descripcion: "Calcular aporte salud empleador", pregunta: "¿Cuál es el porcentaje de aporte a salud que paga el empleador?", respuestaCorrecta: "8.5%", respuestasAlternativas: ["8.5", "0.085"], pista: "El empleador paga el 8.5% para salud", tipo: "valor", puntos: 5 },
        { numero: 10, descripcion: "Calcular aporte pensión empleador", pregunta: "¿Cuál es la fórmula para el aporte del empleador a pensión?", respuestaCorrecta: "=salario*12%", respuestasAlternativas: ["=B2*0.12", "=salario*0.12"], pista: "El empleador aporta el 12% del salario a pensión", tipo: "formula", puntos: 5 },
        { numero: 11, descripcion: "Calcular ARL", pregunta: `La empresa es de clase de riesgo II (1.044%). ¿Cuál es la fórmula para calcular el aporte a ARL?`, respuestaCorrecta: "=salario*1.044%", respuestasAlternativas: ["=B2*0.01044", "=salario*0.01044"], pista: "ARL depende de la clase de riesgo de la empresa", tipo: "formula", puntos: 5 },
        { numero: 12, descripcion: "Calcular caja de compensación", pregunta: "¿Qué porcentaje aporta el empleador a la caja de compensación familiar?", respuestaCorrecta: "4%", respuestasAlternativas: ["4", "0.04"], pista: "Caja de compensación = 4% del salario", tipo: "valor", puntos: 5 },
        { numero: 13, descripcion: "Calcular ICBF y SENA", pregunta: "¿Cuál es el porcentaje total entre ICBF y SENA que paga el empleador?", respuestaCorrecta: "5%", respuestasAlternativas: ["5", "0.05"], pista: "ICBF 3% + SENA 2% = 5% total", tipo: "valor", puntos: 5 },
        { numero: 14, descripcion: "Calcular prima de servicios", pregunta: `¿Cuál es la fórmula en Excel para calcular la prima de servicios semestral de ${datos.empleados[2].nombre}?`, respuestaCorrecta: "=(salario+auxTransporte)*dias/360", respuestasAlternativas: ["=(B2+C2)*180/360", "=salario*180/360"], pista: "Prima = (Salario + Auxilio transporte) * días trabajados / 360", tipo: "formula", puntos: 5 },
        { numero: 15, descripcion: "Calcular cesantías", pregunta: "¿Cuál es la fórmula para calcular las cesantías anuales?", respuestaCorrecta: "=(salario+auxTransporte)*dias/360", respuestasAlternativas: ["=(B2+C2)*360/360", "=salario*1"], pista: "Cesantías = (Salario + Auxilio) * días / 360, para un año completo es igual al salario+auxilio", tipo: "formula", puntos: 5 },
        { numero: 16, descripcion: "Calcular intereses sobre cesantías", pregunta: "¿Qué porcentaje se paga de intereses sobre cesantías?", respuestaCorrecta: "12%", respuestasAlternativas: ["12", "0.12"], pista: "Los intereses sobre cesantías son el 12% anual de las cesantías", tipo: "valor", puntos: 5 },
        { numero: 17, descripcion: "Calcular vacaciones", pregunta: "¿Cuál es la fórmula para calcular las vacaciones anuales?", respuestaCorrecta: "=salario*15/360", respuestasAlternativas: ["=B2*15/360", "=salarioBase/24"], pista: "Vacaciones = Salario base * 15 días / 360, equivale a 15 días hábiles por año", tipo: "formula", puntos: 5 },
        { numero: 18, descripcion: "Calcular dotación", pregunta: "¿Cuántas veces al año tiene derecho a dotación un empleado con salario menor a 2 SMMLV?", respuestaCorrecta: "3", respuestasAlternativas: ["tres", "3 veces"], pista: "La ley obliga 3 dotaciones al año para salarios hasta 2 SMMLV", tipo: "valor", puntos: 5 },
        { numero: 19, descripcion: "Calcular costo total empleado", pregunta: "¿Cuál es la fórmula para calcular el costo total del empleado para la empresa?", respuestaCorrecta: "=neto+aportesSalud+aportesPension+ARL+caja+ICBF+SENA+prima+cesantias+vacaciones", respuestasAlternativas: ["=devengado+parafiscales+prestaciones", "=B2+aportesEmpleador+prestacionesSociales"], pista: "Costo total = Neto pagado + Aportes empleador + Prestaciones sociales", tipo: "formula", puntos: 5 },
        { numero: 20, descripcion: "Resumen nómina total", pregunta: `¿Cuál es la fórmula para sumar el total de la planilla de nómina de los ${datos.empleados.length} empleados?`, respuestaCorrecta: "=SUMA(netoTotal:netoTotal5)", respuestasAlternativas: ["=SUMA(J2:J6)", "=SUMA(neto1:neto5)"], pista: "Usar la función SUMA de Excel para totalizar todos los netos a pagar", tipo: "formula", puntos: 5 }
      ]
    }
  ],
  tienda: [
    {
      titulo: "Nómina Tienda Comercial",
      descripcionGeneral: "Calcula la nómina de una tienda con empleados a tiempo completo y parcial",
      nivel: "basico",
      generarDatos: (seed) => ({
        empresa: `Tienda El Éxito #${seed}`,
        empleados: [
          { nombre: "Sandra Mora", cargo: "Cajera", salarioBase: 1300000 + seed * 20000 },
          { nombre: "Pedro Gómez", cargo: "Vendedor", salarioBase: 1500000 + seed * 25000 },
          { nombre: "Diana Torres", cargo: "Supervisora", salarioBase: 2000000 + seed * 50000 }
        ],
        comisiones: [150000 + seed * 5000, 200000 + seed * 8000, 100000 + seed * 3000],
        diasTrabajados: 30
      }),
      pistas: (datos) => [
        { numero: 1, descripcion: "Identificar componentes del salario", pregunta: `¿Cuáles son los componentes del salario de ${datos.empleados[1].nombre} que incluye comisión?`, respuestaCorrecta: "salario base + comision", respuestasAlternativas: ["salarioBase+comisiones", "base+comision"], pista: "El vendedor tiene salario fijo más comisión por ventas", tipo: "texto", puntos: 5 },
        { numero: 2, descripcion: "Calcular salario con comisión", pregunta: `¿Cuál es la fórmula para calcular el salario total de ${datos.empleados[1].nombre}? (Salario: $${datos.empleados[1].salarioBase.toLocaleString()}, Comisión: $${datos.comisiones[1].toLocaleString()})`, respuestaCorrecta: `=${datos.empleados[1].salarioBase}+${datos.comisiones[1]}`, respuestasAlternativas: ["=salarioBase+comision", "=B2+C2"], pista: "Salario total = Salario base + Comisiones ganadas", tipo: "formula", puntos: 5 },
        { numero: 3, descripcion: "Verificar auxilio de transporte", pregunta: `¿${datos.empleados[2].nombre} con salario $${datos.empleados[2].salarioBase.toLocaleString()} tiene derecho a auxilio de transporte?`, respuestaCorrecta: "no", respuestasAlternativas: ["No", "NO"], pista: "Solo aplica para salarios menores o iguales a 2 SMMLV (2.600.000)", tipo: "texto", puntos: 5 },
        { numero: 4, descripcion: "Calcular descuento salud", pregunta: "¿Cuál es la fórmula en Excel para calcular el 4% de salud del empleado?", respuestaCorrecta: "=salarioBase*4%", respuestasAlternativas: ["=B2*0.04", "=salario*4/100"], pista: "Salud empleado = 4% del ingreso base de cotización", tipo: "formula", puntos: 5 },
        { numero: 5, descripcion: "Calcular IBC para comisionista", pregunta: "Para un trabajador con comisiones, ¿sobre qué valor se calculan los aportes de seguridad social?", respuestaCorrecta: "salario base + comision", respuestasAlternativas: ["totalDevengado", "salario+comision"], pista: "El IBC incluye salario fijo más comisiones habituales", tipo: "texto", puntos: 5 },
        { numero: 6, descripcion: "Calcular descuento pensión", pregunta: "¿Cuál es la fórmula para el descuento a pensión sobre el total devengado?", respuestaCorrecta: "=totalDevengado*4%", respuestasAlternativas: ["=H2*0.04", "=(salario+comision)*0.04"], pista: "Pensión empleado = 4% del IBC (ingreso base de cotización)", tipo: "formula", puntos: 5 },
        { numero: 7, descripcion: "Calcular neto a pagar", pregunta: "¿Cuál es la fórmula para el neto a pagar después de deducciones?", respuestaCorrecta: "=totalDevengado-salud-pension", respuestasAlternativas: ["=H2-I2-J2", "=devengado-descuentos"], pista: "Neto = Total devengado - Salud - Pensión - otros descuentos", tipo: "formula", puntos: 5 },
        { numero: 8, descripcion: "Calcular aporte empleador salud tienda", pregunta: "El empleador de la tienda, ¿qué porcentaje paga para salud?", respuestaCorrecta: "8.5%", respuestasAlternativas: ["8.5", "0.085"], pista: "Empleador paga 8.5% a salud (EPS)", tipo: "valor", puntos: 5 },
        { numero: 9, descripcion: "Calcular costo parafiscal tienda", pregunta: "¿Cuánto paga la tienda por parafiscales (caja + ICBF + SENA) sobre el salario?", respuestaCorrecta: "9%", respuestasAlternativas: ["9", "0.09"], pista: "Caja 4% + ICBF 3% + SENA 2% = 9%", tipo: "valor", puntos: 5 },
        { numero: 10, descripcion: "Calcular prima proporcional", pregunta: `Si ${datos.empleados[0].nombre} lleva 4 meses trabajando, ¿cuál es la fórmula para su prima proporcional?`, respuestaCorrecta: "=(salario+auxTransporte)*120/360", respuestasAlternativas: ["=(B2+C2)*4/12", "=salario*4/12"], pista: "Prima proporcional = (Salario+Auxilio) * días trabajados en semestre / 180", tipo: "formula", puntos: 5 },
        { numero: 11, descripcion: "Calcular cesantías proporcionales", pregunta: "¿Cuál es la fórmula para cesantías de 4 meses?", respuestaCorrecta: "=(salario+auxTransporte)*120/360", respuestasAlternativas: ["=(B2+C2)*4/12", "=salario*120/360"], pista: "Cesantías proporcionales = (Salario+Auxilio) * días / 360", tipo: "formula", puntos: 5 },
        { numero: 12, descripcion: "Calcular intereses cesantías proporcionales", pregunta: "¿Cuál es la fórmula para intereses sobre cesantías por 4 meses?", respuestaCorrecta: "=cesantias*12%*120/360", respuestasAlternativas: ["=cesantias*0.12*4/12", "=cesantias*0.04"], pista: "Intereses = Cesantías * 12% * días / 360", tipo: "formula", puntos: 5 },
        { numero: 13, descripcion: "Calcular vacaciones proporcionales", pregunta: "¿Cuál es la fórmula para vacaciones proporcionales de 4 meses?", respuestaCorrecta: "=salarioBase*120/720", respuestasAlternativas: ["=B2*4/24", "=salario*4/24"], pista: "Vacaciones = Salario * días trabajados / 720 (30 días por cada 12 meses = 2.5 días/mes)", tipo: "formula", puntos: 5 },
        { numero: 14, descripcion: "Identificar fondo solidaridad pensional", pregunta: "¿A partir de cuántos SMMLV el trabajador debe aportar al fondo de solidaridad pensional?", respuestaCorrecta: "4", respuestasAlternativas: ["cuatro", "4 smmlv"], pista: "El fondo de solidaridad aplica para salarios desde 4 SMMLV en adelante", tipo: "valor", puntos: 5 },
        { numero: 15, descripcion: "Calcular total prestaciones sociales", pregunta: "¿Cuál es la fórmula para sumar todas las prestaciones (prima + cesantías + intereses + vacaciones)?", respuestaCorrecta: "=prima+cesantias+intereses+vacaciones", respuestasAlternativas: ["=SUMA(K2:N2)", "=SUMA(prima,cesantias,intereses,vacaciones)"], pista: "Total prestaciones = Suma de todos los beneficios legales", tipo: "formula", puntos: 5 },
        { numero: 16, descripcion: "Calcular total aportes patrón", pregunta: "¿Cuál es la fórmula para el total de aportes del empleador (salud + pensión + ARL + parafiscales)?", respuestaCorrecta: "=aporteSalud+aportePension+ARL+caja+ICBF+SENA", respuestasAlternativas: ["=SUMA(O2:T2)", "=salud+pension+arl+parafiscales"], pista: "Suma todos los aportes que hace la empresa por cada trabajador", tipo: "formula", puntos: 5 },
        { numero: 17, descripcion: "Calcular costo total por trabajador", pregunta: "¿Cuál es la fórmula para el costo total que le representa cada trabajador a la tienda?", respuestaCorrecta: "=salarioBase+auxTransporte+prestaciones+aportesEmpleador", respuestasAlternativas: ["=neto+aportes+prestaciones", "=devengado+aportesPatron+prestaciones"], pista: "Costo total = Lo que recibe el empleado + Lo que paga la empresa por él", tipo: "formula", puntos: 5 },
        { numero: 18, descripcion: "Calcular porcentaje de carga prestacional", pregunta: "Aproximadamente, ¿qué porcentaje adicional sobre el salario representa la carga prestacional en Colombia?", respuestaCorrecta: "52%", respuestasAlternativas: ["52", "0.52", "entre 50% y 55%"], pista: "La carga prestacional en Colombia está entre el 50% y 55% del salario", tipo: "valor", puntos: 5 },
        { numero: 19, descripcion: "Calcular provisión mensual prestaciones", pregunta: "¿Cuál es la fórmula para provisionar mensualmente las prestaciones de un empleado?", respuestaCorrecta: "=salarioBase*52%/12", respuestasAlternativas: ["=B2*0.52/12", "=salario*0.0433"], pista: "Provisión mensual = Salario * porcentaje carga prestacional / 12 meses", tipo: "formula", puntos: 5 },
        { numero: 20, descripcion: "Total nómina tienda", pregunta: `¿Cuál es la fórmula para calcular el total de nómina de los ${datos.empleados.length} empleados de la tienda?`, respuestaCorrecta: "=SUMA(neto1:neto3)", respuestasAlternativas: ["=SUMA(J2:J4)", "=neto1+neto2+neto3"], pista: "Sumar todos los netos a pagar de cada empleado", tipo: "formula", puntos: 5 }
      ]
    }
  ],
  trabajadores: [
    {
      titulo: "Liquidación Trabajador",
      descripcionGeneral: "Calcula la liquidación definitiva de un trabajador que termina su contrato",
      nivel: "avanzado",
      generarDatos: (seed) => {
        const meses = 12 + (seed % 48);
        return {
          empresa: `Empresa Colombia ${seed}`,
          trabajador: { nombre: `Empleado ${seed}`, cargo: "Analista", salarioBase: 1800000 + seed * 30000 },
          fechaIngreso: `01/01/${2020 + (seed % 4)}`,
          fechaRetiro: `31/12/${2021 + (seed % 4)}`,
          diasTrabajados: meses * 30,
          motivoRetiro: seed % 3 === 0 ? "renuncia" : seed % 3 === 1 ? "despido sin justa causa" : "mutuo acuerdo",
          ultimoSalario: 1800000 + seed * 30000,
          auxilioTransporte: 162000
        };
      },
      pistas: (datos) => [
        { numero: 1, descripcion: "Calcular días trabajados para liquidación", pregunta: `¿Cómo se calculan los días para liquidación desde ${datos.fechaIngreso} hasta ${datos.fechaRetiro}?`, respuestaCorrecta: "=(fechaFin-fechaInicio)*30/30", respuestasAlternativas: ["=DIAS360(A1,B1)", "=SIFECHA(fechaIngreso,fechaRetiro,\"D\")"], pista: "Para liquidaciones en Colombia se usa el mes de 30 días con DIAS360", tipo: "formula", puntos: 5 },
        { numero: 2, descripcion: "Calcular cesantías liquidación", pregunta: `¿Cuál es la fórmula para las cesantías de ${datos.diasTrabajados} días trabajados?`, respuestaCorrecta: `=(${datos.ultimoSalario}+${datos.auxilioTransporte})*${datos.diasTrabajados}/360`, respuestasAlternativas: ["=(salario+auxilio)*dias/360", "=(B2+C2)*D2/360"], pista: "Cesantías = (Último salario + Auxilio transporte) * días / 360", tipo: "formula", puntos: 5 },
        { numero: 3, descripcion: "Calcular intereses cesantías liquidación", pregunta: "¿Cuál es la fórmula para los intereses sobre cesantías en la liquidación?", respuestaCorrecta: "=cesantias*12%*diasTrabajados/360", respuestasAlternativas: ["=cesantias*0.12*dias/360", "=E2*0.12*D2/360"], pista: "Intereses = Cesantías * 12% * días / 360", tipo: "formula", puntos: 5 },
        { numero: 4, descripcion: "Calcular prima de servicios liquidación", pregunta: "¿Cuál es la fórmula para la prima de servicios proporcional en la liquidación?", respuestaCorrecta: "=(salario+auxTransporte)*diasEnSemestre/180", respuestasAlternativas: ["=(B2+C2)*diasSem/180", "=salario*diasSemestre/180"], pista: "Prima = (Salario + Auxilio) * días del semestre / 180", tipo: "formula", puntos: 5 },
        { numero: 5, descripcion: "Calcular vacaciones liquidación", pregunta: "¿Cuál es la fórmula para las vacaciones pendientes en la liquidación?", respuestaCorrecta: "=salarioBase*diasTrabajados/720", respuestasAlternativas: ["=B2*D2/720", "=salario*dias/720"], pista: "Vacaciones = Salario base * días trabajados / 720", tipo: "formula", puntos: 5 },
        { numero: 6, descripcion: "Identificar indemnización por despido", pregunta: `El motivo de retiro es "${datos.motivoRetiro}". ¿Se genera indemnización por despido sin justa causa?`, respuestaCorrecta: datos.motivoRetiro === "despido sin justa causa" ? "si" : "no", respuestasAlternativas: datos.motivoRetiro === "despido sin justa causa" ? ["Sí", "SI"] : ["No", "NO"], pista: "Solo hay indemnización en despido sin justa causa o sin preaviso en renuncia", tipo: "texto", puntos: 5 },
        { numero: 7, descripcion: "Calcular indemnización si aplica", pregunta: "Para un contrato indefinido con más de 1 año, ¿cuántos días adicionales de salario se pagan por cada año?", respuestaCorrecta: "20", respuestasAlternativas: ["veinte", "20 dias"], pista: "Ley 789/2002: 30 días primer año + 20 días por cada año adicional", tipo: "valor", puntos: 5 },
        { numero: 8, descripcion: "Calcular total liquidación", pregunta: "¿Cuál es la fórmula para el TOTAL de la liquidación?", respuestaCorrecta: "=cesantias+interesesCesantias+prima+vacaciones+indemnizacion", respuestasAlternativas: ["=SUMA(E2:I2)", "=cese+interes+prima+vac+indem"], pista: "Total = Cesantías + Intereses + Prima + Vacaciones + Indemnización (si aplica)", tipo: "formula", puntos: 5 },
        { numero: 9, descripcion: "Calcular descuentos liquidación", pregunta: "¿Qué descuentos se hacen a la liquidación?", respuestaCorrecta: "prestamos+anticiposCesantias+embargos", respuestasAlternativas: ["deudas+anticipos", "prestamos+deducciones"], pista: "Se descuentan préstamos, anticipos de cesantías y embargos legales", tipo: "texto", puntos: 5 },
        { numero: 10, descripcion: "Calcular neto liquidación", pregunta: "¿Cuál es la fórmula para el neto de la liquidación?", respuestaCorrecta: "=totalLiquidacion-descuentos", respuestasAlternativas: ["=J2-K2", "=liquidacionTotal-deducciones"], pista: "Neto liquidación = Total liquidación - Descuentos aplicables", tipo: "formula", puntos: 5 },
        { numero: 11, descripcion: "Verificar aportes seguridad social liquidación", pregunta: "Durante la liquidación, ¿hasta qué fecha se pagan los aportes a seguridad social?", respuestaCorrecta: "hasta la fecha de retiro", respuestasAlternativas: ["fecha retiro", "ultimo dia trabajado"], pista: "Los aportes se pagan hasta el último día de trabajo", tipo: "texto", puntos: 5 },
        { numero: 12, descripcion: "Calcular salarios pendientes", pregunta: "Si el trabajador tiene 5 días de salario pendiente de pago, ¿cuál es la fórmula?", respuestaCorrecta: "=salarioBase/30*5", respuestasAlternativas: ["=B2/30*5", "=salario*5/30"], pista: "Salario pendiente = (Salario mensual / 30) * días pendientes", tipo: "formula", puntos: 5 },
        { numero: 13, descripcion: "Calcular horas extras pendientes", pregunta: "Si hay 10 horas extras diurnas pendientes, ¿cuál es la fórmula para calcularlas?", respuestaCorrecta: "=(salarioBase/240)*1.25*10", respuestasAlternativas: ["=(B2/240)*1.25*10", "=valorHora*1.25*10"], pista: "HED = (Salario/240) * 1.25 * horas", tipo: "formula", puntos: 5 },
        { numero: 14, descripcion: "Verificar tiempo para pago liquidación", pregunta: "¿Cuántos días tiene el empleador para pagar la liquidación después de terminado el contrato?", respuestaCorrecta: "15", respuestasAlternativas: ["quince", "15 dias"], pista: "El empleador tiene 15 días para pagar la liquidación o incurre en multas", tipo: "valor", puntos: 5 },
        { numero: 15, descripcion: "Calcular mora por no pago", pregunta: "Si el empleador no paga en 15 días, ¿qué sanción aplica?", respuestaCorrecta: "un dia de salario por cada dia de retardo", respuestasAlternativas: ["1 dia salario por dia retardo", "salario diario por mora"], pista: "La ley impone sanción moratoria de 1 día de salario por cada día de retraso", tipo: "texto", puntos: 5 },
        { numero: 16, descripcion: "Calcular sanción moratoria", pregunta: "Si la liquidación se pagó 10 días tarde, ¿cuál es la fórmula para la sanción moratoria?", respuestaCorrecta: "=salarioBase/30*10", respuestasAlternativas: ["=B2/30*10", "=salarioDiario*10"], pista: "Sanción = (Salario mensual / 30) * días de mora", tipo: "formula", puntos: 5 },
        { numero: 17, descripcion: "Calcular dotación pendiente", pregunta: "Si el trabajador lleva 8 meses y no le han dado dotación, ¿cuántas dotaciones se le deben?", respuestaCorrecta: "2", respuestasAlternativas: ["dos", "2 dotaciones"], pista: "Se entregan en enero, mayo y septiembre. Con 8 meses: enero y mayo = 2 dotaciones", tipo: "valor", puntos: 5 },
        { numero: 18, descripcion: "Totalizar acreencias laborales", pregunta: "¿Cuál es la fórmula para el total de todas las acreencias laborales?", respuestaCorrecta: "=neto+salariosPendientes+horasExtras+sanciones", respuestasAlternativas: ["=SUMA(L2:O2)", "=liquidacion+salarios+extras+mora"], pista: "Total acreencias = Neto liquidación + Salarios pendientes + HE pendientes + Sanciones", tipo: "formula", puntos: 5 },
        { numero: 19, descripcion: "Firmar paz y salvo", pregunta: "¿Qué documento debe firmar el trabajador al recibir la liquidación completa?", respuestaCorrecta: "paz y salvo", respuestasAlternativas: ["paz y salvo laboral", "recibo a satisfaccion"], pista: "El trabajador firma paz y salvo confirmando que recibió todo lo adeudado", tipo: "texto", puntos: 5 },
        { numero: 20, descripcion: "Verificar total final liquidación", pregunta: "¿Cuál es la fórmula en Excel para verificar que el total de la liquidación sea correcto usando SUMA?", respuestaCorrecta: "=SUMA(cesantias,intereses,prima,vacaciones,salariosPendientes)", respuestasAlternativas: ["=SUMA(E2:J2)", "=SUMA(cesantias:salariosPendientes)"], pista: "Usar SUMA para verificar cada componente de la liquidación final", tipo: "formula", puntos: 5 }
      ]
    }
  ]
};

// Generar 1000 ejercicios variando parámetros
function generarEjercicios() {
  const ejercicios = [];
  const categorias = Object.keys(plantillas);
  let id = 1;

  for (let i = 0; i < 1000; i++) {
    const catKey = categorias[i % categorias.length];
    const plantillasList = plantillas[catKey];
    const plantilla = plantillasList[i % plantillasList.length];
    const seed = i + 1;

    const datos = plantilla.generarDatos(seed);
    const pistasGeneradas = plantilla.pistas(datos);

    ejercicios.push({
      id: id++,
      titulo: `${plantilla.titulo} #${seed}`,
      categoria: catKey,
      descripcionGeneral: plantilla.descripcionGeneral,
      nivel: plantilla.nivel,
      datos: datos,
      pistas: pistasGeneradas,
      activo: true,
      vecesJugado: 0,
      vecesCompletado: 0
    });
  }

  return ejercicios;
}

module.exports = { generarEjercicios };
