import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Roboto } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import ToastProvider from '@/components/toast-provider';

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
});

export async function generateMetadata(): Promise<Metadata> {
  let title = "Hệ thống Quản lý Thiết bị";
  let description = "Trường Cao đẳng Bách khoa Nam Sài Gòn";
  let ogImage = "";
  let gscCode = "";

  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_OG_IMAGE_URL", "SEO_GSC_CODE"]
        }
      }
    });

    title = settings.find(s => s.key === "SEO_TITLE")?.value || title;
    description = settings.find(s => s.key === "SEO_DESCRIPTION")?.value || description;
    ogImage = settings.find(s => s.key === "SEO_OG_IMAGE_URL")?.value || "";
    gscCode = settings.find(s => s.key === "SEO_GSC_CODE")?.value || "";
  } catch (error) {
    console.error("Failed to fetch SEO settings:", error);
  }

  const metadata: Metadata = {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: ogImage ? [ogImage] : [],
      type: "website",
    },
  };

  if (gscCode) {
    metadata.verification = {
      google: gscCode,
    };
  }

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NextTopLoader 
          color="#3b82f6" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={true} 
          easing="ease" 
          speed={200} 
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6" 
        />
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
