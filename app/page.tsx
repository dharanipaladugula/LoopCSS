import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-[#FF6B6B]/10 via-[#4ECDC4]/10 to-[#87C159]/10">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24">
              <div className="absolute w-12 h-12 rounded-full bg-[#FF6B6B] top-0 left-0 loop-pulse"></div>
              <div className="absolute w-12 h-12 rounded-full bg-[#4ECDC4] bottom-0 left-6 share-pulse"></div>
              <div className="absolute w-12 h-12 rounded-full bg-[#87C159] top-6 right-0 safe-glow"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Loop(CSS)</h1>
          <p className="text-lg text-gray-600 mb-8">Connect. Share. Safe.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

