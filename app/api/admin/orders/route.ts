import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// In-memory fallback storage (for development or when Redis is not configured)
const memoryStorage = {
  orders: new Map<string, any>(),
  orderList: new Set<string>()
};

// Try to initialize Redis, fallback to memory if not available
let redis: Redis | null = null;
try {
  redis = Redis.fromEnv();
} catch (e) {
  console.warn('Redis not configured, using in-memory storage');
  redis = null;
}

// Helper functions for storage
const getOrder = async (id: string) => {
  if (redis) return redis.get(`order:${id}`);
  return memoryStorage.orders.get(id) || null;
};

const setOrder = async (id: string, data: any) => {
  if (redis) return redis.set(`order:${id}`, data);
  memoryStorage.orders.set(id, data);
};

const addOrderToList = async (id: string) => {
  if (redis) return redis.sadd('orders_list', id);
  memoryStorage.orderList.add(id);
};

const getOrderList = async () => {
  if (redis) return redis.smembers('orders_list');
  return Array.from(memoryStorage.orderList);
};

const updateOrderStatus = async (id: string, status: string) => {
  if (redis) {
    const order = await redis.get(`order:${id}`) as any;
    if (order) {
      order.status = status;
      order.updatedAt = Date.now();
      return redis.set(`order:${id}`, order);
    }
  } else {
    const order = memoryStorage.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = Date.now();
      memoryStorage.orders.set(id, order);
    }
  }
};

// GET - получить все заказы
export async function GET(request: Request) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем все ID заказов
    const orderIds = await getOrderList();
    
    // Получаем данные каждого заказа
    const orders = [];
    for (const id of orderIds) {
      const order = await getOrder(id);
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
    await setOrder(orderId, newOrder);
    // Добавляем ID в список
    await addOrderToList(orderId);

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

    const order: any = await getOrder(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Валидные статусы
    const validStatuses = ['received', 'preparing', 'delivering', 'done', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await updateOrderStatus(id, newStatus);

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

    const order = await getOrder(id);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Delete from storage
    if (redis) {
      await redis.del(`order:${id}`);
      await redis.srem('orders_list', id);
    } else {
      memoryStorage.orders.delete(id);
      memoryStorage.orderList.delete(id);
    }

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
