import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import NProgress from 'nprogress';
import { router } from '@inertiajs/react';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false });
router.on('start', () => NProgress.start());
router.on('finish', () => NProgress.done());

createInertiaApp({
    title: (title) => title ? `${title} - e-Kantin` : 'e-Kantin',
    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: false,
});
