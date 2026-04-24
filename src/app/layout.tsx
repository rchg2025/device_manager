import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý Thiết bị",
  description: "Trường Cao đẳng Bách khoa Nam Sài Gòn",
};

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
        {children}
      </body>
    </html>
  );
}
