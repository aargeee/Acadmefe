import Navbar from "./Navbar";

export interface User {
  accessToken: string;
  refreshToken: string;
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: RootLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar/>
      {children}
    </div>
  );
}
