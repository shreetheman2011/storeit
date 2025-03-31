import Image from "next/image";
import { P } from "@/components/custom/p";
import { cn } from "@/lib/utils";
import { Children } from "@/props/types";

const Layout = ({ children }: Children) => (
  <main className="flex items-center justify-center w-full h-screen bg-red-700">
    {/* Left Side - Branding Section */}
    <div className="hidden md:flex flex-1 h-full items-center justify-center p-8 bg-gradient-to-br from-red-600 to-red-800">
      <div className="max-w-md text-center">
        <Image
          src="/filesclipart.png"
          alt="Files Clipart"
          width={150}
          height={150}
          className="mx-auto mb-4 transition-transform duration-300 hover:rotate-6 hover:scale-110"
        />

        <h1
          className={cn(
            "text-white text-4xl font-bold tracking-widest drop-shadow-xl font-outfit"
          )}
        >
          StoreIt
        </h1>
        <P className="text-white mt-4 text-lg leading-relaxed">
          The only storage solution you need. <br />
          Upload as many files as you want and securely share/store them!
        </P>
      </div>
    </div>

    {/* Right Side - Content Section */}
    <div className="flex-1 w-full h-full flex items-center justify-center p-6 bg-gray-100 rounded-lg shadow-xl">
      {children}
    </div>
  </main>
);

export default Layout;
