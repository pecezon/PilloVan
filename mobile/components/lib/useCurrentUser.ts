import { useAuth } from "@clerk/expo";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import { UserRoles } from "@/shared/enums";
import type { Doc } from "@/convex/_generated/dataModel"

export type CurrentUserState =
  | { state: "loading"; user: undefined; roles: [] }
  | { state: "signedOut"; user: undefined; roles: [] }
  | { state: "needsOnboarding"; user: Doc<"users">; roles: UserRoles[] }
  | { state: "onboarded"; user: Doc<"users">; roles: UserRoles[] }

export function useCurrentUser(): CurrentUserState & { isLoading: boolean } {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth()
  const { userId } = useAuth()
  const ensureUser = useMutation(api.users.ensureUser)

  const [hasEnsuredUser, setHasEnsuredUser] = useState(false)
  const ensureInFlightRef = useRef(false)

  useEffect(() => {
    setHasEnsuredUser(false)
    ensureInFlightRef.current = false
  }, [userId])

  useEffect(() => {
    if (isAuthLoading) return

    if (!isAuthenticated) {
      setHasEnsuredUser(false)
      ensureInFlightRef.current = false
      return
    }

    if (!userId) return
    if (hasEnsuredUser || ensureInFlightRef.current) return

    ensureInFlightRef.current = true
    void ensureUser({})
      .then(() => {
        setHasEnsuredUser(true)
      })
      .finally(() => {
        ensureInFlightRef.current = false
      })
  }, [ensureUser, hasEnsuredUser, isAuthenticated, isAuthLoading, userId])

  const user = useQuery(
    api.users.me,
    isAuthenticated && hasEnsuredUser ? {} : "skip"
  )

  if (isAuthLoading) {
    return { state: "loading", isLoading: true, user: undefined, roles: [] }
  }

  if (!isAuthenticated) {
    return { state: "signedOut", isLoading: false, user: undefined, roles: [] }
  }

  if (!hasEnsuredUser || user === undefined) {
    return { state: "loading", isLoading: true, user: undefined, roles: [] }
  }

  if (user.status === "NEEDS_ONBOARDING") {
    return {
      state: "needsOnboarding",
      isLoading: false,
      user,
      roles: user.roles,
    }
  }

  return {
    state: "onboarded",
    isLoading: false,
    user,
    roles: user.roles,
  }
}
