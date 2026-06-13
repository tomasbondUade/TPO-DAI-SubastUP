// controllers/pujasController.js
// Pujas en tiempo real — Prisma + PostgreSQL

const prisma = require('../config/prisma');

const TIMER_SEGUNDOS  = 60;
const MINIMO_PORCENTAJE = 0.10; // 10% más que la puja actual

// ─────────────────────────────────────────────────────────────
// GET /api/pujas/:itemId
// Devuelve la puja más alta y el tiempo restante
// Se llama cada 60 segundos desde el frontend (polling)
// ─────────────────────────────────────────────────────────────
exports.getEstadoPuja = async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);

    const item = await prisma.itemsCatalogo.findFirst({
      where: { identificador: itemId },
      include: {
        productos: {
          select: {
            nombre:             true,
            descripcionCompleta: true,
            fotos:              { take: 3 },
          },
        },
        pujos: {
          orderBy: { importe: 'desc' },
          take:    1,
          include: {
            asistentes: {
              include: {
                clientes: {
                  include: {
                    personas: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item)
      return res.status(404).json({ ok: false, message: 'Ítem no encontrado.' });

    if (item.cerrado)
      return res.json({
        ok:          true,
        cerrado:     true,
        message:     'Esta subasta ya finalizó.',
        pujaActual:  item.pujos[0]?.importe || item.precioBase,
        moneda:      item.moneda,
      });

    // Calcular tiempo restante
    let tiempoRestante = TIMER_SEGUNDOS;
    if (item.ultimaPuja) {
      const segundosTranscurridos = Math.floor(
        (Date.now() - new Date(item.ultimaPuja).getTime()) / 1000
      );
      tiempoRestante = Math.max(0, TIMER_SEGUNDOS - segundosTranscurridos);
    }

    // Si el timer expiró y hay pujas → cerrar el ítem automáticamente
    if (tiempoRestante === 0 && item.pujos.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Marcar ítem como cerrado
        await tx.itemsCatalogo.update({
          where: { identificador: itemId },
          data:  { cerrado: true, subastado: 'si' },
        });

        // Marcar la puja ganadora
        await tx.pujos.update({
          where: { identificador: item.pujos[0].identificador },
          data:  { ganador: 'si' },
        });
      });

      return res.json({
        ok:         true,
        cerrado:    true,
        message:    'Subasta finalizada.',
        pujaActual: item.pujos[0].importe,
        moneda:     item.moneda,
        ganador:    item.pujos[0].asistentes?.clientes?.personas?.nombre || null,
      });
    }

    const pujaActual    = item.pujos[0]?.importe || item.precioBase;
    const minimoSiguiente = parseFloat(pujaActual) * (1 + MINIMO_PORCENTAJE);

    // Fotos en base64
    const fotos = item.productos?.fotos?.map((f) => ({
      id:   f.identificador,
      foto: Buffer.from(f.foto).toString('base64'),
    })) || [];

    return res.json({
      ok:               true,
      cerrado:          false,
      itemId:           item.identificador,
      nombre:           item.productos?.nombre,
      descripcion:      item.productos?.descripcionCompleta,
      moneda:           item.moneda,
      precioBase:       item.precioBase,
      pujaActual:       pujaActual,
      minimoSiguiente:  minimoSiguiente.toFixed(2),
      tiempoRestante,
      fotos,
    });

  } catch (err) {
    console.error('getEstadoPuja error:', err);
    return res.status(500).json({ ok: false, message: 'Error al obtener el estado de la puja.' });
  }
};

// ─────────────────────────────────────────────────────────────
// POST /api/pujas/:itemId
// Registrar una nueva puja
// Body: { importe, asistente }
// ─────────────────────────────────────────────────────────────
exports.pujar = async (req, res) => {
  try {
    const { personaId } = req.user;
    const itemId        = parseInt(req.params.itemId);
    const { importe }   = req.body;

    if (!importe || isNaN(importe) || parseFloat(importe) <= 0)
      return res.status(400).json({ ok: false, message: 'El importe es inválido.' });

    const importeNum = parseFloat(importe);

    // Buscar el ítem
    const item = await prisma.itemsCatalogo.findFirst({
      where:   { identificador: itemId },
      include: {
        pujos: {
          orderBy: { importe: 'desc' },
          take:    1,
        },
        catalogos: {
          include: { subastas: true },
        },
      },
    });

    if (!item)
      return res.status(404).json({ ok: false, message: 'Ítem no encontrado.' });

    if (item.cerrado)
      return res.status(400).json({ ok: false, message: 'Esta subasta ya finalizó.' });

    // Verificar si el timer expiró
    if (item.ultimaPuja) {
      const segundosTranscurridos = Math.floor(
        (Date.now() - new Date(item.ultimaPuja).getTime()) / 1000
      );
      if (segundosTranscurridos >= TIMER_SEGUNDOS)
        return res.status(400).json({ ok: false, message: 'El tiempo de puja expiró.' });
    }

    // Verificar monto mínimo (10% más que la puja actual)
    const pujaActual = parseFloat(item.pujos[0]?.importe || item.precioBase);
    const minimo     = pujaActual * (1 + MINIMO_PORCENTAJE);

    if (importeNum < minimo)
      return res.status(400).json({
        ok:      false,
        message: `Tu puja debe ser al menos ${minimo.toFixed(2)} ${item.moneda} (10% más que la puja actual).`,
        minimo:  minimo.toFixed(2),
      });

    // Buscar el asistente (el usuario en la subasta)
    const subastaId = item.catalogos?.subastas?.identificador;
    const asistente = await prisma.asistentes.findFirst({
      where: {
        subasta: subastaId,
        clientes: { identificador: personaId },
      },
    });

    if (!asistente)
      return res.status(403).json({ ok: false, message: 'No estás registrado como asistente en esta subasta.' });

    // Verificar que no sea el mismo usuario que ya tiene la puja más alta
    if (item.pujos[0]?.asistente === asistente.identificador)
      return res.status(400).json({ ok: false, message: 'Ya tenés la puja más alta.' });

    // Registrar la puja y resetear el timer
    await prisma.$transaction(async (tx) => {
      await tx.pujos.create({
        data: {
          asistente: asistente.identificador,
          item:      itemId,
          importe:   importeNum,
          ganador:   'no',
        },
      });

      await tx.itemsCatalogo.update({
        where: { identificador: itemId },
        data:  { ultimaPuja: new Date() },
      });
    });

    return res.status(201).json({
      ok:            true,
      message:       'Puja registrada correctamente.',
      importeNuevo:  importeNum,
      tiempoRestante: TIMER_SEGUNDOS,
    });

  } catch (err) {
    console.error('pujar error:', err);
    return res.status(500).json({ ok: false, message: 'Error al registrar la puja.' });
  }
};
