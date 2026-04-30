import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// GET - получить все заказы
export async function GET(request: Request) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем все ID заказов
    const orderIds = await kv.smembers('orders_list');
    
    // Получаем данные каждого заказа
    const orders = [];
    for (const id of orderIds) {
      const order = await kv.get(`order:${id}`);
      if (order) orders.push(order);
    }
    
    // Сортируем по времени (новые сверху)
    orders.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch orders',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST - создать заказ
export async function POST(req: Request) {
  try {
    const orderData = await req.json();
    
    // Валидация
    if (!orderData.items || !orderData.customer || !orderData.total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOrder = {
      id: orderId,
      ...orderData,
      status: 'received',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Сохраняем заказ
    await kv.set(`order:${orderId}`, newOrder);
    // Добавляем ID в список
    await kv.sadd('orders_list', orderId);

    return NextResponse.json({ 
      success: true, 
      orderId,
      order: newOrder 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PATCH - обновить статус заказа
export async function PATCH(req: Request) {
  try {
    const { id, newStatus } = await req.json();
    
    // Проверка авторизации
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id || !newStatus) {
      return NextResponse.json({ error: 'Missing id or newStatus' }, { status: 400 });
    }

    const orderKey = `order:${id}`;
    const order: any = await kv.get(orderKey);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Валидные статусы
    const validStatuses = ['received', 'preparing', 'delivering', 'done', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    order.status = newStatus;
    order.updatedAt = Date.now();
    
    await kv.set(orderKey, order);

    return NextResponse.json({ 
      success: true, 
      order 
    });
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update order',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE - удалить заказ
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    
    // Проверка авторизации
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
    }

    const orderKey = `order:${id}`;
    const exists = await kv.exists(orderKey);
    
    if (!exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await kv.del(orderKey);
    await kv.srem('orders_list', id);

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted' 
    });
  } catch (error) {
    console.error('Order delete error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete order',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
