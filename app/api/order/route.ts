import { verifyAuth } from "@/app/utils/auth";
import { checkStock, createOrderItem, createUserAddress, reduceProductStock } from "@/app/utils/queryDb";
import { updateOrderStatus, userAddressSchema } from "@/app/utils/types";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import prisma from "@/app/lib/prisma";
import type { OrderStatus } from "@prisma/client";

export const POST = async (req: Request) => {
  const uuid = uuidv4();
  const token = req.headers.get('cookie')?.split('=')[1];
  const body = await req.json();
  const verifiedToken = token && (await verifyAuth(token));
  const result = userAddressSchema.safeParse(body);

  // Check user token
  if (!verifiedToken) {
    return NextResponse.json({ errors: 'Unauthorized' }, { status: 401 });
  }

  // Check schema validation
  if (!result.success) {
    let zodErrors = {};
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message }
    });
    return NextResponse.json({ errors: zodErrors }, { status: 400 });
  }

  // check stock isValid
  const hasSufficientStock = await checkStock(verifiedToken.userId);
  if (!hasSufficientStock) {
    return NextResponse.json({ errors: 'Product stock is less than user request' }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      orderId: uuid,
      userId: verifiedToken.userId,
      paymentMethod: result.data.paymentMethod,
    }
  });

  if (!order) {
    return NextResponse.json({ errors: 'Internal server error' }, { status: 500 });
  }

  const productCart = await prisma.cart.findMany({
    where: {
      userId: verifiedToken.userId
    },
    select: {
      productId: true,
      quantity: true,
    }
  });

  // Create / Record OrderItem & User Address
  const orderItem = await createOrderItem(productCart, order.orderId);
  const orderAddress = await createUserAddress(result, verifiedToken.userId, order.orderId);

  if (orderItem && orderAddress) {
    await reduceProductStock(verifiedToken.userId);
    return NextResponse.json(order, { status: 201 });
  } else {
    // Order failed => restore product stock and delete record & udate order status to Cancellled
    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId: order.orderId
      }
    })

    await prisma.$transaction([
      ...orderItems.map(orderItem => {
        return prisma.product.update({
          where: {
            productId: orderItem.productId
          },
          data: {
            productStock: {
              increment: orderItem.quantity
            }
          }
        });
      }),

      prisma.address.deleteMany({
        where: {
          orderId: order.orderId
        }
      }),
      prisma.orderItem.deleteMany({
        where: {
          orderId: order.orderId
        }
      }),
      prisma.order.update({
        where: {
          orderId: order.orderId
        },
        data: {
          status: 'Cancelled'
        }
      })


    ]);
    return NextResponse.json({ errors: 'Order Failed' }, { status: 400 })
  }

}

type orderStatus = {
  orderId: string;
  status: keyof typeof OrderStatus;
}
export const PATCH = async (req: Request) => {
  const body: orderStatus = await req.json();
  const result = updateOrderStatus.safeParse(body);
  const token = req.headers.get('cookie')?.split('=')[1];
  const verifiedToken = token && (await verifyAuth(token));

  if (!result.success) {
    let zodErrors = {};
    result.error.issues.forEach((issue) => {
      zodErrors = { ...zodErrors, [issue.path[0]]: issue.message }
    });
    return NextResponse.json(zodErrors, { status: 401 });
  }

  if (!verifiedToken) {
    return NextResponse.json({ errors: 'Unauthorized' }, { status: 401 });
  }

  let orderStatus: OrderStatus = 'Delivered';
  if (verifiedToken.role === 'admin') {
    orderStatus = result.data.status;
  }

  try {
    if (orderStatus === 'Cancelled') {
      const order = await prisma.order.update({
        where: {
          orderId: result.data.orderId,
        },
        data: {
          status: orderStatus,
        },
      });
    
      const orderItems = await prisma.orderItem.findMany({
        where: {
          orderId: order.orderId
        }
      })
  
      await prisma.$transaction([
        ...orderItems.map(orderItem => {
          return prisma.product.update({
            where: {
              productId: orderItem.productId
            },
            data: {
              productStock: {
                increment: orderItem.quantity
              }
            }
          });
        }),
      ])
      
      return NextResponse.json({status: 200})
    }
  
    const order = await prisma.order.update({
      where: {
        orderId: result.data.orderId,
      },
      data: {
        status: orderStatus,
      },
    });
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ errors: 'Internal Server Error' }, { status: 500 });
  }
};
