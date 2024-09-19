"use client"
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@apollo/client";
import { ApolloWrapper } from "./ApolloWrapper";


const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
        <body className={inter.className}>
        <ApolloWrapper>{children}</ApolloWrapper>

        </body>
    </html>
  );
}
