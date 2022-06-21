export const generateGuid = () => window.URL.createObjectURL(new Blob([])).substr(-36);
