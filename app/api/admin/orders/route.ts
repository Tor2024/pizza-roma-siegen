import { NextResponse } from 'next/server';
import { getOrders, saveOrder, updateOrderStatus as updateGitHubStatus, deleteOrder, validateOrderPrices } from '@/lib/githubStorage';

// In-memory cache for fast access
const orderCache = new Map<string, any>();
const refreshCache = async () => {
  const orders = await getOrders();
  orderCache.clear();
  orders.forEach(o => orderCache.set(o.id, o));
  return orders;
};

// GET - получить все заказы
export async function GET(request: Request) {
  try {
    // Проверка авторизации
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Получаем заказы из GitHub (с кэшированием)
    const orders = await refreshCache();
    
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

    // Валидация цен на бэкенде (не доверяем фронтенду!)
    const priceValidation = await validateOrderPrices(orderData.items);
    if (!priceValidation.valid) {
      return NextResponse.json({ 
        error: 'Price validation failed', 
        details: priceValidation.error 
      }, { status: 400 });
    }

    // Пересчитываем total на бэкенде
    const calculatedSubtotal = priceValidation.calculatedTotal || orderData.items.reduce((sum: number, item: any) => {
      const toppingSum = item.toppings?.reduce((t: number, top: any) => t + (top.price || 0), 0) || 0;
      return sum + ((item.price + toppingSum) * (item.quantity || 1));
    }, 0);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOrder = {
      id: orderId,
      ...orderData,
      subtotal: calculatedSubtotal,
      total: calculatedSubtotal + (orderData.deliveryFee || 0) - (orderData.promoDiscount || 0),
      status: 'received',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Сохраняем заказ в GitHub и кэш
    await saveOrder(newOrder);
    orderCache.set(orderId, newOrder);

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

    // Валидные статусы
    const validStatuses = ['received', 'preparing', 'delivering', 'done', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Обновляем в GitHub и кэше
    await updateGitHubStatus(id, newStatus);
    const order = orderCache.get(id);
    if (order) {
      order.status = newStatus;
      order.updatedAt = Date.now();
    }

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

    // Delete from GitHub and cache
    await deleteOrder(id);
    orderCache.delete(id);

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
