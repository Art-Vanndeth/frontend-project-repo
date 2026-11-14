export const metadata = {
  title: 'CSTAD DevOps Final Project | Cloud Native Portal',
  description: 'Next.js + Spring Boot + PostgreSQL deployed via Jenkins, Nexus, Helm, Kubespray, and ArgoCD',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
        }}
      >
        {children}
      </body>
    </html>
  );
}

