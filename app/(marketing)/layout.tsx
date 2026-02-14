import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ThemeSwitcher from '@/components/ui/ThemeSwitcher'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ThemeSwitcher />
    </>
  )
}
