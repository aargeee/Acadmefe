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
    <div className="">
      <Navbar />
      {children}
    </div>
  );
}
