import { CLSMetric, FCPMetric, INPMetric, LCPMetric, onCLS, onFCP, onINP, onLCP, onTTFB, ReportOpts, TTFBMetric } from 'web-vitals';

const reportWebVitals = (onReport: (metric: CLSMetric | FCPMetric | LCPMetric | TTFBMetric | INPMetric) => void, opts?: ReportOpts) => {
    onCLS(onReport, opts);
    onFCP(onReport, opts);
    onINP(onReport, opts);
    onLCP(onReport, opts);
    onTTFB(onReport, opts);
}

export default reportWebVitals;
