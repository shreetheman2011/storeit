"use server";

import db from "@/lib/database/db";
import { getServerSession } from "./auth.action";
import { Subscription } from "@/lib/database/schema/subscription.model";
import { ActionResponse } from "@/lib/utils";

async function fetchPaddleSubscription(userEmail: string) {
  try {
    const body = new URLSearchParams();
    body.append("vendor_id", process.env.PADDLE_VENDOR_ID || "");
    body.append("vendor_auth_code", process.env.PADDLE_AUTH_CODE || "");
    body.append("email", userEmail);

    const response = await fetch(
      "https://vendors.paddle.com/api/2.0/subscription/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body, // Correct format
      }
    );

    const data = await response.json();
    return data.success && data.response.length > 0 ? data.response[0] : null;
  } catch (error) {
    console.error("Error fetching subscription from Paddle:", error);
    return null;
  }
}

export async function getSubscription() {
  try {
    await db();

    const session = await getServerSession();
    if (!session) {
      throw new Error("Unauthorized user");
    }

    const { user } = session;

    let subs = await Subscription.findOne({ subscriber: user.id });

    // If no subscription exists at all, return early
    if (!subs) {
      return ActionResponse({
        message: "No Subscription",
        description: "User does not have any subscription record",
        data: null,
        status: 200,
      });
    }

    // If user has a free plan, return it without checking Paddle
    if (subs.subscriptionType === "free") {
      return ActionResponse({
        message: "Free Plan",
        description: "User is on a free subscription",
        data: subs,
        status: 200,
      });
    }

    // If user has a paid plan but no Paddle subscription ID, fetch from Paddle
    if (
      subs.subscriptionType === "paid" &&
      !subs.gateway?.paddle?.subscription?.id
    ) {
      console.log(
        "Paid plan found but no subscription ID. Fetching from Paddle..."
      );
      const paddleSub = await fetchPaddleSubscription(user.email);

      if (paddleSub) {
        subs = await Subscription.findOneAndUpdate(
          { subscriber: user.id },
          {
            $set: {
              "gateway.paddle.subscription.id": paddleSub.subscription_id,
              "gateway.paddle.subscription.status": paddleSub.status,
            },
          },
          { new: true, upsert: false } // Don't create a new entry, only update if exists
        );
      }
    }

    return ActionResponse({
      message: "Success",
      description: "Successfully retrieved subscription",
      data: subs,
      status: 200,
    });
  } catch (error) {
    console.log("Error in getting subscription", error);
    throw error;
  }
}
