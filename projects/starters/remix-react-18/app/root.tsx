import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteLoaderData } from '@remix-run/react';
import type { LinksFunction, LoaderFunctionArgs } from '@remix-run/node';
import nveLayoutStyles from '@nvidia-elements/styles/layout.css?url';
import nveTypographyStyles from '@nvidia-elements/styles/typography.css?url';
import nveCompactStyles from '@nvidia-elements/themes/compact.css?url';
import nveDarkStyles from '@nvidia-elements/themes/dark.css?url';
import nveFontStyles from '@nvidia-elements/themes/fonts/nvidia-sans.css?url';
import nveIndexStyles from '@nvidia-elements/themes/index.css?url';
import nveViewTransitionStyles from '@nvidia-elements/styles/view-transitions.css?url';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.ico',
    type: 'image/x-icon'
  },
  { rel: 'stylesheet', href: nveFontStyles },
  { rel: 'stylesheet', href: nveIndexStyles },
  { rel: 'stylesheet', href: nveCompactStyles },
  { rel: 'stylesheet', href: nveDarkStyles },
  { rel: 'stylesheet', href: nveTypographyStyles },
  { rel: 'stylesheet', href: nveLayoutStyles },
  { rel: 'stylesheet', href: nveViewTransitionStyles }
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const disableJs = url.searchParams.get('disable-js') === 'true';
  return {
    disableJs
  };
};

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>('root');

  return (
    <html lang="en" nve-theme="">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        {data?.disableJs ? null : <Scripts />}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
