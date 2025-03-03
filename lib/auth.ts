export async function signIn(email: string, password: string) {
  // Simulate API call
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        // Store user in localStorage for demo purposes
        const user = {
          id: "user_" + Math.random().toString(36).substr(2, 9),
          name: email.split("@")[0],
          email,
        }

        localStorage.setItem("loop_user", JSON.stringify(user))
        resolve()
      } else {
        reject(new Error("Invalid credentials"))
      }
    }, 1000)
  })
}

export async function createAccount(email: string, password: string, name: string) {
  // Simulate API call
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (email && password && name) {
        // In a real app, you would create the user in your database
        resolve()
      } else {
        reject(new Error("Invalid information"))
      }
    }, 1000)
  })
}

export async function signOut() {
  // Simulate API call
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      localStorage.removeItem("loop_user")
      resolve()
    }, 500)
  })
}

