const fs = require('fs');

const qaData = [
  {
    category: "React & Next.js 14 App Router",
    qas: [
      { q: "What is the App Router in Next.js 14 and how does it differ from the Pages Router?", a: "The App Router uses the `app/` directory and is built on React Server Components (RSC) by default. It supports nested layouts, streaming, and simplifies data fetching compared to the Pages Router which used `getServerSideProps` and `getStaticProps`." },
      { q: "How did we implement routing in MoneySaver?", a: "We used the App Router with folder-based routing. For example, `app/(dashboard)/dashboard/page.tsx` for the main dashboard, and dynamic routes like `app/api/v1/products/[id]/route.ts` for product-specific APIs." },
      { q: "What are React Server Components (RSC) and where are they used in this project?", a: "RSCs render exclusively on the server, reducing the client-side JavaScript bundle. In MoneySaver, layout components and static pages use RSCs by default, while interactive components like the search bar use the `'use client'` directive." },
      { q: "Why do we use the `'use client'` directive?", a: "It marks a component boundary indicating that the component and its imports should be rendered on the client. We use it for components needing state (`useState`), effects (`useEffect`), or browser APIs, like the dashboard search page." },
      { q: "Explain the purpose of `layout.tsx` in Next.js.", a: "`layout.tsx` defines a UI that is shared across multiple pages (e.g., a header or sidebar). In MoneySaver, we use it to wrap the dashboard pages with a consistent navigation structure." },
      { q: "How is data fetching handled in Next.js 14?", a: "Data fetching is typically done using the native `fetch` API directly within Server Components. It supports built-in caching and revalidation (e.g., `fetch(url, { next: { revalidate: 3600 } })`)." },
      { q: "What is Client-side Navigation and how does Next.js optimize it?", a: "Client-side navigation uses the `<Link>` component. Next.js prefetches the linked route in the background, making page transitions nearly instantaneous without full page reloads." },
      { q: "How did we implement the 'Buy Now' redirect?", a: "We used a Next.js API route (`app/r/[storeSlug]/route.ts`) that performs a 307 Temporary Redirect using `NextResponse.redirect()` to send the user to the merchant's site." },
      { q: "What is Next.js Middleware and how can it be used?", a: "Middleware allows running code before a request is completed. It's often used for authentication, rewriting routes, or setting cookies. We can use it to protect dashboard routes if not using a higher-level auth provider." },
      { q: "How does Next.js handle API routes in the App Router?", a: "API routes are defined using `route.ts` files inside the `app/` directory. They export async functions named after HTTP methods (e.g., `GET`, `POST`)." },
      { q: "Explain the `NextResponse` object.", a: "It extends the standard Web `Response` API with Next.js specific methods, like `NextResponse.json()` for returning JSON data or `NextResponse.redirect()` for routing." },
      { q: "How do we handle loading states in Next.js 14?", a: "We can use `loading.tsx` files which Next.js automatically wraps in a React `<Suspense>` boundary to show a fallback UI while the page content is loading." },
      { q: "What are Server Actions in Next.js?", a: "Server Actions are asynchronous functions executed on the server that can be called directly from client components, simplifying form submissions and data mutations." },
      { q: "How do we optimize images in Next.js?", a: "By using the `<Image>` component from `next/image`, which automatically optimizes formats, resizes images, and implements lazy loading." },
      { q: "What is the purpose of `page.tsx`?", a: "It represents the UI of a route segment. It is the file that makes a route publicly accessible." },
      { q: "How do we handle 404 errors in the App Router?", a: "By creating a `not-found.tsx` file in the appropriate directory to render a custom UI when a route doesn't exist or `notFound()` is called." },
      { q: "Explain error handling with `error.tsx`.", a: "`error.tsx` acts as an Error Boundary. It catches runtime errors in its route segment and displays a fallback UI, preventing the whole app from crashing." },
      { q: "What is the difference between static and dynamic rendering in Next.js?", a: "Static rendering happens at build time (or during revalidation), caching the result. Dynamic rendering happens at request time, useful for personalized or real-time data." },
      { q: "How can we force dynamic rendering for an API route?", a: "By using route segment config options like `export const dynamic = 'force-dynamic'` or by reading dynamic data like headers or cookies." },
      { q: "What is the purpose of `next.config.mjs`?", a: "It's the configuration file for Next.js where we define environment variables, custom headers, rewrites, and configure external image domains." },
      { q: "How do we manage global CSS in Next.js?", a: "By importing a global CSS file (like `globals.css`) in the root `layout.tsx`." },
      { q: "Explain the concept of Route Groups.", a: "Folders wrapped in parentheses, like `(dashboard)`, organize routes logically without affecting the URL path. They allow sharing layouts for a subset of pages." },
      { q: "What is Streaming in Next.js?", a: "Streaming allows breaking down the page's HTML into smaller chunks and progressively sending them to the client from the server, improving perceived performance." },
      { q: "How do we use `useRouter` in the App Router?", a: "Imported from `next/navigation`, it allows programmatic navigation (e.g., `router.push('/dashboard')`) in client components." },
      { q: "What is the difference between `next/router` and `next/navigation`?", a: "`next/router` was used in the Pages router. `next/navigation` provides the new hooks (`useRouter`, `usePathname`, `useSearchParams`) for the App Router." },
      { q: "How do we access URL search parameters?", a: "In server components, via the `searchParams` prop. In client components, using the `useSearchParams` hook." },
      { q: "What are dynamic route segments?", a: "Folders wrapped in square brackets (e.g., `[id]`) that extract the value from the URL to be used as a parameter in the page or route." },
      { q: "How do we handle SEO and metadata in Next.js 14?", a: "Using the Metadata API by exporting a `metadata` object or `generateMetadata` function from a `layout.tsx` or `page.tsx`." },
      { q: "What is the purpose of `_app.tsx` and `_document.tsx`?", a: "They are legacy files from the Pages router. In the App Router, their functionality is absorbed by the root `layout.tsx`." },
      { q: "How do we implement client-side state in a server component architecture?", a: "By pushing state down the component tree into smaller `'use client'` leaf components, leaving the majority of the tree as server components." }
    ]
  },
  {
    category: "TypeScript & System Architecture",
    qas: [
      { q: "Why use TypeScript for MoneySaver?", a: "TypeScript provides static typing, which catches errors at compile-time, improves developer experience with better autocomplete, and makes the codebase easier to refactor and maintain." },
      { q: "What is a generic type in TypeScript?", a: "Generics allow creating reusable components or functions that can work with a variety of types rather than a single one (e.g., our `getCachedSearch<T>` function)." },
      { q: "Explain the difference between `interface` and `type`.", a: "Both define custom object shapes. `interface` is better for extending and merging, while `type` is more flexible for unions, intersections, and mapped types." },
      { q: "How did we type the API responses?", a: "We defined interfaces like `SearchAPIResponse` and `SearchProductCard` in shared files or route files to ensure both the backend and frontend agree on the data structure." },
      { q: "What is strict mode in TypeScript?", a: "`strict: true` in `tsconfig.json` enables a wide range of type-checking behavior, including strict null checks, ensuring variables cannot unexpectedly be null or undefined." },
      { q: "How do we handle type narrowing?", a: "Using type guards (like `typeof`, `instanceof`, or custom predicates returning `x is Type`) to refine a broad type into a more specific one within a conditional block." },
      { q: "What is the `Record<K, V>` utility type?", a: "It constructs an object type whose property keys are `K` and property values are `V`. Used in our router for merchant URLs: `Record<string, string>`." },
      { q: "Explain the use of `Partial<T>`.", a: "It constructs a type with all properties of `T` set to optional. Useful for update functions where only a subset of properties might be provided." },
      { q: "What is an Enum in TypeScript?", a: "Enums allow defining a set of named constants. However, in modern TS, union types (e.g., `'BASE' | 'DISCOUNT'`) are often preferred for simplicity and better transpilation." },
      { q: "How do we use Type Assertions?", a: "Using the `as` keyword (e.g., `event.target as HTMLImageElement`) to override TS's inferred type when the developer knows more about the value's type." },
      { q: "What is the Worker pattern used in the backend?", a: "It's an object-oriented approach where each retailer (Amazon, Flipkart) implements a common `BaseWorker` interface, encapsulating retailer-specific scraping and normalization logic." },
      { q: "Why use a BaseWorker abstraction?", a: "It ensures a uniform API across all scrapers, making it easy to add new retailers without altering the core pipeline, adhering to the Open/Closed Principle." },
      { q: "What is Dependency Injection and is it used here?", a: "DI is a pattern where dependencies are passed into objects. While we don't use a heavy DI container, we pass configured clients (like Redis or DB) into our modules." },
      { q: "Explain the Singleton pattern.", a: "Ensures a class has only one instance and provides a global point of access. Our Redis and Drizzle DB clients are implemented as singletons to avoid exhausting connections." },
      { q: "What is the purpose of the Normalizer?", a: "It takes messy, disparate data from different sources and transforms it into a standard, unified schema (`NormalizedProduct`) so the rest of the application can process it uniformly." },
      { q: "How does the Matcher component work?", a: "It groups normalized products from different retailers that represent the same physical item, often using title similarity, brand extraction, and category heuristics." },
      { q: "Why separate the Stacker engine from the Scraper?", a: "Separation of Concerns. The scraper is only responsible for fetching raw prices. The Stacker engine independently calculates derived discounts based on user context (coupons, cards)." },
      { q: "What is Levenshtein distance?", a: "An algorithm that measures the difference between two strings (how many edits are needed to change one into the other). We use it for typo correction in search queries." },
      { q: "How do we handle error boundaries in the architecture?", a: "Frontend uses React Error Boundaries. Backend wraps external API calls (like SerpAPI or Redis) in try/catch blocks with sensible fallbacks (like Knowledge Base) to prevent catastrophic failures." },
      { q: "What is the role of `env.mjs`?", a: "It validates environment variables at runtime using Zod, ensuring the application fails fast during startup if required configuration (like `SERPAPI_KEY`) is missing." },
      { q: "Explain MVC and how it maps to our Next.js app.", a: "Next.js blurs MVC. Models are our Drizzle schemas. Views are our React components. Controllers are the Server Actions and API Route handlers." },
      { q: "What is rate limiting and why do we need it?", a: "Restricting the number of requests a user can make in a timeframe. We use Upstash Redis for this to prevent abuse, scraping of our own APIs, and to control SerpAPI costs." },
      { q: "How is caching integrated into the architecture?", a: "A Redis-backed caching layer sits in front of the SerpAPI call. If a search query hits the cache (TTL 15m), we bypass the expensive and slow external API." },
      { q: "What is the purpose of the Knowledge Base fallback?", a: "If the external API (SerpAPI) fails or we hit quota limits, the system seamlessly falls back to a static, structured product catalog to ensure the user never sees a broken page." },
      { q: "How does the `slugify` function aid architecture?", a: "It converts arbitrary strings (like retailer names or product titles) into URL-friendly, standardized strings, enabling consistent routing and database lookups." },
      { q: "What is the purpose of `tsconfig.json`?", a: "It specifies the root files and compiler options required to compile the project, including module resolution, strictness, and path aliases." },
      { q: "Explain the concept of 'Hydration'.", a: "The process where React attaches event listeners to the static HTML sent by the server, making the page interactive." },
      { q: "What is a Memory Leak and how do we prevent it in React?", a: "A leak occurs when resources aren't freed. Prevented by cleaning up event listeners, timers, or subscriptions in the `useEffect` cleanup function." },
      { q: "Why use `Date.now()` vs `performance.now()`?", a: "`Date.now()` gives absolute time (UNIX epoch), good for timestamps. `performance.now()` gives sub-millisecond precision relative to page load, better for profiling execution time." },
      { q: "What are the benefits of a Monorepo?", a: "While we use a single repo for the full stack (Next.js handles both frontend and backend), a true monorepo scales by sharing packages across multiple discrete applications (e.g., using Turborepo)." }
    ]
  },
  {
    category: "Drizzle ORM & Neon Postgres",
    qas: [
      { q: "What is Drizzle ORM and why choose it over Prisma?", a: "Drizzle is a lightweight, type-safe TypeScript ORM. It's chosen for its high performance, zero dependencies, SQL-like syntax, and excellent compatibility with serverless environments like Vercel." },
      { q: "How does Neon Serverless Postgres differ from traditional RDS?", a: "Neon separates compute and storage, allowing it to scale to zero when inactive and boot up instantly. This makes it extremely cost-effective for serverless applications." },
      { q: "Explain how schemas are defined in Drizzle.", a: "Schemas are defined as TypeScript variables mapping to tables using functions like `pgTable`, `varchar`, `timestamp`, and `integer`." },
      { q: "How do you define relationships (foreign keys) in Drizzle?", a: "Using the `references()` method on a column definition, e.g., `retailerId: varchar('retailer_id').references(() => retailers.id)`." },
      { q: "What is the purpose of `drizzle.config.ts`?", a: "It configures the Drizzle Kit CLI, specifying the location of the schema files and the database connection string for running migrations and introspections." },
      { q: "How do migrations work in Drizzle?", a: "Drizzle Kit reads changes in the TS schema, generates SQL migration files (e.g., `drizzle-kit generate`), which are then applied to the database (`drizzle-kit push` or running them programmatically)." },
      { q: "What is a Connection Pool?", a: "A cache of database connections maintained so that connections can be reused when future requests to the database are required, heavily optimizing latency in serverless." },
      { q: "How do you perform a JOIN in Drizzle?", a: "Using the `.leftJoin()`, `.innerJoin()` methods on a query builder, or using Drizzle's Relational Queries API (e.g., `db.query.users.findMany({ with: { cards: true } })`)." },
      { q: "Explain SQL Injection and how Drizzle prevents it.", a: "SQL injection is an attack where malicious SQL statements are inserted into entry fields. Drizzle prevents this by automatically using parameterized queries for all inputs." },
      { q: "How do you handle timestamps like 'createdAt' and 'updatedAt'?", a: "Using `timestamp('created_at').defaultNow().notNull()` and handling `updatedAt` either through triggers or application logic." },
      { q: "What is the `JSONB` data type?", a: "A PostgreSQL specific data type for storing JSON data in a binary format, allowing for efficient querying and indexing of nested JSON structures. Used for dynamic product attributes." },
      { q: "How do you execute raw SQL in Drizzle?", a: "Using the `sql` template literal tag, e.g., `db.execute(sql\`SELECT * FROM users\`)`." },
      { q: "What are Indexes and when should you use them?", a: "Indexes speed up data retrieval operations on a table at the cost of slower writes and increased storage. Use them on columns frequently used in `WHERE`, `JOIN`, or `ORDER BY` clauses." },
      { q: "Explain the `serial` vs `uuid` data types for primary keys.", a: "`serial` auto-increments an integer. `uuid` generates a globally unique identifier. We often use `uuid` or `varchar` (like `cuid`) for security (unguessable URLs) and distributed systems." },
      { q: "How do you handle database seeding?", a: "By writing a script (like `db/seed.ts`) that imports the schema and Drizzle instance, then executes `db.insert(table).values([...])` to populate initial data." },
      { q: "What is an upsert operation?", a: "An operation that inserts a new row if it doesn't exist, or updates it if a collision occurs (e.g., ON CONFLICT DO UPDATE). Useful for syncing product prices." },
      { q: "How does transaction management work in Drizzle?", a: "Using `db.transaction(async (tx) => { ... })`. If the callback throws an error, all operations within the transaction are rolled back." },
      { q: "What is a one-to-many relationship?", a: "A relationship where one record in Table A relates to multiple records in Table B. E.g., One User has Many UserCards." },
      { q: "How do you soft-delete records?", a: "Instead of a hard `DELETE`, you add an `isDeleted` boolean or `deletedAt` timestamp column, and filter out those records in application queries." },
      { q: "Why is the `RETURNING` clause useful in Postgres?", a: "It allows an `INSERT`, `UPDATE`, or `DELETE` statement to return the affected rows, avoiding the need for a subsequent `SELECT` query." },
      { q: "What is the N+1 query problem?", a: "A performance anti-pattern where an application executes one query to get a list of records, and then N additional queries to fetch related data for each record. Solved using JOINs or batching." },
      { q: "Explain the purpose of the `priceHistory` table.", a: "It tracks the price changes of a specific `retailerProductId` over time, enabling features like price drop notifications and historical charts." },
      { q: "How do you query by a date range in Drizzle?", a: "Using operators like `gt`, `gte`, `lt`, `lte`. E.g., `where(gte(table.createdAt, startDate))`." },
      { q: "What does `drizzle-kit push` do?", a: "It rapidly syncs the database schema with your TypeScript schema without generating migration files. Useful for rapid local prototyping." },
      { q: "How do you limit and offset queries for pagination?", a: "Using the `.limit(10).offset(20)` methods on the query builder." },
      { q: "What is the 'infer' utility in Drizzle?", a: "It allows you to infer the TypeScript type of a select or insert operation directly from the schema definition, e.g., `type User = typeof users.$inferSelect`." },
      { q: "How are enums handled in Postgres via Drizzle?", a: "Using `pgEnum('name', ['val1', 'val2'])` which maps strictly to Postgres ENUM types for data integrity." },
      { q: "What happens if a Vercel function loses its Neon connection?", a: "Serverless Postgres drivers (like `@neondatabase/serverless`) use WebSockets or HTTP to handle connections statelessly, minimizing connection drop issues." },
      { q: "Explain the concept of connection pooling with PgBouncer.", a: "PgBouncer acts as a middleman, holding a small number of persistent connections to Postgres and multiplexing thousands of short-lived client connections onto them." },
      { q: "Why use `varchar` over `text`?", a: "In Postgres, there is no performance difference. `varchar(n)` simply adds a length constraint. We use `varchar` for IDs and short strings to enforce limits." }
    ]
  },
  {
    category: "Upstash Redis & Caching",
    qas: [
      { q: "What is Redis?", a: "An open-source, in-memory key-value data store used primarily as a cache, message broker, and quick database for ephemeral data." },
      { q: "Why use Upstash for Redis?", a: "Upstash provides a serverless, HTTP/REST-based Redis service. Standard Redis requires TCP connections, which don't work natively in edge/serverless environments like Vercel." },
      { q: "How does caching improve application performance?", a: "It stores the result of expensive operations (like a SerpAPI scrape or a complex DB query) in fast memory. Subsequent requests return immediately from the cache." },
      { q: "What is a TTL (Time To Live)?", a: "A setting that dictates how long a key-value pair remains in the cache before expiring. We use 15 mins for searches and 24h for store metadata." },
      { q: "Explain the cache key format `ms:search:${normalizedQuery}`.", a: "It's a namespacing convention. `ms` identifies the app, `search` is the context, and the normalized query ensures identical searches hit the same cache key regardless of casing or spacing." },
      { q: "What happens on a cache miss?", a: "The application proceeds to fetch the data from the primary source (SerpAPI), processes it, stores the result in the cache, and then returns it to the user." },
      { q: "Why did we make `getCachedSearch` accept a generic `<T>` type?", a: "To make the caching utility flexible enough to accept any JSON-serializable object shape (like our new SerpAPI response) without being hardcoded to legacy interfaces." },
      { q: "What is the risk of caching pricing data?", a: "Prices change. If the TTL is too long, users see stale prices and might face disappointment at checkout. 15 minutes is a sweet spot between freshness and performance." },
      { q: "How do you handle Redis connection errors?", a: "Wrap Redis operations in `try/catch`. On failure, log the error but allow the application to proceed gracefully to the primary data source (fail-open strategy)." },
      { q: "What is Rate Limiting and how does Redis enable it?", a: "Redis commands like `INCR` (increment) and `EXPIRE` allow tracking the number of requests per IP in a time window incredibly fast, rejecting requests over the limit." },
      { q: "Explain the difference between `GET` and `MGET`.", a: "`GET` retrieves a single key. `MGET` retrieves multiple keys in one atomic operation, reducing network round trips." },
      { q: "What is Cache Invalidation?", a: "The process of removing or updating cached data when the source data changes. In our app, we rely mostly on TTLs rather than manual invalidation for search." },
      { q: "Can you store objects directly in Redis?", a: "No, Redis stores strings. Objects must be serialized to JSON (`JSON.stringify`) before storing, and parsed (`JSON.parse`) upon retrieval. (Upstash SDK handles this automatically)." },
      { q: "What is the Thundering Herd problem?", a: "When a popular cached item expires, hundreds of concurrent requests might simultaneously experience a cache miss and hit the backend/API, causing overload." },
      { q: "What is a Cache Stampede prevention technique?", a: "Techniques like adding a small random jitter to TTLs, or having a background worker refresh the cache slightly before expiration." },
      { q: "Why is Upstash Redis accessed via `fetch` instead of a TCP client?", a: "Vercel edge functions and serverless functions prefer stateless HTTP requests. The `@upstash/redis` SDK translates Redis commands into HTTP POST requests." },
      { q: "What is `redis.setnx`?", a: "'Set if Not eXists'. It's used for distributed locks to ensure only one process performs a specific task at a time." },
      { q: "How do we normalize a search query for caching?", a: "Lowercase it, trim whitespace, replace multiple spaces with single underscores, and remove non-alphanumeric characters to ensure high cache hit rates." },
      { q: "What happens when Redis runs out of memory?", a: "It uses an eviction policy (like LRU - Least Recently Used) to delete older keys to make room for new ones." },
      { q: "What is the difference between Cache-Aside and Write-Through?", a: "Cache-Aside: App reads from cache, if miss, reads from DB and writes to cache. Write-Through: App writes to cache, which synchronously writes to DB. We use Cache-Aside." }
    ]
  },
  {
    category: "Scraping, SerpAPI, & Data Pipeline",
    qas: [
      { q: "What is SerpAPI?", a: "A service that provides structured JSON APIs for search engine results. We use their Google Shopping API to scrape real-time product prices across Indian retailers." },
      { q: "Why use SerpAPI instead of Puppeteer/Playwright?", a: "Running headless browsers on Vercel is highly problematic due to size limits and timeouts. SerpAPI offloads the heavy lifting, IP rotation, and CAPTCHA solving to a dedicated provider." },
      { q: "What does the `gl=in` parameter do in SerpAPI?", a: "Sets the geolocation to India, ensuring the Google Shopping results reflect Indian retailers (Amazon.in, Flipkart, etc.) and currency (INR)." },
      { q: "How do we group products from different retailers?", a: "We generate a 'grouping key' based on the first 3-4 significant words of the product title, allowing us to cluster identical items (e.g., 'iPhone 15 128GB') into a single card." },
      { q: "What is the purpose of the `buildRetailerUrl` function?", a: "SerpAPI returns intermediary Google Shopping redirect URLs. This function constructs verified direct search URLs for retailers (e.g., `amazon.in/s?k=...`) so the 'Buy Now' button opens the real store." },
      { q: "How does the backend prevent scraping the same merchant multiple times for the same product?", a: "We group the results by merchant and use deduplication logic, typically keeping the listing with the lowest `currentPrice` for each retailer." },
      { q: "What happens if a user searches for an arbitrary string like 'asdbs'?", a: "SerpAPI will return no shopping results. Our API detects the empty array, and the frontend gracefully displays a 'No results found' state." },
      { q: "Why do we enforce a 12-second AbortSignal timeout on the API route?", a: "Vercel Hobby tier times out functions at 10-15 seconds. The AbortSignal ensures we fail gracefully and return a fallback rather than hanging the server and crashing the client." },
      { q: "How do we extract the Brand from a product title?", a: "Using an array of known brands and regex matching. E.g., if 'Nike' is in the title, we extract it as the brand to display on the UI." },
      { q: "What are 'Raw Offers' in the context of the scraper?", a: "Promotional text snippets provided by the retailer in the Google Shopping listing (e.g., '10% off with HDFC', 'Free Delivery'). We display these as tags on the UI." },
      { q: "Explain the difference between Web Scraping and an API.", a: "APIs provide structured data (JSON) designed for consumption. Scraping involves fetching unstructured HTML pages and parsing them (using Cheerio or regex) to extract data." },
      { q: "Why is web scraping Amazon directly so difficult?", a: "Amazon employs aggressive anti-bot measures, IP blocking, CAPTCHAs, and frequent DOM structure changes. Hence, leveraging Google Shopping via SerpAPI is more reliable." },
      { q: "What is Cheerio?", a: "A fast, flexible, and lean implementation of core jQuery designed specifically for the server (Node.js). Used to parse and manipulate HTML." },
      { q: "How do you handle pagination when scraping?", a: "By identifying the 'Next Page' link or URL parameter and recursively or iteratively fetching pages until a limit is reached or no more pages exist." },
      { q: "What is the role of the User-Agent header in scraping?", a: "It identifies the client requesting the resource. Bots often spoof common browser User-Agents to avoid being blocked by WAFs (Web Application Firewalls)." },
      { q: "What are Proxy Servers and why are they used in scraping?", a: "Intermediary servers that route requests. Used to rotate IP addresses to avoid rate limits and geographical blocks imposed by target websites." },
      { q: "How do we normalize prices?", a: "Remove currency symbols ('₹', '$'), commas, and text, then parse the remaining string into a float or integer." },
      { q: "What is the purpose of the Knowledge Base fallback?", a: "If SerpAPI fails or quotas are exhausted, we query a local, structured object (the KB) to provide reference data, ensuring the app remains functional." },
      { q: "How do we determine if an item is 'In Stock'?", a: "By looking for specific text cues in the listing or API response (e.g., absence of 'Out of Stock' or presence of a delivery estimate)." },
      { q: "What is an `AbortController` in JavaScript?", a: "An interface that allows you to abort one or more Web requests as and when desired, preventing hanging network calls." }
    ]
  },
  {
    category: "Savings Stacker Engine & Core Logic",
    qas: [
      { q: "What is the Savings Stacker Engine?", a: "The core business logic module that sequentially applies multiple discount layers (store discount, coupons, gift cards, bank offers, cashback) to calculate the Net Payable Price." },
      { q: "Why must savings be applied sequentially rather than additively?", a: "Because discounts are usually applied to the remaining balance, not the MRP. (e.g., A 10% coupon applies to the selling price, not the base MRP)." },
      { q: "How does the Stacker handle Flat vs. Percentage discounts?", a: "It checks the discount type. For 'PERCENTAGE', it calculates `currentPrice * (value/100)`. For 'FLAT', it subtracts the exact value." },
      { q: "What is a Maximum Discount Cap?", a: "A limit on a percentage discount (e.g., '10% off up to ₹1000'). The engine uses `Math.min(calculatedDiscount, maxCap)`." },
      { q: "How does the Bank Offer logic work?", a: "It cross-references the user's registered cards (`userCards`) against active merchant offers (`bankOffers`). If a match exists and cart value meets the minimum, the discount is applied." },
      { q: "What are Zave/Gyftr Vouchers?", a: "Platforms that sell merchant gift cards at a discount (e.g., buy a ₹5000 Amazon voucher for ₹4750). The stacker simulates buying and applying these to lower the net price." },
      { q: "How do we handle Affiliate Cashback?", a: "We define baseline cashback percentages for portals like CashKaro. This is treated as a delayed saving (subtracted from Net Payable but noted as cashback)." },
      { q: "What is the ASCI Affiliate Disclosure?", a: "A required legal notice stating that the platform may earn a commission from affiliate links, ensuring transparency with the user." },
      { q: "Why do we require the user to hit 'Enter' or click a button to search?", a: "Debounced keystroke searching was causing too many expensive API calls and exhausting the SerpAPI quota rapidly. A manual trigger gives the user control." },
      { q: "Explain the `ViewStackModal` component.", a: "A React component that breaks down the mathematical calculation of the Net Payable price layer-by-layer for user transparency." },
      { q: "How are community coupons validated?", a: "We track `upvotes` and `downvotes` in the database. Coupons with too many downvotes are flagged and excluded from the Stacker Engine." },
      { q: "What is the OCR Coupon Vault?", a: "A feature that parses user-uploaded screenshots of scratch cards (from GPay/PhonePe) using Vision AI to extract the promo code and store it in their vault." },
      { q: "How do you handle edge cases where a coupon and a bank offer are mutually exclusive?", a: "The stacker engine evaluates the combination rules. If exclusive, it calculates the net price for both scenarios and selects the path that yields the lowest price." },
      { q: "What is the difference between MRP and Selling Price?", a: "MRP is the Maximum Retail Price. Selling Price (Current Price) is what the retailer lists it for after their base platform discount. The Stacker starts from the Selling Price." },
      { q: "Why do we use `Math.max(0, value)` when applying discounts?", a: "To ensure the net payable amount never drops below zero, preventing negative pricing anomalies." },
      { q: "How do you handle currency formatting on the frontend?", a: "Using `Number.prototype.toLocaleString('en-IN')` to format numbers according to the Indian numbering system (lakhs/crores)." },
      { q: "What is a 'Confidence Score' in the search results?", a: "A metric (e.g., 1.0 for Live API data, 0.85 for Knowledge Base data) indicating to the user how reliable and recent the pricing data is." },
      { q: "How do we structure the `MerchantProductOffer` object?", a: "It contains explicit fields for every discount layer (`mrp`, `currentPrice`, `couponCode`, `couponDiscount`, `bankOfferDiscount`, `netFinalPayable`) to easily map to the UI." },
      { q: "What happens if a retailer is not supported by the stacker?", a: "The stacker gracefully returns the base selling price without throwing an error, indicating no additional stackable offers are available." },
      { q: "How is the 'Trending Searches' feature populated?", a: "Currently via hardcoded popular terms, but structurally designed to be hydrated by Redis analytics tracking the most frequent search queries." }
    ]
  },
  {
    category: "Tailwind CSS, UI/UX, & Frontend",
    qas: [
      { q: "What is Tailwind CSS?", a: "A utility-first CSS framework that allows building custom designs by composing utility classes (like `flex`, `pt-4`, `text-center`) directly in the markup." },
      { q: "How do you implement Dark Mode in Tailwind?", a: "MoneySaver uses a forced dark mode aesthetic. We use `slate-950` for backgrounds, `slate-800` for borders, and `emerald-400` for accents." },
      { q: "What is Glassmorphism and how is it implemented?", a: "A UI trend featuring translucent, blurred backgrounds. Implemented in Tailwind using `bg-opacity` (e.g., `bg-slate-950/80`) combined with `backdrop-blur-md`." },
      { q: "How do you create a spinning loading indicator in Tailwind?", a: "By using a border with one transparent side and the `animate-spin` class: `w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin`." },
      { q: "Explain Responsive Design in Tailwind.", a: "Tailwind uses mobile-first media query breakpoints (e.g., `sm:`, `md:`, `lg:`). A class like `text-sm sm:text-base` is small on mobile, but base size on screens wider than the `sm` breakpoint." },
      { q: "What is the `group` class used for?", a: "It allows a child element to style itself based on the state of a parent element (e.g., `group-hover:opacity-100` makes a child visible only when the parent is hovered)." },
      { q: "How do you prevent an image from breaking the layout if it fails to load?", a: "Using the `onError` synthetic event in React: `onError={(e) => { e.currentTarget.style.display = 'none' }}`." },
      { q: "What is the purpose of the `truncate` class?", a: "It applies `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap` to prevent text from wrapping and append an ellipsis if it exceeds the container width." },
      { q: "How do you hide the scrollbar while keeping elements scrollable?", a: "Using custom CSS or a Tailwind plugin to apply `::-webkit-scrollbar { display: none; }` and `-ms-overflow-style: none;`." },
      { q: "Explain the Flexbox properties `justify-between` and `items-center`.", a: "`justify-between` distributes space evenly between flex items along the main axis. `items-center` aligns items along the cross axis in the center." },
      { q: "How do you create a modal overlay?", a: "Using `fixed inset-0 z-50 flex items-center justify-center bg-black/80` to cover the entire viewport and center the modal content." },
      { q: "What is the purpose of the `useRef` hook in the search component?", a: "We use it (`inputRef`) to directly access the DOM node of the input field, allowing us to programmatically `focus()` it when the user clicks 'Clear Search'." },
      { q: "How do you handle conditional class names in React/Tailwind?", a: "Using template literals (`` `class1 ${condition ? 'class2' : 'class3'}` ``) or a utility library like `clsx` or `tailwind-merge`." },
      { q: "What is 'Debouncing' and why was it removed from the search input?", a: "Debouncing delays the execution of a function until after a pause. It was removed because users typing erratically were still triggering too many expensive SerpAPI calls." },
      { q: "How is the Mobile Navigation implemented?", a: "As a `fixed bottom-0 w-full` bar that appears only on small screens, providing quick access to Home, Cards, Vault, and Profile using icons." }
    ]
  },
  {
    category: "Deployment, CI/CD, & GitHub",
    qas: [
      { q: "How is MoneySaver deployed?", a: "It is deployed on Vercel, which natively supports Next.js, automatically configuring Serverless Functions for API routes and Edge Functions for middleware." },
      { q: "What is the `.env.example` file for?", a: "It provides a template of all required environment variables without exposing the actual secrets, helping other developers configure their local environments." },
      { q: "Why do we add `.env` to `.gitignore`?", a: "To prevent committing sensitive API keys (SerpAPI, Database URLs, Clerk secrets) to a public GitHub repository, avoiding security breaches." },
      { q: "What is a 'Build' step in Next.js?", a: "Running `next build` compiles TypeScript, bundles React components, optimizes images, and generates static HTML files for routes that can be prerendered." },
      { q: "How did we resolve the TypeScript Map iteration build error?", a: "Vercel's TS compiler complained about iterating a Map directly without `--downlevelIteration`. We fixed it by wrapping the Map in `Array.from(groups)`." },
      { q: "What is the purpose of the `npm run build` command before deploying?", a: "To catch any compilation or type-checking errors locally before pushing to Vercel, ensuring the production deployment succeeds." },
      { q: "Explain Continuous Integration (CI).", a: "The practice of automating the integration of code changes from multiple contributors into a single software project. Vercel acts as our CI by automatically building PRs." },
      { q: "What does `git push origin master` do?", a: "It uploads local repository content from the `master` branch to the remote repository (GitHub) named `origin`." },
      { q: "How does Vercel handle environment variables?", a: "They are securely stored in the Vercel dashboard and injected into the Node.js runtime (`process.env`) during the build and execution phases." },
      { q: "What is an Edge Function?", a: "A serverless function that runs on a CDN edge node close to the user, providing extremely low latency. We use them for middleware." },
      { q: "How did we verify our production deployment?", a: "By testing the live URL, ensuring the 'Buy Now' links redirect correctly to the merchant, and monitoring Vercel deployment logs for any runtime errors." },
      { q: "What is the purpose of `package-lock.json`?", a: "It locks down the exact versions of all installed dependencies, ensuring reproducible builds across different environments and developers." }
    ]
  }
];

let markdown = "# 💰 MoneySaver (SaverStack) — Comprehensive Interview Guide\n" +
"> A complete collection of 150+ in-depth technical interview questions and answers derived from building the MoneySaver platform. Covers Next.js, Drizzle, Redis, SerpAPI, System Architecture, UI/UX, and CI/CD.\n\n";

let counter = 1;

qaData.forEach((section) => {
  markdown += "## 📌 " + section.category + "\n\n";
  section.qas.forEach((qa) => {
    markdown += "### Q" + counter + ": " + qa.q + "\n";
    markdown += "**Answer:** " + qa.a + "\n\n---\n\n";
    counter++;
  });
});

fs.writeFileSync('docs/MoneySaver_Interview_QA.md', markdown);
console.log('Markdown generated successfully.');
