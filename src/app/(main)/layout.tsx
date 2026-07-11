import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="sp-main">{children}</main>
      <BottomNav />
    </>
  );
}
