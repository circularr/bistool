import { Analytics } from "@vercel/analytics/react"

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {children}
      <Analytics />
    </>
  )
}

export default Layout