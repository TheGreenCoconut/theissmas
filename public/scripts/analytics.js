(function () {
    const { ga4MeasurementId, clarityProjectId } = window.siteAnalytics || {};

    if (/^G-[A-Z0-9]+$/i.test(ga4MeasurementId || '')) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', ga4MeasurementId);

        const googleTag = document.createElement('script');
        googleTag.async = true;
        googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga4MeasurementId);
        document.head.appendChild(googleTag);
    }

    if (/^[a-z0-9]+$/i.test(clarityProjectId || '')) {
        window.clarity = window.clarity || function () {
            (window.clarity.q = window.clarity.q || []).push(arguments);
        };
        const clarityTag = document.createElement('script');
        clarityTag.async = true;
        clarityTag.src = 'https://www.clarity.ms/tag/' + encodeURIComponent(clarityProjectId);
        document.head.appendChild(clarityTag);
    }
})();
