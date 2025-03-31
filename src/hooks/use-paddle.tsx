"use client";
import { useEffect, useState } from "react";
import { Paddle, initializePaddle } from "@paddle/paddle-js";
import { useToast } from "./use-toast";
import { NEXT_PUBLIC_PADDLE_CLIENT_TOKEN } from "@/lib/env";
import { parseError } from "@/lib/utils";

const usePaddle = () => {
  const [paddle, setPaddle] = useState<Paddle>();
  const { toast } = useToast();

  useEffect(() => {
    async function initiatePaddle() {
      if (paddle?.Initialize) {
        return;
      }

      try {
        const paddleInstance = await initializePaddle({
          environment: "sandbox",
          token: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          eventCallback: (data) => {
            console.log(data);
          },
          checkout: {
            settings: {
              displayMode: "overlay",
              theme: "light",
              locale: "en",
            },
          },
        });

        if (paddleInstance) {
          setPaddle(paddleInstance);
        }
      } catch (error) {
        console.log("Error while initializing", error);
        const err = parseError(error);
        toast({
          title: "Error",
          description: err,
        });
      }
    }

    initiatePaddle();
  }, []);

  return paddle;
};

export default usePaddle;
