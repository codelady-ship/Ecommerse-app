import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, LogOut, Plus, RotateCcw, Search } from 'lucide-react';
import '@/admin/admin.css';
import { Wordmark } from '../components/Text.jsx';
import { inr } from '../lib/format.js';
import { useDocumentMeta } from '../lib/meta.js';
import {
  CODE_RE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  PALETTE,
  STYLES,
  adminCall,
  demoLogin,
  getSession,
  login,
  logout,
  resetSandbox,
} from '../lib/adminApi.js';
import { PortalContext } from '@/admin/lib/portal.js';
import { toast } from '@/admin/lib/toast.js';
import { cn } from '@/admin/lib/utils.js';
import { Alert, AlertTitle } from '@/admin/ui/alert.jsx';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/admin/ui/alert-dialog.jsx';
import { Badge } from '@/admin/ui/badge.jsx';
import { Button } from '@/admin/ui/button.jsx';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/admin/ui/dialog.jsx';
import { Input } from '@/admin/ui/input.jsx';
import { Label } from '@/admin/ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/admin/ui/select.jsx';
import { Skeleton } from '@/admin/ui/skeleton.jsx';
import { Switch } from '@/admin/ui/switch.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/admin/ui/table.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/admin/ui/tabs.jsx';
import { Toaster } from '@/admin/ui/toaster.jsx';

const date = (iso) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—';

const MONO = 'tw:font-mono tw:text-[12px] tw:font-medium tw:tracking-[0.1em] tw:uppercase';
const SHELL = 'tw:mx-auto tw:w-full tw:max-w-[1240px] tw:px-4 tw:sm:px-8 tw:lg:px-12';

/** The four HUELINE dyes as a hairline across the top: the panel's only decoration. */
function DyeStrip() {
  return (
    <div className="tw:flex tw:h-1" aria-hidden="true">
      <span className="tw:flex-1 tw:bg-cobalt" />
      <span className="tw:flex-1 tw:bg-marigold" />
      <span className="tw:flex-1 tw:bg-orchid" />
      <span className="tw:flex-1 tw:bg-lagoon" />
    </div>
  );
}

export default function Admin() {
  useDocumentMeta({
    title: 'Admin · Hueline',
    description: 'HUELINE admin panel: products, demo orders and newsletter subscribers. Public demo login is read-only.',
    path: '/admin',
    noindex: true,
  });
  const [session, setSession] = useState(getSession);
  const [portal, setPortal] = useState(null);
  const onLogout = useCallback(() => {
    logout();
    setSession(null);
  }, []);

  // White page for as long as the panel is mounted; the shop gets its paper ground back on the way out.
  useLayoutEffect(() => {
    const html = document.documentElement;
    const theme = document.head.querySelector('meta[name="theme-color"]');
    const previous = theme?.getAttribute('content');
    html.classList.add('hl-admin-page');
    theme?.setAttribute('content', '#ffffff');
    return () => {
      html.classList.remove('hl-admin-page');
      if (previous) theme.setAttribute('content', previous);
    };
  }, []);

  return (
    <PortalContext.Provider value={portal}>
      <div className="hl-admin tw:min-h-dvh tw:bg-white">
        <DyeStrip />
        {session ? (
          <Dashboard session={session} onSession={setSession} onLogout={onLogout} />
        ) : (
          <Login onSession={setSession} />
        )}
        <Toaster />
        {/* Radix portals (dialogs, selects) mount here, inside the panel's own scope. */}
        <div ref={setPortal} className="hl-admin" data-slot="portal-root" />
      </div>
    </PortalContext.Provider>
  );
}

function Login({ onSession }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      onSession(await fn());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className={cn(
        SHELL,
        'tw:grid tw:min-h-[calc(100dvh-4px)] tw:max-w-[1120px] tw:content-center tw:gap-x-16 tw:gap-y-8 tw:py-10 tw:lg:grid-cols-[minmax(0,1fr)_420px]',
      )}
      aria-labelledby="adm-title"
    >
      <div className="tw:grid tw:gap-3 tw:lg:self-end">
        <p className={cn(MONO, 'tw:flex tw:items-baseline tw:gap-2 tw:text-mute')}>
          <Wordmark className="tw:text-[22px] tw:tracking-normal tw:text-ink tw:normal-case" /> · back office
        </p>
        <h1
          id="adm-title"
          className="tw:font-ui tw:text-[clamp(72px,13vw,168px)] tw:leading-[0.84] tw:font-extrabold tw:tracking-[-0.005em] tw:uppercase tw:[font-stretch:62%] tw:[font-variation-settings:'wdth'_62] tw:[&_em]:text-[0.84em] tw:[&_em]:tracking-[-0.03em]"
        >
          Ad<em>min</em>
        </h1>
      </div>

      <form
        className="tw:grid tw:gap-4 tw:rounded-2xl tw:border tw:border-line tw:bg-white tw:p-5 tw:sm:p-7 tw:lg:row-span-2 tw:lg:self-center"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => login(email, password));
        }}
      >
        <div className="tw:grid tw:gap-2">
          <Label htmlFor="adm-email">Email</Label>
          <Input id="adm-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="tw:grid tw:gap-2">
          <Label htmlFor="adm-pass">Password</Label>
          <Input
            id="adm-pass"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <Alert variant="danger" role="alert">
            {error}
          </Alert>
        )}
        <div className="tw:mt-1 tw:grid tw:gap-2.5">
          <Button type="submit" size="lg" className="tw:w-full" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
          <Button variant="outline" size="lg" className="tw:w-full" disabled={busy} onClick={() => run(demoLogin)}>
            Demo admin
          </Button>
        </div>
        <p className="tw:rounded-[10px] tw:bg-wash tw:px-3.5 tw:py-3 tw:text-[14px] tw:leading-snug tw:text-mute">
          Demo login:{' '}
          <span translate="no" className="tw:font-mono tw:text-[13px] tw:text-ink">
            {DEMO_EMAIL}
          </span>{' '}
          /{' '}
          <span translate="no" className="tw:font-mono tw:text-[13px] tw:text-ink">
            {DEMO_PASSWORD}
          </span>
          . It is read-only and sees customer details masked.
        </p>
      </form>

      <div className="tw:lg:self-start">
        <Button asChild variant="link" className="tw:-ml-2 tw:h-11 tw:px-2">
          <Link to="/">← Back to the shop</Link>
        </Button>
      </div>
    </section>
  );
}

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'subscribers', label: 'Subscribers' },
];

function Dashboard({ session, onSession, onLogout }) {
  const [tab, setTab] = useState('products');
  const [data, setData] = useState({ products: null, orders: null, subscribers: null });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [products, orders, subscribers] = await Promise.all(
        ['products', 'orders', 'subscribers'].map((k) => adminCall(`/api/admin/${k}`)),
      );
      setData({ products, orders, subscribers });
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
    } finally {
      onSession(getSession());
    }
  }, [onLogout, onSession]);

  useEffect(() => {
    load();
  }, [load]);

  /** Runs a write; a refused demo write shows the server's friendly message as a toast. */
  const write = async (path, opts, done) => {
    try {
      const r = await adminCall(path, opts);
      toast(done);
      await load();
      return r ?? true;
    } catch (err) {
      if (err.status === 401) onLogout();
      if (err.demo) toast(err.message, 'locked');
      else toast(`Not saved: ${err.message}`, 'error');
      return false;
    } finally {
      onSession(getSession());
    }
  };

  const isDemo = session.role === 'demo';
  return (
    <section aria-labelledby="adm-dash-title">
      <header className="tw:border-b tw:border-line">
        <div className={cn(SHELL, 'tw:flex tw:flex-wrap tw:items-center tw:gap-x-4 tw:gap-y-1 tw:py-3')}>
          <h1 id="adm-dash-title" className="tw:mr-auto tw:flex tw:items-baseline tw:gap-2.5 tw:text-[28px] tw:leading-none tw:font-normal">
            <Wordmark />
            <span className={cn(MONO, 'tw:border-l tw:border-line-strong tw:pl-2.5 tw:text-mute')}>Admin</span>
          </h1>
          <p className="tw:order-last tw:flex tw:w-full tw:min-w-0 tw:flex-wrap tw:items-center tw:gap-2 tw:sm:order-none tw:sm:w-auto">
            <span translate="no" className="tw:min-w-0 tw:font-mono tw:text-[13px] tw:[overflow-wrap:anywhere] tw:text-mute">
              {session.email}
            </span>
            <Badge variant={isDemo ? 'demo' : 'ink'}>{session.sandbox ? 'demo · sandbox' : isDemo ? 'demo · read-only' : 'admin'}</Badge>
          </p>
          <Button variant="outline" onClick={onLogout}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      <div className={cn(SHELL, 'tw:grid tw:grid-cols-[minmax(0,1fr)] tw:gap-5 tw:pt-5 tw:pb-24')}>
        {session.sandbox ? (
          <Alert variant="demo" className="tw:flex tw:flex-col tw:items-start tw:gap-3 tw:md:flex-row tw:md:items-center tw:md:justify-between tw:md:gap-6">
            <span>
              <AlertTitle>Demo mode — changes are not saved.</AlertTitle> The API is offline, so this panel runs on the bundled catalogue in your
              browser. Edits last until you close the tab.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="tw:bg-transparent"
              onClick={() => {
                resetSandbox();
                load();
                toast('Demo data reset');
              }}
            >
              <RotateCcw aria-hidden="true" />
              Reset demo data
            </Button>
          </Alert>
        ) : (
          isDemo && (
            <Alert variant="demo">
              <AlertTitle>Demo admin — read-only.</AlertTitle> You are looking at the live API. The server refuses every change from this account and masks customers' names, emails, phones and addresses.
            </Alert>
          )
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Admin sections">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id}>
                {t.label}
                <Badge variant="count" className={tab === t.id ? 'tw:bg-ink tw:text-white' : undefined}>
                  {data[t.id]?.length ?? '…'}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {error && (
            <Alert variant="danger" role="alert" className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-3">
              <span>{error}</span>
              <Button variant="outline" size="sm" className="tw:bg-transparent" onClick={load}>
                Try again
              </Button>
            </Alert>
          )}

          <TabsContent value="products">
            <Products items={data.products} write={write} failed={Boolean(error)} />
          </TabsContent>
          <TabsContent value="orders">
            <Orders items={data.orders} failed={Boolean(error)} />
          </TabsContent>
          <TabsContent value="subscribers">
            <Subscribers items={data.subscribers} failed={Boolean(error)} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

const EMPTY = { code: '', name: '', fabric: '', price: '', stock: '48', style: STYLES[0].code, colour: PALETTE[0].name, active: true };

function Field({ id, label, className, children }) {
  return (
    <div className={cn('tw:grid tw:content-start tw:gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Dot({ hex }) {
  return <span className="tw:inline-block tw:size-3 tw:shrink-0 tw:rounded-full tw:shadow-[inset_0_0_0_1px_rgba(22,20,26,0.2)]" style={{ background: hex }} aria-hidden="true" />;
}

function Products({ items, write, failed }) {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product code
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null); // the product waiting for "Confirm delete"
  // The dialogs are opened from table rows without a Radix trigger, so focus is handed back by hand:
  // to the button that opened the dialog, or to the search box when that row is gone.
  const opener = useRef(null);
  const remember = () => {
    opener.current = document.activeElement;
  };
  const giveFocusBack = (e) => {
    e.preventDefault();
    (opener.current?.isConnected ? opener.current : document.getElementById('adm-q'))?.focus();
  };

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!items || !t) return items;
    return items.filter((p) => `${p.code} ${p.name} ${p.colour} ${p.styleLabel}`.toLowerCase().includes(t));
  }, [items, q]);

  const open = (p) => {
    remember();
    setFormError('');
    setEditing(p ? p.code : 'new');
    setForm(
      p
        ? { code: p.code, name: p.name, fabric: p.fabric, price: String(p.price), stock: String(p.stock ?? 48), style: p.style, colour: p.colour, active: p.active !== false }
        : EMPTY,
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    const isNew = editing === 'new';
    const code = form.code.trim().toUpperCase();
    if (isNew && !CODE_RE.test(code)) return setFormError('Code must look like HL-K-05.');
    if (form.name.trim().length < 2 || form.fabric.trim().length < 2) return setFormError('Name and fabric need 2+ characters.');
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0)
      return setFormError('Price and stock must be whole numbers, 0 or more.');
    setFormError('');
    const body = { name: form.name.trim(), fabric: form.fabric.trim(), price, stock, style: form.style, colour: form.colour, active: form.active };
    setSaving(true);
    const ok = isNew
      ? await write('/api/admin/products', { method: 'POST', body: { ...body, code } }, `${code} created`)
      : await write(`/api/admin/products/${editing}`, { method: 'PATCH', body }, `${editing} saved`);
    setSaving(false);
    if (ok) setEditing(null);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const pick = (k) => (value) => setForm({ ...form, [k]: value });

  return (
    <div className="tw:grid tw:grid-cols-[minmax(0,1fr)] tw:gap-4">
      <div className="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-2.5">
        <div className="tw:relative tw:min-w-0 tw:flex-[1_1_240px] tw:sm:max-w-[380px]">
          <label className="tw:sr-only" htmlFor="adm-q">
            Search products
          </label>
          <Search className="tw:pointer-events-none tw:absolute tw:top-1/2 tw:left-3.5 tw:size-4 tw:-translate-y-1/2 tw:text-mute" aria-hidden="true" />
          <Input id="adm-q" type="search" className="tw:pl-10" placeholder="Search code, name, colour…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Button className="tw:max-sm:flex-[1_1_100%]" onClick={() => open(null)}>
          <Plus aria-hidden="true" />
          New product
        </Button>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent aria-describedby={undefined} onCloseAutoFocus={giveFocusBack}>
          <DialogHeader>
            <DialogTitle>
              {editing === 'new' ? (
                'New product'
              ) : (
                <>
                  Edit <span translate="no">{editing}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <form id="adm-form" className="tw:grid tw:gap-x-4 tw:gap-y-4 tw:sm:grid-cols-2" onSubmit={submit} noValidate>
            {editing === 'new' && (
              <Field id="pf-code" label="Code" className="tw:sm:col-span-2">
                <Input id="pf-code" className="tw:font-mono tw:uppercase tw:placeholder:normal-case" placeholder="HL-K-05" value={form.code} onChange={set('code')} />
              </Field>
            )}
            <Field id="pf-name" label="Name">
              <Input id="pf-name" value={form.name} onChange={set('name')} />
            </Field>
            <Field id="pf-fabric" label="Fabric">
              <Input id="pf-fabric" value={form.fabric} onChange={set('fabric')} />
            </Field>
            <Field id="pf-price" label="Price (INR)">
              <Input id="pf-price" inputMode="numeric" value={form.price} onChange={set('price')} />
            </Field>
            <Field id="pf-stock" label="Stock">
              <Input id="pf-stock" inputMode="numeric" value={form.stock} onChange={set('stock')} />
            </Field>
            <Field id="pf-style" label="Style">
              <Select value={form.style} onValueChange={pick('style')}>
                <SelectTrigger id="pf-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.code} value={s.code}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field id="pf-colour" label="Colour">
              <Select value={form.colour} onValueChange={pick('colour')}>
                <SelectTrigger id="pf-colour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PALETTE.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      <Dot hex={c.hex} />
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:rounded-[10px] tw:border tw:border-line tw:py-1 tw:pr-2 tw:pl-3.5 tw:sm:col-span-2">
              <label htmlFor="pf-active" className="tw:cursor-pointer tw:text-[15px]">
                Visible in the shop
              </label>
              <Switch id="pf-active" checked={form.active} onCheckedChange={pick('active')} />
            </div>
            {formError && (
              <Alert variant="danger" role="alert" className="tw:sm:col-span-2">
                {formError}
              </Alert>
            )}
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="adm-form" disabled={saving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-step delete, in the page: window.confirm() is blocked in the sandboxed iframe this panel is shown in. */}
      <AlertDialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent onCloseAutoFocus={giveFocusBack}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete <span translate="no">{confirm?.code}</span>?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.name} ({confirm?.colour}) will be removed from the catalogue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="danger"
                onClick={() => {
                  const code = confirm.code;
                  setConfirm(null);
                  write(`/api/admin/products/${code}`, { method: 'DELETE' }, `${code} deleted`);
                }}
              >
                Confirm delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable failed={failed} empty="No products match." items={list} label="Products" minWidth={860} columns={8}>
        <TableHeader>
          <tr>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Style</TableHead>
            <TableHead>Colour</TableHead>
            <TableHead numeric>Price</TableHead>
            <TableHead numeric>Stock</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead>
              <span className="tw:sr-only">Actions</span>
            </TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {list?.map((p) => (
            <TableRow key={p.code}>
              <TableCell className="tw:font-mono tw:text-[13px] tw:tracking-[0.04em]" translate="no">
                {p.code}
              </TableCell>
              <TableCell className="tw:font-semibold">{p.name}</TableCell>
              <TableCell>{p.styleLabel}</TableCell>
              <TableCell>
                <span className="tw:inline-flex tw:items-center tw:gap-2">
                  <Dot hex={p.colourHex} /> {p.colour}
                </span>
              </TableCell>
              <TableCell numeric>{inr(p.price)}</TableCell>
              <TableCell numeric>{p.stock ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={p.active === false ? 'muted' : 'live'}>{p.active === false ? 'Hidden' : 'Live'}</Badge>
              </TableCell>
              <TableCell className="tw:pr-2">
                <div className="tw:flex tw:justify-end tw:gap-1">
                  <Button variant="ghost" size="sm" onClick={() => open(p)} aria-label={`Edit ${p.code}`}>
                    Edit
                  </Button>
                  <Button variant="ghost-danger" size="sm" onClick={() => (remember(), setConfirm(p))} aria-label={`Delete ${p.code}`}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </DataTable>
    </div>
  );
}

function Orders({ items, failed }) {
  return (
    <DataTable failed={failed} empty="No orders yet." items={items} label="Orders" minWidth={760} columns={7}>
      <TableHeader>
        <tr>
          <TableHead>Order</TableHead>
          <TableHead>Placed</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>City</TableHead>
          <TableHead numeric>Pieces</TableHead>
          <TableHead numeric>Total</TableHead>
          <TableHead>Status</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {items?.map((o) => (
          <TableRow key={o.id || o.number}>
            <TableCell className="tw:font-mono tw:text-[13px] tw:tracking-[0.04em]" translate="no">
              {o.number}
            </TableCell>
            <TableCell className="tw:text-mute">{date(o.createdAt)}</TableCell>
            <TableCell className="tw:font-semibold">{o.customer?.name}</TableCell>
            <TableCell>{o.customer?.city}</TableCell>
            <TableCell numeric>{o.items?.reduce((n, i) => n + (i.qty || 0), 0)}</TableCell>
            <TableCell numeric>{inr(o.total)}</TableCell>
            <TableCell>
              <Badge variant="outline">{o.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}

function Subscribers({ items, failed }) {
  return (
    <DataTable failed={failed} empty="No subscribers yet." items={items} label="Newsletter subscribers" minWidth={0} columns={2} className="tw:max-w-[720px]">
      <TableHeader>
        <tr>
          <TableHead>Email</TableHead>
          <TableHead>Joined</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {items?.map((s) => (
          <TableRow key={s.id || s.email}>
            <TableCell translate="no">{s.email}</TableCell>
            <TableCell className="tw:text-mute">{date(s.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
  );
}

const WIDTHS = ['tw:w-20', 'tw:w-36', 'tw:w-24', 'tw:w-28', 'tw:w-16', 'tw:w-12', 'tw:w-14', 'tw:w-24'];

function DataTable({ items, failed, empty, label, columns, children, ...props }) {
  // the load failed: the alert above the panel says why and offers "Try again"
  if (!items && failed) return null;
  if (!items) {
    return (
      <div className={cn('tw:overflow-hidden tw:rounded-[14px] tw:border tw:border-line', props.className)} role="status" aria-busy="true">
        <p className="tw:sr-only">Loading…</p>
        <div className="tw:h-11 tw:border-b tw:border-line tw:bg-wash" />
        {Array.from({ length: 6 }, (_, r) => (
          <div key={r} className="tw:flex tw:h-14 tw:items-center tw:gap-8 tw:border-b tw:border-line tw:px-4 tw:last:border-b-0">
            {WIDTHS.slice(0, columns).map((w, c) => (
              <Skeleton key={c} className={cn(w, 'tw:shrink-0', c > 2 && 'tw:max-md:hidden')} />
            ))}
          </div>
        ))}
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className={cn('tw:grid tw:justify-items-center tw:gap-3 tw:rounded-[14px] tw:border tw:border-dashed tw:border-line-strong tw:px-6 tw:py-14 tw:text-center', props.className)}>
        <span className="tw:flex tw:size-11 tw:items-center tw:justify-center tw:rounded-full tw:bg-wash tw:text-mute" aria-hidden="true">
          <Inbox className="tw:size-5" />
        </span>
        <p className={cn(MONO, 'tw:text-mute')}>{empty}</p>
      </div>
    );
  }
  return (
    <Table label={label} {...props}>
      {children}
    </Table>
  );
}
