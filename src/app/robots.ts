import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/dashboard",
          "/api/",
          "/checkout",
          "/cart",
          "/wishlist",
          "/login",
          "/register",
          "/forgot-password",
          "/verify-otp",
          "/reset-password"
        ]
      }
    ],
    sitemap: "https://www.saweracollection.com/sitemap.xml"
  };
}
