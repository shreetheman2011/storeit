"use client";

import { P, paragraphVariants } from "@/components/custom/p";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/better-auth/auth-client";
import { RiGoogleFill, RiLoader3Fill } from "@remixicon/react";
import { useState } from "react";

interface Props {
  action: "Log In" | "Sign Up";
}

const AuthForm = ({ action }: Props) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Card className="w-96 drop-shadow-2xl">
      <CardHeader>
        <CardTitle
          className={paragraphVariants({ size: "large", weight: "bold" })}
        >
          {action}
        </CardTitle>
        <CardDescription>
          {action == "Log In"
            ? "Log in to access your account"
            : "Create an account today!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          disabled={isLoading}
          variant="lift"
          onClick={async () => {
            await authClient.signIn.social(
              {
                provider: "google",
                callbackURL: "/dashboard",
              },
              {
                onSuccess: () => {
                  toast({
                    title: "Success",
                    description:
                      "Redirection to google sign in page successfull",
                  });
                },
                onError: (c) => {
                  toast({
                    title: "Error",
                    description: c.error.message,
                  });
                },
                onRequest: () => {
                  setIsLoading(true);
                },
                onResponse: () => {
                  setIsLoading(false);
                },
              }
            );
          }}
        >
          {" "}
          {!isLoading ? (
            <RiGoogleFill />
          ) : (
            <RiLoader3Fill className="animate-spin" />
          )}
          {action} with Google
        </Button>

        <P
          variant="muted"
          size="small"
          weight="light"
          className="w-full text-center"
        >
          {action === "Log In" ? (
            <>
              Don&apos;t have an account?{" "}
              <a className="link" href="/sign-up">
                Create an account
              </a>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <a className="link" href="/sign-in">
                Log in
              </a>
            </>
          )}
        </P>
      </CardContent>
      <CardFooter className="flex-col gap-1">
        <p style={{ fontSize: 10, marginBottom: -4 }}>
          All rights reserved &copy; 2025. Google reserves all rights with OAuth
        </p>
        <p style={{ fontSize: 9, marginTop: -4 }}>
          <a
            target="_blank"
            href="https://docs.google.com/document/d/1aBLXHU-NmxnO1mCyPcYOpp8WvCbW0NDouJM5bmRk2qs/edit?usp=sharing"
          >
            Privacy Policy ;{" "}
          </a>
          <a
            target="_blank"
            href="https://docs.google.com/document/d/1DJ3_PM8tL8PDSyBAJAQpW4OkMBjD7t59iF1FZDGz4ZM/edit?usp=sharing"
          >
            Terms of Service ;{" "}
          </a>
          <a
            target="_blank"
            href="https://docs.google.com/document/d/1wCVMP6kSoEbSwAtT9uY6b7ssuLfPmtWbNGEaOi5xPAk/edit?usp=sharing"
          >
            Contact Us
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default AuthForm;
