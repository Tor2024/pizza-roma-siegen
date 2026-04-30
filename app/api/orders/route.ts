import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// POST - создать заказ (для клиентов)
export async function POST(req: Request) {
  try {
    const orderData = await req.json();
    
    // Валидация обязательных полей
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }
    
    if (!orderData.customer?.name || !orderData.customer?.phone || !orderData.customer?.address) {
      return NextResponse.json({ error: 'Missing customer information' }, { status: 400 });
    }

    if (!orderData.total || orderData.total < 15) {
      return NextResponse.json({ error: 'Minimum order is 15€' }, { status: 400 });
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOrder = {
      id: orderId,
      items: orderData.items,
      customer: orderData.customer,
      total: orderData.total,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      promoCode: orderData.promoCode || null,
      promoDiscount: orderData.promoDiscount || 0,
      status: 'received',
      statusHistory: [
        { status: 'received', timestamp: Date.now(), note: 'Order received' }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      estimatedDelivery: orderData.estimatedDelivery || '25-35 min'
    };

    // Сохраняем в Vercel KV
    await redis.set(`order:${orderId}`, newOrder);
    await redis.sadd('orders_list', orderId);

    // Отправляем уведомление админу (заглушка для future webhook)
    console.log(`🍕 New order received: ${orderId} - ${orderData.customer.name} - ${orderData.total}€`);

    return NextResponse.json({ 
      success: true, 
      orderId,
      order: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// GET - получить статус заказа по ID (для клиентов)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const order = await redis.get(`order:${orderId}`);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Возвращаем только нужные поля для клиента
    const { id, status, items, total, customer, createdAt, estimatedDelivery } = order as any;
    
    return NextResponse.json({
      id,
      status,
      items,
      total,
      customer: { name: customer.name }, // Не возвращаем полные данные клиента
      createdAt,
      estimatedDelivery
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch order',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
