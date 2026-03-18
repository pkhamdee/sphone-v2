"""
sPhone Load Generator
=====================
Six user personas split across two targets:

  Direct API (http://localhost:5154)
  ─────────────────────────────────
  BrowseUser          (weight 4) — anonymous visitor browsing products
  RegisterAndBuyUser  (weight 2) — new customer: register → login → create order
  ReturningCustomer   (weight 3) — existing customer: login → dashboard → payment schedule

  Frontend via sphone-app (http://localhost:3000)
  ────────────────────────────────────────────────
  FrontendBrowseUser  (weight 4) — page loads + products via proxy
  FrontendBuyUser     (weight 2) — register → login → apply → order via proxy
  FrontendDashUser    (weight 3) — returning user: dashboard loop via proxy

Frontend personas route through /api/proxy → Next.js server → sphone-api,
creating the full sphone-app → sphone-api → postgresql/redis/kafka trace chain.
"""

import random
from locust import HttpUser, task, between

API_HOST      = "http://localhost:5154"
FRONTEND_HOST = "http://localhost:3000"

INSTALLMENT_MONTHS = [3, 6, 12, 18, 24]


# ---------------------------------------------------------------------------
# Data helpers
# ---------------------------------------------------------------------------

def _national_id() -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(13))


def _phone() -> str:
    prefix = random.choice(["06", "08", "09"])
    return prefix + "".join(str(random.randint(0, 9)) for _ in range(8))


def _full_name() -> str:
    firsts = ["Somchai", "Somying", "Wanchai", "Malee", "Prasert", "Napa", "Kanya", "Araya"]
    lasts  = ["Jaidee", "Kaewkla", "Thongdee", "Srisuk", "Pongpan", "Rakkaew", "Charoenwong"]
    return f"{random.choice(firsts)} {random.choice(lasts)}"


def _dob() -> str:
    y = random.randint(1970, 1998)
    m = random.randint(1, 12)
    d = random.randint(1, 28)
    return f"{y}-{m:02d}-{d:02d}"


# ---------------------------------------------------------------------------
# Auth mixins — one per target so paths stay correct
# ---------------------------------------------------------------------------

class _ApiAuthMixin:
    """Auth via sphone-api directly (/api/...)."""

    def _register_and_login(self):
        national_id = _national_id()
        phone       = _phone()

        resp = self.client.post(
            "/api/auth/register",
            json={"nationalId": national_id, "fullName": _full_name(),
                  "phoneNumber": phone, "dateOfBirth": _dob()},
            name="/api/auth/register",
        )
        if resp.status_code not in (201, 409):
            return None, None, None

        resp = self.client.post(
            "/api/auth/login",
            json={"nationalId": national_id, "phoneNumber": phone},
            name="/api/auth/login",
        )
        if resp.status_code != 200:
            return None, national_id, phone

        return resp.json().get("token"), national_id, phone

    def _auth(self):
        return {"Authorization": f"Bearer {self.token}"} if getattr(self, "token", None) else {}


class _AppAuthMixin:
    """Auth via sphone-app proxy (/api/proxy/...).
    Exercises the full sphone-app → sphone-api traced path."""

    def _register_and_login(self):
        national_id = _national_id()
        phone       = _phone()

        resp = self.client.post(
            "/api/proxy/auth/register",
            json={"nationalId": national_id, "fullName": _full_name(),
                  "phoneNumber": phone, "dateOfBirth": _dob()},
            name="/api/proxy/auth/register",
        )
        if resp.status_code not in (201, 409):
            return None, None, None

        resp = self.client.post(
            "/api/proxy/auth/login",
            json={"nationalId": national_id, "phoneNumber": phone},
            name="/api/proxy/auth/login",
        )
        if resp.status_code != 200:
            return None, national_id, phone

        return resp.json().get("token"), national_id, phone

    def _auth(self):
        return {"Authorization": f"Bearer {self.token}"} if getattr(self, "token", None) else {}


# ===========================================================================
# Direct API personas  (target: sphone-api :5154)
# ===========================================================================

class BrowseUser(HttpUser, _ApiAuthMixin):
    """Anonymous visitor: home → products → product detail."""

    host      = API_HOST
    weight    = 4
    wait_time = between(1, 3)

    @task(1)
    def health(self):
        self.client.get("/api/health", name="/api/health")

    @task(5)
    def list_products(self):
        self.client.get("/api/products", name="/api/products")

    @task(3)
    def list_products_by_category(self):
        cat = random.choice([1, 2, 3, 4, 5])
        self.client.get(f"/api/products?category={cat}", name="/api/products?category=*")

    @task(4)
    def view_product_detail(self):
        resp = self.client.get("/api/products", name="/api/products")
        if resp.status_code == 200:
            products = resp.json()
            if products:
                pid = random.choice(products)["id"]
                self.client.get(f"/api/products/{pid}", name="/api/products/[id]")


class RegisterAndBuyUser(HttpUser, _ApiAuthMixin):
    """New customer journey: register → login → browse → create order."""

    host      = API_HOST
    weight    = 2
    wait_time = between(2, 6)

    def on_start(self):
        self.token     = None
        self.products  = []
        self.order_ids = []

        token, _, _ = self._register_and_login()
        self.token = token

        resp = self.client.get("/api/products", name="/api/products")
        if resp.status_code == 200:
            self.products = resp.json()

    @task(4)
    def browse_products(self):
        self.client.get("/api/products", name="/api/products")

    @task(2)
    def my_profile(self):
        if not self.token:
            return
        self.client.get("/api/customers/me", headers=self._auth(), name="/api/customers/me")

    @task(2)
    def my_orders(self):
        if not self.token:
            return
        self.client.get("/api/orders/my", headers=self._auth(), name="/api/orders/my")

    @task(3)
    def create_order(self):
        if not self.token or not self.products:
            return

        product      = random.choice(self.products)
        price        = product["price"]
        down_payment = round(price * random.uniform(0.05, 0.3), 2)
        months       = random.choice(INSTALLMENT_MONTHS)

        resp = self.client.post(
            "/api/orders",
            json={"productId": product["id"], "downPayment": down_payment, "totalMonths": months},
            headers=self._auth(),
            name="/api/orders",
        )
        if resp.status_code == 201:
            oid = resp.json().get("orderId")
            if oid:
                self.order_ids.append(oid)
                self.client.get(
                    f"/api/payments/schedule/{oid}",
                    headers=self._auth(),
                    name="/api/payments/schedule/[orderId]",
                )

    @task(1)
    def view_payment_schedule(self):
        if not self.token or not self.order_ids:
            return
        oid = random.choice(self.order_ids)
        self.client.get(
            f"/api/payments/schedule/{oid}",
            headers=self._auth(),
            name="/api/payments/schedule/[orderId]",
        )


class ReturningCustomer(HttpUser, _ApiAuthMixin):
    """Returning customer: login → check dashboard → view payment schedule."""

    host      = API_HOST
    weight    = 3
    wait_time = between(3, 8)

    def on_start(self):
        self.token     = None
        self.order_ids = []

        token, _, _ = self._register_and_login()
        self.token = token

        if not self.token:
            return

        resp = self.client.get("/api/products", name="/api/products")
        if resp.status_code != 200 or not resp.json():
            return

        product = random.choice(resp.json())
        resp = self.client.post(
            "/api/orders",
            json={"productId": product["id"],
                  "downPayment": round(product["price"] * 0.1, 2),
                  "totalMonths": 12},
            headers=self._auth(),
            name="/api/orders",
        )
        if resp.status_code == 201:
            self.order_ids.append(resp.json().get("orderId"))

    @task(4)
    def dashboard(self):
        if not self.token:
            return
        self.client.get("/api/customers/me", headers=self._auth(), name="/api/customers/me")
        self.client.get("/api/orders/my",    headers=self._auth(), name="/api/orders/my")

    @task(3)
    def view_payment_schedule(self):
        if not self.token or not self.order_ids:
            return
        oid = random.choice(self.order_ids)
        self.client.get(
            f"/api/payments/schedule/{oid}",
            headers=self._auth(),
            name="/api/payments/schedule/[orderId]",
        )

    @task(2)
    def browse_products(self):
        self.client.get("/api/products", name="/api/products")

    @task(1)
    def re_login(self):
        token, _, _ = self._register_and_login()
        if token:
            self.token = token


# ===========================================================================
# Frontend personas  (target: sphone-app :3000)
# All API calls go through /api/proxy → Next.js server → sphone-api,
# producing the full end-to-end trace: sphone-app → sphone-api → pg/redis/kafka
# ===========================================================================

class FrontendBrowseUser(HttpUser, _AppAuthMixin):
    """Anonymous visitor hitting Next.js pages + product API via proxy."""

    host      = FRONTEND_HOST
    weight    = 4
    wait_time = between(2, 5)

    @task(3)
    def home_page(self):
        self.client.get("/", name="/")

    @task(5)
    def products_page(self):
        self.client.get("/products", name="/products")

    @task(2)
    def login_page(self):
        self.client.get("/login", name="/login")

    @task(2)
    def register_page(self):
        self.client.get("/register", name="/register")

    @task(5)
    def products_via_proxy(self):
        self.client.get("/api/proxy/products", name="/api/proxy/products")

    @task(3)
    def products_by_category_via_proxy(self):
        cat = random.choice([1, 2, 3, 4, 5])
        self.client.get(f"/api/proxy/products?category={cat}", name="/api/proxy/products?category=*")

    @task(4)
    def product_detail_via_proxy(self):
        resp = self.client.get("/api/proxy/products", name="/api/proxy/products")
        if resp.status_code == 200:
            products = resp.json()
            if products:
                pid = random.choice(products)["id"]
                self.client.get(f"/api/proxy/products/{pid}", name="/api/proxy/products/[id]")
                self.client.get(f"/apply/{pid}", name="/apply/[productId]")


class FrontendBuyUser(HttpUser, _AppAuthMixin):
    """New customer: register/login via proxy → apply page → create order via proxy."""

    host      = FRONTEND_HOST
    weight    = 2
    wait_time = between(3, 7)

    def on_start(self):
        self.token     = None
        self.products  = []
        self.order_ids = []

        token, _, _ = self._register_and_login()
        self.token = token

        resp = self.client.get("/api/proxy/products", name="/api/proxy/products")
        if resp.status_code == 200:
            self.products = resp.json()

    @task(3)
    def browse_products_page(self):
        self.client.get("/products", name="/products")

    @task(4)
    def browse_products_via_proxy(self):
        self.client.get("/api/proxy/products", name="/api/proxy/products")

    @task(2)
    def my_profile_via_proxy(self):
        if not self.token:
            return
        self.client.get("/api/proxy/customers/me", headers=self._auth(),
                        name="/api/proxy/customers/me")

    @task(2)
    def my_orders_via_proxy(self):
        if not self.token:
            return
        self.client.get("/api/proxy/orders/my", headers=self._auth(),
                        name="/api/proxy/orders/my")

    @task(3)
    def apply_and_order(self):
        if not self.token or not self.products:
            return

        product      = random.choice(self.products)
        price        = product["price"]
        down_payment = round(price * random.uniform(0.05, 0.3), 2)
        months       = random.choice(INSTALLMENT_MONTHS)

        # Simulate visiting the /apply page before submitting
        self.client.get(f"/apply/{product['id']}", name="/apply/[productId]")

        resp = self.client.post(
            "/api/proxy/orders",
            json={"productId": product["id"], "downPayment": down_payment, "totalMonths": months},
            headers=self._auth(),
            name="/api/proxy/orders",
        )
        if resp.status_code == 201:
            oid = resp.json().get("orderId")
            if oid:
                self.order_ids.append(oid)
                self.client.get(
                    f"/api/proxy/payments/schedule/{oid}",
                    headers=self._auth(),
                    name="/api/proxy/payments/schedule/[orderId]",
                )

    @task(1)
    def view_payment_schedule(self):
        if not self.token or not self.order_ids:
            return
        oid = random.choice(self.order_ids)
        self.client.get(
            f"/api/proxy/payments/schedule/{oid}",
            headers=self._auth(),
            name="/api/proxy/payments/schedule/[orderId]",
        )


class FrontendDashUser(HttpUser, _AppAuthMixin):
    """Returning customer: login via proxy → dashboard page → payment schedule."""

    host      = FRONTEND_HOST
    weight    = 3
    wait_time = between(4, 9)

    def on_start(self):
        self.token     = None
        self.order_ids = []

        token, _, _ = self._register_and_login()
        self.token = token

        if not self.token:
            return

        # Seed one order for the dashboard to display
        resp = self.client.get("/api/proxy/products", name="/api/proxy/products")
        if resp.status_code != 200 or not resp.json():
            return

        product = random.choice(resp.json())
        resp = self.client.post(
            "/api/proxy/orders",
            json={"productId":   product["id"],
                  "downPayment": round(product["price"] * 0.1, 2),
                  "totalMonths": 12},
            headers=self._auth(),
            name="/api/proxy/orders",
        )
        if resp.status_code == 201:
            self.order_ids.append(resp.json().get("orderId"))

    @task(4)
    def dashboard_page(self):
        """Simulates /dashboard: page load + profile + orders via proxy."""
        self.client.get("/dashboard", name="/dashboard")
        if not self.token:
            return
        self.client.get("/api/proxy/customers/me", headers=self._auth(),
                        name="/api/proxy/customers/me")
        self.client.get("/api/proxy/orders/my",    headers=self._auth(),
                        name="/api/proxy/orders/my")

    @task(3)
    def view_payment_schedule(self):
        if not self.token or not self.order_ids:
            return
        oid = random.choice(self.order_ids)
        self.client.get(
            f"/api/proxy/payments/schedule/{oid}",
            headers=self._auth(),
            name="/api/proxy/payments/schedule/[orderId]",
        )

    @task(2)
    def browse_products_page(self):
        self.client.get("/products", name="/products")

    @task(1)
    def re_login(self):
        token, _, _ = self._register_and_login()
        if token:
            self.token = token
