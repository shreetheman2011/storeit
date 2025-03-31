"use server";

import db from "@/lib/database/db";
import {
  ISubscription,
  Subscription,
} from "@/lib/database/schema/subscription.model";
import { getServerSession } from "./auth.action";
import axios from "axios";
import { PADDLE_API_KEY, PADDLE_PRODUCT_ID } from "@/lib/env";
import { ActionResponse, formatFileSize, parseError } from "@/lib/utils";
import paddle from "@/lib/paddle/config";
import { STORAGE_PRICING } from "@/lib/constants";

const paddleBaseUrl = `https://${
  process.env.NODE_ENV !== "production" ? "sandbox-" : ""
}api.paddle.com/`;

const effectiveFrom = `${
  process.env.NODE_ENV === "production" ? "next_billing_period" : "immediately"
}`;

export async function cancelSubscription(subs: ISubscription) {
  try {
    await db();

    const session = await getServerSession();

    if (!session) {
      throw new Error("Unauthenticated user");
    }

    console.log(subs?.gateway?.paddle);

    const paddleSubscriptionCancellationUrl = `${paddleBaseUrl}subscriptions/${subs?.gateway?.paddle?.subscription?.id}/cancel`;

    const res = await axios.post(
      paddleSubscriptionCancellationUrl,
      {
        effective_from: effectiveFrom,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PADDLE_API_KEY}`,
        },
      }
    );
    await Subscription.updateOne(
      { subscriber: session.user.id },
      { selectedStorage: 7516192768 }
    );

    return ActionResponse({
      message: "Subscription Cancelled Successfully",
      description:
        "Your subscription has been cancelled successfully. You will not be charged for the remaining period of your subscription.",
      status: res.status,
    });
  } catch (error) {
    console.log("Error in cancelling subscription", error);
    const err = parseError(error);

    return ActionResponse({
      message: "Error",
      description: err,
      status: 500,
    });
  }
}

export async function createPaddlePrice(
  storage: number,
  storageInByte: number,
  subs: ISubscription
) {
  try {
    const session = await getServerSession();
    const formattedStorage = formatFileSize(storageInByte);

    if (!session) {
      throw new Error("Unauthenticated user");
    }

    const price = await paddle.prices.create({
      name: `Storage;${formattedStorage}`,
      productId: PADDLE_PRODUCT_ID,
      billingCycle: {
        interval: "month",
        frequency: 1,
      },
      taxMode: "external",
      description: `Price for storage: ${formattedStorage} for user ${session.user.email}`,
      unitPrice: {
        amount: Math.trunc(storage * STORAGE_PRICING * 100).toString(),
        currencyCode: "USD",
      },
      quantity: {
        minimum: 1,
        maximum: 999999,
      },
    });
    console.log("subscription id: ", subs?.gateway?.paddle?.subscription?.id);

    await Subscription.updateOne(
      { subscriber: session.user.id },
      {
        "gateway.paddle.priceId": price.id,
        "gateway.paddle.subscription.id": subs.gateway?.paddle.subscription.id,
        "gateway.provider": "paddle",
        selectedStorage: storageInByte,
        subscriptionType: "paid",
      }
    );
    return ActionResponse({
      message: "Price Id created",
      description: "",
      data: price,
      user: session.user,
      status: 201,
    });
  } catch (error) {
    console.log("Error in creating paddle priceId: ", error);

    const err = parseError(error);

    return ActionResponse({
      message: "Error",
      description: `${err}`,
      data: null,
      user: null,
      status: 500,
    });
  }
}
