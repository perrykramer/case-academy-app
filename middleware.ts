import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)","/(api|trpc)(.*)"],
};
```

Save, then:
```
git add .
git commit -m "fix middleware syntax"
git push origin main