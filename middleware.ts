import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!.*\\..*|_next).*)","/(api|trpc)(.*)"],
};
```

Save, then:
```
git add .
git commit -m "force nodejs runtime for middleware"
git push origin main